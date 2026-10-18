"""Command Envelope and Human-In-The-Loop Approval Models."""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from .safety import RiskTier


class ActionPayload(BaseModel):
    action_id: str
    name: str
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ApprovalSubmission(BaseModel):
    envelope_id: str
    event_id: str
    operator_id: str
    rationale: str
    clearance_level: str = "LEVEL-2"


class CryptographicSeal(BaseModel):
    hash_algorithm: str = "SHA-256"
    envelope_hash: str
    previous_block_hash: str


class CommandEnvelope(BaseModel):
    envelope_id: str
    created_at: str
    source_event: str
    action: ActionPayload
    risk_assessment: Dict[str, Any]
    twin_simulation: Dict[str, Any]
    approval: Optional[Dict[str, Any]] = None
    cryptographic_seal: Optional[CryptographicSeal] = None
    status: str = "PENDING_APPROVAL"
    execution_result: Optional[Dict[str, Any]] = None
