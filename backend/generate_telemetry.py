"""Generate canonical 300-point telemetry dataset for ASTRIX ANM-2048 scenario."""
import json
import math
import random
from datetime import datetime, timedelta

def generate_canonical_telemetry(filepath: str):
    random.seed(42)
    start_time = datetime(2026, 9, 17, 12, 0, 0)
    frames = []
    
    # Store history for rolling stats
    attitude_history = []
    rw_history = []
    
    for i in range(300):
        t = i  # 1 frame per simulated second
        timestamp = (start_time + timedelta(seconds=t)).isoformat() + "Z"
        frame_id = f"FRAME-{i+1:04d}"
        
        # 5 Phases
        if t < 60:
            # Phase 1: Nominal Operations (t = 0..59)
            p = t / 60.0
            noise_att = random.gauss(0, 0.008)
            noise_rw = random.gauss(0, 18.0)
            noise_v = random.gauss(0, 0.03)
            noise_thm = random.gauss(0, 0.15)
            noise_sol = random.gauss(0, 1.2)
            noise_mtq = random.gauss(0, 0.01)
            
            attitude_error = round(max(0.04, 0.075 + 0.015 * math.sin(t * 0.1) + noise_att), 4)
            rw_rpm = round(2820.0 + 35.0 * math.cos(t * 0.08) + noise_rw, 1)
            bus_v = round(28.20 + noise_v, 2)
            thermal_c = round(22.1 + 0.5 * (t / 60.0) + noise_thm, 2)
            solar_w = round(214.0 + noise_sol, 1)
            mtq_a = round(0.22 + noise_mtq, 3)
            
        elif t < 120:
            # Phase 2: Incipient Drift / Tachometer degradation (t = 60..119)
            p = (t - 60) / 60.0
            noise_att = random.gauss(0, 0.015)
            noise_rw = random.gauss(0, 35.0)
            noise_v = random.gauss(0, 0.05)
            noise_thm = random.gauss(0, 0.2)
            noise_sol = random.gauss(0, 1.5)
            noise_mtq = random.gauss(0, 0.02)
            
            # Attitude ramps from 0.09 to 0.48 deg (nearing 0.50 threshold)
            attitude_error = round(0.09 + 0.39 * (p ** 1.6) + noise_att, 4)
            # Wheel speed accelerates from 2850 to 5350 RPM (nearing 5500 threshold)
            rw_rpm = round(2850.0 + 2500.0 * (p ** 1.3) + noise_rw, 1)
            bus_v = round(28.20 - 0.55 * p + noise_v, 2)
            thermal_c = round(22.6 + 10.5 * p + noise_thm, 2)
            solar_w = round(214.0 - 24.0 * (p ** 1.2) + noise_sol, 1)
            mtq_a = round(0.22 + 0.52 * p + noise_mtq, 3)
            
        elif t < 180:
            # Phase 3: Anomaly Event ANM-2048 Saturation (t = 120..179)
            p = (t - 120) / 60.0
            noise_att = random.gauss(0, 0.03)
            noise_rw = random.gauss(0, 45.0)
            noise_v = random.gauss(0, 0.06)
            noise_thm = random.gauss(0, 0.3)
            noise_sol = random.gauss(0, 2.0)
            noise_mtq = random.gauss(0, 0.03)
            
            # Attitude breaches 0.50 deg threshold, peaking around 2.38 deg
            attitude_peak = 0.52 + 1.86 * math.sin(p * math.pi * 0.75)
            attitude_error = round(max(0.51, attitude_peak + noise_att), 4)
            # Wheel RPM exceeds 5500 RPM threshold, saturating around 6050 - 6180 RPM
            rw_rpm = round(min(6200.0, 5520.0 + 620.0 * math.sin(p * math.pi * 0.6) + noise_rw), 1)
            bus_v = round(27.65 - 0.95 * math.sin(p * math.pi * 0.6) + noise_v, 2)
            thermal_c = round(33.1 + 9.5 * (p ** 0.8) + noise_thm, 2)
            solar_w = round(190.0 - 45.0 * math.sin(p * math.pi * 0.6) + noise_sol, 1)
            mtq_a = round(min(1.05, 0.74 + 0.28 * p + noise_mtq), 3)
            
        elif t < 240:
            # Phase 4: AI Investigation & Commanded Mitigation SOP-ADCS-042 (t = 180..239)
            p = (t - 180) / 60.0
            decay = math.exp(-2.6 * p)
            noise_att = random.gauss(0, 0.02) * (decay + 0.3)
            noise_rw = random.gauss(0, 25.0) * (decay + 0.5)
            noise_v = random.gauss(0, 0.04)
            noise_thm = random.gauss(0, 0.2)
            noise_sol = random.gauss(0, 1.5)
            noise_mtq = random.gauss(0, 0.02)
            
            # Attitude recovers from 2.2 deg down to 0.45 deg
            attitude_error = round(max(0.18, 0.18 + (2.20 - 0.18) * decay + noise_att), 4)
            # Wheel RPM drops from 6100 down to 3300 RPM
            rw_rpm = round(3100.0 + (6050.0 - 3100.0) * decay + noise_rw, 1)
            bus_v = round(26.70 + (28.10 - 26.70) * (1 - decay) + noise_v, 2)
            thermal_c = round(42.6 - 15.0 * p + noise_thm, 2)
            solar_w = round(145.0 + (208.0 - 145.0) * (1 - decay) + noise_sol, 1)
            mtq_a = round(0.98 - 0.65 * p + noise_mtq, 3)
            
        else:
            # Phase 5: Post-Recovery & Nominal Stabilization (t = 240..299)
            p = (t - 240) / 60.0
            noise_att = random.gauss(0, 0.008)
            noise_rw = random.gauss(0, 16.0)
            noise_v = random.gauss(0, 0.03)
            noise_thm = random.gauss(0, 0.15)
            noise_sol = random.gauss(0, 1.2)
            noise_mtq = random.gauss(0, 0.01)
            
            attitude_error = round(max(0.04, 0.082 + 0.012 * math.cos(t * 0.1) + noise_att), 4)
            rw_rpm = round(2830.0 + 25.0 * math.sin(t * 0.08) + noise_rw, 1)
            bus_v = round(28.21 + noise_v, 2)
            thermal_c = round(max(22.0, 27.6 - 5.5 * p + noise_thm), 2)
            solar_w = round(212.5 + noise_sol, 1)
            mtq_a = round(0.22 + noise_mtq, 3)
        
        # Track histories
        attitude_history.append(attitude_error)
        rw_history.append(rw_rpm)
        
        # Rolling statistics (past up to 60 frames)
        window_att = attitude_history[-60:]
        window_rw = rw_history[-60:]
        
        rolling_mean_att = sum(window_att) / len(window_att)
        
        if len(attitude_history) >= 2:
            dt_min = 1.0 / 60.0  # 1 second = 1/60 min
            rate_att = (attitude_history[-1] - attitude_history[-2]) / dt_min
        else:
            rate_att = 0.0
            
        # Rolling std of reaction wheel speed
        mean_rw = sum(window_rw) / len(window_rw)
        var_rw = sum((x - mean_rw) ** 2 for x in window_rw) / len(window_rw)
        rolling_std_rw = math.sqrt(var_rw)
        
        # Power margin percentage: based on solar power generation vs 250W capacity
        power_margin = min(100.0, max(15.0, (solar_w / 250.0) * 100.0))
        
        frame = {
            "frame_id": frame_id,
            "timestamp": timestamp,
            "satellite_id": "SAT-ALPHA-01",
            "mission_id": "LEO-ORBIT-1",
            "channels": {
                "attitude_error_deg": attitude_error,
                "reaction_wheel_rpm": rw_rpm,
                "bus_voltage_v": bus_v,
                "thermal_panel_c": thermal_c,
                "solar_array_w": solar_w,
                "magnetorquer_current_a": mtq_a
            },
            "computed_features": {
                "attitude_error_rolling_mean_60s": round(rolling_mean_att, 4),
                "attitude_error_rate_deg_per_min": round(rate_att, 4),
                "rw_speed_rolling_std_60s": round(rolling_std_rw, 2),
                "power_margin_percent": round(power_margin, 2)
            },
            "quality_flags": {
                "all_channels_valid": True,
                "timestamp_synchronized": True
            }
        }
        frames.append(frame)
        
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(frames, f, indent=2)
        
    print(f"Successfully generated {len(frames)} canonical telemetry frames to {filepath}")

if __name__ == "__main__":
    generate_canonical_telemetry("backend/app/data/canonical_telemetry.json")
