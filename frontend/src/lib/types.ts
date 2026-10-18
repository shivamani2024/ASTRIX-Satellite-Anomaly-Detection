/**
 * ASTRIX Ground Operations — TypeScript Definitions.
 */

export interface TelemetryChannels {
  attitude_error_deg: number;
  reaction_wheel_rpm: number;
  bus_voltage_v: number;
  thermal_panel_c: number;
  solar_array_w: number;
  magnetorquer_current_a: number;
}

export interface ComputedFeatures {
  attitude_error_rolling_mean_60s: number;
  attitude_error_rate_deg_per_min: number;
  rw_speed_rolling_std_60s: number;
  power_margin_percent: number;
}

export interface QualityFlags {
  all_channels_valid: boolean;
  timestamp_synchronized: boolean;
}

export interface TelemetryFrame {
  frame_id: string;
  timestamp: string;
  satellite_id: string;
  mission_id: string;
  channels: TelemetryChannels;
  computed_features: ComputedFeatures;
  quality_flags: QualityFlags;
}

export type SeverityLevel = "NOMINAL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ChannelSignature {
  trend: string;
  severity: SeverityLevel;
}

export interface AnomalyEvent {
  event_id: string;
  detected_at: string;
  severity: SeverityLevel;
  subsystem: string;
  title: string;
  detection_method: string;
  detectors: {
    isolation_forest_anomaly_score?: number;
    ml_anomalous?: boolean;
    physics_breaches?: string[];
    breach_count?: number;
    [key: string]: any;
  };
  signature: Record<string, ChannelSignature>;
  affected_channels: string[];
  detector_version: string;
  status: "ACTIVE" | "INVESTIGATING" | "MITIGATED" | "RESOLVED";
}

export interface AgentStep {
  agent_name: string;
  status: "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
  started_at?: string;
  completed_at?: string;
  summary: string;
  details: Record<string, any>;
}

export interface EvidencePayload {
  channel: string;
  metric: string;
  value: any;
  baseline: any;
  divergence_sigma: number;
  implication: string;
}

export interface SOPReference {
  sop_id: string;
  title: string;
  category: string;
  relevance_score: number;
  matching_excerpt: string;
}

export interface DiagnosticOutput {
  event_id: string;
  root_cause: string;
  confidence_score: number;
  supporting_evidence: EvidencePayload[];
  referenced_sops: SOPReference[];
  proposed_recovery_action: string;
  recovery_parameters: Record<string, any>;
  rationale: string;
}

export interface InvestigationState {
  event_id: string;
  current_stage: "IDLE" | "RUNNING" | "ANALYST" | "DIAGNOSTIC" | "RECOVERY" | "SAFETY" | "COMPLETED";
  agents: Record<string, AgentStep>;
  diagnostic_output?: DiagnosticOutput;
  is_complete: boolean;
}

export type RiskTier = "T0" | "T1" | "T2" | "T3" | "T4";

export interface PreFlightCheck {
  check_id: string;
  name: string;
  passed: boolean;
  details: string;
  observed_value: any;
  required_bound: string;
}

export interface SafetyValidationResult {
  event_id: string;
  action_id: string;
  action_name: string;
  risk_tier: RiskTier;
  requires_human_approval: boolean;
  pre_flight_checks: PreFlightCheck[];
  all_checks_passed: boolean;
  digital_twin_passed: boolean;
  can_execute: boolean;
  reason: string;
}

export interface ActionPayload {
  action_id: string;
  name: string;
  parameters: Record<string, any>;
}

export interface CryptographicSeal {
  hash_algorithm: string;
  envelope_hash: string;
  previous_block_hash: string;
}

export interface ApprovalSubmission {
  envelope_id: string;
  event_id: string;
  operator_id: string;
  rationale: string;
  clearance_level?: string;
}

export interface CommandEnvelope {
  envelope_id: string;
  created_at: string;
  source_event: string;
  action: ActionPayload;
  risk_assessment: Record<string, any>;
  twin_simulation: Record<string, any>;
  approval?: Record<string, any>;
  cryptographic_seal?: CryptographicSeal;
  status: "PENDING_APPROVAL" | "APPROVED" | "EXECUTED" | "REJECTED";
  execution_result?: Record<string, any>;
}

export interface AuditEntry {
  block_index: number;
  timestamp: string;
  actor: string;
  action_type: string;
  target: string;
  payload_hash: string;
  risk_tier: string;
  status: string;
  previous_block_hash: string;
  block_hash: string;
}

export interface AuditChainVerification {
  is_valid: boolean;
  total_blocks: number;
  tamper_detected: boolean;
  first_invalid_block?: number;
  message: string;
}

export interface SubsystemStatus {
  status: "NOMINAL" | "WARNING" | "CRITICAL";
  mode: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  version: string;
  mission_id: string;
  satellite_id: string;
  subsystems: Record<string, SubsystemStatus>;
  active_anomaly_count: number;
}

export interface TelemetryWebSocketMessage {
  type: "TELEMETRY_FRAME";
  frame: TelemetryFrame;
  engine_status: {
    current_index: number;
    total_frames: number;
    is_playing: boolean;
    playback_speed: number;
    noise_enabled: boolean;
    history_size: number;
  };
  anomaly?: AnomalyEvent;
}
