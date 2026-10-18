"""Orbital Ground Track and Pass Prediction API Router."""
from fastapi import APIRouter
from app.services.orbit_service import orbit_service

router = APIRouter(prefix="/orbit", tags=["Orbit"])


@router.get("/ground-track")
def get_ground_track():
    """Retrieve real-time orbital ground track, coordinates, and ground station visibility cones."""
    return orbit_service.get_ground_track()
