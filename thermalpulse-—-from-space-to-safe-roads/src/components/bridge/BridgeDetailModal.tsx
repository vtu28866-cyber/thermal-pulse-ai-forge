import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Satellite, 
  Eye, 
  Wrench, 
  History, 
  X, 
  MapPin, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Camera, 
  Calendar,
  Layers,
  Thermometer
} from 'lucide-react';
import { Bridge, SatelliteObservation, InspectionImage, RepairJob, AuditLogItem } from '../../types';
import { api } from '../../services/api';

interface BridgeDetailModalProps {
  bridge: Bridge | null;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const BridgeDetailModal: React.FC<BridgeDetailModalProps> = ({
  bridge,
  onClose,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'satellite' | 'inspection' | 'maintenance' | 'audit'>('overview');
  const [details, setDetails] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    if (!bridge) return;
    const currentBridge = bridge;
    async function load() {
      const data = await api.getBridge(currentBridge.id);
      setDetails(data);
      const allLogs = await api.getAuditLogs();
      setAuditLogs(allLogs.filter(l => l.entityId === currentBridge.id || l.details.includes(currentBridge.name) || l.details.includes(currentBridge.code)));
    }
    load();
  }, [bridge]);

  if (!bridge) return null;

  const observations: SatelliteObservation[] = details?.observations || [];
  const images: InspectionImage[] = details?.images || [];
  const jobs: RepairJob[] = details?.jobs || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">{bridge.code}</span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                  bridge.priority === 'Priority Inspection' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  bridge.priority === 'Review Recommended' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {bridge.priority}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{bridge.name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 px-4 sm:px-5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('satellite')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'satellite'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>2. Satellite Observations ({observations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inspection')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inspection'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3. Visual Inspection ({images.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>4. Maintenance & Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>5. Audit History ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab Content Canvas */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Structural Class</span>
                  <span className="text-sm font-bold text-white mt-1 block">{bridge.structureType}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Deck Width</span>
                  <span className="text-sm font-bold text-cyan-300 mt-1 block">{bridge.deckWidthMeters} meters</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Span Length</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block">{bridge.lengthMeters} meters</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Built Year / Traffic</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block">{bridge.builtYear} &bull; {bridge.dailyTraffic.toLocaleString()}/day</span>
                </div>
              </div>

              {/* Geo Location & Coordinates */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cyan-400" /> Geospatial Coordinates:</span>
                  <span className="text-white font-bold">{bridge.location.lat.toFixed(5)}, {bridge.location.lng.toFixed(5)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Location Jurisdiction:</span>
                  <span className="text-slate-200">{bridge.location.city}, {bridge.location.stateCountry}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Current Operational Status:</span>
                  <span className="text-emerald-400 font-bold">{bridge.status}</span>
                </div>
              </div>

              {/* Spatial Resolution Suitability Note */}
              {bridge.pixelSuitabilityNote && (
                <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 font-mono text-cyan-300 text-xs">
                  <strong>Satellite Sensor Suitability:</strong> {bridge.pixelSuitabilityNote}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SATELLITE OBSERVATIONS */}
          {activeTab === 'satellite' && (
            <div className="space-y-4">
              {observations.length === 0 ? (
                <div className="p-8 text-center font-mono text-slate-400">No satellite passes recorded for this bridge yet.</div>
              ) : (
                observations.map((obs) => (
                  <div key={obs.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-cyan-400 font-bold">{obs.sensor}</span>
                        <div className="text-[10px] text-slate-400">Scene: {obs.sceneId}</div>
                      </div>
                      <span className="text-slate-300 text-[11px]">{new Date(obs.acquisitionDate).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-[10px] text-slate-400 block">Surface Temp</span>
                        <span className="font-bold text-white">{obs.surfaceTemperatureCelsius}&deg;C</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-[10px] text-slate-400 block">Baseline</span>
                        <span className="font-bold text-slate-300">{obs.baselineTempCelsius}&deg;C</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-[10px] text-slate-400 block">Delta T</span>
                        <span className={`font-bold ${obs.temperatureAnomalyDeltaC > 2.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          +{obs.temperatureAnomalyDeltaC}&deg;C
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded">
                        <span className="text-[10px] text-slate-400 block">Pixel Suitability</span>
                        <span className={`font-bold ${obs.qualityFlags.pixelResolutionSuitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {obs.qualityFlags.pixelResolutionSuitable ? 'SUITABLE' : 'TOO COARSE'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: VISUAL INSPECTION */}
          {activeTab === 'inspection' && (
            <div className="space-y-4">
              {images.length === 0 ? (
                <div className="p-8 text-center font-mono text-slate-400">No ground inspection photos attached yet.</div>
              ) : (
                images.map((img) => (
                  <div key={img.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{img.title}</span>
                      <span className="font-mono text-[10px] text-slate-400">{img.sourceType} &bull; {img.inspectorName}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <img src={img.imageUrl} alt={img.title} className="rounded-lg object-cover w-full h-32 border border-slate-700" />
                      <div className="sm:col-span-2 space-y-2 font-mono text-xs">
                        <div className="text-slate-300">Detections Found: {img.detections.length}</div>
                        {img.detections.map((d) => (
                          <div key={d.id} className="p-2 bg-slate-900 rounded flex items-center justify-between">
                            <span className="text-rose-300 font-semibold">{d.defectType}</span>
                            <span className="text-slate-400 text-[10px]">Confidence: {(d.confidence * 100).toFixed(0)}% &bull; Status: {d.confirmedStatus}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: MAINTENANCE & JOBS */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="p-8 text-center font-mono text-slate-400">No repair jobs created for this bridge.</div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{job.id} &bull; Status: {job.status}</span>
                      <span className="text-slate-400 text-[10px]">Progress: {job.progressPct}%</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{job.defectSummary}</p>
                    <div className="text-[11px] text-slate-400">
                      Assigned Vehicle: <span className="text-cyan-400">{job.assignedVehicleId}</span>
                      {job.authorizedBy && ` &bull; Authorized By: ${job.authorizedBy}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: AUDIT HISTORY */}
          {activeTab === 'audit' && (
            <div className="space-y-2 font-mono">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No specific audit entries found for this bridge.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                    <span className="text-cyan-400 shrink-0 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">{log.action} &bull; {log.user}</div>
                      <p className="text-slate-400 font-sans text-[11px] mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
