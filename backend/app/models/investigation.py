"""AI Investigation and Agent Models."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AgentStep(BaseModel):
    agent_name: str
    status: str  # IDLE, RUNNING, COMPLETED, FAILED
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    summary: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)


class EvidencePayload(BaseModel):
    channel: str
    metric: str
    value: Any
    baseline: Any
    divergence_sigma: float
    implication: str


class SOPReference(BaseModel):
    sop_id: str
    title: str
    category: str
    relevance_score: float
    matching_excerpt: str


class DiagnosticOutput(BaseModel):
    event_id: str
    root_cause: str
    confidence_score: float
    supporting_evidence: List[EvidencePayload] = Field(default_factory=list)
    referenced_sops: List[SOPReference] = Field(default_factory=list)
    proposed_recovery_action: str
    recovery_parameters: Dict[str, Any] = Field(default_factory=dict)
    rationale: str


class InvestigationState(BaseModel):
    event_id: str
    current_stage: str
    agents: Dict[str, AgentStep] = Field(default_factory=dict)
    diagnostic_output: Optional[DiagnosticOutput] = None
    is_complete: bool = False
