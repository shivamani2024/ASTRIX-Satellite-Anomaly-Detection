"""Safety Policy Engine enforcing T0-T4 Risk Matrix & 7 Pre-Flight Flight Constraints."""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.config import settings
from app.logger import logger
from app.models.safety import RiskTier, PreFlightCheck, SafetyValidationResult
from app.models.command import CommandEnvelope, ActionPayload
from app.services.telemetry_engine import telemetry_engine
from app.services.digital_twin import digital_twin_engine


class SafetyPolicyEngine:
    """Enforces spaceflight safety rules, pre-flight telemetry constraints, and operator clearance."""

    def __init__(self):
        # Default mock sensor state for flight pre-flight conditions
        self.simulated_comm_window_remaining_s: int = 420
        self.simulated_mtq_temp_c: float = 38.4
        self.simulated_solar_incidence_deg: float = 14.2
        self.simulated_prop_valves_closed: bool = True

    def evaluate_risk_tier(self, action_id: str) -> RiskTier:
        """Map action ID to safety risk tier."""
        action_upper = action_id.upper()
        if "REBOOT_FLIGHT_COMPUTER" in action_upper or "VENT_MAIN_TANK" in action_upper:
            return RiskTier.T4
        elif "THRUSTER" in action_upper or "ORBIT_LOWERING" in action_upper or "T3" in action_upper:
            return RiskTier.T3
        elif "DESAT" in action_upper or "MTQ" in action_upper or "SLEW" in action_upper or "T2" in action_upper:
            return RiskTier.T2
        elif "HEATER" in action_upper or "PAYLOAD_SHED" in action_upper or "T1" in action_upper:
            return RiskTier.T1
        return RiskTier.T0

    def run_pre_flight_checks(
        self,
        event_id: str,
        action_id: str,
        action_name: str,
        action_params: Optional[Dict[str, Any]] = None,
    ) -> SafetyValidationResult:
        """Execute the 7 automated pre-flight checks against live and simulated satellite parameters."""
        risk_tier = self.evaluate_risk_tier(action_id)

        # Immediate T4 check: Zero Override Policy
        if risk_tier == RiskTier.T4:
            logger.error(f"Action {action_id} classified as T4 FORBIDDEN. Zero-override policy triggered.")
            return SafetyValidationResult(
                event_id=event_id,
                action_id=action_id,
                action_name=action_name,
                risk_tier=risk_tier,
                requires_human_approval=True,
                pre_flight_checks=[
                    PreFlightCheck(
                        check_id="CHK-CRIT-00",
                        name="Forbidden Catastrophic Risk Action Check",
                        passed=False,
                        details="Action violates vehicle survivability envelope. Zero-override policy in effect.",
                        observed_value="T4_FORBIDDEN",
                        required_bound="T0-T3",
                    )
                ],
                all_checks_passed=False,
                digital_twin_passed=False,
                can_execute=False,
                reason="ZERO-OVERRIDE ENFORCED: T4 actions are strictly forbidden from uplink by automated ground safety policy.",
            )

        # Run digital twin lookahead
        curr_frame = telemetry_engine.get_current_frame()
        twin_result = digital_twin_engine.simulate(
            initial_frame=curr_frame,
            action_id=action_id,
            action_params=action_params,
            duration_s=300,
        )
        digital_twin_passed = twin_result["passed"]

        # Gather current telemetry values
        bus_voltage = curr_frame.channels.bus_voltage_v if curr_frame else 27.8
        comm_window_s = self.simulated_comm_window_remaining_s
        mtq_temp_c = self.simulated_mtq_temp_c
        solar_inc_deg = self.simulated_solar_incidence_deg
        valves_closed = self.simulated_prop_valves_closed
        peak_slew = twin_result["peak_slew_rate_deg_s"]
        operator_clearance = settings.OPERATOR_CLEARANCE

        checks: List[PreFlightCheck] = [
            # Check 1: Comm Window
            PreFlightCheck(
                check_id="CHK-ADCS-01",
                name="Line of Sight Communication Window",
                passed=(comm_window_s >= settings.MIN_COMM_WINDOW_S),
                details=f"Current LOS duration is {comm_window_s}s (minimum required: {settings.MIN_COMM_WINDOW_S}s).",
                observed_value=f"{comm_window_s}s",
                required_bound=f">={settings.MIN_COMM_WINDOW_S}s",
            ),
            # Check 2: Bus Voltage
            PreFlightCheck(
                check_id="CHK-ADCS-02",
                name="EPS Main Bus Voltage Margin",
                passed=(bus_voltage >= settings.BUS_VOLTAGE_MIN_V),
                details=f"Main bus voltage is {bus_voltage:.2f}V (redline minimum: {settings.BUS_VOLTAGE_MIN_V}V).",
                observed_value=f"{bus_voltage:.2f}V",
                required_bound=f">={settings.BUS_VOLTAGE_MIN_V}V",
            ),
            # Check 3: Magnetorquer Thermal Headroom
            PreFlightCheck(
                check_id="CHK-ADCS-03",
                name="Magnetorquer Driver Thermal Headroom",
                passed=(mtq_temp_c <= 65.0),
                details=f"Magnetorquer driver coil is {mtq_temp_c:.1f}°C (maximum operational limit: 65.0°C).",
                observed_value=f"{mtq_temp_c:.1f}°C",
                required_bound="<=65.0°C",
            ),
            # Check 4: Solar Array Incidence Geometry
            PreFlightCheck(
                check_id="CHK-ADCS-04",
                name="Solar Array Sun Vector Incidence Angle",
                passed=(solar_inc_deg <= 35.0),
                details=f"Current solar incidence is {solar_inc_deg:.1f}° (safe generation threshold: <=35.0°).",
                observed_value=f"{solar_inc_deg:.1f}°",
                required_bound="<=35.0°",
            ),
            # Check 5: Digital Twin Kinematic Stability
            PreFlightCheck(
                check_id="CHK-ADCS-05",
                name="Digital Twin 300s Kinematic Stability Margin",
                passed=digital_twin_passed,
                details=f"Lookahead simulation predicted peak slew of {peak_slew:.3f}°/s (limit: 0.250°/s).",
                observed_value=f"{peak_slew:.3f}°/s",
                required_bound="<=0.250°/s",
            ),
            # Check 6: Propulsion Inhibit
            PreFlightCheck(
                check_id="CHK-ADCS-06",
                name="Propulsion System Thruster Latch Valves Closed",
                passed=valves_closed,
                details="Confirmed RCS thruster latch valves are isolated to prevent conflicting torque impulses.",
                observed_value="CLOSED" if valves_closed else "OPEN",
                required_bound="CLOSED",
            ),
            # Check 7: Operator Clearance
            PreFlightCheck(
                check_id="CHK-ADCS-07",
                name="Command Authorization Clearance Level",
                passed=(operator_clearance in ["LEVEL-2", "LEVEL-3", "FLIGHT_DIRECTOR"]),
                details=f"Active console operator clearance is {operator_clearance} (required: LEVEL-2 or higher).",
                observed_value=operator_clearance,
                required_bound=">=LEVEL-2",
            ),
        ]

        all_checks_passed = all(c.passed for c in checks)
        requires_human = risk_tier in [RiskTier.T2, RiskTier.T3]

        if not all_checks_passed:
            failed_names = [c.name for c in checks if not c.passed]
            reason = f"Pre-flight safety checks failed: {', '.join(failed_names)}"
            can_execute = False
        elif requires_human:
            reason = f"Action {action_id} verified against flight constraints. Gated at {risk_tier.value} awaiting operator sign-off with mandatory engineering rationale."
            can_execute = True
        else:
            reason = "All pre-flight checks nominal. Safe for autonomous execution."
            can_execute = True

        return SafetyValidationResult(
            event_id=event_id,
            action_id=action_id,
            action_name=action_name,
            risk_tier=risk_tier,
            requires_human_approval=requires_human,
            pre_flight_checks=checks,
            all_checks_passed=all_checks_passed,
            digital_twin_passed=digital_twin_passed,
            can_execute=can_execute,
            reason=reason,
        )

    def validate_operator_submission(
        self,
        envelope: CommandEnvelope,
        operator_id: str,
        clearance: str,
        rationale: str,
    ) -> Dict[str, Any]:
        """Validate human-in-the-loop sign-off."""
        if envelope.risk_assessment.get("risk_tier") == RiskTier.T4.value:
            return {
                "authorized": False,
                "status_code": 403,
                "error": "HTTP 403 Forbidden: T4 catastrophic actions cannot be overridden by ground operators.",
            }

        if len(rationale.strip()) < settings.MIN_RATIONALE_LENGTH:
            return {
                "authorized": False,
                "status_code": 400,
                "error": f"Operator rationale must be at least {settings.MIN_RATIONALE_LENGTH} characters (received {len(rationale.strip())}).",
            }

        if clearance not in ["LEVEL-2", "LEVEL-3", "FLIGHT_DIRECTOR"]:
            return {
                "authorized": False,
                "status_code": 403,
                "error": f"Insufficient operator clearance '{clearance}'. Minimum LEVEL-2 required.",
            }

        return {
            "authorized": True,
            "status_code": 200,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "operator_id": operator_id,
            "clearance": clearance,
            "rationale": rationale,
        }


# Global safety policy engine singleton
safety_policy_engine = SafetyPolicyEngine()
