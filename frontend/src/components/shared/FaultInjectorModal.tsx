"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Zap,
  Thermometer,
  Compass,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";

interface FaultOption {
  id: string;
  name: string;
  subsystem: string;
  icon: React.ElementType;
  description: string;
  redlines: string;
  color: string;
}

const FAULT_OPTIONS: FaultOption[] = [
  {
    id: "REACTION_WHEEL_SATURATION",
    name: "Reaction Wheel Momentum Saturation",
    subsystem: "ADCS",
    icon: Compass,
    description: "RW speed climbs past 6,000 RPM into tachometer saturation; attitude pointing error drifts past 1.10°.",
    redlines: "RW_SPEED > 5500 RPM | ATTITUDE_ERR > 0.50°",
    color: "#ef4444",
  },
  {
    id: "SOLAR_ARRAY_DROP",
    name: "Solar Array Power Generation Loss",
    subsystem: "EPS",
    icon: Zap,
    description: "Solar array generation drops from 212W to 32W; main EPS bus voltage collapses below 25.2V.",
    redlines: "BUS_VOLTAGE < 26.50 V | SOLAR_W < 160 W",
    color: "#f59e0b",
  },
  {
    id: "THERMAL_EXCURSION",
    name: "Radiator Heat Pipe Thermal Excursion",
    subsystem: "THERMAL",
    icon: Thermometer,
    description: "Thermal radiator temperature climbs to 49.5°C; magnetorquer coil resistance increases with heat.",
    redlines: "PANEL_TEMP > 45.0 °C | MTQ_CURR > 0.85 A",
    color: "#ef4444",
  },
  {
    id: "THRUSTER_PRESSURE_LEAK",
    name: "RCS Propulsion Pressure Drop",
    subsystem: "PROPULSION",
    icon: ShieldAlert,
    description: "Micro-leak in cold-gas RCS manifold causing minor unregulated torque disturbance.",
    redlines: "TANK_PRESSURE < 18.0 bar",
    color: "#8b5cf6",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFaultUpdated?: () => void;
}

export function FaultInjectorModal({ isOpen, onClose, onFaultUpdated }: Props) {
  const [selectedFault, setSelectedFault] = useState<string>("REACTION_WHEEL_SATURATION");
  const [severity, setSeverity] = useState<string>("CRITICAL");
  const [activeFault, setActiveFault] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getActiveFault()
        .then((res) => {
          if (res?.active_fault) setActiveFault(res.active_fault);
          else setActiveFault(null);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInject = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.injectFault(selectedFault, severity);
      setActiveFault(res.active_fault);
      setMessage(`Successfully injected fault: ${selectedFault}`);
      if (onFaultUpdated) onFaultUpdated();
    } catch (err: any) {
      setMessage(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.clearFault();
      setActiveFault(null);
      setMessage("Injected faults cleared. Restored nominal baseline.");
      if (onFaultUpdated) onFaultUpdated();
    } catch (err: any) {
      setMessage(`Failed to clear: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        className="aerospace-card"
        style={{
          width: "100%",
          maxWidth: "640px",
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Interactive Flight Fault Injector
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#64748b" }}>
                Simulate on-the-fly subsystem failure telemetry to test autonomous FDIR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: "4px",
              borderRadius: "6px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Active Status Banner */}
          {activeFault ? (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#fff1f2",
                border: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#b91c1c" }}>
                  FAULT ACTIVE: {activeFault.fault_type} ({activeFault.severity})
                </span>
              </div>
              <button
                onClick={handleClear}
                disabled={loading}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#065f46",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Clear Fault
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#065f46",
              }}
            >
              <CheckCircle2 size={16} color="#059669" />
              All spacecraft telemetry buses operating in NOMINAL state.
            </div>
          )}

          {/* Fault Scenario Grid */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>
              SELECT FAILURE SCENARIO
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {FAULT_OPTIONS.map((fault) => {
                const isSelected = selectedFault === fault.id;
                const Icon = fault.icon;
                return (
                  <div
                    key={fault.id}
                    onClick={() => setSelectedFault(fault.id)}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: isSelected ? `2px solid #134e4a` : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon size={16} color={isSelected ? "#134e4a" : "#64748b"} />
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>
                          {fault.subsystem}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                        }}
                      >
                        {fault.id.split("_")[0]}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                      {fault.name}
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.3 }}>
                      {fault.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity Picker */}
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>
              INJECTION SEVERITY TIER
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {["WARNING", "CRITICAL"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: severity === s ? `2px solid ${s === "CRITICAL" ? "#ef4444" : "#f59e0b"}` : "1px solid #cbd5e1",
                    backgroundColor: severity === s ? (s === "CRITICAL" ? "#fee2e2" : "#fef3c7") : "#f8fafc",
                    color: severity === s ? (s === "CRITICAL" ? "#b91c1c" : "#92400e") : "#64748b",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {s === "CRITICAL" ? "🔴 TIER T2 / CRITICAL" : "🟡 TIER T1 / WARNING"}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#134e4a",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
              }}
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={handleClear}
            disabled={loading || !activeFault}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#475569",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: activeFault ? "pointer" : "not-allowed",
              opacity: activeFault ? 1 : 0.6,
            }}
          >
            <RotateCcw size={14} />
            Reset Nominal
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <button
              onClick={handleInject}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
              }}
            >
              <Play size={14} />
              {loading ? "Injecting..." : "Inject Fault"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
