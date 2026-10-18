"""Operator Profile and Clearance Verification Router."""
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/operator")
def get_operator_profile():
    """Retrieve active ground console operator profile and clearance permissions."""
    return {
        "operator_id": settings.OPERATOR_ID,
        "name": "Capt. P. Singh",
        "role": "ADCS Subsystem Specialist / Primary Flight Controller",
        "clearance_level": settings.OPERATOR_CLEARANCE,
        "authorized_tiers": ["T0", "T1", "T2"],
        "callsign": "ASTRIX-CONTROL-1",
        "station": "ISRO-ISTRAC Deep Space Ground Network",
    }
