"""AI Investigation and 4-Agent Deliberation Router."""
import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.models.investigation import InvestigationState, DiagnosticOutput
from app.services.langgraph_agent import agent_pipeline

router = APIRouter(prefix="/investigation", tags=["Investigation"])


class TriggerPayload(BaseModel):
    event_id: str = "ANM-2048"


@router.post("/trigger", response_model=InvestigationState)
async def trigger_investigation(payload: TriggerPayload, background_tasks: BackgroundTasks):
    """Trigger the 4-agent LangGraph deliberation pipeline for an anomaly."""
    # Run async in background or await if fast
    state = agent_pipeline.get_or_create_investigation(payload.event_id)
    if state.current_stage != "RUNNING":
        background_tasks.add_task(agent_pipeline.execute_investigation, payload.event_id)
    return state


@router.get("/status/{event_id}", response_model=InvestigationState)
def get_investigation_status(event_id: str):
    """Poll the status and thought processes of all 4 investigative agents."""
    return agent_pipeline.get_investigation_state(event_id)


@router.get("/dossier/{event_id}", response_model=DiagnosticOutput)
def get_investigation_dossier(event_id: str):
    """Retrieve complete evidence dossier, root cause, and recovery proposal."""
    state = agent_pipeline.get_investigation_state(event_id)
    if not state.diagnostic_output:
        raise HTTPException(
            status_code=400,
            detail=f"Investigation for {event_id} is still in progress (stage: {state.current_stage}) or not initiated",
        )
    return state.diagnostic_output
