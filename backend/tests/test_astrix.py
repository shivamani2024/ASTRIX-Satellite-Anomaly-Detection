"""Comprehensive Backend Test Suite for ASTRIX Ground Operations."""
import pytest
from app.services.telemetry_engine import TelemetryEngine
from app.services.anomaly_detector import AnomalyDetector
from app.services.rag_engine import RAGEngine
from app.services.digital_twin import DigitalTwinEngine
from app.services.safety_policy import SafetyPolicyEngine
from app.services.audit_logger import AuditLogger
from app.models.safety import RiskTier
from app.models.telemetry import TelemetryFrame, TelemetryChannels, ComputedFeatures, QualityFlags


def test_telemetry_engine_load_and_step():
    """Verify telemetry engine loads canonical dataset and steps forward."""
    engine = TelemetryEngine()
    assert len(engine.frames) > 0
    initial_idx = engine.current_index

    frame = engine.step_next_frame()
    assert frame is not None
    assert frame.satellite_id == "SAT-ALPHA-01"
    assert frame.channels.attitude_error_deg > 0
    assert engine.current_index == (initial_idx + 1) % len(engine.frames)


def test_anomaly_detection_nominal_and_critical():
    """Verify anomaly detector triggers on physical threshold breaches."""
    detector = AnomalyDetector()

    # Nominal frame
    nominal_frame = TelemetryFrame(
        frame_id="TEST-001",
        channels=TelemetryChannels(
            attitude_error_deg=0.08,
            reaction_wheel_rpm=2850.0,
            bus_voltage_v=28.2,
            thermal_panel_c=22.2,
            solar_array_w=212.0,
            magnetorquer_current_a=0.22,
        ),
        computed_features=ComputedFeatures(
            attitude_error_rolling_mean_60s=0.08,
            attitude_error_rate_deg_per_min=0.001,
            rw_speed_rolling_std_60s=12.0,
            power_margin_percent=98.0,
        ),
        quality_flags=QualityFlags(),
    )
    res_nom = detector.process_frame(nominal_frame)
    assert res_nom is None or res_nom.status == "RESOLVED"

    # Critical anomaly frame (momentum saturation)
    anom_frame = TelemetryFrame(
        frame_id="TEST-002",
        channels=TelemetryChannels(
            attitude_error_deg=0.75,
            reaction_wheel_rpm=5750.0,
            bus_voltage_v=27.1,
            thermal_panel_c=38.5,
            solar_array_w=195.0,
            magnetorquer_current_a=0.45,
        ),
        computed_features=ComputedFeatures(
            attitude_error_rolling_mean_60s=0.72,
            attitude_error_rate_deg_per_min=0.08,
            rw_speed_rolling_std_60s=85.0,
            power_margin_percent=82.0,
        ),
        quality_flags=QualityFlags(),
    )
    res_anom = detector.process_frame(anom_frame)
    assert res_anom is not None
    assert res_anom.event_id == "ANM-2048"
    assert res_anom.subsystem == "ADCS"
    assert res_anom.severity.value in ["HIGH", "CRITICAL"]


def test_rag_engine_search():
    """Verify RAG engine retrieves SOP-ADCS-042 for momentum saturation queries."""
    rag = RAGEngine()
    assert len(rag.runbooks) >= 5

    results = rag.search("reaction wheel momentum saturation magnetorquer desaturation", top_k=3)
    assert len(results) > 0
    top = results[0]
    assert top.sop_id == "SOP-ADCS-042"
    assert top.relevance_score > 0.4


def test_digital_twin_lookahead_kinematics():
    """Verify 300s lookahead simulation verifies safety corridor."""
    twin = DigitalTwinEngine()
    sim = twin.simulate(duration_s=300)

    assert sim["passed"] is True
    assert sim["peak_slew_rate_deg_s"] <= 0.25
    assert len(sim["trajectories"]["mitigated"]) == 301
    assert len(sim["trajectories"]["unmitigated"]) == 301
    assert sim["trajectories"]["mitigated"][-1]["reaction_wheel_rpm"] < 3000.0


def test_safety_policy_and_t4_lockout():
    """Verify T0-T4 risk matrix, pre-flight checks, and T4 zero-override lockout."""
    safety = SafetyPolicyEngine()

    # T2 action: Reaction wheel desaturation
    val_t2 = safety.run_pre_flight_checks(
        event_id="ANM-2048",
        action_id="CMD_DESAT_MTQ_042",
        action_name="Desaturation",
    )
    assert val_t2.risk_tier == RiskTier.T2
    assert val_t2.requires_human_approval is True
    assert len(val_t2.pre_flight_checks) == 7
    assert val_t2.all_checks_passed is True

    # T4 action: Reboot main flight computer (must be blocked 100%)
    val_t4 = safety.run_pre_flight_checks(
        event_id="ANM-2048",
        action_id="CMD_REBOOT_FLIGHT_COMPUTER_HARD",
        action_name="Emergency Hard Reboot",
    )
    assert val_t4.risk_tier == RiskTier.T4
    assert val_t4.can_execute is False
    assert "ZERO-OVERRIDE" in val_t4.reason


def test_audit_ledger_cryptographic_verification_and_tamper():
    """Verify SHA-256 hash chaining and tamper-evident detection."""
    import os
    if os.path.exists("./scratch_test_ledger.json"):
        os.remove("./scratch_test_ledger.json")
    ledger = AuditLogger(ledger_file="./scratch_test_ledger.json")

    # Verify initial genesis
    verif = ledger.verify_chain()
    assert verif.is_valid is True

    # Append test block
    entry = ledger.append_entry(
        actor="TEST_OPERATOR",
        action_type="TEST_ACTION",
        target="SAT-ALPHA-01",
        payload={"msg": "Valid payload"},
        risk_tier="T1",
    )
    assert entry.block_index == 1
    assert ledger.verify_chain().is_valid is True

    # Simulate Tampering on Block #1
    tampered = ledger.tamper_block_for_demo(1, "MALICIOUS_IMPOSTER")
    assert tampered is True

    # Recalculate verification: must detect tamper!
    ruptured_verif = ledger.verify_chain()
    assert ruptured_verif.is_valid is False
    assert ruptured_verif.tamper_detected is True
    assert ruptured_verif.first_invalid_block == 1
    
    # Cleanup scratch ledger
    import os
    if os.path.exists("./scratch_test_ledger.json"):
        os.remove("./scratch_test_ledger.json")


def test_opssat_ml_model_metrics_and_inference():
    """Verify trained ESA OPS-SAT model metrics and inference capabilities."""
    detector = AnomalyDetector()
    metrics = detector.get_opssat_metrics()
    assert metrics is not None
    assert "test_metrics" in metrics
    assert metrics["test_metrics"]["accuracy"] > 0.90
    assert metrics["test_metrics"]["roc_auc"] > 0.95
    assert len(metrics["channel_breakdown"]) == 9

    # Test prediction on a sample telemetry feature vector
    sample_nominal = {
        "mean": 0.05,
        "var": 0.001,
        "std": 0.03,
        "kurtosis": 2.5,
        "skew": 0.1,
        "n_peaks": 4,
        "diff_var": 0.0001,
    }
    pred = detector.predict_opssat_segment(sample_nominal)
    assert "anomaly" in pred
    assert "confidence" in pred
    assert "model" in pred


def test_fault_injection_and_clear():
    """Verify fault injection modifies telemetry bus values and clear restores nominal."""
    engine = TelemetryEngine()
    assert engine.active_fault is None

    # Inject Solar Array Drop fault
    res = engine.inject_fault("SOLAR_ARRAY_DROP", severity="CRITICAL")
    assert res["status"] == "ACTIVE"
    assert engine.active_fault["fault_type"] == "SOLAR_ARRAY_DROP"

    frame = engine.step_next_frame()
    assert frame.channels.solar_array_w < 50.0  # Nominally 212W
    assert frame.channels.bus_voltage_v < 26.0  # Nominally 28.2V

    # Clear fault
    cleared = engine.clear_fault()
    assert cleared["status"] == "CLEARED"
    assert engine.active_fault is None


def test_orbit_service_ground_track():
    """Verify Keplerian orbit service computes ground track and station passes."""
    from app.services.orbit_service import orbit_service
    track = orbit_service.get_ground_track()

    assert "satellite" in track
    assert track["satellite"]["altitude_km"] == 540.0
    assert "current_pos" in track["satellite"]
    assert -90.0 <= track["satellite"]["current_pos"]["lat"] <= 90.0
    assert -180.0 <= track["satellite"]["current_pos"]["lon"] <= 180.0
    assert len(track["past_track"]) == 45
    assert len(track["future_track"]) == 91
    assert len(track["ground_stations"]) == 4


