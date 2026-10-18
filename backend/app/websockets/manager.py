"""WebSocket Manager for Real-time 10Hz Telemetry & Anomaly Streaming."""
import asyncio
import json
from typing import Set, Dict, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect

from app.config import settings
from app.logger import logger
from app.services.telemetry_engine import telemetry_engine
from app.services.anomaly_detector import anomaly_detector


class ConnectionManager:
    """Manages active WebSocket connections and frame broadcasting."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.broadcast_task: Optional[asyncio.Task] = None
        self._running: bool = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast_json(self, message: Dict[str, Any]):
        """Broadcast JSON payload to all connected clients."""
        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                dead_connections.add(connection)
            except Exception as e:
                logger.warning(f"Error sending to WebSocket client: {e}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def start_broadcasting(self):
        """10Hz telemetry streaming loop."""
        if self._running:
            return

        self._running = True
        interval = 1.0 / max(1, settings.TELEMETRY_BROADCAST_HZ)
        logger.info(f"Starting 10Hz telemetry broadcast loop (interval: {interval*1000:.1f}ms)")

        while self._running:
            try:
                # Step to next frame
                frame = telemetry_engine.step_next_frame()
                if frame:
                    # Run anomaly detection
                    anomaly = anomaly_detector.process_frame(frame)

                    payload = {
                        "type": "TELEMETRY_FRAME",
                        "frame": frame.model_dump(),
                        "engine_status": telemetry_engine.get_status(),
                        "anomaly": anomaly.model_dump() if anomaly else None,
                    }

                    if self.active_connections:
                        await self.broadcast_json(payload)

                # Delay according to playback speed
                effective_interval = interval / max(0.1, telemetry_engine.playback_speed)
                await asyncio.sleep(effective_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in telemetry broadcast loop: {e}")
                await asyncio.sleep(0.5)

        logger.info("Telemetry broadcast loop stopped")

    def stop_broadcasting(self):
        self._running = False
        if self.broadcast_task and not self.broadcast_task.done():
            self.broadcast_task.cancel()


# Global WebSocket manager singleton
ws_manager = ConnectionManager()
