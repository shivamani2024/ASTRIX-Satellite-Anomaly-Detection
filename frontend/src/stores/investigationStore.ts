/**
 * AI Multi-Agent Investigation State Store (Zustand).
 */
import { create } from "zustand";
import { InvestigationState, DiagnosticOutput } from "@/lib/types";

interface InvestigationStoreState {
  state: InvestigationState | null;
  dossier: DiagnosticOutput | null;
  isTriggering: boolean;
  selectedAgent: string;

  setState: (state: InvestigationState) => void;
  setDossier: (dossier: DiagnosticOutput) => void;
  setIsTriggering: (triggering: boolean) => void;
  setSelectedAgent: (agentKey: string) => void;
  reset: () => void;
}

export const useInvestigationStore = create<InvestigationStoreState>((set) => ({
  state: null,
  dossier: null,
  isTriggering: false,
  selectedAgent: "analyst",

  setState: (state) => set({ state }),
  setDossier: (dossier) => set({ dossier }),
  setIsTriggering: (triggering) => set({ isTriggering: triggering }),
  setSelectedAgent: (agentKey) => set({ selectedAgent: agentKey }),
  reset: () => set({ state: null, dossier: null, isTriggering: false, selectedAgent: "analyst" }),
}));
