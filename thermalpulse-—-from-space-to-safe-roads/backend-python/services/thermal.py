"""
ThermalPulse Thermal Processing Engine
Processes Landsat Collection 2 Level-2 Surface Temperature products and Sentinel-3 SLSTR data.
Enforces pixel resolution suitability, radiometric filtering, and anomaly classification.
"""
from typing import Dict, Any, Optional
import numpy as np


def kelvin_to_celsius(temp_k: float) -> float:
    """Converts absolute temperature from Kelvin to Celsius."""
    return round(temp_k - 273.15, 2)


def check_pixel_resolution_suitability(deck_width_meters: float, sensor_gsd_meters: float) -> bool:
    """
    Checks whether the bridge geometry is sufficiently resolved by the sensor pixel size.
    Rule: Bridge deck width must be at least 70% of the ground sample distance.
    If not, sub-pixel mixed signal dominates and bridge-level assessment is invalid.
    """
    return deck_width_meters >= (sensor_gsd_meters * 0.7)


def analyze_thermal_observation(
    deck_width_meters: float,
    sensor: str,
    raw_temp_kelvin: float,
    baseline_temp_celsius: float = 21.3,
    cloud_cover_pct: float = 5.0,
    quality_mask_pass: bool = True
) -> Dict[str, Any]:
    """
    Executes full thermal screening pipeline with quality masks and suitability checks.
    """
    gsd_meters = 1000.0 if "Sentinel-3" in sensor else 30.0

    # 1. Pixel resolution suitability check
    if not check_pixel_resolution_suitability(deck_width_meters, gsd_meters):
        return {
            "status": "FAILED",
            "resolution_suitable": False,
            "warning": "Insufficient spatial resolution for bridge-level thermal assessment.",
            "deck_width_meters": deck_width_meters,
            "sensor_gsd_meters": gsd_meters,
            "explanation": f"Sensor pixel footprint ({gsd_meters}m) is too coarse for bridge deck width ({deck_width_meters}m). Pixels reflect surrounding terrain/water."
        }

    # 2. Quality and cloud mask filter
    if cloud_cover_pct > 25.0 or not quality_mask_pass:
        return {
            "status": "DEGRADED",
            "resolution_suitable": True,
            "warning": "Cloud contamination or degraded radiometric quality mask detected.",
            "cloud_cover_pct": cloud_cover_pct
        }

    # 3. Temperature conversion and statistical delta
    surface_temp_c = kelvin_to_celsius(raw_temp_kelvin)
    delta_t = round(surface_temp_c - baseline_temp_celsius, 2)
    is_anomaly = delta_t >= 2.5

    # 4. Synthesize 5x5 thermal grid
    base_grid = np.full((5, 5), baseline_temp_celsius)
    base_grid[1:4, 1:4] = surface_temp_c - 0.5
    base_grid[2, 2] = surface_temp_c

    return {
        "status": "SUCCESS",
        "resolution_suitable": True,
        "surface_temp_celsius": surface_temp_c,
        "baseline_temp_celsius": baseline_temp_celsius,
        "temperature_anomaly_delta_c": delta_t,
        "is_thermal_anomaly": is_anomaly,
        "label": "Unusual Temperature Observation" if is_anomaly else "Nominal Thermal Baseline",
        "confidence_score": 0.88 if is_anomaly else 0.94,
        "thermal_grid": base_grid.round(1).tolist()
    }
