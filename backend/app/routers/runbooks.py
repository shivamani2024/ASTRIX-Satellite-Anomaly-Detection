"""ECSS/ISRO Flight Runbooks SOP Library Router."""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException

from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/runbooks", tags=["Runbooks"])


@router.get("/all", response_model=List[Dict[str, Any]])
def get_all_runbooks():
    """Retrieve complete catalog of ECSS/ISRO standard operating procedures."""
    return rag_engine.get_all_sops()


@router.get("/search")
def search_runbooks(
    q: str = Query(..., description="Search query or keyword e.g. reaction wheel, desaturation"),
    top_k: int = Query(5, ge=1, le=10),
):
    """Vector search over flight runbooks with relevance scoring."""
    return rag_engine.search(q, top_k=top_k)


@router.get("/{sop_id}")
def get_runbook(sop_id: str):
    """Retrieve full text and procedure steps for a specific SOP ID."""
    sop = rag_engine.get_sop_by_id(sop_id)
    if not sop:
        raise HTTPException(status_code=404, detail=f"Runbook '{sop_id}' not found")
    return sop
