"use client";

import React from "react";
import { ChannelSignature, SeverityLevel } from "@/lib/types";

interface SignatureMatrixProps {
  signature: Record<string, ChannelSignature>;
}

export function SignatureMatrix({ signature }: SignatureMatrixProps) {
  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="badge-status badge-critical">CRITICAL</span>;
      case "HIGH":
        return <span className="badge-status badge-warning">HIGH</span>;
      case "MEDIUM":
        return <span className="badge-status badge-warning">MEDIUM</span>;
      case "LOW":
        return <span className="badge-status badge-nominal">LOW</span>;
      case "NOMINAL":
      default:
        return <span className="badge-status badge-nominal">NOMINAL</span>;
    }
  };

  const getTrendBadge = (trend: string) => {
    const isSat = trend === "SATURATED" || trend === "ELEVATED" || trend === "INCREASING";
    return (
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: "4px",
          backgroundColor: isSat ? "#fee2e2" : "#f1f5f9",
          color: isSat ? "#ef4444" : "#475569",
          border: isSat ? "1px solid #fecaca" : "1px solid #cbd5e1",
        }}
      >
        {trend}
      </span>
    );
  };

  const entries = Object.entries(signature || {});

  if (entries.length === 0) {
    return (
      <div style={{ fontSize: "0.8rem", color: "#64748b", padding: "12px" }}>
        No channel signature signatures computed.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            <th style={{ padding: "10px 14px" }}>Channel</th>
            <th style={{ padding: "10px 14px" }}>Observed Trend</th>
            <th style={{ padding: "10px 14px" }}>Signature Severity</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([chName, sig]) => (
            <tr
              key={chName}
              style={{
                borderBottom: "1px solid #f1f5f9",
                fontSize: "0.8rem",
              }}
            >
              <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0f172a" }}>
                {chName}
              </td>
              <td style={{ padding: "10px 14px" }}>{getTrendBadge(sig.trend)}</td>
              <td style={{ padding: "10px 14px" }}>{getSeverityBadge(sig.severity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
