"""ASTRIX System Configuration Module."""
import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server
    FASTAPI_PORT: int = 8000
    FASTAPI_HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Mission & Satellite Identity
    MISSION_ID: str = "LEO-ORBIT-1"
    SATELLITE_ID: str = "SAT-ALPHA-01"
    OPERATOR_ID: str = "OPR-SINGH-001"
    OPERATOR_CLEARANCE: str = "LEVEL-2"

    # AI Reasoning
    USE_MOCK_AI: bool = True
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    VOYAGE_API_KEY: str = ""

    # Database
    DATABASE_URL: str = "sqlite:///./astrix_dev.db"

    # Telemetry Engine
    TELEMETRY_REPLAY_SPEED: float = 1.0
    TELEMETRY_BROADCAST_HZ: int = 10

    # Physics Bounds & Anomaly Thresholds
    ATTITUDE_ERROR_THRESHOLD_DEG: float = 0.50
    RW_SPEED_THRESHOLD_RPM: float = 5500.0
    POWER_MARGIN_MIN_PCT: float = 60.0
    THERMAL_MAX_C: float = 45.0
    BUS_VOLTAGE_MIN_V: float = 26.5

    # Safety Matrix
    MIN_COMM_WINDOW_S: int = 180
    MIN_RATIONALE_LENGTH: int = 20

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
