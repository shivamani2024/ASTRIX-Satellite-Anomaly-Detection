"use client";

import React, { useEffect, useState } from "react";
import {
  FileCode,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuditStore } from "@/stores/auditStore";
import { api } from "@/lib/api";

export default function AuditLedgerPage() {
  const entries = useAuditStore((s) => s.entries);
  const setEntries = useAuditStore((s) => s.setEntries);
  const verification = useAuditStore((s) => s.verification);
  const setVerification = useAuditStore((s) => s.setVerification);
  const isVerifying = useAuditStore((s) => s.isVerifying);
  const setIsVerifying = useAuditStore((s) => s.setIsVerifying);

  const [tamperMessage, setTamperMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLedgerAndVerify();
  }, []);

  const loadLedgerAndVerify = async () => {
    try {
      const list = await api.getAuditEntries(100);
      setEntries(list);
      const verif = await api.verifyAuditChain();
      setVerification(verif);
    } catch (err) {
      console.error("Failed to load audit ledger:", err);
    }
  };

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setTamperMessage(null);
    try {
      const verif = await api.verifyAuditChain();
      setVerification(verif);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = async () => {
    try {
      const res = await api.simulateTamper(1, "MALICIOUS_IMPOSTER");
      setVerification(res.verification);
      setTamperMessage(
        "TAMPER TEST ACTIVE: Block #1 mutated with actor 'MALICIOUS_IMPOSTER'. Cryptographic chain link severed!"
      );
      const updated = await api.getAuditEntries(100);
      setEntries(updated);
    } catch (err: any) {
      console.error(err);
    }
  };

  const isChainValid = verification?.is_valid && !verification?.tamper_detected;

  return (
    <div>
      <PageHeader
        title="AUDIT TRAIL & LEDGER"
        subtitle="SHA-256 hash-chain block ledger logging all autonomous decisions, operator sign-offs, and flight telecommands."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSimulateTamper}
              className="btn-aerospace"
              style={{ borderColor: "#fca5a5", color: "#ef4444" }}
              title="Test cryptographic rupture detection"
            >
              <AlertTriangle size={14} /> Simulate Tamper
            </button>

            <button
              onClick={handleVerifyChain}
              disabled={isVerifying}
              className="btn-aerospace"
              style={{ backgroundColor: "#134e4a", color: "#ffffff", fontWeight: 700 }}
            >
              <ShieldCheck size={14} />
              <span>{isVerifying ? "Verifying Hashes..." : "Recalculate & Verify Chain"}</span>
            </button>
          </div>
        }
      />

      {/* Verification Status Card */}
      <div
        className="aerospace-card"
        style={{
          padding: "18px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          backgroundColor: isChainValid ? "#ecfdf5" : "#fff1f2",
          borderColor: isChainValid ? "#a7f3d0" : "#fecaca",
        }}
      >
        {isChainValid ? (
          <CheckCircle2 size={28} color="#059669" />
        ) : (
          <ShieldAlert size={28} color="#ef4444" />
        )}

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 800, color: isChainValid ? "#065f46" : "#b91c1c", marginBottom: "2px" }}>
            {isChainValid ? "CRYPTOGRAPHIC PROOF OF AUTHENTICITY VALID" : "HASH MISMATCH: INTEGRITY BREACH DETECTED"}
          </div>
          <div style={{ fontSize: "0.82rem", color: isChainValid ? "#065f46" : "#b91c1c" }}>
            {verification?.message || "Recalculating SHA-256 block ledger..."}
          </div>
        </div>

        <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
          BLOCKS AUDITED: <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{entries.length}</strong>
        </div>
      </div>

      {tamperMessage && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#b91c1c",
            fontSize: "0.82rem",
            fontWeight: 600,
          }}
        >
          {tamperMessage}
        </div>
      )}

      {/* Block Ledger Table */}
      <div className="aerospace-card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "18px" }}>
          CRYPTOGRAPHIC BLOCK SEQUENCE ({entries.length} BLOCKS)
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 14px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>BLOCK</th>
                <th style={{ padding: "12px 14px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>TIMESTAMP</th>
                <th style={{ padding: "12px 14px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>ACTOR</th>
                <th style={{ padding: "12px 14px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>ACTION</th>
                <th style={{ padding: "12px 14px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>RISK</th>
                <th style={{ padding: "12px 14px", fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>SHA-256 BLOCK HASH</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((block) => (
                <tr key={block.block_index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 800, color: "#0f172a", fontSize: "0.85rem" }}>
                    #{block.block_index}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.78rem", color: "#64748b" }}>
                    {block.timestamp.replace("T", " ").substring(0, 19)}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>
                    {block.actor}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.82rem", color: "#475569" }}>
                    {block.action_type}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      className={`badge-status ${
                        block.risk_tier === "T4"
                          ? "badge-critical"
                          : block.risk_tier === "T3"
                          ? "badge-warning"
                          : "badge-nominal"
                      }`}
                    >
                      {block.risk_tier}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#0284c7" }}>
                    {block.block_hash.substring(0, 24)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
