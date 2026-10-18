"""Safety Policy & Pre-Flight Validation Router."""
from typing import Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.models.safety import SafetyValidationResult
from app.services.safety_policy import safety_policy_engine

router = APIRouter(prefix="/safety", tags=["Safety"])


class ValidateRequest(BaseModel):
    event_id: str = "ANM-2048"
    action_id: str = "CMD_DESAT_MTQ_042"
    action_name: str = "Reaction Wheel Magnetorquer Desaturation"
    action_params: Optional[Dict[str, Any]] = None


@router.post("/validate", response_model=SafetyValidationResult)
def validate_action(req: ValidateRequest):
    """Run all 7 pre-flight constraint checks against live telemetry and digital twin."""
    return safety_policy_engine.run_pre_flight_checks(
        event_id=req.event_id,
        action_id=req.action_id,
        action_name=req.action_name,
        action_params=req.action_params,
    )


@router.get("/risk-matrix")
def get_risk_matrix():
    """Retrieve T0-T4 Risk Tiering rules and requirements."""
    return {
        "T0": {"name": "Informational", "gating": "AUTONOMOUS", "desc": "Telemetry adjustments, minor gain tuning"},
        "T1": {"name": "Routine Autonomous", "gating": "AUTONOMOUS", "desc": "Load shedding, standard heater controls"},
        "T2": {"name": "Operator Gated", "gating": "SINGLE_HUMAN_APPROVAL", "desc": "Actuator desaturation, slews. Requires >=20 char rationale."},
        "T3": {"name": "Senior Gated", "gating": "DUAL_SENIOR_APPROVAL", "desc": "Thruster firing, orbit maneuvers, sun-pointing emergency"},
        "T4": {"name": "FORBIDDEN", "gating": "ZERO_OVERRIDE_403", "desc": "Catastrophic risk actions. Unoverridable hard lockout."},
    }
