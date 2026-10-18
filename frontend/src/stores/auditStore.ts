/**
 * Cryptographic Audit Ledger State Store (Zustand).
 */
import { create } from "zustand";
import { AuditEntry, AuditChainVerification } from "@/lib/types";

interface AuditState {
  entries: AuditEntry[];
  verification: AuditChainVerification | null;
  isLoading: boolean;
  isVerifying: boolean;
  tamperSimulationResult: any | null;

  setEntries: (entries: AuditEntry[]) => void;
  setVerification: (verification: AuditChainVerification) => void;
  setIsLoading: (loading: boolean) => void;
  setIsVerifying: (verifying: boolean) => void;
  setTamperSimulationResult: (result: any) => void;
}

export const useAuditStore = create<AuditState>((set) => ({
  entries: [],
  verification: null,
  isLoading: false,
  isVerifying: false,
  tamperSimulationResult: null,

  setEntries: (entries) => set({ entries }),
  setVerification: (verification) => set({ verification }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsVerifying: (verifying) => set({ isVerifying: verifying }),
  setTamperSimulationResult: (result) => set({ tamperSimulationResult: result }),
}));
