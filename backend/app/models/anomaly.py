"""Anomaly Pydantic Models."""
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SeverityLevel(str, Enum):
    NOMINAL = "NOMINAL"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ChannelSignature(BaseModel):
    trend: str = Field(..., description="e.g. INCREASING, DECREASING, STABLE, ELEVATED")
    severity: SeverityLevel


class AnomalyEvent(BaseModel):
    event_id: str = Field(..., description="Unique anomaly ID, e.g. ANM-2048")
    detected_at: str = Field(..., description="ISO-8601 timestamp")
    severity: SeverityLevel
    subsystem: str = Field(..., description="Subsystem affected e.g. ADCS, EPS, THERMAL")
    title: str
    detection_method: str = "HYBRID"
    detectors: Dict[str, Any] = Field(
        default_factory=dict,
        description="Isolation forest anomaly score & physics bounds breaches"
    )
    signature: Dict[str, ChannelSignature] = Field(default_factory=dict)
    affected_channels: List[str] = Field(default_factory=list)
    detector_version: str = "v2.4.1-hybrid"
    status: str = "ACTIVE"  # ACTIVE, INVESTIGATING, MITIGATED, RESOLVED
