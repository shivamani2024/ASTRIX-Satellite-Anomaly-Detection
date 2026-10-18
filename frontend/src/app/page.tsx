"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Gauge,
  Brain,
  CheckCircle2,
  Battery,
  Thermometer,
  Radio,
  Compass,
  Zap,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { GroundTrackMap } from "@/components/shared/GroundTrackMap";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useAnomalyStore } from "@/stores/anomalyStore";
import { api } from "@/lib/api";

export default function MissionControlDashboard() {
  const currentFrame = useTelemetryStore((s) => s.currentFrame);
  const activeAnomalies = useAnomalyStore((s) => s.activeAnomalies);
  const setActiveAnomalies = useAnomalyStore((s) => s.setActiveAnomalies);

  useEffect(() => {
    api.getActiveAnomalies().then(setActiveAnomalies).catch(console.error);
  }, [setActiveAnomalies]);

  const ch = currentFrame?.channels;
  const isAnom = activeAnomalies.length > 0;

  // Real-time or calibrated metrics matching the screenshot
  const attitudeVal = ch ? ch.attitude_error_deg : 0.82;
  const isAttitudeWarning = attitudeVal > 0.40 || isAnom;

  return (
    <div>
      <PageHeader
        title="MISSION CONTROL"
        subtitle="Real-time satellite health, anomaly intelligence and recovery readiness."
      />

      {/* Top 5 Metric Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        {/* Card 1: Satellite Health */}
        <div
          className="aerospace-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#10b981", marginBottom: "8px" }}>
            <Activity size={24} />
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", marginBottom: "6px" }}>
            SATELLITE HEALTH
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#059669" }}>
            98.7%
          </div>
        </div>

        {/* Card 2: Active Anomalies */}
        <div
          className="aerospace-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#ef4444", marginBottom: "8px" }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", marginBottom: "6px" }}>
            ACTIVE ANOMALIES
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#ef4444" }}>
            01
          </div>
        </div>

        {/* Card 3: Telemetry Rate */}
        <div
          className="aerospace-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#10b981", marginBottom: "8px" }}>
            <Gauge size={24} />
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", marginBottom: "6px" }}>
            TELEMETRY RATE
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#065f46", lineHeight: "1.2" }}>
            1,248
            <span style={{ fontSize: "0.85rem", fontWeight: 700, marginLeft: "4px" }}>pts/min</span>
          </div>
        </div>

        {/* Card 4: AI Confidence */}
        <div
          className="aerospace-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#8b5cf6", marginBottom: "8px" }}>
            <Brain size={24} />
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", marginBottom: "6px" }}>
            AI CONFIDENCE
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#8b5cf6" }}>
            94%
          </div>
        </div>

        {/* Card 5: Recovery Status */}
        <div
          className="aerospace-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ color: "#10b981", marginBottom: "8px" }}>
            <CheckCircle2 size={24} />
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.04em", marginBottom: "6px" }}>
            RECOVERY STATUS
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#059669" }}>
            READY
          </div>
        </div>
      </div>

      {/* 2D Orbital Ground Track World Map */}
      <GroundTrackMap />

      {/* Main Content Grid: Satellite Health (Left) & Recent Events (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        {/* Left: Satellite Subsystem Health */}
        <div className="aerospace-card" style={{ padding: "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              SATELLITE HEALTH
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "2px" }}>
              Current subsystem status for SAT-ALPHA-01
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {/* 1. POWER */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Battery size={24} color="#10b981" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>POWER</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>98%</span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <span className="badge-status badge-nominal">NOMINAL</span>
              </div>
            </div>

            {/* 2. THERMAL */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Thermometer size={24} color="#10b981" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>THERMAL</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>94%</span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <span className="badge-status badge-nominal">NOMINAL</span>
              </div>
            </div>

            {/* 3. COMMUNICATION */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Radio size={24} color="#10b981" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>COMMUNICATION</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>97%</span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <span className="badge-status badge-nominal">NOMINAL</span>
              </div>
            </div>

            {/* 4. ATTITUDE CONTROL (WARNING) */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "10px",
                border: isAttitudeWarning ? "1px solid #fde68a" : "1px solid #e2e8f0",
                backgroundColor: isAttitudeWarning ? "#fffbeb" : "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Compass size={24} color={isAttitudeWarning ? "#f59e0b" : "#10b981"} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isAttitudeWarning ? "#b45309" : "#475569" }}>
                ATTITUDE CONTROL
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>89%</span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <span className="badge-status badge-warning">WARNING</span>
              </div>
            </div>

            {/* 5. PROPULSION */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Zap size={24} color="#10b981" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>PROPULSION</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>96%</span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <span className="badge-status badge-nominal">NOMINAL</span>
              </div>
            </div>

            {/* 6. PAYLOAD */}
            <div
              style={{
                padding: "20px 16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Activity size={24} color="#10b981" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>PAYLOAD</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>99%</span>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <span className="badge-status badge-nominal">NOMINAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Events Timeline */}
        <div className="aerospace-card" style={{ padding: "24px" }}>
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={18} color="#0f172a" />
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                RECENT EVENTS
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "2px" }}>
                Latest logs from the mission timeline
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Event 1 */}
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>12:15:00 UTC</span>
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
                  INFO
                </span>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                Telemetry Update
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                Ground station AOS (Acquisition of Signal) established.
              </div>
            </div>

            {/* Event 2 */}
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>12:20:30 UTC</span>
                <span className="badge-status badge-nominal">SUCCESS</span>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                Maneuver
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                Solar array sun-tracking adjustment completed.
              </div>
            </div>

            {/* Event 3 */}
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>12:35:12 UTC</span>
                <span className="badge-status badge-nominal">SUCCESS</span>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                System Check
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                Thermal subsystem routine diagnostic nominal.
              </div>
            </div>

            {/* Event 4 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>12:41:58 UTC</span>
                <span className="badge-status badge-warning">WARNING</span>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                Attitude Deviation
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                Reaction wheel speed deviation detected.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
