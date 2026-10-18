"""Telemetry Pydantic Models."""
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class TelemetryChannels(BaseModel):
    attitude_error_deg: float = Field(..., description="Pointing attitude error in degrees")
    reaction_wheel_rpm: float = Field(..., description="Reaction wheel speed in RPM")
    bus_voltage_v: float = Field(..., description="Main power bus voltage in Volts")
    thermal_panel_c: float = Field(..., description="Radiator / panel temperature in Celsius")
    solar_array_w: float = Field(..., description="Solar array generated power in Watts")
    magnetorquer_current_a: float = Field(..., description="Magnetorquer coil current in Amperes")


class ComputedFeatures(BaseModel):
    attitude_error_rolling_mean_60s: float = Field(0.0)
    attitude_error_rate_deg_per_min: float = Field(0.0)
    rw_speed_rolling_std_60s: float = Field(0.0)
    power_margin_percent: float = Field(100.0)


class QualityFlags(BaseModel):
    all_channels_valid: bool = True
    timestamp_synchronized: bool = True


class TelemetryFrame(BaseModel):
    frame_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    satellite_id: str = "SAT-ALPHA-01"
    mission_id: str = "LEO-ORBIT-1"
    channels: TelemetryChannels
    computed_features: ComputedFeatures
    quality_flags: QualityFlags = Field(default_factory=QualityFlags)


class TelemetryBatch(BaseModel):
    frames: list[TelemetryFrame]
    count: int
    start_time: str
    end_time: str
