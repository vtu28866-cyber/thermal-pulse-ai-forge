export type InspectionPriority = 
  | 'Priority Inspection'
  | 'Review Recommended'
  | 'Routine Monitoring'
  | 'Insufficient Data';

export type BridgeStatus = 'Operational' | 'Inspection Scheduled' | 'Under Repair' | 'Verification Pending' | 'Critical Alert';

export type UserRole = 'administrator' | 'inspector' | 'maintenance_operator';

export interface Bridge {
  id: string;
  code: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    stateCountry: string;
  };
  structureType: 'Cable-Stayed' | 'Suspension' | 'Steel Truss' | 'Concrete Box Girder' | 'Arch Bridge';
  lengthMeters: number;
  deckWidthMeters: number;
  builtYear: number;
  dailyTraffic: number;
  priority: InspectionPriority;
  status: BridgeStatus;
  lastObservationDate: string;
  thermalAnomalyDetected: boolean;
  activeDefectCount: number;
  pixelSuitabilityNote?: string;
}

export interface SatelliteObservation {
  id: string;
  bridgeId: string;
  sceneId: string;
  sensor: 'Landsat-9 TIRS-2' | 'Landsat-8 TIRS' | 'Sentinel-2 MSI' | 'Sentinel-3 SLSTR';
  acquisitionDate: string;
  cloudCoverPct: number;
  groundSampleDistanceMeters: number;
  surfaceTemperatureKelvin: number;
  surfaceTemperatureCelsius: number;
  baselineTempCelsius: number;
  temperatureAnomalyDeltaC: number;
  qualityFlags: {
    radiometricQuality: 'High' | 'Medium' | 'Cloud Contaminated' | 'No-Data';
    pixelResolutionSuitable: boolean;
    cloudFreeOverBridge: boolean;
  };
  confidenceScore: number;
  isDemoData: boolean;
  tileThumbnailUrl?: string;
  thermalGrid?: number[][]; // 5x5 thermal pixel matrix
}

export interface DefectDetection {
  id: string;
  defectType: 'Visible Surface Crack' | 'Pothole / Damaged Pavement' | 'Concrete Spalling' | 'Surface Anomaly';
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number }; // normalized 0-1
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
  confirmedStatus: 'Pending Review' | 'Confirmed' | 'Rejected';
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface InspectionImage {
  id: string;
  bridgeId: string;
  title: string;
  imageUrl: string;
  capturedAt: string;
  inspectorName: string;
  sourceType: 'Ground Photo' | 'Drone Inspection' | 'Crawler Camera' | 'Verification Scan';
  detections: DefectDetection[];
  notes?: string;
  isDemoData: boolean;
}

export type VehicleState = 
  | 'Idle'
  | 'Inspection Requested'
  | 'Traveling to Site'
  | 'Arrived'
  | 'Assessing Defect'
  | 'Repair Authorized'
  | 'Repair In Progress'
  | 'Repair Completed'
  | 'Verification Pending'
  | 'Verified Completed'
  | 'Manual Review Required';

export interface RepairVehicle {
  id: string;
  code: string;
  name: string;
  model: string;
  batteryPct: number;
  connectivity: 'Connected (5G Ultra)' | 'Connected (Satellite)' | 'Degraded' | 'Offline';
  currentState: VehicleState;
  assignedBridgeId?: string;
  assignedJobId?: string;
  currentLat: number;
  currentLng: number;
  speedKmh: number;
  taskProgressPct: number;
  sealantLevelPct: number;
  toolTemperatureC: number;
  safetyState: 'Nominal' | 'Warning' | 'Emergency Stop' | 'Maintenance Lock';
  lastTelemetryTimestamp: string;
}

export interface RepairJob {
  id: string;
  bridgeId: string;
  defectSummary: string;
  defectId?: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Pending Authorization' | 'Authorized' | 'In Progress' | 'Verification Pending' | 'Verified Completed' | 'Additional Work Required' | 'Cancelled';
  assignedVehicleId: string;
  authorizedBy?: string;
  authorizedAt?: string;
  progressPct: number;
  createdAt: string;
  completedAt?: string;
  beforeImageUrl: string;
  afterImageUrl?: string;
  verificationOutcome?: 'Repair verified by authorized reviewer' | 'Defect remains visible; additional work required' | 'Unable to verify: evidence insufficient' | 'Manual inspection required';
  verifierNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  linkTab?: string;
  bridgeId?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entityType: 'Bridge' | 'Observation' | 'Inspection' | 'Repair Job' | 'Vehicle' | 'Verification' | 'System';
  entityId: string;
  details: string;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
  isCheckpoint?: boolean;
}

export type RoverComponentId = 
  | 'chassis'
  | 'wheels'
  | 'suspension'
  | 'arm_base'
  | 'arm_upper'
  | 'arm_forearm'
  | 'arm_effector'
  | 'sensor_mast'
  | 'camera_gimbal'
  | 'lidar'
  | 'battery_pack'
  | 'led_headlights';

export interface RoverComponentInfo {
  id: RoverComponentId;
  name: string;
  category: 'Structural' | 'Locomotion' | 'Robotic Arm' | 'Sensors & Optics' | 'Power System';
  status: 'Nominal' | 'Active Scanning' | 'Engaged' | 'Standby';
  description: string;
  specs: string;
}

export interface TelemetryPoint {
  time: string;
  batteryPct: number;
  speedKmh: number;
  toolTempC: number;
  distanceKm: number;
  headingDeg: number;
}

export interface InspectionPriorityFactor {
  name: string;
  weight: number;
  score: number;
  status: 'Good' | 'Moderate' | 'Critical';
  description: string;
}

export interface BridgePriorityAssessment {
  bridgeId: string;
  priorityCategory: InspectionPriority;
  overallScore: number; // 0 - 100
  factors: InspectionPriorityFactor[];
  dataQualityStatus: 'Adequate Quality' | 'Degraded (High Cloud)' | 'Insufficient Resolution' | 'Missing Baseline';
  uncertaintyExplanation: string;
  recommendedAction: string;
  inspectorOverride?: {
    overriddenPriority: InspectionPriority;
    inspectorName: string;
    reason: string;
    timestamp: string;
  };
}
