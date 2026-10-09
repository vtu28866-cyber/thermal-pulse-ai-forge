"""
ThermalPulse FastAPI Backend
AI-Powered Bridge Monitoring & Autonomous Repair Platform
"""
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from services.thermal import analyze_thermal_observation, kelvin_to_celsius
from services.defect import detect_defects_simulated

app = FastAPI(
    title="ThermalPulse API",
    description="Bridge Monitoring, Landsat Thermal Anomaly Screening & Autonomous Repair Verification",
    version="2.6.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- PYDANTIC SCHEMAS -----------------

class BridgeCreate(BaseModel):
    name: str = Field(..., example="Golden Gate North Approach Viaduct")
    lat: float = Field(..., example=37.8282)
    lng: float = Field(..., example=-122.4828)
    city: str = Field("San Francisco", example="San Francisco")
    state_country: str = Field("California, USA", example="California, USA")
    structure_type: str = Field("Suspension", example="Suspension")
    length_meters: float = Field(2737, example=2737)
    deck_width_meters: float = Field(27, example=27)
    built_year: int = Field(1937, example=1937)
    daily_traffic: int = Field(112000, example=112000)

class ThermalAnalyzeRequest(BaseModel):
    bridge_id: str = Field(..., example="br-01")
    deck_width_meters: float = Field(27.0, example=27.0)
    sensor: str = Field("Landsat-9 TIRS-2", example="Landsat-9 TIRS-2")
    raw_temp_kelvin: float = Field(298.65, example=298.65)
    baseline_temp_celsius: float = Field(21.3, example=21.3)
    cloud_cover_pct: float = Field(4.2, example=4.2)

class RepairJobCreate(BaseModel):
    bridge_id: str
    defect_summary: str
    priority: str = "High"
    assigned_vehicle_id: str = "veh-tx4"
    before_image_url: str

class AuthorizeJobRequest(BaseModel):
    authorized_by: str = "Chief Engineer Alvarez"

class VerifyJobRequest(BaseModel):
    outcome: str = Field(..., example="Repair verified by authorized reviewer")
    verifier_notes: str = Field(..., example="Sealing intact; meets ASTM D6690.")
    verifier_name: str = Field("Inspector Sarah Chen, PE", example="Inspector Sarah Chen, PE")
    after_image_url: Optional[str] = None

# In-memory store for demonstration
bridges_db = [
    {
        "id": "br-01",
        "code": "USA-CA-GG-01",
        "name": "Golden Gate North Approach Viaduct",
        "lat": 37.8282,
        "lng": -122.4828,
        "city": "San Francisco",
        "deck_width_meters": 27.0,
        "priority": "Priority Inspection",
        "status": "Inspection Scheduled"
    },
    {
        "id": "br-02",
        "code": "USA-NY-BK-04",
        "name": "Brooklyn Bridge East Viaduct Span 4",
        "lat": 40.7061,
        "lng": -73.9969,
        "city": "New York City",
        "deck_width_meters": 26.0,
        "priority": "Review Recommended",
        "status": "Verification Pending"
    }
]

repair_jobs_db = [
    {
        "id": "job-01",
        "bridge_id": "br-01",
        "defect_summary": "Longitudinal deck crack near expansion joint",
        "status": "Pending Authorization",
        "progress_pct": 0,
        "assigned_vehicle_id": "veh-tx4",
        "authorized_by": None
    }
]

# ----------------- API ENDPOINTS -----------------

@app.get("/api/bridges")
def list_bridges():
    return {"success": True, "count": len(bridges_db), "data": bridges_db}

@app.post("/api/bridges")
def create_bridge(b: BridgeCreate):
    new_bridge = {
        "id": f"br-{len(bridges_db)+1}",
        "code": f"INFR-{len(bridges_db)+100}",
        "name": b.name,
        "lat": b.lat,
        "lng": b.lng,
        "city": b.city,
        "deck_width_meters": b.deck_width_meters,
        "priority": "Routine Monitoring",
        "status": "Operational"
    }
    bridges_db.append(new_bridge)
    return {"success": True, "data": new_bridge}

@app.post("/api/thermal/analyze")
def analyze_thermal(req: ThermalAnalyzeRequest):
    """
    Executes Landsat L2 Surface Temperature screening.
    Enforces pixel-resolution suitability check.
    """
    result = analyze_thermal_observation(
        deck_width_meters=req.deck_width_meters,
        sensor=req.sensor,
        raw_temp_kelvin=req.raw_temp_kelvin,
        baseline_temp_celsius=req.baseline_temp_celsius,
        cloud_cover_pct=req.cloud_cover_pct
    )
    return {"success": True, "data": result}

@app.post("/api/inspections/{inspection_id}/analyze")
def analyze_inspection_image(inspection_id: str):
    """
    Analyzes ground-level inspection photographs for defects (cracks, potholes, spalling).
    """
    detections = detect_defects_simulated(inspection_id)
    return {"success": True, "inspection_id": inspection_id, "detections": detections}

@app.post("/api/repair-jobs")
def create_repair_job(job: RepairJobCreate):
    new_job = {
        "id": f"job-{len(repair_jobs_db)+1}",
        "bridge_id": job.bridge_id,
        "defect_summary": job.defect_summary,
        "status": "Pending Authorization", # HUMAN APPROVAL REQUIRED
        "progress_pct": 0,
        "assigned_vehicle_id": job.assigned_vehicle_id,
        "authorized_by": None,
        "before_image_url": job.before_image_url
    }
    repair_jobs_db.append(new_job)
    return {"success": True, "data": new_job}

@app.post("/api/repair-jobs/{job_id}/authorize")
def authorize_repair_job(job_id: str, req: AuthorizeJobRequest):
    """
    Human authorization gatekeeper.
    Vehicles cannot repair automatically without this step!
    """
    for job in repair_jobs_db:
        if job["id"] == job_id:
            job["status"] = "Authorized"
            job["authorized_by"] = req.authorized_by
            job["authorized_at"] = datetime.utcnow().isoformat()
            return {"success": True, "message": "Repair authorized.", "data": job}
    raise HTTPException(status_code=404, detail="Repair job not found")

@app.post("/api/repair-jobs/{job_id}/verify")
def verify_repair_job(job_id: str, req: VerifyJobRequest):
    """
    Post-repair engineering sign-off workflow.
    """
    valid_outcomes = [
        "Repair verified by authorized reviewer",
        "Defect remains visible; additional work required",
        "Unable to verify: evidence insufficient",
        "Manual inspection required"
    ]
    if req.outcome not in valid_outcomes:
        raise HTTPException(status_code=400, detail="Invalid verification outcome")

    for job in repair_jobs_db:
        if job["id"] == job_id:
            job["verification_outcome"] = req.outcome
            job["verifier_notes"] = req.verifier_notes
            job["verified_by"] = req.verifier_name
            job["verified_at"] = datetime.utcnow().isoformat()
            job["status"] = "Verified Completed" if req.outcome == "Repair verified by authorized reviewer" else "Additional Work Required"
            return {"success": True, "data": job}
    raise HTTPException(status_code=404, detail="Repair job not found")

@app.get("/api/reports/summary")
def get_summary_metrics():
    return {
        "success": True,
        "data": {
            "total_bridges": len(bridges_db),
            "requiring_inspection": 1,
            "open_defects": 3,
            "active_repair_jobs": 1,
            "awaiting_verification": 1,
            "verified_completed": 1
        }
    }
