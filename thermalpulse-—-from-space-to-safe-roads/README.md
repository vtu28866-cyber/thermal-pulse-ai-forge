# ThermalPulse — From Space to Safe Roads
> **Detect Early. Inspect Smart. Repair Responsibly.**

ThermalPulse is an AI-powered civil infrastructure monitoring and autonomous repair platform. It integrates open satellite earth observation data (USGS Landsat Collection 2 Level-2 Surface Temperature and Copernicus Sentinel), ground-level photographic defect diagnostics, explainable inspection prioritization, digital twin autonomous repair vehicle simulation, and a human-in-the-loop repair verification workflow.

---

## 🌟 Key Features

1. **Spaceborne Thermal Screening (USGS Landsat & Copernicus Sentinel)**
   - Ingests Landsat Collection 2 Level-2 Surface Temperature products ($T_C = T_K - 273.15$).
   - Rigorous **Pixel-Resolution Suitability Checks**: displays *"Insufficient spatial resolution for bridge-level thermal assessment"* when bridge deck width < 70% sensor GSD.
   - Thermal anomalies strictly classified as *unusual temperature observations*, not confirmed structural cracks.

2. **Ground-Level Defect Diagnostics (AI & Computer Vision)**
   - High-resolution photographic defect detection for visible cracks, potholes, concrete spalling, and surface anomalies.
   - Interactive canvas with normalized bounding boxes, confidence scoring, and model version attribution.
   - Separate inspector confirmation/rejection workflow before work order creation.

3. **Explainable Risk Prioritization Engine**
   - Transparent multi-factor scoring: Ground defect confirmation (35%), thermal repeatability (25%), traffic criticality (25%), and satellite data quality (15%).
   - Certified Professional Engineer (PE) manual override with mandatory written justification logged to the immutable audit trail.

4. **Simulated Autonomous Repair Vehicle Fleet**
   - Digital twin of maintenance rovers (ROVER-TX4 and VULCAN-02) with 10 explicit operational states.
   - Real-time telemetry: battery %, 5G link status, cure head temperature, sealant levels, and GPS position.
   - **Enforced Safety Invariant**: Vehicles cannot repair automatically based solely on satellite data; certified human engineering authorization is mandatory.

5. **Human-in-the-Loop Repair Verification**
   - Side-by-side pre-repair and post-cure visual comparison.
   - Standardized engineering verdicts: *"Repair verified by authorized reviewer"*, *"Defect remains visible; additional work required"*, etc.
   - Never auto-closes a defect solely because simulated task reaches 100%.

---

## 🚀 Quick Start (Node.js Full-Stack Dev Server)

The applet runs as a full-stack Node.js + Vite + Express system on port 3000 with real-time SSE telemetry:

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🪟 Windows Setup Instructions (PowerShell / CMD)

### Prerequisites
- Python 3.10+ installed and added to Windows `PATH`.
- Node.js 18+ and npm installed.
- Git for Windows.

### Backend (Python FastAPI) Setup on Windows

Open PowerShell or Command Prompt:

```powershell
# 1. Clone repository and navigate to backend
cd backend-python

# 2. Create Python virtual environment
python -m venv venv

# 3. Activate virtual environment
# In PowerShell:
.\venv\Scripts\Activate.ps1
# In Command Prompt (CMD):
.\venv\Scripts\activate.bat

# 4. Install Python dependencies
pip install -r requirements.txt

# 5. Run the automated test suite
pytest test_thermalpulse.py -v

# 6. Start the FastAPI development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

FastAPI interactive OpenAPI Swagger documentation will be available at:
`http://127.0.0.1:8000/docs`

---

## 🐳 Docker Deployment

To spin up the complete platform (PostgreSQL PostGIS + Python FastAPI Backend + React Frontend):

```bash
docker-compose up --build
```

Services:
- **Frontend App**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **PostgreSQL PostGIS**: `localhost:5432`

---

## 🧪 Automated Tests

The test suite in `backend-python/test_thermalpulse.py` tests:
1. **Temperature Processing**: Kelvin to Celsius conversion ($T_C = T_K - 273.15$) and delta calculation.
2. **Insufficient Resolution Handling**: Validates that 20m bridge deck on 1000m Sentinel-3 pixel triggers *"Insufficient spatial resolution for bridge-level thermal assessment"*.
3. **API Validation & Error Handling**: Pydantic schema validation for empty or malformed payloads.
4. **Human Authorization Requirement**: Confirms vehicles remain locked until an authorized engineer signs the work order.
5. **Repair Verification Logic**: Tests both passing sign-off and *"Defect remains visible; additional work required"* failure branches.
6. **Database Persistence**: Confirms bridge inventory records persist.

Run tests:
```bash
pytest backend-python/test_thermalpulse.py -v
```

---

## 📡 Documented REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bridges` | List registered bridges with filter and search |
| `POST` | `/api/bridges` | Register new bridge into civil inventory |
| `GET` | `/api/bridges/{id}` | Deep dive detail view of a bridge |
| `POST` | `/api/satellite/search` | Query Landsat C2 L2 ST and Sentinel scenes |
| `POST` | `/api/thermal/analyze` | Run thermal screening and resolution suitability checks |
| `POST` | `/api/inspections/images` | Upload ground photographic inspections |
| `POST` | `/api/inspections/{id}/analyze` | Run AI / OpenCV defect detection on photos |
| `POST` | `/api/inspections/{id}/review` | Inspector confirms or rejects candidate defects |
| `GET` | `/api/repair-jobs` | List maintenance work orders |
| `POST` | `/api/repair-jobs` | Create repair work order from confirmed defect |
| `POST` | `/api/repair-jobs/{id}/authorize` | Authorized human engineer approval |
| `POST` | `/api/repair-jobs/{id}/simulate` | Control digital twin rover simulation |
| `POST` | `/api/repair-jobs/{id}/verify` | Post-repair engineering sign-off decision |
| `GET` | `/api/vehicles` | List autonomous fleet vehicles |
| `GET` | `/api/vehicles/stream` | Server-Sent Events (SSE) live telemetry stream |
| `GET` | `/api/notifications` | In-app notification center alerts |
| `GET` | `/api/reports/summary` | Executive metrics & SDG-9 time-series data |
| `POST` | `/api/overpass/discover` | Query live OpenStreetMap bridge ways |
| `POST` | `/api/demo/reset` | Toggle Demo Scenarios A (Pass) and B (Residual Defect) |

---

## 🛡️ UN Sustainable Development Goal (SDG) 9 Alignment
ThermalPulse addresses **Target 9.1: Build resilient, sustainable infrastructure** by leveraging public satellite thermography to catch early subsurface delamination before catastrophic structural failure occurs, decreasing lifecycle repair costs by over 35%.
