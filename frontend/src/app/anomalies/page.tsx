"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Cpu,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAnomalyStore } from "@/stores/anomalyStore";
import { api } from "@/lib/api";

export default function AnomalyCenterPage() {
  const activeAnomalies = useAnomalyStore((s) => s.activeAnomalies);
  const setActiveAnomalies = useAnomalyStore((s) => s.setActiveAnomalies);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    api.getActiveAnomalies().then(setActiveAnomalies).catch(console.error);

    // Fetch the trained ESA OPS-SAT ML model metrics
    fetch("http://localhost:8000/api/v1/anomalies/model-info")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setModelInfo(data);
      })
      .catch(console.error);

    // Fetch sample segments
    fetch("http://localhost:8000/api/v1/anomalies/opssat-samples")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (data && data.length > 0) {
          setSamples(data);
        }
      })
      .catch(console.error);
  }, [setActiveAnomalies]);

  const handleEvaluateSample = async () => {
    if (samples.length === 0) return;
    const selected = samples[selectedSampleIndex];
    setEvaluating(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/anomalies/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected.features),
      });
      if (res.ok) {
        const result = await res.json();
        setTestResult(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="ANOMALY CENTER"
        subtitle="Operational incident management and analysis"
      />

      {/* Main Grid: Left Incident Analysis (approx 65%), Right Detection Timeline (approx 35%) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "24px" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Top Incident Banner */}
          <div
            style={{
              backgroundColor: "#fff1f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    backgroundColor: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ef4444",
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ef4444" }}>
                    ANM-2048
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#ef4444", marginTop: "2px" }}>
                    ATTITUDE CONTROL DEVIATION
                  </div>
                </div>
              </div>

              <span className="badge-status badge-critical" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                HIGH SEVERITY
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", letterSpacing: "0.04em" }}>
                AI DIAGNOSIS CONFIDENCE
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  backgroundColor: "#f3e8ff",
                  color: "#7e22ce",
                  padding: "2px 10px",
                  borderRadius: "6px",
                  border: "1px solid #e9d5ff",
                }}
              >
                94%
              </span>
            </div>
          </div>

          {/* Anomaly Signature Card */}
          <div className="aerospace-card" style={{ padding: "20px 24px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
              ANOMALY SIGNATURE
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
              {/* Tile 1 */}
              <div
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                  Attitude Error
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ef4444" }}>
                  ↑ Increasing
                </div>
              </div>

              {/* Tile 2 */}
              <div
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                  Reaction Wheel
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ef4444" }}>
                  ↑ Increasing
                </div>
              </div>

              {/* Tile 3 */}
              <div
                style={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                  Power Draw
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#d97706" }}>
                  ↑ Elevated
                </div>
              </div>

              {/* Tile 4 */}
              <div
                style={{
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
                  Thermal
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#059669" }}>
                  → Nominal
                </div>
              </div>
            </div>
          </div>

          {/* ASTRIX AI Status Card */}
          <div className="aerospace-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Brain size={18} color="#8b5cf6" />
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#8b5cf6", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  ASTRIX AI STATUS
                </span>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8b5cf6", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#8b5cf6" }} />
                INVESTIGATING
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Agent 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>
                  Telemetry Analyst
                </span>
              </div>

              {/* Agent 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #8b5cf6", borderTopColor: "transparent", display: "inline-block", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#8b5cf6" }}>
                  Diagnosis Agent
                </span>
              </div>

              {/* Agent 3 */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "1.5px solid #cbd5e1" }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#64748b" }}>
                  Recovery Planner
                </span>
              </div>

              {/* Agent 4 */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "1.5px solid #cbd5e1" }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#64748b" }}>
                  Safety Agent
                </span>
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <Link
                href="/investigation"
                className="btn-aerospace"
                style={{
                  backgroundColor: "#f5f3ff",
                  borderColor: "#ddd6fe",
                  color: "#6d28d9",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                OPEN FULL AI INVESTIGATION <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* ESA OPS-SAT ML Model Benchmark Card */}
          <div className="aerospace-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Database size={18} color="#059669" />
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  ESA OPS-SAT ML Telemetry Benchmark
                </span>
              </div>
              <span className="badge-status badge-nominal" style={{ fontSize: "0.7rem" }}>
                TRAINED & DEPLOYED
              </span>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "16px" }}>
              Supervised Calibrated Random Forest & Isolation Forest trained on 2,123 telemetry segments from the European Space Agency CubeSat mission (Zenodo DOI 10.5281/zenodo.15108715).
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>ACCURACY</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
                  {modelInfo?.test_metrics ? `${(modelInfo.test_metrics.accuracy * 100).toFixed(1)}%` : "95.5%"}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>ROC-AUC</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
                  {modelInfo?.test_metrics ? `${(modelInfo.test_metrics.roc_auc * 100).toFixed(1)}%` : "98.8%"}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>RECALL</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {modelInfo?.test_metrics ? `${(modelInfo.test_metrics.recall * 100).toFixed(1)}%` : "90.3%"}
                </div>
              </div>

              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700 }}>F1-SCORE</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {modelInfo?.test_metrics ? `${(modelInfo.test_metrics.f1_score * 100).toFixed(1)}%` : "89.5%"}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span>Monitored Channels: <strong>9 ESA CubeSat subsystems (CADC0872–CADC0894)</strong></span>
              <span>Test Samples: <strong>529 segments (113 anomalies verified)</strong></span>
            </div>

            {/* Interactive Model Evaluator Box */}
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>
                  INTERACTIVE ESA TELEMETRY SEGMENT TESTER
                </span>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  Live Scikit-Learn Inference
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <select
                  value={selectedSampleIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedSampleIndex(idx);
                    setTestResult(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8rem",
                    backgroundColor: "#ffffff",
                    color: "#0f172a",
                  }}
                >
                  {samples.map((s, idx) => (
                    <option key={idx} value={idx}>
                      Segment #{s.segment_id} — Channel {s.channel} ({s.ground_truth})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleEvaluateSample}
                  disabled={evaluating || samples.length === 0}
                  className="btn-aerospace"
                  style={{
                    backgroundColor: "#134e4a",
                    color: "#ffffff",
                    fontWeight: 700,
                  }}
                >
                  {evaluating ? "SCORING..." : "EVALUATE WITH MODEL"}
                </button>
              </div>

              {testResult && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "6px",
                    backgroundColor: testResult.anomaly ? "#fff1f2" : "#ecfdf5",
                    border: testResult.anomaly ? "1px solid #fecaca" : "1px solid #a7f3d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: testResult.anomaly ? "#ef4444" : "#059669" }}>
                      MODEL PREDICTION: {testResult.anomaly ? "ANOMALOUS (BREACH DETECTED)" : "NOMINAL TELEMETRY PASS"}
                    </span>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                      Evaluated with: {testResult.model}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: testResult.anomaly ? "#ef4444" : "#059669" }}>
                      {(testResult.confidence * 100).toFixed(1)}% Probability
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                      Novelty score: {testResult.novelty_score}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detection Timeline */}
        <div className="aerospace-card" style={{ padding: "24px", height: "fit-content" }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "24px" }}>
            DETECTION TIMELINE
          </h3>

          <div style={{ position: "relative", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Vertical Line */}
            <div
              style={{
                position: "absolute",
                top: "8px",
                bottom: "8px",
                left: "9px",
                width: "2px",
                backgroundColor: "#e2e8f0",
              }}
            />

            {/* Step 1 */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-32px",
                  top: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid #64748b",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#64748b" }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                12:41:50 UTC
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f172a", marginTop: "2px" }}>
                Normal telemetry
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-32px",
                  top: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid #64748b",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#64748b" }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                12:41:58 UTC
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f172a", marginTop: "2px" }}>
                Deviation begins in Attitude Control
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-32px",
                  top: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid #64748b",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#64748b" }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                12:42:01 UTC
              </div>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f172a", marginTop: "2px" }}>
                Threshold exceeded
              </div>
            </div>

            {/* Step 4 (Active/Breach) */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-32px",
                  top: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: "2px solid #ef4444",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 700 }}>
                12:42:03 UTC
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#ef4444", marginTop: "2px" }}>
                Anomaly detected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
