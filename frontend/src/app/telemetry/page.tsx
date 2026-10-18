"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { Play, Pause, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { api } from "@/lib/api";

export default function LiveTelemetryPage() {
  const currentFrame = useTelemetryStore((s) => s.currentFrame);
  const history = useTelemetryStore((s) => s.history);
  const engineStatus = useTelemetryStore((s) => s.engineStatus);

  const [activeRange, setActiveRange] = useState("1 MIN");

  const handlePlayPause = async () => {
    if (engineStatus.is_playing) {
      await api.pauseTelemetry();
    } else {
      await api.playTelemetry();
    }
  };

  const handleReset = async () => {
    await api.resetTelemetry();
  };

  // Extract recent telemetry points
  const pointsCount = activeRange === "1 MIN" ? 30 : activeRange === "5 MIN" ? 60 : 120;
  const chartData = history.slice(-pointsCount).map((f) => {
    const timeStr = f.timestamp.substring(11, 19);
    return {
      time: timeStr,
      attitude_error_deg: f.channels.attitude_error_deg,
      reaction_wheel_rpm: f.channels.reaction_wheel_rpm,
      bus_voltage_v: f.channels.bus_voltage_v,
      thermal_panel_c: f.channels.thermal_panel_c,
    };
  });

  const latest = currentFrame?.channels || {
    attitude_error_deg: 1.11,
    reaction_wheel_rpm: 6000.0,
    bus_voltage_v: 28.52,
    thermal_panel_c: 14.5,
  };

  const isAttitudeBreach = latest.attitude_error_deg > 0.50;
  const isRwBreach = latest.reaction_wheel_rpm > 5300;

  return (
    <div>
      <PageHeader
        title="LIVE TELEMETRY"
        subtitle="High-fidelity real-time subsystem data streams."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {["1 MIN", "5 MIN", "15 MIN", "1 HR"].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`time-pill ${activeRange === range ? "active" : ""}`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      {/* 2x2 Clean Aerospace Chart Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {/* Chart 1: Attitude Error (°) */}
        <div className="aerospace-card" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
              Attitude Error (°)
            </h3>
            <span
              className={`badge-status ${isAttitudeBreach ? "badge-critical" : "badge-nominal"}`}
              style={{ fontSize: "0.85rem", padding: "4px 10px" }}
            >
              {latest.attitude_error_deg.toFixed(2)}°
            </span>
          </div>

          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 1.5]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <ReferenceLine
                  y={0.5}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: "WARNING THRESHOLD",
                    fill: "#ef4444",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attitude_error_deg"
                  stroke="#0284c7"
                  strokeWidth={2.4}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Reaction Wheel Speed (RPM) */}
        <div className="aerospace-card" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
              Reaction Wheel Speed (RPM)
            </h3>
            <span
              className={`badge-status ${isRwBreach ? "badge-critical" : "badge-nominal"}`}
              style={{ fontSize: "0.85rem", padding: "4px 10px" }}
            >
              {Math.round(latest.reaction_wheel_rpm)} RPM
            </span>
          </div>

          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[4000, 6500]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <ReferenceLine
                  y={5000}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: "NOMINAL LIMIT",
                    fill: "#ef4444",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reaction_wheel_rpm"
                  stroke="#0284c7"
                  strokeWidth={2.4}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Battery Voltage (V) */}
        <div className="aerospace-card" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
              Battery Voltage (V)
            </h3>
            <span
              className="badge-status badge-nominal"
              style={{ fontSize: "0.85rem", padding: "4px 10px" }}
            >
              {latest.bus_voltage_v.toFixed(2)} V
            </span>
          </div>

          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[27, 30]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <ReferenceLine y={27.5} stroke="#cbd5e1" strokeDasharray="4 4" />
                <ReferenceLine y={29.5} stroke="#cbd5e1" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="bus_voltage_v"
                  stroke="#059669"
                  strokeWidth={2.4}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Temperature (°C) */}
        <div className="aerospace-card" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
              Temperature (°C)
            </h3>
            <span
              className="badge-status badge-nominal"
              style={{ fontSize: "0.85rem", padding: "4px 10px" }}
            >
              {latest.thermal_panel_c.toFixed(1)} °C
            </span>
          </div>

          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[13, 20]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <ReferenceLine y={16} stroke="#cbd5e1" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="thermal_panel_c"
                  stroke="#059669"
                  strokeWidth={2.4}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stream Controls Bar */}
      <div
        className="aerospace-card"
        style={{
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handlePlayPause}
            className="btn-aerospace"
            style={{
              backgroundColor: engineStatus.is_playing ? "#ecfdf5" : "#fffbeb",
              borderColor: engineStatus.is_playing ? "#a7f3d0" : "#fde68a",
              color: engineStatus.is_playing ? "#065f46" : "#b45309",
            }}
          >
            {engineStatus.is_playing ? <Pause size={16} /> : <Play size={16} />}
            <span>{engineStatus.is_playing ? "PAUSE STREAM" : "RESUME STREAM"}</span>
          </button>

          <button onClick={handleReset} className="btn-aerospace">
            <RotateCcw size={16} />
            <span>RESET TIMELINE</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>PLAYBACK SPEED:</span>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => api.setSpeed(s)}
              className={`time-pill ${engineStatus.playback_speed === s ? "active" : ""}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
