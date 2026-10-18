"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Network,
  Play,
  ArrowDown,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Compass,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Satellite3D } from "@/components/shared/Satellite3D";
import { useTwinStore } from "@/stores/twinStore";
import { api } from "@/lib/api";

export default function DigitalTwinPage() {
  const simulationResult = useTwinStore((s) => s.simulationResult);
  const setSimulationResult = useTwinStore((s) => s.setSimulationResult);
  const isSimulating = useTwinStore((s) => s.isSimulating);
  const setIsSimulating = useTwinStore((s) => s.setIsSimulating);

  const [simCompleted, setSimCompleted] = useState(false);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateTwin("CMD_DESAT_MTQ_042", {
        target_rpm: 2500.0,
        gain_k: 0.045,
        active_axes: ["Y", "Z"],
      }, 300);
      setSimulationResult(res);
      setSimCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="ASTRIX DIGITAL TWIN"
        subtitle="Validate recovery strategies before operational authorization."
        icon={<Network size={28} color="#059669" style={{ marginRight: "10px" }} />}
      />

      {/* Main Grid: Left Kinematic Model (70%), Right Simulation Flow (30%) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "24px" }}>
        {/* Left: Satellite Kinematic Model Viewport */}
        <div className="aerospace-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              SATELLITE KINEMATIC MODEL
            </h3>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#475569",
                border: "1px solid #cbd5e1",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "#f8fafc",
              }}
            >
              MODEL LOADED
            </span>
          </div>

          {/* 3D Viewport Box matching screenshot styling */}
          <div
            style={{
              position: "relative",
              height: "460px",
              borderRadius: "10px",
              backgroundColor: "#94a3b8",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Top-Left Floating Badge: POWER | NOMINAL */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(6px)",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                POWER
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
                NOMINAL
              </div>
            </div>

            {/* Top-Right Floating Badge: THERMAL | NOMINAL */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(6px)",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                zIndex: 10,
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                THERMAL
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
                NOMINAL
              </div>
            </div>

            {/* 3D Canvas with procedural satellite or interactive Euler attitude gyro */}
            <div style={{ width: "100%", height: "100%" }}>
              <Satellite3D />
            </div>
          </div>
        </div>

        {/* Right: Simulation Flow */}
        <div className="aerospace-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            SIMULATION FLOW
          </h3>

          {/* Current State Box */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              CURRENT STATE
            </span>
            <span className="badge-status badge-critical" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
              ANOMALY
            </span>
          </div>

          {/* Down Arrow */}
          <div style={{ display: "flex", justifyContent: "center", color: "#94a3b8" }}>
            <ArrowDown size={20} />
          </div>

          {/* Proposed Action Box */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#059669", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                PROPOSED ACTION
              </div>
            </div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textAlign: "right" }}>
              RW DESATURATION
            </div>
          </div>

          {/* Down Arrow */}
          <div style={{ display: "flex", justifyContent: "center", color: "#94a3b8" }}>
            <ArrowDown size={20} />
          </div>

          {/* Purple RUN SIMULATION Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="btn-purple-action"
            style={{ width: "100%", padding: "14px 20px", fontSize: "0.9rem" }}
          >
            <Play size={18} fill="#ffffff" />
            <span>{isSimulating ? "RUNNING SIMULATION (300s)..." : "RUN SIMULATION"}</span>
          </button>

          {/* Simulation Results (if run or completed) */}
          {(simCompleted || simulationResult) && (
            <div
              style={{
                marginTop: "10px",
                padding: "16px",
                backgroundColor: "#ecfdf5",
                borderRadius: "8px",
                border: "1px solid #a7f3d0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#065f46" }}>
                <CheckCircle2 size={18} />
                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>SIMULATION VALIDATED</span>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#065f46", lineHeight: "1.4", marginBottom: "14px" }}>
                Physical trajectory confirms attitude error convergence within 180s without violating thermal or power limits.
              </p>

              <Link
                href="/safety"
                className="btn-aerospace"
                style={{
                  width: "100%",
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  fontWeight: 700,
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                PROCEED TO SAFETY VALIDATION <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
