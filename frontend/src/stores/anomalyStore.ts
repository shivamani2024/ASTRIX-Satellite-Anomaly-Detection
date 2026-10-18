/**
 * Anomaly State Store (Zustand).
 */
import { create } from "zustand";
import { AnomalyEvent } from "@/lib/types";

interface AnomalyState {
  activeAnomalies: AnomalyEvent[];
  history: AnomalyEvent[];
  selectedAnomaly: AnomalyEvent | null;
  isLoading: boolean;

  setActiveAnomalies: (anomalies: AnomalyEvent[]) => void;
  setHistory: (anomalies: AnomalyEvent[]) => void;
  selectAnomaly: (anomaly: AnomalyEvent | null) => void;
  updateFromStream: (anomaly: AnomalyEvent | undefined) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAnomalyStore = create<AnomalyState>((set, get) => ({
  activeAnomalies: [],
  history: [],
  selectedAnomaly: null,
  isLoading: false,

  setActiveAnomalies: (anomalies) => set({ activeAnomalies: anomalies }),
  setHistory: (anomalies) => set({ history: anomalies }),
  selectAnomaly: (anomaly) => set({ selectedAnomaly: anomaly }),

  updateFromStream: (anomaly) => {
    if (!anomaly) return;
    const current = get().activeAnomalies;
    const exists = current.find((a) => a.event_id === anomaly.event_id);
    if (anomaly.status === "RESOLVED") {
      set({
        activeAnomalies: current.filter((a) => a.event_id !== anomaly.event_id),
      });
    } else if (!exists) {
      set({ activeAnomalies: [anomaly, ...current] });
    } else {
      set({
        activeAnomalies: current.map((a) => (a.event_id === anomaly.event_id ? anomaly : a)),
      });
    }
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
