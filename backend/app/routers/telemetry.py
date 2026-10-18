"""Telemetry Replay and Stream API Router."""
from typing import List, Optional
from fastapi import APIRouter, Query, Body
from pydantic import BaseModel

from app.models.telemetry import TelemetryFrame
from app.services.telemetry_engine import telemetry_engine

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


class SpeedPayload(BaseModel):
    speed: float


class SeekPayload(BaseModel):
    frame_index: int


class NoisePayload(BaseModel):
    enabled: bool


@router.get("/current", response_model=Optional[TelemetryFrame])
def get_current_telemetry():
    """Retrieve current active telemetry frame."""
    return telemetry_engine.get_current_frame()


@router.get("/history", response_model=List[TelemetryFrame])
def get_telemetry_history(limit: int = Query(100, ge=1, le=500)):
    """Retrieve rolling history buffer of telemetry frames."""
    return telemetry_engine.get_history(limit=limit)


@router.get("/status")
def get_engine_status():
    """Retrieve telemetry replay engine status."""
    return telemetry_engine.get_status()


@router.post("/play")
def play_replay():
    """Resume telemetry replay stream."""
    telemetry_engine.play()
    return {"status": "PLAYING", "engine": telemetry_engine.get_status()}


@router.post("/pause")
def pause_replay():
    """Pause telemetry replay stream."""
    telemetry_engine.pause()
    return {"status": "PAUSED", "engine": telemetry_engine.get_status()}


@router.post("/speed")
def set_replay_speed(payload: SpeedPayload):
    """Set telemetry replay speed multiplier (0.1x to 10.0x)."""
    telemetry_engine.set_speed(payload.speed)
    return {"speed": telemetry_engine.playback_speed, "engine": telemetry_engine.get_status()}


@router.post("/seek")
def seek_frame(payload: SeekPayload):
    """Seek replay engine to specific frame index."""
    telemetry_engine.seek(payload.frame_index)
    return {"current_index": telemetry_engine.current_index, "engine": telemetry_engine.get_status()}


@router.post("/reset")
def reset_replay():
    """Reset telemetry replay back to frame 0."""
    telemetry_engine.reset()
    return {"status": "RESET", "engine": telemetry_engine.get_status()}


@router.post("/noise")
def toggle_noise(payload: NoisePayload):
    """Toggle sensor noise injection."""
    telemetry_engine.set_noise(payload.enabled)
    return {"noise_enabled": telemetry_engine.noise_enabled}


class InjectFaultPayload(BaseModel):
    fault_type: str  # REACTION_WHEEL_SATURATION, SOLAR_ARRAY_DROP, THERMAL_EXCURSION, THRUSTER_PRESSURE_LEAK
    severity: str = "HIGH"


@router.post("/inject-fault")
def inject_fault(payload: InjectFaultPayload):
    """Inject a simulated flight telemetry anomaly."""
    res = telemetry_engine.inject_fault(payload.fault_type, payload.severity)
    return {"status": "SUCCESS", "active_fault": res}


@router.post("/clear-fault")
def clear_fault():
    """Clear any active injected flight anomaly and return to nominal baseline."""
    res = telemetry_engine.clear_fault()
    return {"status": "SUCCESS", "result": res}


@router.get("/active-fault")
def get_active_fault():
    """Get currently active injected fault."""
    return {"active_fault": telemetry_engine.get_active_fault()}
