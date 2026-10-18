"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ErrorBoundary } from "./ErrorBoundary";
import { useWebSocket } from "@/hooks/useWebSocket";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Mount real-time WebSocket connection to backend 10Hz stream
  useWebSocket();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "250px", display: "flex", flexDirection: "column" }}>
        <TopBar />
        <main
          style={{
            marginTop: "64px",
            padding: "28px 36px",
            flex: 1,
            position: "relative",
            zIndex: 10,
            backgroundColor: "#f8fafc",
          }}
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
