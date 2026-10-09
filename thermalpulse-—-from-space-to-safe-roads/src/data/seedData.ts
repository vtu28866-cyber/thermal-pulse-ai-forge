import { Bridge, SatelliteObservation, InspectionImage, RepairVehicle, RepairJob, NotificationItem, AuditLogItem, BridgePriorityAssessment } from '../types';

export const initialBridges: Bridge[] = [
  {
    id: 'br-01',
    code: 'USA-CA-GG-01',
    name: 'Golden Gate North Approach Viaduct',
    location: {
      lat: 37.8282,
      lng: -122.4828,
      city: 'San Francisco',
      stateCountry: 'California, USA'
    },
    structureType: 'Suspension',
    lengthMeters: 2737,
    deckWidthMeters: 27,
    builtYear: 1937,
    dailyTraffic: 112000,
    priority: 'Priority Inspection',
    status: 'Inspection Scheduled',
    lastObservationDate: '2026-10-04T18:42:00Z',
    thermalAnomalyDetected: true,
    activeDefectCount: 2,
    pixelSuitabilityNote: 'Deck width (27m) requires Landsat sub-pixel thermal de-mixing; Sentinel-3 (1km) resolution unsuitable.'
  },
  {
    id: 'br-02',
    code: 'USA-NY-BK-04',
    name: 'Brooklyn Bridge East Viaduct Span 4',
    location: {
      lat: 40.7061,
      lng: -73.9969,
      city: 'New York City',
      stateCountry: 'New York, USA'
    },
    structureType: 'Cable-Stayed',
    lengthMeters: 1825,
    deckWidthMeters: 26,
    builtYear: 1883,
    dailyTraffic: 116000,
    priority: 'Review Recommended',
    status: 'Verification Pending',
    lastObservationDate: '2026-10-06T15:20:00Z',
    thermalAnomalyDetected: true,
    activeDefectCount: 1,
    pixelSuitabilityNote: 'High surrounding urban heat island; thermal anomaly compared against adjacent roadway baseline.'
  },
  {
    id: 'br-03',
    code: 'USA-FL-SS-02',
    name: 'Sunshine Skyway Main Channel Cable Span',
    location: {
      lat: 27.6183,
      lng: -82.6561,
      city: 'St. Petersburg',
      stateCountry: 'Florida, USA'
    },
    structureType: 'Cable-Stayed',
    lengthMeters: 6700,
    deckWidthMeters: 29,
    builtYear: 1987,
    dailyTraffic: 58000,
    priority: 'Routine Monitoring',
    status: 'Operational',
    lastObservationDate: '2026-10-07T16:10:00Z',
    thermalAnomalyDetected: false,
    activeDefectCount: 0,
    pixelSuitabilityNote: 'Over-water boundary creates sharp thermal contrast; marine thermal calibration applied.'
  },
  {
    id: 'br-04',
    code: 'USA-MI-MB-01',
    name: 'Mackinac Straits Suspension Span',
    location: {
      lat: 45.8174,
      lng: -84.7278,
      city: 'St. Ignace',
      stateCountry: 'Michigan, USA'
    },
    structureType: 'Suspension',
    lengthMeters: 8038,
    deckWidthMeters: 20,
    builtYear: 1957,
    dailyTraffic: 12500,
    priority: 'Insufficient Data',
    status: 'Operational',
    lastObservationDate: '2026-09-28T17:05:00Z',
    thermalAnomalyDetected: false,
    activeDefectCount: 0,
    pixelSuitabilityNote: 'Deck width (20m) is below 30m native Landsat res; thermal deconvolution marked Insufficient Data.'
  },
  {
    id: 'br-05',
    code: 'TUR-IST-BB-01',
    name: 'Bosphorus Intercontinental Bridge',
    location: {
      lat: 41.0456,
      lng: 29.0344,
      city: 'Istanbul',
      stateCountry: 'Istanbul, Turkey'
    },
    structureType: 'Suspension',
    lengthMeters: 1560,
    deckWidthMeters: 33,
    builtYear: 1973,
    dailyTraffic: 180000,
    priority: 'Review Recommended',
    status: 'Under Repair',
    lastObservationDate: '2026-10-05T09:30:00Z',
    thermalAnomalyDetected: true,
    activeDefectCount: 1,
    pixelSuitabilityNote: 'Wide deck (33m) matches Landsat 30m resampled Level-2 surface temperature products.'
  },
  {
    id: 'br-06',
    code: 'GBR-SVR-MB-03',
    name: 'Second Severn Crossing West Viaduct',
    location: {
      lat: 51.5833,
      lng: -2.6983,
      city: 'Bristol',
      stateCountry: 'Gloucestershire, UK'
    },
    structureType: 'Concrete Box Girder',
    lengthMeters: 5128,
    deckWidthMeters: 34,
    builtYear: 1996,
    dailyTraffic: 80000,
    priority: 'Priority Inspection',
    status: 'Critical Alert',
    lastObservationDate: '2026-10-02T11:45:00Z',
    thermalAnomalyDetected: true,
    activeDefectCount: 3,
    pixelSuitabilityNote: 'Box girder internal thermal mass difference verified against Sentinel-2 multispectral baseline.'
  }
];

export const initialSatelliteObservations: SatelliteObservation[] = [
  {
    id: 'sat-obs-01',
    bridgeId: 'br-01',
    sceneId: 'LC09_L2SP_044034_20261004_02_T1',
    sensor: 'Landsat-9 TIRS-2',
    acquisitionDate: '2026-10-04T18:42:00Z',
    cloudCoverPct: 4.2,
    groundSampleDistanceMeters: 30, // resampled from 100m native
    surfaceTemperatureKelvin: 298.65,
    surfaceTemperatureCelsius: 25.5,
    baselineTempCelsius: 21.3,
    temperatureAnomalyDeltaC: 4.2,
    qualityFlags: {
      radiometricQuality: 'High',
      pixelResolutionSuitable: true,
      cloudFreeOverBridge: true
    },
    confidenceScore: 0.88,
    isDemoData: true,
    thermalGrid: [
      [21.1, 21.4, 21.2, 21.5, 21.3],
      [21.4, 23.8, 25.1, 24.0, 21.6],
      [21.2, 24.9, 25.5, 25.2, 21.4],
      [21.5, 23.5, 24.8, 23.7, 21.5],
      [21.0, 21.3, 21.2, 21.4, 21.1]
    ]
  },
  {
    id: 'sat-obs-02',
    bridgeId: 'br-01',
    sceneId: 'LC08_L2SP_044034_20260918_02_T1',
    sensor: 'Landsat-8 TIRS',
    acquisitionDate: '2026-09-18T18:38:00Z',
    cloudCoverPct: 12.0,
    groundSampleDistanceMeters: 30,
    surfaceTemperatureKelvin: 296.25,
    surfaceTemperatureCelsius: 23.1,
    baselineTempCelsius: 20.8,
    temperatureAnomalyDeltaC: 2.3,
    qualityFlags: {
      radiometricQuality: 'High',
      pixelResolutionSuitable: true,
      cloudFreeOverBridge: true
    },
    confidenceScore: 0.82,
    isDemoData: true,
    thermalGrid: [
      [20.7, 20.9, 20.8, 21.0, 20.8],
      [20.9, 22.0, 22.8, 22.1, 21.0],
      [20.8, 22.7, 23.1, 22.9, 20.9],
      [21.0, 22.1, 22.6, 22.0, 20.8],
      [20.6, 20.8, 20.7, 20.9, 20.7]
    ]
  },
  {
    id: 'sat-obs-03',
    bridgeId: 'br-02',
    sceneId: 'LC09_L2SP_014032_20261006_02_T1',
    sensor: 'Landsat-9 TIRS-2',
    acquisitionDate: '2026-10-06T15:20:00Z',
    cloudCoverPct: 8.5,
    groundSampleDistanceMeters: 30,
    surfaceTemperatureKelvin: 297.85,
    surfaceTemperatureCelsius: 24.7,
    baselineTempCelsius: 21.6,
    temperatureAnomalyDeltaC: 3.1,
    qualityFlags: {
      radiometricQuality: 'High',
      pixelResolutionSuitable: true,
      cloudFreeOverBridge: true
    },
    confidenceScore: 0.85,
    isDemoData: true,
    thermalGrid: [
      [21.5, 21.7, 21.6, 21.8, 21.5],
      [21.7, 23.2, 24.1, 23.5, 21.8],
      [21.6, 24.0, 24.7, 24.3, 21.7],
      [21.8, 23.1, 23.9, 23.3, 21.6],
      [21.4, 21.6, 21.5, 21.7, 21.4]
    ]
  },
  {
    id: 'sat-obs-04',
    bridgeId: 'br-04',
    sceneId: 'S3A_SL_2_WST____20260928_02_T1',
    sensor: 'Sentinel-3 SLSTR',
    acquisitionDate: '2026-09-28T17:05:00Z',
    cloudCoverPct: 22.4,
    groundSampleDistanceMeters: 1000,
    surfaceTemperatureKelvin: 288.15,
    surfaceTemperatureCelsius: 15.0,
    baselineTempCelsius: 15.2,
    temperatureAnomalyDeltaC: -0.2,
    qualityFlags: {
      radiometricQuality: 'Medium',
      pixelResolutionSuitable: false, // 1000m pixel covers huge water body + tiny bridge
      cloudFreeOverBridge: false
    },
    confidenceScore: 0.25,
    isDemoData: true
  }
];

export const initialInspectionImages: InspectionImage[] = [
  {
    id: 'img-gg-01',
    bridgeId: 'br-01',
    title: 'North Pier Deck Expansion Joint Area #3',
    // SVG base64 generated realistic inspection photo with pavement & cracks
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80',
    capturedAt: '2026-10-05T10:14:00Z',
    inspectorName: 'Eng. Marcus Vance, PE',
    sourceType: 'Ground Photo',
    isDemoData: true,
    notes: 'Ground thermal imaging confirmed hot spot corresponds to asphalt debonding and 14mm wide longitudinal crack.',
    detections: [
      {
        id: 'det-01',
        defectType: 'Visible Surface Crack',
        confidence: 0.94,
        bbox: { x: 0.35, y: 0.40, width: 0.38, height: 0.22 },
        severity: 'High',
        confirmedStatus: 'Confirmed',
        confirmedBy: 'Eng. Marcus Vance, PE',
        confirmedAt: '2026-10-05T11:00:00Z'
      },
      {
        id: 'det-02',
        defectType: 'Concrete Spalling',
        confidence: 0.81,
        bbox: { x: 0.15, y: 0.65, width: 0.20, height: 0.18 },
        severity: 'Medium',
        confirmedStatus: 'Confirmed',
        confirmedBy: 'Eng. Marcus Vance, PE',
        confirmedAt: '2026-10-05T11:05:00Z'
      }
    ]
  },
  {
    id: 'img-bk-01',
    bridgeId: 'br-02',
    title: 'Span 4 Roadway Pavement Section B',
    imageUrl: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80',
    capturedAt: '2026-10-06T09:20:00Z',
    inspectorName: 'Senior Inspector Sarah Chen',
    sourceType: 'Crawler Camera',
    isDemoData: true,
    notes: 'Post-repair verification crawl captured remaining sub-surface hairline fracture.',
    detections: [
      {
        id: 'det-03',
        defectType: 'Visible Surface Crack',
        confidence: 0.76,
        bbox: { x: 0.48, y: 0.45, width: 0.25, height: 0.15 },
        severity: 'Medium',
        confirmedStatus: 'Confirmed',
        confirmedBy: 'Senior Inspector Sarah Chen',
        confirmedAt: '2026-10-06T14:30:00Z'
      }
    ]
  },
  {
    id: 'img-ss-01',
    bridgeId: 'br-03',
    title: 'Sunshine Skyway Span South Abutment',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    capturedAt: '2026-10-07T08:00:00Z',
    inspectorName: 'David Ross, DOT Inspector',
    sourceType: 'Drone Inspection',
    isDemoData: true,
    notes: 'Routine scheduled drone flyover. Surface coating intact, zero macro cracks.',
    detections: []
  }
];

export const initialVehicles: RepairVehicle[] = [
  {
    id: 'veh-tx4',
    code: 'ROVER-TX4',
    name: 'Autonomous Repair Rover Alpha',
    model: 'ThermalPulse AutoPatch Mk-IV',
    batteryPct: 88,
    connectivity: 'Connected (5G Ultra)',
    currentState: 'Traveling to Site',
    assignedBridgeId: 'br-01',
    assignedJobId: 'job-01',
    currentLat: 37.8245,
    currentLng: -122.4812,
    speedKmh: 14.5,
    taskProgressPct: 35,
    sealantLevelPct: 92,
    toolTemperatureC: 165,
    safetyState: 'Nominal',
    lastTelemetryTimestamp: '2026-10-08T22:20:10Z'
  },
  {
    id: 'veh-vulcan',
    code: 'VULCAN-02',
    name: 'Heavy Deck Resurfacing Unit Beta',
    model: 'Vulcan Autonomous Grout & Seal',
    batteryPct: 64,
    connectivity: 'Connected (Satellite)',
    currentState: 'Verification Pending',
    assignedBridgeId: 'br-02',
    assignedJobId: 'job-02',
    currentLat: 40.7061,
    currentLng: -73.9969,
    speedKmh: 0.0,
    taskProgressPct: 100,
    sealantLevelPct: 41,
    toolTemperatureC: 45,
    safetyState: 'Nominal',
    lastTelemetryTimestamp: '2026-10-08T22:21:45Z'
  },
  {
    id: 'veh-scout',
    code: 'SCOUT-01',
    name: 'Bridge Deck Ultrasonic Crawler',
    model: 'AeroCrawl NDT Scanner',
    batteryPct: 95,
    connectivity: 'Connected (5G Ultra)',
    currentState: 'Idle',
    currentLat: 37.8300,
    currentLng: -122.4790,
    speedKmh: 0.0,
    taskProgressPct: 0,
    sealantLevelPct: 100,
    toolTemperatureC: 22,
    safetyState: 'Nominal',
    lastTelemetryTimestamp: '2026-10-08T22:15:00Z'
  }
];

export const initialRepairJobs: RepairJob[] = [
  {
    id: 'job-01',
    bridgeId: 'br-01',
    defectSummary: 'Longitudinal deck crack (14mm width, 1.8m length) near North Pier expansion joint.',
    defectId: 'det-01',
    priority: 'Urgent',
    status: 'In Progress',
    assignedVehicleId: 'veh-tx4',
    authorizedBy: 'Chief Engineer Alvarez (State DOT)',
    authorizedAt: '2026-10-08T20:15:00Z',
    progressPct: 35,
    createdAt: '2026-10-08T19:30:00Z',
    beforeImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80',
    verificationOutcome: undefined
  },
  {
    id: 'job-02',
    bridgeId: 'br-02',
    defectSummary: 'Spall void & asphalt fracture along Span 4 roadway lane 2.',
    defectId: 'det-03',
    priority: 'High',
    status: 'Verification Pending',
    assignedVehicleId: 'veh-vulcan',
    authorizedBy: 'Inspector Sarah Chen',
    authorizedAt: '2026-10-08T15:00:00Z',
    progressPct: 100,
    createdAt: '2026-10-08T14:10:00Z',
    completedAt: '2026-10-08T18:00:00Z',
    beforeImageUrl: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80',
    verificationOutcome: 'Defect remains visible; additional work required',
    verifierNotes: 'Post-cure acoustic inspection reveals hairline fissure remaining beneath composite patch.',
    verifiedBy: 'Inspector Sarah Chen',
    verifiedAt: '2026-10-08T19:40:00Z'
  },
  {
    id: 'job-03',
    bridgeId: 'br-03',
    defectSummary: 'Preventative expansion joint polymer injection (Span South).',
    priority: 'Medium',
    status: 'Verified Completed',
    assignedVehicleId: 'veh-vulcan',
    authorizedBy: 'David Ross, DOT',
    authorizedAt: '2026-09-30T10:00:00Z',
    progressPct: 100,
    createdAt: '2026-09-29T14:00:00Z',
    completedAt: '2026-10-01T16:30:00Z',
    beforeImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    verificationOutcome: 'Repair verified by authorized reviewer',
    verifierNotes: 'Sealing intact. Elastic modulus meets DOT bridge maintenance spec ASTM D6690.',
    verifiedBy: 'David Ross, DOT',
    verifiedAt: '2026-10-02T09:15:00Z'
  }
];

export const initialPriorityAssessments: Record<string, BridgePriorityAssessment> = {
  'br-01': {
    bridgeId: 'br-01',
    priorityCategory: 'Priority Inspection',
    overallScore: 84,
    dataQualityStatus: 'Adequate Quality',
    uncertaintyExplanation: 'Landsat 9 thermal resolution (30m) required sub-pixel de-mixing. High confidence supported by repeated +4.2°C thermal delta on consecutive passes.',
    recommendedAction: 'Immediate on-site ultrasound inspection and autonomous rover sealing dispatch.',
    factors: [
      { name: 'Ground-Image Defect Confirmation', weight: 35, score: 92, status: 'Critical', description: 'Inspector confirmed 14mm longitudinal deck crack with spalling.' },
      { name: 'Thermal Anomaly Repeatability', weight: 25, score: 88, status: 'Critical', description: 'Landsat-9 recorded +4.2°C delta; Landsat-8 previously recorded +2.3°C delta.' },
      { name: 'Bridge Criticality & Traffic Volume', weight: 25, score: 85, status: 'Moderate', description: 'Strategic arterial (112,000 daily vehicles) built in 1937.' },
      { name: 'Satellite Observation Quality', weight: 15, score: 70, status: 'Moderate', description: '4.2% cloud cover; clear radiometric signal over bridge polygon.' }
    ]
  },
  'br-02': {
    bridgeId: 'br-02',
    priorityCategory: 'Review Recommended',
    overallScore: 68,
    dataQualityStatus: 'Adequate Quality',
    uncertaintyExplanation: 'Dense urban thermal environment induces baseline elevation (+3.1°C). Ground verification confirmed defect remains visible after first repair pass.',
    recommendedAction: 'Conduct secondary manual inspection before re-authorizing vehicle seal.',
    factors: [
      { name: 'Ground-Image Defect Confirmation', weight: 35, score: 75, status: 'Critical', description: 'Residual defect detected in post-repair scan.' },
      { name: 'Thermal Anomaly Repeatability', weight: 25, score: 65, status: 'Moderate', description: '+3.1°C surface temp elevation over bridge deck baseline.' },
      { name: 'Bridge Criticality & Traffic Volume', weight: 25, score: 80, status: 'Moderate', description: 'Historic landmark handling 116,000 daily vehicles.' },
      { name: 'Satellite Observation Quality', weight: 15, score: 55, status: 'Moderate', description: '8.5% cloud cover; urban heat de-mixing applied.' }
    ]
  },
  'br-03': {
    bridgeId: 'br-03',
    priorityCategory: 'Routine Monitoring',
    overallScore: 18,
    dataQualityStatus: 'Adequate Quality',
    uncertaintyExplanation: 'Marine boundary layer calibrated. Zero thermal anomalies and zero active defects.',
    recommendedAction: 'Continue 16-day cycle satellite observation.',
    factors: [
      { name: 'Ground-Image Defect Confirmation', weight: 35, score: 10, status: 'Good', description: 'Zero active defects detected.' },
      { name: 'Thermal Anomaly Repeatability', weight: 25, score: 15, status: 'Good', description: 'Surface temp tracks within 0.3°C of maritime baseline.' },
      { name: 'Bridge Criticality & Traffic Volume', weight: 25, score: 35, status: 'Good', description: 'Modern 1987 cable-stayed design.' },
      { name: 'Satellite Observation Quality', weight: 15, score: 90, status: 'Good', description: 'Clear skies, high radiometric precision.' }
    ]
  },
  'br-04': {
    bridgeId: 'br-04',
    priorityCategory: 'Insufficient Data',
    overallScore: 40,
    dataQualityStatus: 'Insufficient Resolution',
    uncertaintyExplanation: 'Bridge deck width (20m) is less than sensor pixel width (30m Landsat / 1000m Sentinel-3). Pixels are water-dominated and cannot reliably diagnose bridge deck.',
    recommendedAction: 'Rely on airborne UAV thermography or high-res commercial imagery.',
    factors: [
      { name: 'Ground-Image Defect Confirmation', weight: 35, score: 20, status: 'Good', description: 'No recent ground imagery uploaded.' },
      { name: 'Thermal Anomaly Repeatability', weight: 25, score: 40, status: 'Moderate', description: 'Thermal signal dominated by Lake Michigan water surface.' },
      { name: 'Bridge Criticality & Traffic Volume', weight: 25, score: 45, status: 'Moderate', description: 'Major interstate link.' },
      { name: 'Satellite Observation Quality', weight: 15, score: 15, status: 'Critical', description: 'Insufficient spatial resolution for bridge-level thermal assessment.' }
    ]
  }
};

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-01',
    timestamp: '2026-10-08T22:18:00Z',
    title: 'Repair In Progress — Golden Gate Viaduct',
    message: 'Autonomous Rover Alpha (ROVER-TX4) underway on crack defect det-01 at 35% completion.',
    severity: 'info',
    read: false,
    linkTab: 'vehicles',
    bridgeId: 'br-01'
  },
  {
    id: 'notif-02',
    timestamp: '2026-10-08T21:40:00Z',
    title: 'Verification Action Required: Defect Remains Visible',
    message: 'Repair job #job-02 on Brooklyn Bridge Span 4 marked "Defect remains visible; additional work required" by Inspector Chen.',
    severity: 'warning',
    read: false,
    linkTab: 'verification',
    bridgeId: 'br-02'
  },
  {
    id: 'notif-03',
    timestamp: '2026-10-08T18:42:00Z',
    title: 'Landsat-9 Thermal Anomaly Flagged',
    message: 'Scene LC09_L2SP_044034 recorded +4.2°C surface temperature anomaly over Golden Gate North Approach.',
    severity: 'critical',
    read: true,
    linkTab: 'satellite',
    bridgeId: 'br-01'
  },
  {
    id: 'notif-04',
    timestamp: '2026-10-08T15:00:00Z',
    title: 'Repair Authorized by Chief Engineer Alvarez',
    message: 'Work order job-01 authorized for automated patch rover dispatch.',
    severity: 'success',
    read: true,
    linkTab: 'maintenance',
    bridgeId: 'br-01'
  }
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'log-01',
    timestamp: '2026-10-08T22:20:00Z',
    user: 'Autonomous Fleet Controller',
    role: 'maintenance_operator',
    action: 'TELEMETRY_UPDATE',
    entityType: 'Vehicle',
    entityId: 'veh-tx4',
    details: 'ROVER-TX4 reported nominal battery (88%), sealant pressure 4.2 bar, progress 35%.'
  },
  {
    id: 'log-02',
    timestamp: '2026-10-08T21:40:00Z',
    user: 'Inspector Sarah Chen',
    role: 'inspector',
    action: 'VERIFY_DECISION_RECORDED',
    entityType: 'Verification',
    entityId: 'job-02',
    details: 'Inspector rejected completion: "Defect remains visible; additional work required. Sub-surface fissure detected."'
  },
  {
    id: 'log-03',
    timestamp: '2026-10-08T20:15:00Z',
    user: 'Chief Engineer Alvarez',
    role: 'administrator',
    action: 'REPAIR_JOB_AUTHORIZED',
    entityType: 'Repair Job',
    entityId: 'job-01',
    details: 'Human authorization granted for Golden Gate North Approach repair. Assigned to ROVER-TX4.'
  },
  {
    id: 'log-04',
    timestamp: '2026-10-08T19:30:00Z',
    user: 'Eng. Marcus Vance, PE',
    role: 'inspector',
    action: 'DEFECT_CONFIRMED',
    entityType: 'Inspection',
    entityId: 'img-gg-01',
    details: 'Confirmed 14mm longitudinal crack detected by AI model v2.4 (Confidence: 94%).'
  },
  {
    id: 'log-05',
    timestamp: '2026-10-08T18:45:00Z',
    user: 'Landsat Ingestion Pipeline',
    role: 'maintenance_operator',
    action: 'THERMAL_ANOMALY_RECORDED',
    entityType: 'Observation',
    entityId: 'sat-obs-01',
    details: 'Landsat-9 Collection 2 L2 ST ingested: Delta T = +4.2°C above baseline.'
  }
];
