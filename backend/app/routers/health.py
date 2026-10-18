"""System Health & Subsystem Status Router."""
from datetime import datetime, timezone
from fastapi import APIRouter
from app.config import settings
from app.services.telemetry_engine import telemetry_engine
from app.services.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
@router.get("/")
def get_system_health():
    """Get overall system health and subsystem telemetry status."""
    curr = telemetry_engine.get_current_frame()
    active_anomalies = anomaly_detector.get_active_anomalies()

    adcs_status = "CRITICAL" if any(a.subsystem == "ADCS" for a in active_anomalies) else "NOMINAL"
    eps_status = "WARNING" if curr and curr.channels.bus_voltage_v < 27.2 else "NOMINAL"
    thermal_status = "WARNING" if curr and curr.channels.thermal_panel_c > 35.0 else "NOMINAL"

    return {
        "status": "OPERATIONAL",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "version": "1.0.0",
        "mission_id": settings.MISSION_ID,
        "satellite_id": settings.SATELLITE_ID,
        "subsystems": {
            "ADCS": {"status": adcs_status, "mode": "3-AXIS_FINE_POINTING"},
            "EPS": {"status": eps_status, "mode": "SUNLIGHT_REGULATED"},
            "THERMAL": {"status": thermal_status, "mode": "PASSIVE_HEAT_PIPE"},
            "COMM": {"status": "NOMINAL", "mode": "S-BAND_HIGH_RATE"},
            "PROP": {"status": "NOMINAL", "mode": "VALVES_ISOLATED"},
            "CDH": {"status": "NOMINAL", "mode": "DUAL_FLIGHT_COMPUTER_SYNC"},
        },
        "active_anomaly_count": len(active_anomalies),
    }
