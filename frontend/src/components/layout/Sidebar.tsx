"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Brain,
  Network,
  ShieldCheck,
  History,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAnomalyStore } from "@/stores/anomalyStore";

const NAV_ITEMS = [
  { href: "/mission-control", label: "Mission Control", icon: LayoutDashboard },
  { href: "/telemetry", label: "Live Telemetry", icon: Activity },
  { href: "/anomalies", label: "Anomaly Center", icon: AlertTriangle },
  { href: "/investigation", label: "AI Investigation", icon: Brain },
  { href: "/digital-twin", label: "Digital Twin", icon: Network },
  { href: "/safety", label: "Safety Validation", icon: ShieldCheck },
  { href: "/audit", label: "Audit Trail", icon: History },
  { href: "/runbooks", label: "Runbooks", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const activeAnomalies = useAnomalyStore((s) => s.activeAnomalies);

  return (
    <aside
      style={{
        width: "250px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: "64px",
          padding: "0 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#134e4a",
          }}
        >
          {/* Custom SVG Astrix orbital cross emblem matching screenshot */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#134e4a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
            <path d="M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" strokeWidth="1.6" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: "#134e4a",
            fontFamily: "var(--font-sans)",
          }}
        >
          ASTRIX
        </span>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "20px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div
          style={{
            padding: "0 12px 10px 12px",
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#64748b",
          }}
        >
          MISSION OPERATIONS
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === "/mission-control" && pathname === "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? "#e6f4ea" : "transparent",
                color: isActive ? "#065f46" : "#475569",
                borderLeft: isActive ? "3px solid #059669" : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={18} color={isActive ? "#059669" : "#64748b"} />
              <span>{item.label}</span>
              {item.href === "/anomalies" && activeAnomalies.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#ef4444",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom subtle profile / status mark */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#1e293b",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          N
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>Flight Director</div>
          <div style={{ fontSize: "0.68rem" }}>Console Active</div>
        </div>
      </div>
    </aside>
  );
}
