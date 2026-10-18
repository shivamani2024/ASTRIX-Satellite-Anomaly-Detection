"""Anomaly Incidents API Router."""
from typing import List, Optional
from fastapi import APIRouter, HTTPException

from app.models.anomaly import AnomalyEvent
from app.services.anomaly_detector import anomaly_detector

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


@router.get("/active", response_model=List[AnomalyEvent])
def get_active_anomalies():
    """Retrieve all currently active anomalies."""
    return anomaly_detector.get_active_anomalies()


@router.get("/history", response_model=List[AnomalyEvent])
def get_anomaly_history():
    """Retrieve historical anomaly incidents."""
    return anomaly_detector.get_anomaly_history()


@router.get("/model-info")
def get_model_info():
    """Retrieve metadata, accuracy, and benchmark metrics for the trained ESA OPS-SAT ML model."""
    metrics = anomaly_detector.get_opssat_metrics()
    if not metrics:
        raise HTTPException(status_code=404, detail="OPS-SAT model metrics not found")
    return metrics


@router.get("/opssat-samples")
def get_opssat_samples():
    """Retrieve curated test segments from the ESA OPS-SAT benchmark dataset."""
    import os
    import pandas as pd
    data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "opssat_dataset.csv")
    if not os.path.exists(data_path):
        raise HTTPException(status_code=404, detail="Dataset not found")
    df = pd.read_csv(data_path)
    
    # Pick 3 anomalous and 3 nominal segments from the test split (train == 0)
    test_df = df[df["train"] == 0]
    anom_samples = test_df[test_df["anomaly"] == 1].head(3)
    nom_samples = test_df[test_df["anomaly"] == 0].head(3)
    combined = pd.concat([anom_samples, nom_samples])
    
    records = []
    for _, row in combined.iterrows():
        records.append({
            "segment_id": int(row["segment"]),
            "channel": str(row["channel"]),
            "ground_truth": "ANOMALOUS" if row["anomaly"] == 1 else "NOMINAL",
            "mean": round(float(row["mean"]), 4),
            "std": round(float(row["std"]), 4),
            "kurtosis": round(float(row["kurtosis"]), 4),
            "diff2_var": round(float(row["diff2_var"]), 6),
            "features": row.to_dict()
        })
    return records


@router.post("/evaluate")
def evaluate_telemetry_features(features: dict):
    """Predict anomaly probability for an input telemetry feature vector using trained OPS-SAT model."""
    result = anomaly_detector.predict_opssat_segment(features)
    return result


@router.get("/{event_id}", response_model=AnomalyEvent)
def get_anomaly_by_id(event_id: str):
    """Retrieve detailed anomaly record by ID."""
    event = anomaly_detector.get_anomaly_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Anomaly event '{event_id}' not found")
    return event
