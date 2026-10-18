/**
 * ASTRIX Ground Operations — Constants and System Configurations.
 */

export const MISSION_CONFIG = {
  MISSION_ID: "LEO-ORBIT-1",
  SATELLITE_ID: "SAT-ALPHA-01",
  OPERATOR_ID: "OPR-SINGH-001",
  ORBIT_ALTITUDE_KM: 540,
  INCLINATION_DEG: 97.4,
  ORBITAL_PERIOD_MIN: 95.4,
  GROUND_STATION: "ISTRAC-BLR-01",
};

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/v1";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/telemetry";

export const THRESHOLDS = {
  ATTITUDE_ERROR_DEG: 0.50,
  ATTITUDE_ERROR_NOMINAL: 0.08,
  RW_SPEED_RPM_REDLINE: 5500.0,
  RW_SPEED_RPM_NOMINAL: 2850.0,
  BUS_VOLTAGE_MIN_V: 26.5,
  BUS_VOLTAGE_NOMINAL_V: 28.2,
  THERMAL_PANEL_MAX_C: 45.0,
  THERMAL_PANEL_NOMINAL_C: 22.2,
  POWER_MARGIN_MIN_PCT: 60.0,
  PEAK_SLEW_RATE_MAX_DEG_S: 0.25,
};

export const CHANNELS_CONFIG = [
  {
    key: "attitude_error_deg" as const,
    label: "Attitude Error",
    unit: "deg",
    nominal: "0.08°",
    threshold: "0.50°",
    color: "#00F0FF",
  },
  {
    key: "reaction_wheel_rpm" as const,
    label: "Reaction Wheel Speed",
    unit: "RPM",
    nominal: "2850 RPM",
    threshold: "5500 RPM",
    color: "#EF4444",
  },
  {
    key: "bus_voltage_v" as const,
    label: "EPS Main Bus Voltage",
    unit: "V",
    nominal: "28.2 V",
    threshold: "26.5 V",
    color: "#10B981",
  },
  {
    key: "thermal_panel_c" as const,
    label: "Radiator Panel Temp",
    unit: "°C",
    nominal: "22.2 °C",
    threshold: "45.0 °C",
    color: "#F59E0B",
  },
  {
    key: "solar_array_w" as const,
    label: "Solar Array Output",
    unit: "W",
    nominal: "212 W",
    threshold: "160 W",
    color: "#38BDF8",
  },
  {
    key: "magnetorquer_current_a" as const,
    label: "Magnetorquer Current",
    unit: "A",
    nominal: "0.22 A",
    threshold: "1.0 A",
    color: "#A855F7",
  },
];

export const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "LayoutDashboard", badge: "" },
  { href: "/telemetry", label: "Live Telemetry", icon: "Activity", badge: "10Hz" },
  { href: "/anomalies", label: "Anomaly Triage", icon: "AlertTriangle", badge: "ANM-2048" },
  { href: "/investigation", label: "AI Investigation", icon: "Brain", badge: "LangGraph" },
  { href: "/digital-twin", label: "Digital Twin", icon: "Box", badge: "3D" },
  { href: "/safety", label: "Safety & Approvals", icon: "ShieldCheck", badge: "T2 Gated" },
  { href: "/audit", label: "Audit Ledger", icon: "FileCode", badge: "SHA-256" },
  { href: "/runbooks", label: "Flight Runbooks", icon: "BookOpen", badge: "ECSS" },
];
