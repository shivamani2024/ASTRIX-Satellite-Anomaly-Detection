"use client";

import React from "react";
import { Compass, Zap, Flame, Radio, Rocket, Cpu } from "lucide-react";

interface SubsystemInfo {
  code: string;
  name: string;
  status: "NOMINAL" | "WARNING" | "CRITICAL";
  mode: string;
  metric: string;
}

interface SubsystemGridProps {
  subsystems?: Record<string, { status: "NOMINAL" | "WARNING" | "CRITICAL"; mode: string }>;
}

export function SubsystemGrid({ subsystems }: SubsystemGridProps) {
  const defaultList: SubsystemInfo[] = [
    {
      code: "ADCS",
      name: "Attitude Control",
      status: subsystems?.ADCS?.status || "CRITICAL",
      mode: subsystems?.ADCS?.mode || "3-AXIS POINTING",
      metric: "RW: 5740 RPM",
    },
    {
      code: "EPS",
      name: "Electrical Power",
      status: subsystems?.EPS?.status || "NOMINAL",
      mode: subsystems?.EPS?.mode || "SUNLIGHT CHARGING",
      metric: "Bus: 28.2 V",
    },
    {
      code: "THERMAL",
      name: "Thermal Control",
      status: subsystems?.THERMAL?.status || "NOMINAL",
      mode: subsystems?.THERMAL?.mode || "PASSIVE RADIATOR",
      metric: "Panel: 22.4°C",
    },
    {
      code: "COMM",
      name: "Communications",
      status: subsystems?.COMM?.status || "NOMINAL",
      mode: subsystems?.COMM?.mode || "S-BAND HIGH RATE",
      metric: "Carrier: 2048 MHz",
    },
    {
      code: "PROP",
      name: "Propulsion",
      status: subsystems?.PROP?.status || "NOMINAL",
      mode: subsystems?.PROP?.mode || "VALVES ISOLATED",
      metric: "Tank: 22.4 bar",
    },
    {
      code: "CDH",
      name: "Data Handling",
      status: subsystems?.CDH?.status || "NOMINAL",
      mode: subsystems?.CDH?.mode || "PRIMARY OPR SYNC",
      metric: "CPU: 18.2%",
    },
  ];

  const getIcon = (code: string) => {
    switch (code) {
      case "ADCS":
        return <Compass size={18} />;
      case "EPS":
        return <Zap size={18} />;
      case "THERMAL":
        return <Flame size={18} />;
      case "COMM":
        return <Radio size={18} />;
      case "PROP":
        return <Rocket size={18} />;
      case "CDH":
        return <Cpu size={18} />;
      default:
        return <Cpu size={18} />;
    }
  };

  const getStatusBadge = (status: "NOMINAL" | "WARNING" | "CRITICAL") => {
    switch (status) {
      case "CRITICAL":
        return <span className="badge-status badge-critical">CRITICAL</span>;
      case "WARNING":
        return <span className="badge-status badge-warning">ALERT</span>;
      case "NOMINAL":
      default:
        return <span className="badge-status badge-nominal">NOMINAL</span>;
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "14px",
      }}
    >
      {defaultList.map((sub) => {
        const isCrit = sub.status === "CRITICAL";
        const isWarn = sub.status === "WARNING";

        return (
          <div
            key={sub.code}
            className="aerospace-card"
            style={{
              padding: "16px",
              border: isCrit
                ? "1px solid #fecaca"
                : isWarn
                ? "1px solid #fde68a"
                : "1px solid #e2e8f0",
              backgroundColor: isCrit
                ? "#fff1f2"
                : isWarn
                ? "#fffbeb"
                : "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: isCrit ? "#ef4444" : "#059669" }}>
                {getIcon(sub.code)}
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                  {sub.code}
                </span>
              </div>
              {getStatusBadge(sub.status)}
            </div>

            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "10px" }}>
              {sub.name}
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "8px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span style={{ color: "#64748b" }}>{sub.mode}</span>
              <strong style={{ color: isCrit ? "#ef4444" : "#0f172a" }}>{sub.metric}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}
