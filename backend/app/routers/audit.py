"""Cryptographic Audit Ledger Router."""
from typing import List
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

from app.models.audit import AuditEntry, AuditChainVerification
from app.services.audit_logger import audit_logger

router = APIRouter(prefix="/audit", tags=["Audit"])


class TamperPayload(BaseModel):
    block_index: int
    tampered_actor: str = "MALICIOUS_ACTOR_IMPOSTER"


@router.get("/entries", response_model=List[AuditEntry])
def get_audit_entries(limit: int = Query(100, ge=1, le=500)):
    """Retrieve chronologically ordered cryptographic audit blocks."""
    return audit_logger.get_entries(limit=limit)


@router.get("/verify", response_model=AuditChainVerification)
def verify_audit_chain():
    """Recalculate and cryptographically verify all SHA-256 block hashes and chaining links."""
    return audit_logger.verify_chain()


@router.post("/tamper-demo")
def simulate_tampering(payload: TamperPayload):
    """Simulate unauthorized tampering on a block to verify cryptographic rupture detection."""
    success = audit_logger.tamper_block_for_demo(
        block_index=payload.block_index, fake_actor=payload.tampered_actor
    )
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Block index #{payload.block_index} out of range (chain length: {len(audit_logger.chain)})",
        )
    # Return verification immediately after tampering
    verification = audit_logger.verify_chain()
    return {
        "tampered_block_index": payload.block_index,
        "tampered_actor": payload.tampered_actor,
        "verification": verification.model_dump(),
    }
