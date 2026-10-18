"""ASTRIX Ground Operations System — Main Application Entrypoint."""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.logger import logger
from app.websockets.manager import ws_manager
from app.routers import (
    health,
    telemetry,
    anomalies,
    investigation,
    twin,
    safety,
    commands,
    audit,
    runbooks,
    auth,
    orbit,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycles."""
    logger.info("Initializing ASTRIX Ground Operations Backend Services...")
    # Start 10Hz telemetry streaming loop as background task
    broadcast_task = asyncio.create_task(ws_manager.start_broadcasting())
    ws_manager.broadcast_task = broadcast_task
    logger.info(f"System ready on http://{settings.FASTAPI_HOST}:{settings.FASTAPI_PORT}")

    yield

    logger.info("Shutting down ASTRIX Ground Operations Services...")
    ws_manager.stop_broadcasting()
    try:
        broadcast_task.cancel()
        await broadcast_task
    except (asyncio.CancelledError, Exception):
        pass
    logger.info("Cleanup completed.")


app = FastAPI(
    title="ASTRIX Ground Operations API",
    description="Autonomous Spacecraft Operations & Mission Control System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers with /api/v1 prefix
app.include_router(health.router, prefix="/api/v1")
app.include_router(telemetry.router, prefix="/api/v1")
app.include_router(anomalies.router, prefix="/api/v1")
app.include_router(investigation.router, prefix="/api/v1")
app.include_router(twin.router, prefix="/api/v1")
app.include_router(safety.router, prefix="/api/v1")
app.include_router(commands.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(runbooks.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(orbit.router, prefix="/api/v1")


@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """10Hz real-time bidirectional WebSocket connection for telemetry and anomaly streaming."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep receiving client commands (e.g. heartbeat pings)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)


@app.get("/")
def root():
    return {
        "system": "ASTRIX Ground Operations System",
        "status": "ONLINE",
        "mission_id": settings.MISSION_ID,
        "satellite_id": settings.SATELLITE_ID,
        "api_docs": "/docs",
        "websocket": "/ws/telemetry",
    }
