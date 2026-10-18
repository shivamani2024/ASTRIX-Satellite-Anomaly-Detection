"""Telemetry Engine Service for ASTRIX Ground Operations."""
import asyncio
import json
import os
import random
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from app.config import settings
from app.logger import logger
from app.models.telemetry import TelemetryFrame, TelemetryChannels, ComputedFeatures, QualityFlags


class TelemetryEngine:
    """Manages telemetry frame loading, replay simulation, noise injection, and history buffers."""

    def __init__(self, data_path: Optional[str] = None):
        if data_path is None:
            data_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), "data", "canonical_telemetry.json"
            )
        self.data_path = data_path
        self.frames: List[TelemetryFrame] = []
        self.current_index: int = 0
        self.is_playing: bool = True
        self.playback_speed: float = settings.TELEMETRY_REPLAY_SPEED
        self.noise_enabled: bool = True
        self.history_buffer: List[TelemetryFrame] = []
        self.history_max_size: int = 500
        self.active_fault: Optional[Dict[str, Any]] = None
        
        # Load dataset
        self.load_data()

    def load_data(self):
        """Load canonical telemetry dataset into memory."""
        try:
            if not os.path.exists(self.data_path):
                logger.error(f"Telemetry dataset not found at {self.data_path}")
                return

            with open(self.data_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)

            self.frames = [TelemetryFrame(**item) for item in raw_data]
            self.current_index = 0
            if self.frames:
                self.history_buffer = [self.frames[0]]
            logger.info(f"Loaded {len(self.frames)} telemetry frames from {self.data_path}")
        except Exception as e:
            logger.error(f"Failed to load telemetry dataset: {e}")

    def get_current_frame(self) -> Optional[TelemetryFrame]:
        """Get current active frame."""
        if not self.frames:
            return None
        return self.frames[self.current_index]

    def step_next_frame(self) -> Optional[TelemetryFrame]:
        """Advance to next frame with real-time timestamp and optional noise."""
        if not self.frames:
            return None

        base_frame = self.frames[self.current_index]
        now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        # Apply slight live perturbations if noise enabled
        channels_data = base_frame.channels.model_dump()
        if self.noise_enabled:
            channels_data["attitude_error_deg"] = round(
                max(0.01, channels_data["attitude_error_deg"] + random.gauss(0, 0.003)), 4
            )
            channels_data["reaction_wheel_rpm"] = round(
                channels_data["reaction_wheel_rpm"] + random.gauss(0, 5.0), 1
            )
            channels_data["bus_voltage_v"] = round(
                channels_data["bus_voltage_v"] + random.gauss(0, 0.01), 2
            )
            channels_data["thermal_panel_c"] = round(
                channels_data["thermal_panel_c"] + random.gauss(0, 0.05), 2
            )
            channels_data["solar_array_w"] = round(
                channels_data["solar_array_w"] + random.gauss(0, 0.3), 1
            )
            channels_data["magnetorquer_current_a"] = round(
                channels_data["magnetorquer_current_a"] + random.gauss(0, 0.005), 3
            )

        # Apply active injected fault overrides
        if self.active_fault:
            ftype = self.active_fault.get("fault_type")
            if ftype == "REACTION_WHEEL_SATURATION":
                channels_data["attitude_error_deg"] = round(max(0.85, 0.95 + random.gauss(0, 0.04)), 4)
                channels_data["reaction_wheel_rpm"] = round(max(5800.0, 6150.0 + random.gauss(0, 20.0)), 1)
            elif ftype == "SOLAR_ARRAY_DROP":
                channels_data["solar_array_w"] = round(max(20.0, 32.0 + random.gauss(0, 3.0)), 1)
                channels_data["bus_voltage_v"] = round(max(24.5, 25.15 + random.gauss(0, 0.1)), 2)
            elif ftype == "THERMAL_EXCURSION":
                channels_data["thermal_panel_c"] = round(max(46.0, 49.5 + random.gauss(0, 0.3)), 2)
                channels_data["magnetorquer_current_a"] = round(max(0.80, 0.94 + random.gauss(0, 0.02)), 3)
            elif ftype == "THRUSTER_PRESSURE_LEAK":
                channels_data["bus_voltage_v"] = round(max(25.8, 26.3 + random.gauss(0, 0.05)), 2)
                channels_data["attitude_error_deg"] = round(max(0.42, 0.58 + random.gauss(0, 0.02)), 4)

        frame = TelemetryFrame(
            frame_id=f"LIVE-{self.current_index + 1:04d}",
            timestamp=now_iso,
            satellite_id=settings.SATELLITE_ID,
            mission_id=settings.MISSION_ID,
            channels=TelemetryChannels(**channels_data),
            computed_features=base_frame.computed_features,
            quality_flags=base_frame.quality_flags
        )

        # Update history buffer
        self.history_buffer.append(frame)
        if len(self.history_buffer) > self.history_max_size:
            self.history_buffer.pop(0)

        # Advance index if playing
        if self.is_playing:
            self.current_index = (self.current_index + 1) % len(self.frames)

        return frame

    def play(self):
        self.is_playing = True
        logger.info("Telemetry replay RESUMED")

    def pause(self):
        self.is_playing = False
        logger.info("Telemetry replay PAUSED")

    def set_speed(self, speed: float):
        if speed > 0:
            self.playback_speed = float(speed)
            logger.info(f"Telemetry replay speed set to {self.playback_speed}x")

    def seek(self, frame_index: int):
        if 0 <= frame_index < len(self.frames):
            self.current_index = frame_index
            logger.info(f"Telemetry replay seeked to frame {frame_index}")

    def reset(self):
        self.current_index = 0
        self.history_buffer.clear()
        if self.frames:
            self.history_buffer.append(self.frames[0])
        logger.info("Telemetry replay RESET to frame 0")

    def set_noise(self, enabled: bool):
        self.noise_enabled = enabled
        logger.info(f"Telemetry noise set to {enabled}")

    def trigger_recovery_maneuver(self):
        """Immediately transition telemetry stream to recovery sequence (Phase 4, frame index 180)."""
        self.current_index = 180
        self.is_playing = True
        logger.info("Executing recovery telecommand: Jumped telemetry engine to Phase 4 Desaturation Sequence (frame 180)")

    def get_history(self, limit: int = 100) -> List[TelemetryFrame]:
        """Return the most recent telemetry frames."""
        return self.history_buffer[-limit:]

    def inject_fault(self, fault_type: str, severity: str = "HIGH") -> Dict[str, Any]:
        """Inject an intentional telemetry anomaly fault into the real-time stream."""
        now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        self.active_fault = {
            "fault_type": fault_type,
            "severity": severity,
            "injected_at": now_iso,
            "status": "ACTIVE",
        }
        logger.warning(f"FAULT INJECTED: {fault_type} (Severity: {severity})")
        return self.active_fault

    def clear_fault(self) -> Dict[str, Any]:
        """Clear active injected fault and restore nominal telemetry generation."""
        prev = self.active_fault
        self.active_fault = None
        logger.info(f"FAULT CLEARED: {prev.get('fault_type') if prev else 'None'}")
        return {"status": "CLEARED", "previous_fault": prev}

    def get_active_fault(self) -> Optional[Dict[str, Any]]:
        return self.active_fault

    def get_status(self) -> Dict[str, Any]:
        """Return engine execution status."""
        return {
            "current_index": self.current_index,
            "total_frames": len(self.frames),
            "is_playing": self.is_playing,
            "playback_speed": self.playback_speed,
            "noise_enabled": self.noise_enabled,
            "history_size": len(self.history_buffer),
            "active_fault": self.active_fault,
        }


# Global engine singleton
telemetry_engine = TelemetryEngine()
