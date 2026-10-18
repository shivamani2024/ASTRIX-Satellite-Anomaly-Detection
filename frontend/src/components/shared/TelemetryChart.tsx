"use client";

import React, { useMemo } from "react";
import { TelemetryFrame, TelemetryChannels } from "@/lib/types";
import { CHANNELS_CONFIG, THRESHOLDS } from "@/lib/constants";

interface TelemetryChartProps {
  history: TelemetryFrame[];
  selectedChannels: (keyof TelemetryChannels)[];
  height?: number;
  showThresholds?: boolean;
}

export function TelemetryChart({
  history,
  selectedChannels,
  height = 280,
  showThresholds = true,
}: TelemetryChartProps) {
  const width = 800; // Normalized SVG coordinate space

  // Compute bounding values across selected channels
  const { minVal, maxVal, points } = useMemo(() => {
    if (!history || history.length === 0) {
      return { minVal: 0, maxVal: 100, points: {} };
    }

    let min = Infinity;
    let max = -Infinity;

    selectedChannels.forEach((chKey) => {
      history.forEach((f) => {
        const val = f.channels[chKey];
        if (typeof val === "number") {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity || max <= min) max = min + 10;

    // Add 10% margin on top/bottom
    const range = max - min;
    const paddedMin = min - range * 0.05;
    const paddedMax = max + range * 0.08;

    // Build polyline points for each channel
    const pts: Record<string, string> = {};
    const n = history.length;

    selectedChannels.forEach((chKey) => {
      const coordPairs = history.map((f, i) => {
        const x = (i / Math.max(1, n - 1)) * (width - 60) + 50;
        const val = f.channels[chKey] ?? 0;
        const normalizedY = (val - paddedMin) / (paddedMax - paddedMin || 1);
        const y = height - 40 - normalizedY * (height - 60);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      pts[chKey] = coordPairs.join(" ");
    });

    return { minVal: paddedMin, maxVal: paddedMax, points: pts };
  }, [history, selectedChannels, height]);

  // Channel color mapping
  const channelMeta = useMemo(() => {
    const map = new Map();
    CHANNELS_CONFIG.forEach((c) => map.set(c.key, c));
    return map;
  }, []);

  return (
    <div
      className="glass-panel"
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Legend & Current Values */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}>
          {selectedChannels.map((chKey) => {
            const meta = channelMeta.get(chKey);
            const latestVal = history[history.length - 1]?.channels[chKey];
            return (
              <div
                key={chKey}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
                className="font-mono"
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    backgroundColor: meta?.color || "var(--accent-cyan)",
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  {meta?.label || chKey}:
                </span>
                <strong style={{ fontSize: "0.75rem", color: "#FFF" }}>
                  {latestVal !== undefined ? (Number.isInteger(latestVal) ? latestVal : latestVal.toFixed(2)) : "--"} {meta?.unit}
                </strong>
              </div>
            );
          })}
        </div>

        <div className="font-mono" style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
          WINDOW: {history.length} SAMPLES ({((history.length * 0.1)).toFixed(1)}s @ 10Hz)
        </div>
      </div>

      {/* SVG Chart Plot */}
      <div style={{ width: "100%", height: `${height}px`, position: "relative" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "100%", overflow: "visible" }}
          preserveAspectRatio="none"
        >
          {/* Background Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - 40 - ratio * (height - 60);
            const gridVal = minVal + ratio * (maxVal - minVal);
            return (
              <g key={idx}>
                <line
                  x1={45}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="3 3"
                />
                <text
                  x={40}
                  y={y + 3}
                  fill="var(--text-dim)"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {gridVal >= 1000 ? gridVal.toFixed(0) : gridVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Time axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const x = 50 + ratio * (width - 60);
            return (
              <line
                key={idx}
                x1={x}
                y1={height - 35}
                x2={x}
                y2={height - 40}
                stroke="rgba(255, 255, 255, 0.15)"
              />
            );
          })}

          {/* Polyline series for each selected channel */}
          {selectedChannels.map((chKey) => {
            const pts = points[chKey];
            const meta = channelMeta.get(chKey);
            if (!pts) return null;

            return (
              <polyline
                key={chKey}
                fill="none"
                stroke={meta?.color || "var(--accent-cyan)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pts}
                style={{
                  filter: `drop-shadow(0 0 4px ${meta?.color || "var(--accent-cyan)"})`,
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
