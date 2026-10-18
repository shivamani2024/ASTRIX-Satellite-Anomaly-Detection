"""Command Envelope and Human-In-The-Loop Approval Router."""
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.logger import logger
from app.models.command import CommandEnvelope, ActionPayload, ApprovalSubmission, CryptographicSeal
from app.services.safety_policy import safety_policy_engine
from app.services.digital_twin import digital_twin_engine
from app.services.audit_logger import audit_logger
from app.services.telemetry_engine import telemetry_engine

router = APIRouter(prefix="/commands", tags=["Commands"])

# Active command envelopes stored in-memory
envelopes: Dict[str, CommandEnvelope] = {}


@router.get("/envelope/{event_id}", response_model=CommandEnvelope)
def get_command_envelope(event_id: str):
    """Retrieve or construct the pending command envelope for an anomaly."""
    if event_id not in envelopes:
        action = ActionPayload(
            action_id="CMD_DESAT_MTQ_042",
            name="Reaction Wheel Magnetorquer Desaturation",
            parameters={
                "target_rpm": 2500.0,
                "gain_k": 0.045,
                "active_axes": ["Y", "Z"],
                "pulse_width_ms": 250,
            },
        )
        twin_sim = digital_twin_engine.simulate(
            initial_frame=telemetry_engine.get_current_frame(),
            action_id=action.action_id,
            action_params=action.parameters,
        )
        safety_val = safety_policy_engine.run_pre_flight_checks(
            event_id=event_id,
            action_id=action.action_id,
            action_name=action.name,
            action_params=action.parameters,
        )

        envelope_id = f"ENV-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        envelopes[event_id] = CommandEnvelope(
            envelope_id=envelope_id,
            created_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            source_event=event_id,
            action=action,
            risk_assessment=safety_val.model_dump(),
            twin_simulation={
                "simulation_id": twin_sim["simulation_id"],
                "passed": twin_sim["passed"],
                "peak_slew_deg_s": twin_sim["peak_slew_rate_deg_s"],
                "settling_time_s": twin_sim["settling_time_s"],
            },
            status="PENDING_APPROVAL",
        )

    return envelopes[event_id]


@router.post("/submit-approval")
def submit_approval(submission: ApprovalSubmission):
    """Operator sign-off submission with engineering rationale verification."""
    envelope = envelopes.get(submission.event_id)
    if not envelope:
        raise HTTPException(status_code=404, detail=f"No command envelope found for {submission.event_id}")

    validation = safety_policy_engine.validate_operator_submission(
        envelope=envelope,
        operator_id=submission.operator_id,
        clearance=submission.clearance_level,
        rationale=submission.rationale,
    )

    if not validation["authorized"]:
        raise HTTPException(
            status_code=validation["status_code"],
            detail=validation["error"],
        )

    # Append approval block to cryptographic ledger
    last_block = audit_logger.chain[-1] if audit_logger.chain else None
    prev_hash = last_block.block_hash if last_block else "0" * 64

    audit_entry = audit_logger.append_entry(
        actor=submission.operator_id,
        action_type="HUMAN_APPROVED",
        target=f"{submission.event_id}:{envelope.action.action_id}",
        payload={
            "envelope_id": envelope.envelope_id,
            "rationale": submission.rationale,
            "clearance": submission.clearance_level,
        },
        risk_tier=envelope.risk_assessment.get("risk_tier", "T2"),
        status="APPROVED",
    )

    # Dispatch Uplink Command
    uplink_entry = audit_logger.append_entry(
        actor="UPLINK_CONTROLLER",
        action_type="COMMAND_UPLINKED",
        target=envelope.action.action_id,
        payload=envelope.action.model_dump(),
        risk_tier=envelope.risk_assessment.get("risk_tier", "T2"),
        status="EXECUTED",
    )

    # Trigger recovery maneuver in telemetry engine (jumps to Phase 4 desaturation)
    telemetry_engine.trigger_recovery_maneuver()

    envelope.approval = validation
    envelope.cryptographic_seal = CryptographicSeal(
        hash_algorithm="SHA-256",
        envelope_hash=uplink_entry.payload_hash,
        previous_block_hash=uplink_entry.previous_block_hash,
    )
    envelope.status = "EXECUTED"
    envelope.execution_result = {
        "telecommand_frame_id": f"TC-{envelope.envelope_id}",
        "carrier_freq_mhz": 2048.5,
        "transmission_status": "ACK_RECEIVED",
        "postcondition": "Magnetorquer pulse sequence active. Reaction wheel deceleration initiated.",
        "audit_block_index": uplink_entry.block_index,
        "block_hash": uplink_entry.block_hash,
    }

    logger.info(f"Command envelope {envelope.envelope_id} approved and executed by {submission.operator_id}")
    return envelope
