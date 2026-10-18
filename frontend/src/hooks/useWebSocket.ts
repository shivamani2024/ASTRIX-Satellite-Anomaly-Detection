/**
 * WebSocket streaming hook for 10Hz live telemetry and anomaly alerts.
 */
import { useEffect, useRef } from "react";
import { WS_URL } from "@/lib/constants";
import { useTelemetryStore } from "@/stores/telemetryStore";
import { useAnomalyStore } from "@/stores/anomalyStore";
import { TelemetryWebSocketMessage } from "@/lib/types";

export function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const appendFrame = useTelemetryStore((s) => s.appendFrame);
  const setEngineStatus = useTelemetryStore((s) => s.setEngineStatus);
  const setWsConnected = useTelemetryStore((s) => s.setWsConnected);
  const updateAnomalyFromStream = useAnomalyStore((s) => s.updateFromStream);

  useEffect(() => {
    let isMounted = true;

    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          console.log("[WS] Connected to ASTRIX 10Hz telemetry stream");
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data: TelemetryWebSocketMessage = JSON.parse(event.data);
            if (data.type === "TELEMETRY_FRAME" && data.frame) {
              appendFrame(data.frame);
              if (data.engine_status) {
                setEngineStatus(data.engine_status);
              }
              if (data.anomaly) {
                updateAnomalyFromStream(data.anomaly);
              }
            }
          } catch (err) {
            console.error("[WS] Message parsing error:", err);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          console.warn("[WS] Disconnected from telemetry stream. Reconnecting in 2s...");
          setWsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        };

        ws.onerror = (err) => {
          console.error("[WS] Connection error:", err);
          ws.close();
        };
      } catch (err) {
        console.error("[WS] Failed to initiate connection:", err);
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [appendFrame, setEngineStatus, setWsConnected, updateAnomalyFromStream]);

  return { isConnected: useTelemetryStore((s) => s.wsConnected) };
}
