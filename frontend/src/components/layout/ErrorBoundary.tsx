"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught error]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel"
          style={{
            margin: "40px auto",
            maxWidth: "600px",
            padding: "32px",
            textAlign: "center",
            border: "1px solid rgba(239, 68, 68, 0.4)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              color: "var(--accent-crimson)",
            }}
          >
            <AlertOctagon size={28} />
          </div>

          <h2
            className="font-mono"
            style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FFF", marginBottom: "8px" }}
          >
            SUBSYSTEM CONSOLE EXCEPTION
          </h2>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "20px",
              lineHeight: "1.5",
            }}
          >
            {this.state.error?.message || "An unexpected error occurred in this telemetry module."}
          </p>

          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-aerospace btn-cyan"
            style={{ margin: "0 auto" }}
          >
            <RefreshCw size={14} />
            Reset Subsystem Display
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
