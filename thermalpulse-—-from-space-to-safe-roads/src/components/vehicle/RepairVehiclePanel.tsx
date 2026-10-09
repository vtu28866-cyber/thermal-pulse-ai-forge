import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  FastForward, 
  Battery, 
  Wifi, 
  Thermometer, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Wrench, 
  MapPin, 
  Clock,
  UserCheck,
  ChevronRight,
  Terminal
} from 'lucide-react';
import { RepairVehicle, RepairJob, Bridge, VehicleState, UserRole } from '../../types';
import { api } from '../../services/api';

interface RepairVehiclePanelProps {
  bridges: Bridge[];
  vehicles: RepairVehicle[];
  selectedBridgeId: string;
  currentRole: UserRole;
  onRefreshVehicles: () => void;
  onNavigateTab: (tab: string) => void;
}

export const RepairVehiclePanel: React.FC<RepairVehiclePanelProps> = ({
  bridges,
  vehicles,
  selectedBridgeId,
  currentRole,
  onRefreshVehicles,
  onNavigateTab
}) => {
  const [activeVehicleId, setActiveVehicleId] = useState<string>('veh-tx4');
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<number>(1);
  const [eventLog, setEventLog] = useState<string[]>([
    'System initialization: Rover telemetry stream established on 5G sub-6GHz link.',
    'Assigned to Golden Gate North Approach defect det-01.',
    'Awaiting engineering job authorization.'
  ]);

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
  const assignedBridge = bridges.find(b => b.id === activeVehicle?.assignedBridgeId) || bridges[0];
  const activeJob = jobs.find(j => j.id === activeVehicle?.assignedJobId) || jobs[0];

  useEffect(() => {
    async function loadJobs() {
      const allJobs = await api.getRepairJobs();
      setJobs(allJobs);
    }
    loadJobs();
    const interval = setInterval(loadJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthorizeJob = async () => {
    if (!activeJob) return;
    try {
      await api.authorizeRepairJob(
        activeJob.id,
        currentRole === 'administrator' ? 'Civil Director Alvarez' : 'Lead Engineer Sarah Chen, PE'
      );
      setEventLog(prev => [
        `[${new Date().toLocaleTimeString()}] Human engineering authorization granted by ${currentRole}. Vehicle interlock released.`,
        ...prev
      ]);
      onRefreshVehicles();
      const updated = await api.getRepairJobs();
      setJobs(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleControlSimulation = async (action: 'start' | 'pause' | 'cancel' | 'step' | 'reset') => {
    if (!activeJob) return;
    try {
      const res = await api.simulateRepairJob(activeJob.id, action, activeSpeed);
      if (action === 'start') setIsSimulating(true);
      if (action === 'pause' || action === 'cancel' || action === 'reset') setIsSimulating(false);

      setEventLog(prev => [
        `[${new Date().toLocaleTimeString()}] Command executed: ${action.toUpperCase()} (State: ${res?.vehicle?.currentState || 'Updated'})`,
        ...prev
      ]);
      onRefreshVehicles();
      const updated = await api.getRepairJobs();
      setJobs(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const stateStepList: VehicleState[] = [
    'Idle',
    'Inspection Requested',
    'Traveling to Site',
    'Arrived',
    'Assessing Defect',
    'Repair Authorized',
    'Repair In Progress',
    'Repair Completed',
    'Verification Pending',
    'Verified Completed'
  ];

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              Robotics Telemetry & Digital Twin
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
              SIMULATED DIGITAL VEHICLE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Autonomous Bridge-Maintenance Vehicle Fleet
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Software simulation interface controlling autonomous polymer-injection patch rovers and surface crawlers.
            Strict human approval required before repair commences.
          </p>
        </div>

        {/* Rover Selector Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveVehicleId(v.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                v.id === activeVehicle?.id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {v.code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Telemetry Gauges & State Machine */}
        <div className="space-y-4">
          {/* Vehicle Identity Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{activeVehicle?.code}</span>
                <h3 className="text-base font-bold text-white">{activeVehicle?.name}</h3>
                <span className="text-[11px] font-mono text-slate-400">{activeVehicle?.model}</span>
              </div>
              <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {activeVehicle?.currentState}
              </span>
            </div>

            {/* Dials & Gauges Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              {/* Battery */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1"><Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery</span>
                  <span>{activeVehicle?.batteryPct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded transition-all"
                    style={{ width: `${activeVehicle?.batteryPct}%` }}
                  />
                </div>
              </div>

              {/* Connectivity */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-cyan-400" /> Link</span>
                  <span className="text-emerald-400 text-[9px] font-bold">5G ULTRA</span>
                </div>
                <span className="text-slate-200 text-[11px] font-semibold block truncate">
                  {activeVehicle?.connectivity}
                </span>
              </div>

              {/* Tool Head Temperature */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-rose-400" /> Cure Head</span>
                  <span>{activeVehicle?.toolTemperatureC}&deg;C</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded transition-all"
                    style={{ width: `${Math.min(100, (activeVehicle?.toolTemperatureC || 40) / 2)}%` }}
                  />
                </div>
              </div>

              {/* Sealant Reservoir */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5 text-blue-400" /> Sealant Res</span>
                  <span>{activeVehicle?.sealantLevelPct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded transition-all"
                    style={{ width: `${activeVehicle?.sealantLevelPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Position Coordinates & Speed */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-cyan-400" /> GPS Deck Location:</span>
                <span className="text-slate-200">{activeVehicle?.currentLat.toFixed(5)}, {activeVehicle?.currentLng.toFixed(5)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Traverse Velocity:</span>
                <span className="text-cyan-300 font-bold">{activeVehicle?.speedKmh.toFixed(1)} km/h</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Safety Supervisor:</span>
                <span className="text-emerald-400 font-semibold">{activeVehicle?.safetyState}</span>
              </div>
            </div>
          </div>

          {/* ROS2 / MQTT Architecture Integration Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
            <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold block">
              Robotics Adapter Interface Spec
            </span>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Compatible with ROS 2 / Micro-ROS bridge via WebSocket or MQTT telemetry topic <code className="text-cyan-300">/thermalpulse/rover/telemetry</code> and control service <code className="text-cyan-300">/thermalpulse/rover/dispatch</code>.
            </p>
          </div>
        </div>

        {/* Center/Right: Simulation Controller & State Flow */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            {/* Active Mission Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Active Work Order: {activeJob?.id || 'None'}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {assignedBridge?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeJob?.defectSummary || 'Routine autonomous roadway inspection path.'}
                </p>
              </div>

              {/* Human Authorization Status Badge */}
              <div className="shrink-0">
                {activeJob?.status === 'Pending Authorization' ? (
                  <button
                    onClick={handleAuthorizeJob}
                    className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20 animate-pulse"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Authorize Repair & Unlock</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-mono text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Authorized by {activeJob?.authorizedBy || 'Chief Engineer'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Physical Execution Progress</span>
                <span className="text-cyan-300 font-bold">{activeJob?.progressPct ?? activeVehicle?.taskProgressPct ?? 0}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${activeJob?.progressPct ?? activeVehicle?.taskProgressPct ?? 0}%` }}
                />
              </div>
            </div>

            {/* 10-State Flow Visualizer */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Rover Lifecycle State Track (10 States)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono">
                {stateStepList.map((st, idx) => {
                  const isCurrent = activeVehicle?.currentState === st;
                  return (
                    <div
                      key={st}
                      className={`p-2 rounded border text-center transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 font-bold shadow-md shadow-cyan-950'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800/80'
                      }`}
                    >
                      <div className="text-[9px] text-slate-400">Step {idx + 1}</div>
                      <div className="truncate">{st}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Control Console */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleControlSimulation('start')}
                  disabled={activeJob?.status === 'Pending Authorization'}
                  className={`px-3 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeJob?.status === 'Pending Authorization'
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Simulation</span>
                </button>

                <button
                  onClick={() => handleControlSimulation('pause')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>

                <button
                  onClick={() => handleControlSimulation('step')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>+15% Step</span>
                </button>

                <button
                  onClick={() => handleControlSimulation('reset')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400">Speed:</span>
                {[1, 2, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      activeSpeed === s ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {s}&times;
                  </button>
                ))}
              </div>
            </div>

            {/* Live Event Terminal Log */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Telemetry Event Stream
                </span>
                <span className="text-[10px] text-emerald-400 animate-pulse">● LIVE STREAM</span>
              </div>
              <div className="max-h-28 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
                {eventLog.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    <span className="text-cyan-500">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Verification Flow Link */}
            {activeVehicle?.currentState === 'Verification Pending' && (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="text-amber-300">
                  <strong>Simulated application reached 100%!</strong> Task is now &quot;Verification Pending&quot;.
                </div>
                <button
                  onClick={() => onNavigateTab('verification')}
                  className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-colors"
                >
                  Proceed to Verification &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
