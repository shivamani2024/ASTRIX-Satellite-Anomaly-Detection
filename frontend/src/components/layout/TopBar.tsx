"use client";

import { useState, useRef } from "react";
import { Bell, User, ChevronDown, Volume2, VolumeX, AlertOctagon, AlertTriangle } from "lucide-react";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useAnomalyStore } from "@/stores/anomalyStore";
import { FaultInjectorModal } from "@/components/shared/FaultInjectorModal";

export function TopBar() {
  const wsConnected = useTelemetryStore((s) => s.wsConnected);
  const activeSatellite = useTelemetryStore((s) => s.activeSatellite);
  const activeMission = useTelemetryStore((s) => s.activeMission);
  const setActiveSatellite = useTelemetryStore((s) => s.setActiveSatellite);
  const setActiveMission = useTelemetryStore((s) => s.setActiveMission);
  const activeAnomalies = useAnomalyStore((s) => s.activeAnomalies);

  const [isSimMode, setIsSimMode] = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);
  const [satOpen, setSatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [alarmAcknowledged, setAlarmAcknowledged] = useState(false);
  const [faultModalOpen, setFaultModalOpen] = useState(false);

  // Play subtle NASA dual-tone chime when alarm is triggered
  const playChime = () => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(800, ctx.currentTime);
      osc2.frequency.setValueAtTime(1200, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext unavailable or not interacted yet
    }
  };

  const hasAnomaly = activeAnomalies.length > 0;

  const handleSelectSatellite = (sat: string) => {
    setActiveSatellite(sat);
    if (sat === "ESA-OPS-SAT-1") {
      setActiveMission("ESA-OPS-SAT");
    } else {
      setActiveMission("LEO-ORBIT-1");
    }
    setSatOpen(false);
  };

  const handleSelectMission = (m: string) => {
    setActiveMission(m);
    if (m === "ESA-OPS-SAT") {
      setActiveSatellite("ESA-OPS-SAT-1");
    } else {
      setActiveSatellite("SAT-ALPHA-01");
    }
    setMissionOpen(false);
  };

  return (
    <header
      style={{
        height: "64px",
        position: "fixed",
        top: 0,
        left: "250px",
        right: 0,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 28px",
        zIndex: 30,
        gap: "20px",
      }}
    >
      {/* Left items: Mission & Satellite Selectors */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginRight: "auto" }}>
        {/* Mission dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", letterSpacing: "0.04em" }}>
            MISSION:
          </span>
          <div
            onClick={() => setMissionOpen(!missionOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            <span>{activeMission}</span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {missionOpen && (
            <div
              style={{
                position: "absolute",
                top: "38px",
                left: "64px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 50,
                width: "160px",
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => handleSelectMission("LEO-ORBIT-1")}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: activeMission === "LEO-ORBIT-1" ? 700 : 500,
                  backgroundColor: activeMission === "LEO-ORBIT-1" ? "#f1f5f9" : "transparent",
                  cursor: "pointer",
                }}
              >
                LEO-ORBIT-1
              </div>
              <div
                onClick={() => handleSelectMission("ESA-OPS-SAT")}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: activeMission === "ESA-OPS-SAT" ? 700 : 500,
                  backgroundColor: activeMission === "ESA-OPS-SAT" ? "#f1f5f9" : "transparent",
                  cursor: "pointer",
                }}
              >
                ESA-OPS-SAT
              </div>
            </div>
          )}
        </div>

        <div style={{ width: "1px", height: "18px", backgroundColor: "#cbd5e1" }} />

        {/* Satellite dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", letterSpacing: "0.04em" }}>
            SATELLITE:
          </span>
          <div
            onClick={() => setSatOpen(!satOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            <span>{activeSatellite}</span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {satOpen && (
            <div
              style={{
                position: "absolute",
                top: "38px",
                left: "70px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 50,
                width: "160px",
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => handleSelectSatellite("SAT-ALPHA-01")}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: activeSatellite === "SAT-ALPHA-01" ? 700 : 500,
                  backgroundColor: activeSatellite === "SAT-ALPHA-01" ? "#f1f5f9" : "transparent",
                  cursor: "pointer",
                }}
              >
                SAT-ALPHA-01
              </div>
              <div
                onClick={() => handleSelectSatellite("ESA-OPS-SAT-1")}
                style={{
                  padding: "8px 12px",
                  fontSize: "0.8rem",
                  fontWeight: activeSatellite === "ESA-OPS-SAT-1" ? 700 : 500,
                  backgroundColor: activeSatellite === "ESA-OPS-SAT-1" ? "#f1f5f9" : "transparent",
                  cursor: "pointer",
                }}
              >
                ESA-OPS-SAT-1
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Master Warning Indicator if Anomaly Active */}
      {hasAnomaly && (
        <div
          onClick={() => {
            setAlarmAcknowledged(true);
            playChime();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            borderRadius: "6px",
            backgroundColor: alarmAcknowledged ? "#fffbeb" : "#fef2f2",
            border: alarmAcknowledged ? "1px solid #fde68a" : "1px solid #fecaca",
            cursor: "pointer",
          }}
          title="Click to acknowledge master alarm"
        >
          <AlertOctagon size={16} color={alarmAcknowledged ? "#d97706" : "#ef4444"} />
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              color: alarmAcknowledged ? "#b45309" : "#b91c1c",
              letterSpacing: "0.04em",
            }}
          >
            {alarmAcknowledged ? "ALARM ACKNOWLEDGED" : "MASTER WARNING"}
          </span>
        </div>
      )}

      {/* Right controls: Connection Status, Sim Mode, Sound Mute, Notifications, Operator */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {/* Connection Status Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
            }}
          />
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#065f46",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            LIVE CONNECTION
          </span>
        </div>

        {/* Simulation Mode Pill */}
        <button
          onClick={() => setIsSimMode(!isSimMode)}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid #0284c7",
            backgroundColor: isSimMode ? "#0284c7" : "transparent",
            color: isSimMode ? "#ffffff" : "#0284c7",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          SIMULATION MODE
        </button>

        {/* Fault Injector Trigger Button */}
        <button
          onClick={() => setFaultModalOpen(true)}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid #fecaca",
            backgroundColor: "#fff1f2",
            color: "#b91c1c",
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Open interactive fault injection console"
        >
          <AlertTriangle size={14} color="#ef4444" />
          INJECT FAULT
        </button>

        {/* Fault Injector Modal */}
        <FaultInjectorModal
          isOpen={faultModalOpen}
          onClose={() => setFaultModalOpen(false)}
        />

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isMuted ? "#94a3b8" : "#0f172a",
            display: "flex",
            alignItems: "center",
          }}
          title={isMuted ? "Unmute Alarms" : "Mute Alarms"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Bell size={18} color="#475569" />
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: "0.62rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </span>
        </div>

        {/* Operator Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
            }}
          >
            <User size={16} />
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>
            Operator
          </span>
        </div>
      </div>
    </header>
  );
}
