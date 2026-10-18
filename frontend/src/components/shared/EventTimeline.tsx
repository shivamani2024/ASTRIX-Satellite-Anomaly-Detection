"use client";

import React from "react";
import { AnomalyEvent } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface EventTimelineProps {
  events: AnomalyEvent[];
  onSelect?: (event: AnomalyEvent) => void;
  selectedEventId?: string;
}

export function EventTimeline({ events, onSelect, selectedEventId }: EventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.82rem",
        }}
      >
        NO ANOMALY EVENTS DETECTED
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {events.map((ev) => {
        const isSelected = selectedEventId === ev.event_id;
        const isCrit = ev.severity === "CRITICAL" || ev.severity === "HIGH";

        return (
          <div
            key={ev.event_id}
            onClick={() => onSelect && onSelect(ev)}
            className="aerospace-card"
            style={{
              padding: "16px",
              cursor: onSelect ? "pointer" : "default",
              border: isSelected
                ? "2px solid #059669"
                : isCrit
                ? "1px solid #fecaca"
                : "1px solid #e2e8f0",
              backgroundColor: isSelected
                ? "#ecfdf5"
                : isCrit
                ? "#fff1f2"
                : "#ffffff",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={16} color={isCrit ? "#ef4444" : "#f59e0b"} />
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>
                  {ev.event_id}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                  [{ev.subsystem}]
                </span>
              </div>

              <span
                className={`badge-status ${
                  ev.status === "RESOLVED"
                    ? "badge-nominal"
                    : isCrit
                    ? "badge-critical"
                    : "badge-warning"
                }`}
                style={{ fontSize: "0.68rem" }}
              >
                {ev.status} • {ev.severity}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 700, marginBottom: "8px" }}>
              {ev.title}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.72rem",
                color: "#64748b",
              }}
            >
              <span>DETECTED: {ev.detected_at.substring(11, 19)} UTC</span>
              <span>METHOD: {ev.detection_method.split(" ")[0]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
