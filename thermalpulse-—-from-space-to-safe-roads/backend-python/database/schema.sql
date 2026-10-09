-- ============================================================
-- THERMALPULSE: POSTGRESQL & POSTGIS DATABASE SCHEMA
-- From Space to Safe Roads
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users & Roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('administrator', 'inspector', 'maintenance_operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bridges
CREATE TABLE IF NOT EXISTS bridges (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    city VARCHAR(100) NOT NULL,
    state_country VARCHAR(100) NOT NULL,
    structure_type VARCHAR(100) NOT NULL,
    length_meters DOUBLE PRECISION NOT NULL,
    deck_width_meters DOUBLE PRECISION NOT NULL,
    built_year INT NOT NULL,
    daily_traffic INT NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'Routine Monitoring',
    status VARCHAR(50) NOT NULL DEFAULT 'Operational',
    last_observation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    thermal_anomaly_detected BOOLEAN DEFAULT FALSE,
    active_defect_count INT DEFAULT 0,
    pixel_suitability_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bridges_geom ON bridges USING GIST (location_geom);

-- 3. Satellite Assets
CREATE TABLE IF NOT EXISTS satellite_assets (
    id VARCHAR(100) PRIMARY KEY,
    scene_id VARCHAR(100) NOT NULL,
    sensor VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    acquisition_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ground_sample_distance_meters DOUBLE PRECISION NOT NULL,
    cloud_cover_pct DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bridge Observations & Thermal Results
CREATE TABLE IF NOT EXISTS bridge_observations (
    id VARCHAR(100) PRIMARY KEY,
    bridge_id VARCHAR(50) REFERENCES bridges(id) ON DELETE CASCADE,
    asset_id VARCHAR(100) REFERENCES satellite_assets(id),
    surface_temp_kelvin DOUBLE PRECISION NOT NULL,
    surface_temp_celsius DOUBLE PRECISION NOT NULL,
    baseline_temp_celsius DOUBLE PRECISION NOT NULL,
    temp_anomaly_delta_c DOUBLE PRECISION NOT NULL,
    radiometric_quality VARCHAR(50) NOT NULL,
    pixel_resolution_suitable BOOLEAN NOT NULL,
    cloud_free_over_bridge BOOLEAN NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    label VARCHAR(100) NOT NULL,
    is_demo_data BOOLEAN DEFAULT FALSE,
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inspection Images
CREATE TABLE IF NOT EXISTS inspection_images (
    id VARCHAR(100) PRIMARY KEY,
    bridge_id VARCHAR(50) REFERENCES bridges(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    inspector_name VARCHAR(100) NOT NULL,
    notes TEXT,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Defect Detections
CREATE TABLE IF NOT EXISTS defect_detections (
    id VARCHAR(100) PRIMARY KEY,
    image_id VARCHAR(100) REFERENCES inspection_images(id) ON DELETE CASCADE,
    defect_type VARCHAR(100) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    bbox_x DOUBLE PRECISION NOT NULL,
    bbox_y DOUBLE PRECISION NOT NULL,
    bbox_w DOUBLE PRECISION NOT NULL,
    bbox_h DOUBLE PRECISION NOT NULL,
    severity VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    confirmed_status VARCHAR(50) DEFAULT 'Pending Review',
    confirmed_by VARCHAR(100),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Autonomous Repair Vehicles
CREATE TABLE IF NOT EXISTS repair_vehicles (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    battery_pct DOUBLE PRECISION NOT NULL,
    connectivity VARCHAR(50) NOT NULL,
    current_state VARCHAR(50) NOT NULL,
    assigned_bridge_id VARCHAR(50) REFERENCES bridges(id),
    current_lat DOUBLE PRECISION NOT NULL,
    current_lng DOUBLE PRECISION NOT NULL,
    speed_kmh DOUBLE PRECISION DEFAULT 0.0,
    task_progress_pct DOUBLE PRECISION DEFAULT 0.0,
    sealant_level_pct DOUBLE PRECISION DEFAULT 100.0,
    tool_temperature_c DOUBLE PRECISION DEFAULT 25.0,
    safety_state VARCHAR(50) DEFAULT 'Nominal',
    last_telemetry_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Repair Jobs
CREATE TABLE IF NOT EXISTS repair_jobs (
    id VARCHAR(50) PRIMARY KEY,
    bridge_id VARCHAR(50) REFERENCES bridges(id) ON DELETE CASCADE,
    defect_id VARCHAR(100),
    defect_summary TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending Authorization',
    assigned_vehicle_id VARCHAR(50) REFERENCES repair_vehicles(id),
    authorized_by VARCHAR(100),
    authorized_at TIMESTAMP WITH TIME ZONE,
    progress_pct DOUBLE PRECISION DEFAULT 0.0,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT,
    verification_outcome VARCHAR(100),
    verifier_notes TEXT,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    bridge_id VARCHAR(50) REFERENCES bridges(id) ON DELETE SET NULL,
    link_tab VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL
);
