"""Audit Ledger Pydantic Models."""
from typing import Any, Optional
from pydantic import BaseModel, Field


class AuditEntry(BaseModel):
    block_index: int
    timestamp: str
    actor: str
    action_type: str  # ANOMALY_DETECTED, INVESTIGATION_STARTED, DIAGNOSIS_COMPLETED, TWIN_SIMULATED, SAFETY_VALIDATED, HUMAN_APPROVED, COMMAND_UPLINKED, POSTCONDITION_VERIFIED
    target: str
    payload_hash: str
    risk_tier: str = "T0"
    status: str = "SUCCESS"
    previous_block_hash: str
    block_hash: str


class AuditChainVerification(BaseModel):
    is_valid: bool
    total_blocks: int
    tamper_detected: bool = False
    first_invalid_block: Optional[int] = None
    message: str
