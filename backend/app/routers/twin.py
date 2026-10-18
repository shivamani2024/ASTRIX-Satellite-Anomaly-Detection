"""Digital Twin Simulation Router."""
from typing import Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.digital_twin import digital_twin_engine
from app.services.telemetry_engine import telemetry_engine
from app.config import settings

router = APIRouter(prefix="/twin", tags=["Digital Twin"])


class SimulationRequest(BaseModel):
    action_id: str = "CMD_DESAT_MTQ_042"
    action_params: Optional[Dict[str, Any]] = None
    duration_s: int = 300


@router.post("/simulate")
def run_simulation(req: SimulationRequest):
    """Run 300s kinematic attitude and reaction wheel desaturation lookahead simulation."""
    curr_frame = telemetry_engine.get_current_frame()
    result = digital_twin_engine.simulate(
        initial_frame=curr_frame,
        action_id=req.action_id,
        action_params=req.action_params,
        duration_s=req.duration_s,
    )
    return result


@router.get("/envelope")
def get_safety_envelope():
    """Retrieve kinematic and dynamic safety corridor bounds."""
    return {
        "rw_speed_redline_rpm": settings.RW_SPEED_THRESHOLD_RPM,
        "attitude_error_max_deg": settings.ATTITUDE_ERROR_THRESHOLD_DEG,
        "max_slew_rate_deg_s": 0.25,
        "thermal_max_c": settings.THERMAL_MAX_C,
        "min_bus_voltage_v": settings.BUS_VOLTAGE_MIN_V,
    }
