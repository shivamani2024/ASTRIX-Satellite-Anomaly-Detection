"""Safety Policy & Pre-Flight Verification Models."""
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class RiskTier(str, Enum):
    T0 = "T0"  # Informational / Telemetry adjustment
    T1 = "T1"  # Routine Autonomous / Low risk
    T2 = "T2"  # Operator Gated / Single approval + rationale
    T3 = "T3"  # Senior Gated / Senior controller dual approval
    T4 = "T4"  # FORBIDDEN / Catastrophic risk, HTTP 403 Zero-Override


class PreFlightCheck(BaseModel):
    check_id: str
    name: str
    passed: bool
    details: str
    observed_value: Any = None
    required_bound: str = ""


class SafetyValidationResult(BaseModel):
    event_id: str
    action_id: str
    action_name: str
    risk_tier: RiskTier
    requires_human_approval: bool
    pre_flight_checks: List[PreFlightCheck]
    all_checks_passed: bool
    digital_twin_passed: bool
    can_execute: bool
    reason: str
