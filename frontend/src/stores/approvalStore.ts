/**
 * Command Envelope and Operator Approval State Store (Zustand).
 */
import { create } from "zustand";
import { CommandEnvelope, SafetyValidationResult } from "@/lib/types";

interface ApprovalState {
  envelope: CommandEnvelope | null;
  validation: SafetyValidationResult | null;
  rationale: string;
  isSubmitting: boolean;
  error: string | null;

  setEnvelope: (envelope: CommandEnvelope | null) => void;
  setValidation: (validation: SafetyValidationResult | null) => void;
  setRationale: (rationale: string) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
}

export const useApprovalStore = create<ApprovalState>((set) => ({
  envelope: null,
  validation: null,
  rationale: "Executing SOP-ADCS-042 magnetorquer desaturation to relieve RW-02 momentum saturation above 5500 RPM safely within ground station pass window.",
  isSubmitting: false,
  error: null,

  setEnvelope: (envelope) => set({ envelope }),
  setValidation: (validation) => set({ validation }),
  setRationale: (rationale) => set({ rationale }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
}));
