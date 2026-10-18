/**
 * Digital Twin Simulation State Store (Zustand).
 */
import { create } from "zustand";

interface TwinState {
  simulationResult: any | null;
  isSimulating: boolean;
  selectedTrajectory: "mitigated" | "unmitigated" | "comparison";
  simulationTimeStep: number;

  setSimulationResult: (result: any) => void;
  setIsSimulating: (simulating: boolean) => void;
  setSelectedTrajectory: (traj: "mitigated" | "unmitigated" | "comparison") => void;
  setSimulationTimeStep: (step: number) => void;
}

export const useTwinStore = create<TwinState>((set) => ({
  simulationResult: null,
  isSimulating: false,
  selectedTrajectory: "comparison",
  simulationTimeStep: 0,

  setSimulationResult: (result) => set({ simulationResult: result }),
  setIsSimulating: (simulating) => set({ isSimulating: simulating }),
  setSelectedTrajectory: (traj) => set({ selectedTrajectory: traj }),
  setSimulationTimeStep: (step) => set({ simulationTimeStep: step }),
}));
