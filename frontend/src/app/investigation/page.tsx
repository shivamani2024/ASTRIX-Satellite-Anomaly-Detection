"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Activity,
  Search,
  GitBranch,
  ShieldCheck,
  Terminal,
  Play,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useInvestigationStore } from "@/stores/investigationStore";
import { api } from "@/lib/api";

export default function AIInvestigationPage() {
  const state = useInvestigationStore((s) => s.state);
  const setState = useInvestigationStore((s) => s.setState);
  const [isRunning, setIsRunning] = useState(false);

  const eventId = "ANM-2048";

  useEffect(() => {
    api.getInvestigationStatus(eventId).then(setState).catch(console.error);
  }, [setState]);

  const handleTriggerInvestigation = async () => {
    setIsRunning(true);
    try {
      const res = await api.triggerInvestigation(eventId);
      setState(res);
      // Poll until complete
      const timer = setInterval(async () => {
        const update = await api.getInvestigationStatus(eventId);
        setState(update);
        if (update.is_complete) {
          clearInterval(timer);
          setIsRunning(false);
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="ASTRIX AI INVESTIGATION"
        subtitle="Multi-agent orchestration graph analyzing ANM-2048."
        icon={<Brain size={28} color="#059669" style={{ marginRight: "10px" }} />}
        actions={
          <button
            onClick={handleTriggerInvestigation}
            disabled={isRunning}
            className="btn-purple-action"
          >
            <Play size={16} />
            <span>{isRunning ? "AGENTS RUNNING..." : "RUN MULTI-AGENT PIPELINE"}</span>
          </button>
        }
      />

      {/* Main Layout: Orchestration Graph (70%) + Operator Evidence (30%) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "24px" }}>
        {/* Left: Orchestration Graph */}
        <div className="aerospace-card" style={{ padding: "30px 24px" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "30px" }}>
            ORCHESTRATION GRAPH
          </h3>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Center Top Root Node: ASTRIX MISSION AI */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "#ecfdf5",
                  border: "2px solid #059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.15)",
                }}
              >
                <Brain size={36} />
              </div>
              <span
                style={{
                  marginTop: "12px",
                  fontSize: "0.88rem",
                  fontWeight: 800,
                  color: "#065f46",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                ASTRIX MISSION AI
              </span>

              {/* Vertical trunk line down */}
              <div
                style={{
                  width: "2px",
                  height: "40px",
                  backgroundColor: "#cbd5e1",
                  marginTop: "10px",
                }}
              />
            </div>

            {/* Horizontal branch bar spanning the 5 agents */}
            <div style={{ width: "86%", position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: "#cbd5e1",
                }}
              />
            </div>

            {/* 5 Connected Agent Nodes */}
            <div
              style={{
                width: "96%",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "12px",
                marginTop: "0px",
              }}
            >
              {/* Agent 1: Telemetry Analyst */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "2px", height: "30px", backgroundColor: "#cbd5e1" }} />
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    border: "2px solid #059669",
                    borderRadius: "10px",
                    padding: "16px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", color: "#059669" }}>
                    <Activity size={24} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>
                    TELEMETRY ANALYST
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px", marginBottom: "10px" }}>
                    Pattern detection
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      backgroundColor: "#134e4a",
                      color: "#ffffff",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    ANALYZING
                  </span>
                </div>
              </div>

              {/* Agent 2: Diagnosis Agent */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "2px", height: "30px", backgroundColor: "#cbd5e1" }} />
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "16px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", color: "#64748b" }}>
                    <Search size={24} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>
                    DIAGNOSIS AGENT
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px", marginBottom: "10px" }}>
                    Root-cause analysis
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    WAITING
                  </span>
                </div>
              </div>

              {/* Agent 3: Recovery Planner */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "2px", height: "30px", backgroundColor: "#cbd5e1" }} />
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "16px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", color: "#64748b" }}>
                    <GitBranch size={24} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>
                    RECOVERY PLANNER
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px", marginBottom: "10px" }}>
                    Response generation
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    WAITING
                  </span>
                </div>
              </div>

              {/* Agent 4: Safety Agent */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "2px", height: "30px", backgroundColor: "#cbd5e1" }} />
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "16px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", color: "#64748b" }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>
                    SAFETY AGENT
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px", marginBottom: "10px" }}>
                    Constraint validation
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    WAITING
                  </span>
                </div>
              </div>

              {/* Agent 5: Audit Agent */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "2px", height: "30px", backgroundColor: "#cbd5e1" }} />
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "16px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px", color: "#64748b" }}>
                    <Terminal size={24} />
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>
                    AUDIT AGENT
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px", marginBottom: "10px" }}>
                    Decision trace
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    WAITING
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operator Evidence */}
        <div className="aerospace-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px" }}>
            OPERATOR EVIDENCE
          </h3>

          {/* Observation */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              OBSERVATION
            </div>
            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
              Attitude error increased above expected range (0.82° &gt; 0.50° limit).
            </p>
          </div>

          {/* Correlated Signals */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
              CORRELATED SIGNALS
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "0.82rem", color: "#e11d48", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>→</span> Reaction wheel speed increased simultaneously
              </div>
              <div style={{ fontSize: "0.82rem", color: "#d97706", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>→</span> Power draw elevated
              </div>
              <div style={{ fontSize: "0.82rem", color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>→</span> Thermal stable
              </div>
            </div>
          </div>

          {/* Probable Cause & Confidence */}
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
              PROBABLE CAUSE
            </div>
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a", marginBottom: "12px" }}>
                ADCS RW-1 Momentum Saturation due to Tachometer Drift
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b" }}>CONFIDENCE</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#8b5cf6" }}>94%</span>
              </div>

              {/* Purple Confidence Progress Bar */}
              <div style={{ width: "100%", height: "8px", backgroundColor: "#ede9fe", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "94%", height: "100%", backgroundColor: "#a855f7", borderRadius: "4px" }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <Link
              href="/digital-twin"
              className="btn-aerospace"
              style={{
                width: "100%",
                backgroundColor: "#134e4a",
                color: "#ffffff",
                fontWeight: 700,
                textAlign: "center",
                justifyContent: "center",
              }}
            >
              CONTINUE TO DIGITAL TWIN <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
