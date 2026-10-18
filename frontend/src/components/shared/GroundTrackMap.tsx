"use client";

import React, { useEffect, useState } from "react";
import { Globe, Radio, Signal, Compass, Navigation } from "lucide-react";
import { api } from "@/lib/api";

interface Pos {
  lat: number;
  lon: number;
}

interface GroundStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  in_contact: boolean;
  distance_km: number;
  elevation_deg: number;
  cone_radius_km: number;
}

interface OrbitData {
  satellite: {
    id: string;
    name: string;
    altitude_km: number;
    inclination_deg: number;
    velocity_km_s: number;
    current_pos: {
      lat: number;
      lon: number;
      sunlit: boolean;
    };
  };
  past_track: [number, number][];
  future_track: [number, number][];
  ground_stations: GroundStation[];
  contact_summary: {
    active_station: string;
    status: string;
    los_seconds: number;
    uplink_frequency: string;
    downlink_frequency: string;
  };
}

export function GroundTrackMap() {
  const [data, setData] = useState<OrbitData | null>(null);
  const [countdown, setCountdown] = useState<number>(420);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const res = await api.getGroundTrack();
        if (res) {
          setData(res);
          if (res.contact_summary?.los_seconds) {
            setCountdown(res.contact_summary.los_seconds);
          }
        }
      } catch (e) {
        console.error("Failed to load ground track:", e);
      }
    };

    fetchTrack();
    const interval = setInterval(fetchTrack, 2500);
    return () => clearInterval(interval);
  }, []);

  // Local seconds ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 420));
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // SVG coordinate transformation:
  // Lon: -180 to +180 -> X: 0 to 800
  // Lat: +90 to -90 -> Y: 0 to 400
  const toX = (lon: number) => ((lon + 180) / 360) * 800;
  const toY = (lat: number) => ((90 - lat) / 180) * 400;

  const satPos = data?.satellite?.current_pos || { lat: 34.2, lon: -12.4, sunlit: true };
  const satX = toX(satPos.lon);
  const satY = toY(satPos.lat);

  // Build SVG path for tracks, handling -180/180 meridian wrap-arounds
  const buildPathString = (points: [number, number][]) => {
    if (!points || points.length === 0) return "";
    let d = "";
    for (let i = 0; i < points.length; i++) {
      const [lat, lon] = points[i];
      const x = toX(lon);
      const y = toY(lat);

      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        const prevLon = points[i - 1][1];
        // If wrapped across antimeridian (>180 deg jump), start new subpath
        if (Math.abs(lon - prevLon) > 180) {
          d += ` M ${x} ${y}`;
        } else {
          d += ` L ${x} ${y}`;
        }
      }
    }
    return d;
  };

  const pastPath = data ? buildPathString(data.past_track) : "";
  const futurePath = data ? buildPathString(data.future_track) : "";

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const inPass = data?.contact_summary?.status === "IN_PASS";

  return (
    <div
      className="aerospace-card"
      style={{
        padding: "20px 24px",
        marginBottom: "28px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              backgroundColor: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#059669",
            }}
          >
            <Globe size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                2D Orbital Ground Track & Contact Cones
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                }}
              >
                SSO 540km • INC 97.4°
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
              Real-time LEO sub-satellite projection, Keplerian ground track, and European ground station passes
            </p>
          </div>
        </div>

        {/* Live Pass Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: inPass ? "#ecfdf5" : "#f8fafc",
              border: `1px solid ${inPass ? "#a7f3d0" : "#e2e8f0"}`,
            }}
          >
            <Radio size={14} color={inPass ? "#059669" : "#64748b"} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b" }}>
                {inPass ? "ACTIVE GROUND PASS" : "NEXT PASS CONTACT"}
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: inPass ? "#065f46" : "#0f172a" }}>
                {data?.contact_summary?.active_station || "Svalbard SGS"} ({formatTime(countdown)})
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <Signal size={14} color="#0284c7" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b" }}>UPLINK / DOWNLINK</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0284c7" }}>
                S-Band 2.2GHz • X-Band 8.4GHz
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Map Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "320px",
          borderRadius: "10px",
          backgroundColor: "#f0f4f8",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
        }}
      >
        <svg
          viewBox="0 0 800 400"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {/* Latitude / Longitude Grid */}
          <defs>
            <pattern id="grid" width="66.66" height="66.66" patternUnits="userSpaceOnUse">
              <path d="M 66.66 0 L 0 0 0 66.66" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Equator & Prime Meridian */}
          <line x1="0" y1="200" x2="800" y2="200" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 4" />
          <line x1="400" y1="0" x2="400" y2="400" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 4" />

          {/* Simplified Vector Continents */}
          <g fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8">
            {/* North America */}
            <path d="M 120 70 L 220 60 L 260 90 L 240 140 L 200 170 L 160 180 L 140 150 L 100 120 Z" />
            {/* South America */}
            <path d="M 240 210 L 290 230 L 300 290 L 270 360 L 240 330 L 225 250 Z" />
            {/* Europe */}
            <path d="M 390 80 L 460 70 L 470 120 L 430 140 L 380 120 Z" />
            {/* Africa */}
            <path d="M 380 150 L 460 160 L 480 230 L 440 320 L 400 320 L 360 210 Z" />
            {/* Asia */}
            <path d="M 480 60 L 680 70 L 720 130 L 650 200 L 550 180 L 490 140 Z" />
            {/* Australia */}
            <path d="M 630 260 L 710 270 L 700 330 L 640 330 Z" />
          </g>

          {/* Ground Station Footprint Cones */}
          {data?.ground_stations?.map((gs) => {
            const gx = toX(gs.lon);
            const gy = toY(gs.lat);
            const radius = (gs.cone_radius_km / 40075) * 800; // rough scale

            return (
              <g key={gs.id}>
                {/* Coverage Circle */}
                <circle
                  cx={gx}
                  cy={gy}
                  r={radius}
                  fill={gs.in_contact ? "rgba(16, 185, 129, 0.18)" : "rgba(2, 132, 199, 0.08)"}
                  stroke={gs.in_contact ? "#10b981" : "#38bdf8"}
                  strokeWidth="1.2"
                  strokeDasharray={gs.in_contact ? "none" : "3 3"}
                />
                {/* Station Tower Marker */}
                <circle
                  cx={gx}
                  cy={gy}
                  r="3.5"
                  fill={gs.in_contact ? "#059669" : "#0284c7"}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text
                  x={gx + 6}
                  y={gy + 3}
                  fontSize="8"
                  fontWeight="700"
                  fill="#334155"
                  fontFamily="sans-serif"
                >
                  {gs.id}
                </text>
              </g>
            );
          })}

          {/* Past Orbit Ground Track (Dashed Cyan) */}
          {pastPath && (
            <path
              d={pastPath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.65"
            />
          )}

          {/* Future Orbit Ground Track (Solid Emerald/Teal) */}
          {futurePath && (
            <path
              d={futurePath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.2"
              opacity="0.85"
            />
          )}

          {/* Active Satellite Marker */}
          <g transform={`translate(${satX}, ${satY})`}>
            {/* Animated Radar Pulse */}
            <circle
              r="14"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              opacity="0.6"
            >
              <animate attributeName="r" values="6;22;6" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.5s" repeatCount="indefinite" />
            </circle>

            {/* Satellite Body */}
            <rect
              x="-6"
              y="-6"
              width="12"
              height="12"
              rx="2"
              fill="#134e4a"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Solar Wings */}
            <line x1="-12" y1="0" x2="-6" y2="0" stroke="#0284c7" strokeWidth="3" />
            <line x1="6" y1="0" x2="12" y2="0" stroke="#0284c7" strokeWidth="3" />

            {/* Satellite Info Tag */}
            <rect
              x="14"
              y="-12"
              width="110"
              height="20"
              rx="4"
              fill="rgba(15, 23, 42, 0.85)"
            />
            <text
              x="18"
              y="1"
              fill="#ffffff"
              fontSize="8"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              SAT-ALPHA-01 ({satPos.lat > 0 ? `${satPos.lat}°N` : `${Math.abs(satPos.lat)}°S`}, {satPos.lon > 0 ? `${satPos.lon}°E` : `${Math.abs(satPos.lon)}°W`})
            </text>
          </g>
        </svg>

        {/* Floating Telemetry Badge in Bottom Left of Map */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "14px",
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(6px)",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid rgba(203, 213, 225, 0.8)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#334155",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div>
            <span style={{ color: "#64748b", fontSize: "0.68rem" }}>LATITUDE: </span>
            <span>{satPos.lat.toFixed(2)}°</span>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.68rem" }}>LONGITUDE: </span>
            <span>{satPos.lon.toFixed(2)}°</span>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.68rem" }}>ALTITUDE: </span>
            <span>540.0 km</span>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "0.68rem" }}>VELOCITY: </span>
            <span>7.58 km/s</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: satPos.sunlit ? "#f59e0b" : "#64748b",
              }}
            />
            <span>{satPos.sunlit ? "SUNLIT" : "ECLIPSE"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
