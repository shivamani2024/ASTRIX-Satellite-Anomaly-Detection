"""Hybrid Anomaly Detection Service (Isolation Forest + Deterministic Physics Bounds)."""
import os
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from collections import deque

from app.config import settings
from app.logger import logger
from app.models.telemetry import TelemetryFrame
from app.models.anomaly import AnomalyEvent, SeverityLevel, ChannelSignature


class AnomalyDetector:
    """Hybrid detection engine evaluating deterministic physical thresholds and statistical ML anomalies."""

    def __init__(self):
        self.active_anomalies: Dict[str, AnomalyEvent] = {}
        self.anomaly_history: List[AnomalyEvent] = []
        self.recent_frames: deque = deque(maxlen=30)
        self.model = None
        self.is_trained: bool = False
        
        # Nominal baselines (means and stds) for fallback statistical scoring
        self.nominal_baseline = {
            "attitude_error_deg": (0.08, 0.02),
            "reaction_wheel_rpm": (2850.0, 50.0),
            "bus_voltage_v": (28.2, 0.05),
            "thermal_panel_c": (22.2, 0.5),
            "solar_array_w": (212.0, 3.0),
            "magnetorquer_current_a": (0.22, 0.03),
        }

        self.opssat_pipeline = None
        self.opssat_metrics = None
        self._init_model()

    def _init_model(self):
        """Attempt to load trained ESA OPS-SAT ML pipeline and baseline Isolation Forest."""
        try:
            import joblib
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
            model_path = os.path.join(data_dir, "opssat_model.joblib")
            metrics_path = os.path.join(data_dir, "opssat_metrics.json")

            if os.path.exists(model_path):
                self.opssat_pipeline = joblib.load(model_path)
                logger.info(f"Loaded trained ESA OPS-SAT ML pipeline from {model_path}")

            if os.path.exists(metrics_path):
                with open(metrics_path, "r", encoding="utf-8") as f:
                    self.opssat_metrics = json.load(f)
                logger.info("Loaded ESA OPS-SAT benchmark metrics metadata")

            from sklearn.ensemble import IsolationForest
            import numpy as np

            data_path = os.path.join(data_dir, "canonical_telemetry.json")
            if os.path.exists(data_path):
                with open(data_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Extract first 60 frames (nominal Phase 1)
                train_samples = []
                for item in data[:60]:
                    ch = item["channels"]
                    cf = item.get("computed_features", {})
                    train_samples.append([
                        ch["attitude_error_deg"],
                        ch["reaction_wheel_rpm"],
                        ch["bus_voltage_v"],
                        ch["thermal_panel_c"],
                        ch["solar_array_w"],
                        ch["magnetorquer_current_a"],
                        cf.get("attitude_error_rolling_mean_60s", ch["attitude_error_deg"]),
                        cf.get("rw_speed_rolling_std_60s", 15.0),
                    ])

                if train_samples:
                    X = np.array(train_samples)
                    self.model = IsolationForest(
                        n_estimators=100,
                        contamination=0.01,
                        random_state=42
                    )
                    self.model.fit(X)
                    self.is_trained = True
                    logger.info("Isolation Forest anomaly detector initialized and fitted on nominal baseline")
        except Exception as e:
            logger.warning(f"Could not initialize ML models: {e}")

    def get_opssat_metrics(self) -> Optional[Dict[str, Any]]:
        """Return metrics and information on the trained ESA OPS-SAT benchmark model."""
        return self.opssat_metrics

    def predict_opssat_segment(self, features: Dict[str, float]) -> Dict[str, Any]:
        """Predict anomaly probability on raw or engineered telemetry feature vector."""
        if not self.opssat_pipeline:
            return {"error": "OPS-SAT model not loaded"}
        try:
            import numpy as np
            feature_cols = self.opssat_pipeline["feature_cols"]
            scaler = self.opssat_pipeline["scaler"]
            clf = self.opssat_pipeline["rf_classifier"]
            iso = self.opssat_pipeline["isolation_forest"]

            vec = np.array([[features.get(col, 0.0) for col in feature_cols]])
            scaled_vec = scaler.transform(vec)
            prob = float(clf.predict_proba(scaled_vec)[0, 1])
            is_anomaly = bool(prob >= 0.5)
            iso_score = float(iso.decision_function(scaled_vec)[0])

            return {
                "anomaly": is_anomaly,
                "confidence": round(prob, 4),
                "novelty_score": round(iso_score, 4),
                "model": "ESA OPS-SAT Random Forest + Isolation Forest"
            }
        except Exception as e:
            return {"error": str(e)}

    def _compute_ml_score(self, frame: TelemetryFrame) -> float:
        """Compute ML anomaly score (0.0 = nominal, 1.0 = highly anomalous)."""
        ch = frame.channels
        cf = frame.computed_features

        if self.is_trained and self.model is not None:
            try:
                import numpy as np
                feature_vec = np.array([[
                    ch.attitude_error_deg,
                    ch.reaction_wheel_rpm,
                    ch.bus_voltage_v,
                    ch.thermal_panel_c,
                    ch.solar_array_w,
                    ch.magnetorquer_current_a,
                    cf.attitude_error_rolling_mean_60s,
                    cf.rw_speed_rolling_std_60s,
                ]])
                # decision_function returns negative values for anomalies, positive for nominal
                raw_score = float(self.model.decision_function(feature_vec)[0])
                # Normalize raw_score (approx -0.5 to +0.5) to 0.0 (nominal) -> 1.0 (anomalous)
                normalized = max(0.0, min(1.0, 0.5 - (raw_score * 2.0)))
                return round(normalized, 4)
            except Exception:
                pass

        # Fallback: statistical Mahalanobis/Z-score sum
        total_z2 = 0.0
        for key, (mean_val, std_val) in self.nominal_baseline.items():
            val = getattr(ch, key, mean_val)
            z = (val - mean_val) / (std_val if std_val > 0 else 1.0)
            total_z2 += (z ** 2)

        # Normalize total z-score to 0.0 - 1.0
        heuristic_score = max(0.0, min(1.0, (total_z2 ** 0.5) / 15.0))
        return round(heuristic_score, 4)

    def _evaluate_trends(self, frame: TelemetryFrame) -> Dict[str, ChannelSignature]:
        """Compute trends and severity for each channel based on recent history."""
        signatures: Dict[str, ChannelSignature] = {}
        ch = frame.channels

        if len(self.recent_frames) < 3:
            for field_name in ch.model_dump().keys():
                signatures[field_name] = ChannelSignature(
                    trend="STABLE", severity=SeverityLevel.NOMINAL
                )
            return signatures

        # Analyze each channel
        for field_name in ch.model_dump().keys():
            current_val = getattr(ch, field_name)
            past_vals = [getattr(f.channels, field_name) for f in self.recent_frames]
            delta = current_val - past_vals[0]
            avg_past = sum(past_vals) / len(past_vals)

            # Trend determination
            rel_change = delta / (avg_past if abs(avg_past) > 0.001 else 1.0)
            if rel_change > 0.08:
                trend = "INCREASING"
            elif rel_change < -0.08:
                trend = "DECREASING"
            elif field_name == "reaction_wheel_rpm" and current_val > 5500.0:
                trend = "SATURATED"
            elif field_name == "attitude_error_deg" and current_val > 0.50:
                trend = "ELEVATED"
            else:
                trend = "STABLE"

            # Severity classification
            severity = SeverityLevel.NOMINAL
            if field_name == "reaction_wheel_rpm":
                if current_val > settings.RW_SPEED_THRESHOLD_RPM:
                    severity = SeverityLevel.CRITICAL
                elif current_val > 4800.0:
                    severity = SeverityLevel.HIGH
                elif current_val > 4000.0:
                    severity = SeverityLevel.MEDIUM
            elif field_name == "attitude_error_deg":
                if current_val > 1.5:
                    severity = SeverityLevel.CRITICAL
                elif current_val > settings.ATTITUDE_ERROR_THRESHOLD_DEG:
                    severity = SeverityLevel.HIGH
                elif current_val > 0.30:
                    severity = SeverityLevel.MEDIUM
            elif field_name == "thermal_panel_c":
                if current_val > settings.THERMAL_MAX_C:
                    severity = SeverityLevel.CRITICAL
                elif current_val > 38.0:
                    severity = SeverityLevel.HIGH
            elif field_name == "bus_voltage_v":
                if current_val < settings.BUS_VOLTAGE_MIN_V:
                    severity = SeverityLevel.CRITICAL
                elif current_val < 27.2:
                    severity = SeverityLevel.HIGH

            signatures[field_name] = ChannelSignature(trend=trend, severity=severity)

        return signatures

    def process_frame(self, frame: TelemetryFrame) -> Optional[AnomalyEvent]:
        """Process incoming frame and detect anomalies."""
        self.recent_frames.append(frame)
        ch = frame.channels
        cf = frame.computed_features

        # 1. Evaluate Physics Bounds
        physics_breaches = []
        if ch.attitude_error_deg > settings.ATTITUDE_ERROR_THRESHOLD_DEG:
            physics_breaches.append(
                f"Attitude error {ch.attitude_error_deg}° exceeds threshold {settings.ATTITUDE_ERROR_THRESHOLD_DEG}°"
            )
        if ch.reaction_wheel_rpm > settings.RW_SPEED_THRESHOLD_RPM:
            physics_breaches.append(
                f"Reaction wheel {ch.reaction_wheel_rpm} RPM exceeds redline {settings.RW_SPEED_THRESHOLD_RPM} RPM"
            )
        if ch.bus_voltage_v < settings.BUS_VOLTAGE_MIN_V:
            physics_breaches.append(
                f"Bus voltage {ch.bus_voltage_v}V below threshold {settings.BUS_VOLTAGE_MIN_V}V"
            )
        if ch.thermal_panel_c > settings.THERMAL_MAX_C:
            physics_breaches.append(
                f"Thermal panel {ch.thermal_panel_c}°C exceeds limit {settings.THERMAL_MAX_C}°C"
            )
        if cf.power_margin_percent < settings.POWER_MARGIN_MIN_PCT:
            physics_breaches.append(
                f"Power margin {cf.power_margin_percent}% below minimum {settings.POWER_MARGIN_MIN_PCT}%"
            )

        # 2. Evaluate ML Anomaly Score
        ml_score = self._compute_ml_score(frame)
        is_ml_anomalous = ml_score > 0.65

        signatures = self._evaluate_trends(frame)

        # If either physics or ML detects an anomaly
        is_anomalous = len(physics_breaches) > 0 or is_ml_anomalous

        event_id = "ANM-2048"

        if is_anomalous:
            # Determine overall severity
            if ch.reaction_wheel_rpm > 5500.0 or ch.attitude_error_deg > 1.5:
                severity = SeverityLevel.CRITICAL
            elif ch.attitude_error_deg > settings.ATTITUDE_ERROR_THRESHOLD_DEG:
                severity = SeverityLevel.HIGH
            elif ml_score > 0.75:
                severity = SeverityLevel.MEDIUM
            else:
                severity = SeverityLevel.LOW

            affected_channels = [
                k for k, sig in signatures.items() if sig.severity != SeverityLevel.NOMINAL
            ]
            if not affected_channels and len(physics_breaches) > 0:
                affected_channels = ["reaction_wheel_rpm", "attitude_error_deg"]

            event = AnomalyEvent(
                event_id=event_id,
                detected_at=frame.timestamp,
                severity=severity,
                subsystem="ADCS",
                title="Reaction Wheel Momentum Saturation & Pointing Error Excursion",
                detection_method="HYBRID (Isolation Forest + Physics Bounds)",
                detectors={
                    "isolation_forest_anomaly_score": ml_score,
                    "ml_anomalous": is_ml_anomalous,
                    "physics_breaches": physics_breaches,
                    "breach_count": len(physics_breaches),
                },
                signature=signatures,
                affected_channels=affected_channels,
                detector_version="v2.4.1-hybrid",
                status="ACTIVE",
            )

            self.active_anomalies[event_id] = event
            # Also keep in history (update if exists)
            hist_match = next((e for e in self.anomaly_history if e.event_id == event_id), None)
            if not hist_match:
                self.anomaly_history.append(event)
            else:
                idx = self.anomaly_history.index(hist_match)
                self.anomaly_history[idx] = event

            return event

        else:
            # If was active and now back in nominal bounds, mark resolved
            if event_id in self.active_anomalies:
                resolved_event = self.active_anomalies[event_id]
                resolved_event.status = "RESOLVED"
                resolved_event.severity = SeverityLevel.NOMINAL
                del self.active_anomalies[event_id]
                logger.info(f"Anomaly {event_id} has stabilized and is marked RESOLVED")
                return resolved_event

        return None

    def get_active_anomalies(self) -> List[AnomalyEvent]:
        return list(self.active_anomalies.values())

    def get_anomaly_history(self) -> List[AnomalyEvent]:
        return self.anomaly_history

    def get_anomaly_by_id(self, event_id: str) -> Optional[AnomalyEvent]:
        if event_id in self.active_anomalies:
            return self.active_anomalies[event_id]
        return next((e for e in self.anomaly_history if e.event_id == event_id), None)


anomaly_detector = AnomalyDetector()
