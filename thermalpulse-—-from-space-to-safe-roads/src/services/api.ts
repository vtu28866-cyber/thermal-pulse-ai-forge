import { Bridge, SatelliteObservation, InspectionImage, RepairVehicle, RepairJob, NotificationItem, AuditLogItem, BridgePriorityAssessment } from '../types';

export const api = {
  async getBridges(priority?: string, status?: string, search?: string): Promise<Bridge[]> {
    const params = new URLSearchParams();
    if (priority) params.append('priority', priority);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`/api/bridges?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async getBridge(bridgeId: string): Promise<{
    bridge: Bridge;
    assessment: BridgePriorityAssessment;
    observations: SatelliteObservation[];
    images: InspectionImage[];
    jobs: RepairJob[];
  }> {
    const res = await fetch(`/api/bridges/${bridgeId}`);
    const json = await res.json();
    return json.data;
  },

  async createBridge(data: Partial<Bridge>): Promise<Bridge> {
    const res = await fetch('/api/bridges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  },

  async getObservations(bridgeId: string): Promise<SatelliteObservation[]> {
    const res = await fetch(`/api/bridges/${bridgeId}/observations`);
    const json = await res.json();
    return json.data || [];
  },

  async searchSatellite(params: { bridgeId?: string; sensor: string; dateStart?: string; dateEnd?: string }): Promise<SatelliteObservation[]> {
    const res = await fetch('/api/satellite/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const json = await res.json();
    return json.data || [];
  },

  async analyzeThermal(params: {
    bridgeId: string;
    sensor: string;
    rawTempKelvin: number;
    baselineTempCelsius?: number;
    cloudCoverPct?: number;
  }): Promise<any> {
    const res = await fetch('/api/thermal/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  },

  async uploadInspectionImage(data: {
    bridgeId: string;
    title: string;
    imageUrl: string;
    inspectorName?: string;
    sourceType?: string;
    notes?: string;
  }): Promise<InspectionImage> {
    const res = await fetch('/api/inspections/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  },

  async analyzeInspectionDefects(inspectionId: string): Promise<any> {
    const res = await fetch(`/api/inspections/${inspectionId}/analyze`, {
      method: 'POST'
    });
    return await res.json();
  },

  async reviewDefect(inspectionId: string, defectId: string, decision: 'CONFIRM' | 'REJECT', inspectorName?: string, notes?: string): Promise<any> {
    const res = await fetch(`/api/inspections/${inspectionId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defectId, decision, inspectorName, notes })
    });
    return await res.json();
  },

  async getRepairJobs(bridgeId?: string, status?: string): Promise<RepairJob[]> {
    const params = new URLSearchParams();
    if (bridgeId) params.append('bridgeId', bridgeId);
    if (status) params.append('status', status);
    const res = await fetch(`/api/repair-jobs?${params.toString()}`);
    const json = await res.json();
    return json.data || [];
  },

  async createRepairJob(data: {
    bridgeId: string;
    defectId?: string;
    defectSummary: string;
    priority?: string;
    assignedVehicleId?: string;
    beforeImageUrl?: string;
  }): Promise<RepairJob> {
    const res = await fetch('/api/repair-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  },

  async authorizeRepairJob(jobId: string, authorizedBy?: string): Promise<RepairJob> {
    const res = await fetch(`/api/repair-jobs/${jobId}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizedBy })
    });
    const json = await res.json();
    return json.data;
  },

  async simulateRepairJob(jobId: string, action: 'start' | 'pause' | 'cancel' | 'step' | 'reset', speedMultiplier: number = 1): Promise<any> {
    const res = await fetch(`/api/repair-jobs/${jobId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, speedMultiplier })
    });
    return await res.json();
  },

  async verifyRepair(jobId: string, outcome: string, verifierNotes?: string, verifierName?: string, afterImageUrl?: string): Promise<any> {
    const res = await fetch(`/api/repair-jobs/${jobId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, verifierNotes, verifierName, afterImageUrl })
    });
    return await res.json();
  },

  async getVehicles(): Promise<RepairVehicle[]> {
    const res = await fetch('/api/vehicles');
    const json = await res.json();
    return json.data || [];
  },

  async getVehicleTelemetry(vehicleId: string): Promise<any> {
    const res = await fetch(`/api/vehicles/${vehicleId}/telemetry`);
    return await res.json();
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications');
    const json = await res.json();
    return json.data || [];
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch('/api/notifications/read-all', { method: 'POST' });
  },

  async getSummaryReport(): Promise<any> {
    const res = await fetch('/api/reports/summary');
    const json = await res.json();
    return json.data;
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch('/api/audit-logs');
    const json = await res.json();
    return json.data || [];
  },

  async discoverOverpassBridges(lat: number, lng: number, radiusKm: number = 10): Promise<any[]> {
    const res = await fetch('/api/overpass/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, radiusKm })
    });
    const json = await res.json();
    return json.data || [];
  },

  async overridePriority(bridgeId: string, newPriority: string, inspectorName?: string, reason?: string): Promise<any> {
    const res = await fetch('/api/priority/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bridgeId, newPriority, inspectorName, reason })
    });
    return await res.json();
  },

  async resetDemoScenario(scenario: 'default' | 'scenario-pass' | 'scenario-fail'): Promise<any> {
    const res = await fetch('/api/demo/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    return await res.json();
  }
};
