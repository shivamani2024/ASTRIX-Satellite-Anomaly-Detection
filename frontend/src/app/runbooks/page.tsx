"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  Tag,
  Shield,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";

export default function RunbooksPage() {
  const [runbooks, setRunbooks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubsystem, setSelectedSubsystem] = useState("ALL");
  const [selectedSop, setSelectedSop] = useState<any | null>(null);

  useEffect(() => {
    api.getAllRunbooks().then((data) => {
      setRunbooks(data);
      if (data.length > 0) {
        setSelectedSop(data[0]);
      }
    }).catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      api.getAllRunbooks().then(setRunbooks).catch(console.error);
      return;
    }
    try {
      const results = await api.searchRunbooks(searchQuery, 10);
      const all = await api.getAllRunbooks();
      const matched = results
        .map((r: any) => all.find((d: any) => d.sop_id === r.sop_id))
        .filter(Boolean);
      setRunbooks(matched.length > 0 ? matched : all);
    } catch (err) {
      console.error(err);
    }
  };

  const subsystems = ["ALL", "ADCS", "EPS", "THERMAL", "PROPULSION", "FDIR"];

  const filtered = runbooks.filter((sop) => {
    if (selectedSubsystem !== "ALL" && sop.subsystem !== selectedSubsystem) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        sop.sop_id.toLowerCase().includes(q) ||
        sop.title.toLowerCase().includes(q) ||
        sop.summary.toLowerCase().includes(q) ||
        sop.keywords?.some((k: string) => k.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="OPERATIONAL RUNBOOKS & SOP LIBRARY"
        subtitle="ECSS-E-ST-70-11C & ISRO standards for spacecraft failure detection, isolation, and recovery."
        actions={
          <span className="badge-status badge-nominal-soft">
            {runbooks.length} RUNBOOKS INDEXED
          </span>
        }
      />

      {/* Search & Filter Toolbar */}
      <div
        className="aerospace-card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 320px", maxWidth: "500px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search runbooks by title, keywords, or triggers..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "6px",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                color: "#0f172a",
                fontSize: "0.82rem",
              }}
            />
          </div>
          <button type="submit" className="btn-aerospace" style={{ backgroundColor: "#134e4a", color: "#ffffff", fontWeight: 700 }}>
            Search
          </button>
        </form>

        {/* Subsystem Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {subsystems.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubsystem(sub)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: selectedSubsystem === sub ? "#134e4a" : "#ffffff",
                color: selectedSubsystem === sub ? "#ffffff" : "#475569",
                border: selectedSubsystem === sub ? "1px solid #134e4a" : "1px solid #cbd5e1",
                transition: "all 0.15s ease",
              }}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Runbooks Directory & Detailed Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "24px" }}>
        {/* Runbook Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((sop) => {
            const isSelected = selectedSop?.sop_id === sop.sop_id;

            return (
              <div
                key={sop.sop_id}
                onClick={() => setSelectedSop(sop)}
                className="aerospace-card"
                style={{
                  padding: "16px",
                  cursor: "pointer",
                  border: isSelected ? "2px solid #059669" : "1px solid #e2e8f0",
                  backgroundColor: isSelected ? "#ecfdf5" : "#ffffff",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BookOpen size={16} color={isSelected ? "#059669" : "#64748b"} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                      {sop.sop_id}
                    </span>
                    <span className="badge-status badge-nominal-soft">{sop.subsystem}</span>
                  </div>
                  <span
                    className={`badge-status ${
                      sop.risk_tier === "T4"
                        ? "badge-critical"
                        : sop.risk_tier === "T3"
                        ? "badge-warning"
                        : "badge-nominal"
                    }`}
                  >
                    {sop.risk_tier}
                  </span>
                </div>

                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                  {sop.title}
                </div>

                <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: "1.4", marginBottom: "8px" }}>
                  {sop.summary}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {sop.keywords?.slice(0, 3).map((kw: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.68rem",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                      }}
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Inspector Pane */}
        {selectedSop && (
          <div className="aerospace-card" style={{ padding: "28px", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    {selectedSop.title}
                  </h3>
                  <span className="badge-status badge-nominal">{selectedSop.subsystem}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  ID: <strong style={{ color: "#0f172a" }}>{selectedSop.sop_id}</strong> | Version: <strong>{selectedSop.version || "1.0.0"}</strong>
                </div>
              </div>
              <span className="badge-status badge-nominal" style={{ fontSize: "0.75rem" }}>
                TIER {selectedSop.risk_tier}
              </span>
            </div>

            <div style={{ padding: "14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                Summary
              </div>
              <div style={{ fontSize: "0.82rem", color: "#334155", lineHeight: "1.5" }}>
                {selectedSop.summary}
              </div>
            </div>

            {/* Execution Steps */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
                PROCEDURE ACTION SEQUENCE
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedSop.steps?.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#059669" }}>
                        STEP {idx + 1}
                      </span>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                        {step.name || step.action}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      {step.description || step.command}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
