/**
 * Telemetry State Store (Zustand).
 */
import { create } from "zustand";
import { TelemetryFrame, TelemetryChannels } from "@/lib/types";

interface TelemetryState {
  currentFrame: TelemetryFrame | null;
  history: TelemetryFrame[];
  maxHistoryLength: number;
  engineStatus: {
    current_index: number;
    total_frames: number;
    is_playing: boolean;
    playback_speed: number;
    noise_enabled: boolean;
    history_size: number;
  };
  selectedChannels: (keyof TelemetryChannels)[];
  wsConnected: boolean;
  activeSatellite: string;
  activeMission: string;

  setCurrentFrame: (frame: TelemetryFrame) => void;
  appendFrame: (frame: TelemetryFrame) => void;
  setHistory: (frames: TelemetryFrame[]) => void;
  setEngineStatus: (status: any) => void;
  setSelectedChannels: (channels: (keyof TelemetryChannels)[]) => void;
  toggleChannel: (channel: keyof TelemetryChannels) => void;
  setWsConnected: (connected: boolean) => void;
  setActiveSatellite: (sat: string) => void;
  setActiveMission: (mission: string) => void;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  currentFrame: null,
  history: [],
  maxHistoryLength: 120,
  engineStatus: {
    current_index: 0,
    total_frames: 300,
    is_playing: true,
    playback_speed: 1.0,
    noise_enabled: true,
    history_size: 0,
  },
  selectedChannels: ["attitude_error_deg", "reaction_wheel_rpm"],
  wsConnected: false,
  activeSatellite: "SAT-ALPHA-01",
  activeMission: "LEO-ORBIT-1",

  setCurrentFrame: (frame) => set({ currentFrame: frame }),

  appendFrame: (frame) => {
    const prev = get().history;
    const next = [...prev, frame];
    if (next.length > get().maxHistoryLength) {
      next.shift();
    }
    set({ currentFrame: frame, history: next });
  },

  setHistory: (frames) => set({ history: frames }),
  setEngineStatus: (status) => set({ engineStatus: status }),
  setSelectedChannels: (channels) => set({ selectedChannels: channels }),

  toggleChannel: (channel) => {
    const curr = get().selectedChannels;
    if (curr.includes(channel)) {
      if (curr.length > 1) {
        set({ selectedChannels: curr.filter((c) => c !== channel) });
      }
    } else {
      set({ selectedChannels: [...curr, channel] });
    }
  },

  setWsConnected: (connected) => set({ wsConnected: connected }),
  setActiveSatellite: (sat) => set({ activeSatellite: sat }),
  setActiveMission: (mission) => set({ activeMission: mission }),
}));
