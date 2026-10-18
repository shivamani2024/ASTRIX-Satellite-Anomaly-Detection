/**
 * ASTRIX Ground Operations — Typed API Client.
 */
import {
  SystemHealth,
  TelemetryFrame,
  AnomalyEvent,
  InvestigationState,
  DiagnosticOutput,
  SafetyValidationResult,
  CommandEnvelope,
  ApprovalSubmission,
  AuditEntry,
  AuditChainVerification,
} from "./types";
import { API_BASE } from "./constants";

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let errorDetail = "API request failed";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `${res.status} ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson<SystemHealth>("/health/"),

  // Telemetry
  getTelemetryCurrent: () => fetchJson<TelemetryFrame | null>("/telemetry/current"),
  getTelemetryHistory: (limit = 100) => fetchJson<TelemetryFrame[]>(`/telemetry/history?limit=${limit}`),
  getEngineStatus: () => fetchJson<any>("/telemetry/status"),
  playTelemetry: () => fetchJson<any>("/telemetry/play", { method: "POST" }),
  pauseTelemetry: () => fetchJson<any>("/telemetry/pause", { method: "POST" }),
  setSpeed: (speed: number) =>
    fetchJson<any>("/telemetry/speed", {
      method: "POST",
      body: JSON.stringify({ speed }),
    }),
  seekFrame: (frame_index: number) =>
    fetchJson<any>("/telemetry/seek", {
      method: "POST",
      body: JSON.stringify({ frame_index }),
    }),
  resetTelemetry: () => fetchJson<any>("/telemetry/reset", { method: "POST" }),
  toggleNoise: (enabled: boolean) =>
    fetchJson<any>("/telemetry/noise", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),

  // Anomalies
  getActiveAnomalies: () => fetchJson<AnomalyEvent[]>("/anomalies/active"),
  getAnomalyHistory: () => fetchJson<AnomalyEvent[]>("/anomalies/history"),
  getAnomalyById: (id: string) => fetchJson<AnomalyEvent>(`/anomalies/${id}`),

  // AI Investigation
  triggerInvestigation: (event_id = "ANM-2048") =>
    fetchJson<InvestigationState>("/investigation/trigger", {
      method: "POST",
      body: JSON.stringify({ event_id }),
    }),
  getInvestigationStatus: (event_id: string) =>
    fetchJson<InvestigationState>(`/investigation/status/${event_id}`),
  getInvestigationDossier: (event_id: string) =>
    fetchJson<DiagnosticOutput>(`/investigation/dossier/${event_id}`),

  // Digital Twin
  simulateTwin: (action_id = "CMD_DESAT_MTQ_042", action_params?: any, duration_s = 300) =>
    fetchJson<any>("/twin/simulate", {
      method: "POST",
      body: JSON.stringify({ action_id, action_params, duration_s }),
    }),
  getSafetyEnvelope: () => fetchJson<any>("/twin/envelope"),

  // Safety
  validateSafety: (event_id = "ANM-2048", action_id = "CMD_DESAT_MTQ_042", action_name = "Desaturation", action_params?: any) =>
    fetchJson<SafetyValidationResult>("/safety/validate", {
      method: "POST",
      body: JSON.stringify({ event_id, action_id, action_name, action_params }),
    }),
  getRiskMatrix: () => fetchJson<any>("/safety/risk-matrix"),

  // Commands & Approvals
  getCommandEnvelope: (event_id = "ANM-2048") => fetchJson<CommandEnvelope>(`/commands/envelope/${event_id}`),
  submitApproval: (submission: ApprovalSubmission) =>
    fetchJson<CommandEnvelope>("/commands/submit-approval", {
      method: "POST",
      body: JSON.stringify(submission),
    }),

  // Audit Ledger
  getAuditEntries: (limit = 100) => fetchJson<AuditEntry[]>(`/audit/entries?limit=${limit}`),
  verifyAuditChain: () => fetchJson<AuditChainVerification>("/audit/verify"),
  simulateTamper: (block_index: number, tampered_actor = "MALICIOUS_IMPOSTER") =>
    fetchJson<any>("/audit/tamper-demo", {
      method: "POST",
      body: JSON.stringify({ block_index, tampered_actor }),
    }),

  // Runbooks SOP Library
  getAllRunbooks: () => fetchJson<any[]>("/runbooks/all"),
  searchRunbooks: (q: string, top_k = 5) => fetchJson<any[]>(`/runbooks/search?q=${encodeURIComponent(q)}&top_k=${top_k}`),
  getRunbookById: (sop_id: string) => fetchJson<any>(`/runbooks/${sop_id}`),

  // Operator Auth Profile
  getOperatorProfile: () => fetchJson<any>("/auth/operator"),

  // Fault Injection & Anomaly Simulation
  injectFault: (fault_type: string, severity = "HIGH") =>
    fetchJson<any>("/telemetry/inject-fault", {
      method: "POST",
      body: JSON.stringify({ fault_type, severity }),
    }),
  clearFault: () => fetchJson<any>("/telemetry/clear-fault", { method: "POST" }),
  getActiveFault: () => fetchJson<any>("/telemetry/active-fault"),

  // Orbital Ground Track & Station Passes
  getGroundTrack: () => fetchJson<any>("/orbit/ground-track"),
};
