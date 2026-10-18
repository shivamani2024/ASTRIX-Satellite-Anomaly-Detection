"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  channelKey: string;
  value: number;
  unit: string;
  nominal: string;
  threshold: string;
  thresholdValue?: number;
  isBreached?: boolean;
  color?: string;
  sparkline?: number[];
}

export function MetricCard({
  label,
  channelKey,
  value,
  unit,
  nominal,
  threshold,
  thresholdValue,
  isBreached = false,
  color = "#059669",
}: MetricCardProps) {
  const isHigh = isBreached || (thresholdValue !== undefined && value > thresholdValue);
  const statusColor = isHigh ? "#ef4444" : color;

  return (
    <div
      className="aerospace-card"
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: isHigh ? "1px solid #fecaca" : "1px solid #e2e8f0",
        backgroundColor: isHigh ? "#fff1f2" : "#ffffff",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              color: "#64748b",
              letterSpacing: "0.04em",
              marginBottom: "2px",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
            CHANNEL: {channelKey}
          </div>
        </div>

        <span
          className={`badge-status ${isHigh ? "badge-critical" : "badge-nominal"}`}
          style={{ fontSize: "0.68rem" }}
        >
          {isHigh ? "ALERT" : "NOMINAL"}
        </span>
      </div>

      {/* Main Metric Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "10px 0" }}>
        <span
          style={{
            fontSize: "1.9rem",
            fontWeight: 800,
            color: statusColor,
            letterSpacing: "-0.02em",
          }}
        >
          {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}
        </span>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
          {unit}
        </span>
      </div>

      {/* Footer Baseline Constraints */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid #f1f5f9",
          fontSize: "0.72rem",
        }}
      >
        <span style={{ color: "#64748b" }}>
          NOMINAL: <strong style={{ color: "#0f172a" }}>{nominal}</strong>
        </span>
        <span style={{ color: isHigh ? "#ef4444" : "#64748b" }}>
          REDLINE: <strong style={{ color: isHigh ? "#ef4444" : "#0f172a" }}>{threshold}</strong>
        </span>
      </div>
    </div>
  );
}
