"use client";

import React from "react";
import { TelemetryChannels } from "@/lib/types";
import { CHANNELS_CONFIG } from "@/lib/constants";

interface ChannelPickerProps {
  selectedChannels: (keyof TelemetryChannels)[];
  onToggle: (channel: keyof TelemetryChannels) => void;
}

export function ChannelPicker({ selectedChannels, onToggle }: ChannelPickerProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
      <span
        style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginRight: "4px" }}
      >
        ACTIVE CHANNELS:
      </span>
      {CHANNELS_CONFIG.map((ch) => {
        const isSelected = selectedChannels.includes(ch.key);
        return (
          <button
            key={ch.key}
            onClick={() => onToggle(ch.key)}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: isSelected ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: isSelected ? "#134e4a" : "#ffffff",
              color: isSelected ? "#ffffff" : "#475569",
              border: isSelected ? "1px solid #134e4a" : "1px solid #cbd5e1",
              transition: "all 0.15s ease",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: isSelected ? "#10b981" : "#cbd5e1",
              }}
            />
            <span>{ch.label}</span>
          </button>
        );
      })}
    </div>
  );
}
