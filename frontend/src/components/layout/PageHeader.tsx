"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeType?: "nominal" | "warning" | "critical" | "cyan" | "purple";
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badgeText,
  badgeType = "cyan",
  actions,
  icon,
}: PageHeaderProps) {
  const getBadgeClass = () => {
    switch (badgeType) {
      case "nominal":
        return "badge-nominal";
      case "warning":
        return "badge-warning";
      case "critical":
        return "badge-critical";
      case "purple":
        return "badge-purple";
      case "cyan":
      default:
        return "badge-status";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "24px",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          {icon && <div style={{ display: "flex", alignItems: "center" }}>{icon}</div>}
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#0f172a",
              textTransform: "uppercase",
              fontFamily: "var(--font-sans)",
            }}
          >
            {title}
          </h1>
          {badgeText && <span className={`badge-status ${getBadgeClass()}`}>{badgeText}</span>}
        </div>
        <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: "1.4" }}>
          {subtitle}
        </p>
      </div>

      {actions && <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>{actions}</div>}
    </div>
  );
}
