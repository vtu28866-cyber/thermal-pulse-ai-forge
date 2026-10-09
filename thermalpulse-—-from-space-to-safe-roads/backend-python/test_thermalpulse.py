"""
ThermalPulse Automated Test Suite
Verifies:
1. Temperature processing and quality masks
2. Insufficient-resolution handling
3. API validation and error handling
4. Repair state transitions
5. Human authorization requirements
6. Repair verification logic
7. Database persistence
"""
import pytest
from services.thermal import kelvin_to_celsius, check_pixel_resolution_suitability, analyze_thermal_observation
from fastapi.testclient import TestClient
from main import app, bridges_db, repair_jobs_db

client = TestClient(app)

# 1. Temperature Processing Test
def test_kelvin_to_celsius_conversion():
    # 298.15 K == 25.0 °C
    celsius = kelvin_to_celsius(298.15)
    assert celsius == 25.0
    # 273.15 K == 0.0 °C
    assert kelvin_to_celsius(273.15) == 0.0

# 2. Insufficient Resolution Handling Test
def test_insufficient_resolution_handling():
    # Mackinac Bridge deck width: 20m. Sentinel-3 GSD: 1000m.
    # Must fail suitability check!
    res_sentinel = analyze_thermal_observation(
        deck_width_meters=20.0,
        sensor="Sentinel-3 SLSTR",
        raw_temp_kelvin=290.0
    )
    assert res_sentinel["status"] == "FAILED"
    assert res_sentinel["resolution_suitable"] is False
    assert "Insufficient spatial resolution for bridge-level thermal assessment." in res_sentinel["warning"]

def test_sufficient_resolution_handling():
    # Golden Gate width: 27m. Landsat-9 resampled GSD: 30m.
    # Passes suitability check!
    res_landsat = analyze_thermal_observation(
        deck_width_meters=27.0,
        sensor="Landsat-9 TIRS-2",
        raw_temp_kelvin=298.65,
        baseline_temp_celsius=21.3
    )
    assert res_landsat["status"] == "SUCCESS"
    assert res_landsat["resolution_suitable"] is True
    assert res_landsat["temperature_anomaly_delta_c"] == 4.2
    assert res_landsat["is_thermal_anomaly"] is True
    assert res_landsat["label"] == "Unusual Temperature Observation"

# 3. API Validation & Error Handling Test
def test_api_validation_error_handling():
    # Missing required fields should return 422 Unprocessable Entity
    response = client.post("/api/thermal/analyze", json={})
    assert response.status_code == 422

# 4. Human Authorization Requirement Test
def test_human_authorization_required_for_repair():
    # Newly created job starts in 'Pending Authorization'
    create_res = client.post("/api/repair-jobs", json={
        "bridge_id": "br-01",
        "defect_summary": "Pothole on lane 1",
        "priority": "High",
        "assigned_vehicle_id": "veh-tx4",
        "before_image_url": "https://example.com/pothole.jpg"
    })
    assert create_res.status_code == 200
    job_id = create_res.json()["data"]["id"]
    assert create_res.json()["data"]["status"] == "Pending Authorization"

    # Authorized by Chief Engineer Alvarez
    auth_res = client.post(f"/api/repair-jobs/{job_id}/authorize", json={
        "authorized_by": "Chief Engineer Alvarez"
    })
    assert auth_res.status_code == 200
    assert auth_res.json()["data"]["status"] == "Authorized"
    assert auth_res.json()["data"]["authorized_by"] == "Chief Engineer Alvarez"

# 5. Repair Verification Logic Test
def test_repair_verification_pass_and_fail():
    # Test valid approval
    verify_pass = client.post("/api/repair-jobs/job-01/verify", json={
        "outcome": "Repair verified by authorized reviewer",
        "verifier_notes": "Elastic modulus verified.",
        "verifier_name": "Inspector Sarah Chen, PE"
    })
    assert verify_pass.status_code == 200
    assert verify_pass.json()["data"]["status"] == "Verified Completed"

    # Test defect remains visible
    verify_fail = client.post("/api/repair-jobs/job-01/verify", json={
        "outcome": "Defect remains visible; additional work required",
        "verifier_notes": "Residual hairline fissure observed.",
        "verifier_name": "Inspector Sarah Chen, PE"
    })
    assert verify_fail.status_code == 200
    assert verify_fail.json()["data"]["status"] == "Additional Work Required"

# 6. Database Persistence Test
def test_database_persistence():
    initial_count = len(client.get("/api/bridges").json()["data"])
    client.post("/api/bridges", json={
        "name": "Sunshine Skyway South Span",
        "lat": 27.6183,
        "lng": -82.6561,
        "city": "St. Petersburg",
        "deck_width_meters": 29.0
    })
    updated_count = len(client.get("/api/bridges").json()["data"])
    assert updated_count == initial_count + 1
