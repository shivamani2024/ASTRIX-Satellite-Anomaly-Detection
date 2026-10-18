"""Orbital Ground Track and Ground Station Pass Service for ASTRIX."""
import math
import time
from datetime import datetime, timezone
from typing import Dict, List, Any

# Standard European & Global Space Tracking Ground Stations
GROUND_STATIONS = [
    {
        "id": "SGS",
        "name": "Svalbard Ground Station",
        "lat": 78.2298,
        "lon": 15.4078,
        "country": "Norway",
        "mask_deg": 5.0,
        "cone_radius_km": 1900.0,
    },
    {
        "id": "KRN",
        "name": "Kiruna Station (ESRANGE)",
        "lat": 67.8558,
        "lon": 20.9647,
        "country": "Sweden",
        "mask_deg": 5.0,
        "cone_radius_km": 1750.0,
    },
    {
        "id": "KRU",
        "name": "Kourou CSG Tracking",
        "lat": 5.2514,
        "lon": -52.8092,
        "country": "French Guiana",
        "mask_deg": 5.0,
        "cone_radius_km": 1800.0,
    },
    {
        "id": "REU",
        "name": "Redu Deep Space / Ops Centre",
        "lat": 50.0022,
        "lon": 5.1467,
        "country": "Belgium",
        "mask_deg": 5.0,
        "cone_radius_km": 1650.0,
    },
]

EARTH_RADIUS_KM = 6371.0
ORBIT_ALTITUDE_KM = 540.0
ORBIT_INCLINATION_DEG = 97.4  # Sun-synchronous LEO
ORBIT_PERIOD_SEC = 95.4 * 60.0  # ~5724 seconds
ORBITAL_VELOCITY_KM_S = 7.58


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great circle distance between two points on Earth in km."""
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def get_satellite_position_at_time(t_epoch_sec: float) -> Dict[str, Any]:
    """Calculate sub-satellite position for a 540km SSO orbit at given epoch."""
    omega = (2 * math.pi) / ORBIT_PERIOD_SEC
    u = omega * (t_epoch_sec % ORBIT_PERIOD_SEC)

    inc_rad = math.radians(ORBIT_INCLINATION_DEG)
    sin_lat = math.sin(inc_rad) * math.sin(u)
    lat_rad = math.asin(max(-1.0, min(1.0, sin_lat)))
    lat_deg = math.degrees(lat_rad)

    earth_rot_deg_per_sec = 360.0 / 86164.09
    lon_asc_node = -15.0 - (earth_rot_deg_per_sec * t_epoch_sec) % 360.0

    cos_u = math.cos(u)
    cos_lat = math.cos(lat_rad)
    if abs(cos_lat) > 1e-6:
        cos_dlon = max(-1.0, min(1.0, cos_u / cos_lat))
        dlon_rad = math.acos(cos_dlon)
        if math.sin(u) < 0:
            dlon_rad = 2 * math.pi - dlon_rad
    else:
        dlon_rad = 0.0

    lon_deg = (lon_asc_node + math.degrees(dlon_rad)) % 360.0
    if lon_deg > 180.0:
        lon_deg -= 360.0

    return {
        "lat": round(lat_deg, 3),
        "lon": round(lon_deg, 3),
        "alt_km": ORBIT_ALTITUDE_KM,
        "vel_km_s": ORBITAL_VELOCITY_KM_S,
        "sunlit": bool(math.cos(u) > -0.2),
    }


class OrbitService:
    """Manages ground track propagation and ground station contacts."""

    def __init__(self):
        self.reference_epoch = time.time()

    def get_ground_track(self) -> Dict[str, Any]:
        """Compute current position, past orbit (45 min), and future orbit (90 min)."""
        now = time.time()
        curr_pos = get_satellite_position_at_time(now)

        # Generate past track (-45 min to 0 min, 45 points)
        past_track: List[List[float]] = []
        for dt_min in range(-45, 0, 1):
            pos = get_satellite_position_at_time(now + (dt_min * 60))
            past_track.append([pos["lat"], pos["lon"]])

        # Generate future track (0 min to +90 min, 90 points)
        future_track: List[List[float]] = []
        for dt_min in range(0, 91, 1):
            pos = get_satellite_position_at_time(now + (dt_min * 60))
            future_track.append([pos["lat"], pos["lon"]])

        # Check ground station contacts
        stations_status = []
        active_contact = None

        for gs in GROUND_STATIONS:
            dist = _haversine_km(curr_pos["lat"], curr_pos["lon"], gs["lat"], gs["lon"])
            in_contact = dist <= gs["cone_radius_km"]

            elevation_deg = 0.0
            if in_contact:
                elevation_deg = max(5.0, round(90.0 * (1.0 - (dist / gs["cone_radius_km"])), 1))

            status_entry = {
                **gs,
                "distance_km": round(dist, 1),
                "in_contact": in_contact,
                "elevation_deg": elevation_deg,
            }
            stations_status.append(status_entry)

            if in_contact and (active_contact is None or dist < active_contact["distance_km"]):
                active_contact = status_entry

        los_seconds = 420
        contact_name = "Svalbard Ground Station (SGS)"
        if active_contact:
            contact_name = active_contact["name"]
            remaining_km = max(50.0, active_contact["cone_radius_km"] - active_contact["distance_km"])
            los_seconds = max(15, int(remaining_km / ORBITAL_VELOCITY_KM_S))

        return {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "satellite": {
                "id": "SAT-ALPHA-01",
                "name": "ASTRIX LEO Sentinel",
                "orbit_type": "SSO (Sun-Synchronous LEO)",
                "altitude_km": ORBIT_ALTITUDE_KM,
                "inclination_deg": ORBIT_INCLINATION_DEG,
                "period_min": round(ORBIT_PERIOD_SEC / 60.0, 1),
                "velocity_km_s": ORBITAL_VELOCITY_KM_S,
                "current_pos": curr_pos,
            },
            "past_track": past_track,
            "future_track": future_track,
            "ground_stations": stations_status,
            "active_contact": active_contact,
            "contact_summary": {
                "active_station": contact_name,
                "status": "IN_PASS" if active_contact else "OUT_OF_PASS",
                "los_seconds": los_seconds,
                "uplink_frequency": "2215.5 MHz (S-Band)",
                "downlink_frequency": "8450.0 MHz (X-Band High-Rate)",
            },
        }


# Global orbit service instance
orbit_service = OrbitService()
