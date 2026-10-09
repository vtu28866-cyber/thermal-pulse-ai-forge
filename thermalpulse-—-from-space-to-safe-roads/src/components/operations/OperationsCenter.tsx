import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  FastForward, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Battery, 
  Cpu, 
  MapPin, 
  Navigation, 
  Radio, 
  Clock, 
  FileText, 
  UserCheck, 
  Wrench, 
  Eye, 
  ChevronRight,
  Sliders,
  Send,
  Maximize2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Rover3DCanvas, ROVER_COMPONENTS } from '../vehicle/Rover3DCanvas';
import { LiveOperationMap } from './LiveOperationMap';
import { Bridge, RepairVehicle, VehicleState, RouteWaypoint, TelemetryPoint, UserRole, RoverComponentInfo } from '../../types';

interface OperationsCenterProps {
  bridges: Bridge[];
  selectedBridgeId: string;
  onSelectBridge: (id: string) => void;
  currentRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onRefreshAll: () => void;
}

// Generate realistic intermediate route waypoints between start and destination
function generateWaypoints(startLat: number, startLng: number, destLat: number, destLng: number): RouteWaypoint[] {
  const steps = 8;
  const points: RouteWaypoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add realistic roadway curve offset
    const curveOffset = Math.sin(t * Math.PI) * 0.003;
    const lat = startLat + (destLat - startLat) * t + curveOffset;
    const lng = startLng + (destLng - startLng) * t - curveOffset * 0.5;
    points.push({
      lat,
      lng,
      name: i === 0 ? 'Civil Equipment Depot' : i === steps ? 'Bridge Deck Inspection Zone' : `Waypoint ${i}`,
      isCheckpoint: i % 2 === 0
    });
  }
  return points;
}

export const OperationsCenter: React.FC<OperationsCenterProps> = ({
  bridges,
  selectedBridgeId,
  onSelectBridge,
  currentRole,
  onNavigateTab,
  onRefreshAll
}) => {
  // Target Bridge
  const destinationBridge = bridges.find(b => b.id === selectedBridgeId) || bridges[0];

  // Base Depot coordinates (e.g., Highway Maintenance Yard)
  const depotCoords = { lat: 37.8020, lng: -122.4650 };

  // Synchronized Vehicle State
  const [vehicle, setVehicle] = useState<RepairVehicle>({
    id: 'veh-tx4',
    code: 'ROVER-TX4',
    name: 'Autonomous Repair Rover Alpha',
    model: 'ThermalPulse AutoPatch Mk-IV NDT',
    batteryPct: 88,
    connectivity: 'Connected (5G Ultra)',
    currentState: 'Traveling to Site',
    assignedBridgeId: destinationBridge.id,
    currentLat: 37.8180,
    currentLng: -122.4760,
    speedKmh: 14.5,
    taskProgressPct: 35,
    sealantLevelPct: 89,
    toolTemperatureC: 165,
    safetyState: 'Nominal',
    lastTelemetryTimestamp: new Date().toISOString()
  });

  // Route Waypoints & Navigation Simulation State
  const [routeWaypoints, setRouteWaypoints] = useState<RouteWaypoint[]>(() =>
    generateWaypoints(depotCoords.lat, depotCoords.lng, destinationBridge.location.lat, destinationBridge.location.lng)
  );
  const [routeProgressPct, setRouteProgressPct] = useState<number>(35);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeSpeedMultiplier, setActiveSpeedMultiplier] = useState<number>(1);
  const [selectedComponent, setSelectedComponent] = useState<RoverComponentInfo | null>(null);

  // Telemetry History for Charts
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([
    { time: '10:00', batteryPct: 98, speedKmh: 0, toolTempC: 22, distanceKm: 0, headingDeg: 340 },
    { time: '10:05', batteryPct: 95, speedKmh: 12.5, toolTempC: 35, distanceKm: 0.8, headingDeg: 335 },
    { time: '10:10', batteryPct: 92, speedKmh: 15.0, toolTempC: 60, distanceKm: 1.6, headingDeg: 320 },
    { time: '10:15', batteryPct: 89, speedKmh: 14.5, toolTempC: 140, distanceKm: 2.3, headingDeg: 315 },
    { time: '10:20', batteryPct: 88, speedKmh: 14.5, toolTempC: 165, distanceKm: 2.9, headingDeg: 315 }
  ]);

  // Mission Activity Log
  const [missionLogs, setMissionLogs] = useState<string[]>([
    '[10:00:15] Mission initialized: Assigned to ' + destinationBridge.name,
    '[10:05:30] Navigation underway: Transit along approach span waypoints',
    '[10:15:22] LiDAR obstacle scanning active (32-channel, 0 obstacles)',
    '[10:20:00] Telemetry streaming: Battery 88%, Sealant 89%, Temperature 165°C'
  ]);

  // Authorization Modal
  const [authModal, setAuthModal] = useState(false);
  const [engineerSignName, setEngineerSignName] = useState(
    currentRole === 'administrator' ? 'Chief Engineer Alvarez, PE' : 'Lead Inspector Sarah Chen, PE'
  );

  // Recalculate route when destination bridge changes
  useEffect(() => {
    const newRoute = generateWaypoints(depotCoords.lat, depotCoords.lng, destinationBridge.location.lat, destinationBridge.location.lng);
    setRouteWaypoints(newRoute);
  }, [destinationBridge.id]);

  // --------------------------------------------------------------------------
  // SYNCHRONIZED SIMULATION ENGINE (Updates 3D model, Map & Telemetry simultaneously)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setRouteProgressPct((prev) => {
        const nextProgress = Math.min(100, prev + 2.5 * activeSpeedMultiplier);

        // Calculate exact interpolated GPS coordinate along waypoints
        const totalSegments = routeWaypoints.length - 1;
        const exactIndex = (nextProgress / 100) * totalSegments;
        const segmentIdx = Math.min(totalSegments - 1, Math.floor(exactIndex));
        const segmentFraction = exactIndex - segmentIdx;

        const pA = routeWaypoints[segmentIdx];
        const pB = routeWaypoints[segmentIdx + 1] || pA;

        const currentLat = pA.lat + (pB.lat - pA.lat) * segmentFraction;
        const currentLng = pA.lng + (pB.lng - pA.lng) * segmentFraction;

        // Update Vehicle Object with shared state
        setVehicle((v) => {
          let updatedState: VehicleState = v.currentState;
          let speed = v.speedKmh;
          let toolTemp = v.toolTemperatureC;

          // State Machine Progression:
          if (v.currentState === 'Traveling to Site') {
            speed = 14.5;
            if (nextProgress >= 100) {
              updatedState = 'Arrived';
              speed = 0;
            }
          } else if (v.currentState === 'Arrived') {
            updatedState = 'Assessing Defect';
          } else if (v.currentState === 'Assessing Defect') {
            speed = 0;
            // Transition to awaiting authorization
            if (nextProgress >= 100) {
              updatedState = 'Awaiting Authorization' as any;
            }
          } else if (v.currentState === 'Repair In Progress') {
            speed = 1.2;
            toolTemp = 168;
            if (nextProgress >= 100) {
              updatedState = 'Repair Completed';
              speed = 0;
            }
          } else if (v.currentState === 'Repair Completed') {
            updatedState = 'Verification Pending';
          }

          const updatedBattery = Math.max(12, v.batteryPct - 0.15 * activeSpeedMultiplier);
          const updatedSealant = updatedState === 'Repair In Progress' ? Math.max(10, v.sealantLevelPct - 0.4) : v.sealantLevelPct;

          return {
            ...v,
            currentState: updatedState,
            currentLat,
            currentLng,
            speedKmh: speed,
            taskProgressPct: nextProgress,
            batteryPct: updatedBattery,
            sealantLevelPct: updatedSealant,
            toolTemperatureC: toolTemp,
            lastTelemetryTimestamp: new Date().toISOString()
          };
        });

        return nextProgress;
      });

      // Update telemetry history graph
      const timeStr = new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
      setTelemetryHistory((prev) => [
        ...prev.slice(-12),
        {
          time: timeStr,
          batteryPct: vehicle.batteryPct,
          speedKmh: vehicle.speedKmh,
          toolTempC: vehicle.toolTemperatureC,
          distanceKm: Number(((routeProgressPct / 100) * 3.8).toFixed(2)),
          headingDeg: 320
        }
      ]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, activeSpeedMultiplier, routeWaypoints, vehicle.currentState, routeProgressPct]);

  // --------------------------------------------------------------------------
  // MISSION CONTROL ACTIONS (Strictly Validated Transitions)
  // --------------------------------------------------------------------------
  const handleStartMission = () => {
    setIsSimulating(true);
    setRouteProgressPct(0);
    setVehicle((v) => ({
      ...v,
      currentState: 'Traveling to Site',
      speedKmh: 14.5
    }));
    setMissionLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] MISSION STARTED: Vehicle dispatched toward ${destinationBridge.name}`,
      ...prev
    ]);
  };

  const handlePauseResume = () => {
    setIsSimulating(!isSimulating);
    setMissionLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] SIMULATION ${isSimulating ? 'PAUSED' : 'RESUMED'}`,
      ...prev
    ]);
  };

  const handleBeginInspection = () => {
    setVehicle((v) => ({
      ...v,
      currentState: 'Assessing Defect',
      speedKmh: 0
    }));
    setRouteProgressPct(0);
    setIsSimulating(true);
    setMissionLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Camera mast & LiDAR inspection scan initiated on deck expansion joint.`,
      ...prev
    ]);
  };

  const handleRequestApproval = () => {
    setAuthModal(true);
  };

  const handleAuthorizeRepair = () => {
    setVehicle((v) => ({
      ...v,
      currentState: 'Repair In Progress',
      speedKmh: 1.2,
      toolTemperatureC: 165
    }));
    setRouteProgressPct(0);
    setIsSimulating(true);
    setAuthModal(false);
    setMissionLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] HUMAN ENGINEERING AUTHORIZATION GRANTED by ${engineerSignName}. Automated repair unlocked!`,
      ...prev
    ]);
  };

  const handleResetDemo = () => {
    setRouteProgressPct(0);
    setIsSimulating(false);
    setVehicle((v) => ({
      ...v,
      currentState: 'Idle',
      currentLat: depotCoords.lat,
      currentLng: depotCoords.lng,
      speedKmh: 0,
      taskProgressPct: 0,
      batteryPct: 95
    }));
    setMissionLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Demo simulation reset to Depot Base.`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Operations Center Top HUD Ribbon */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              Split-Screen Operations Workspace
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              SYNCHRONIZED 3D & GIS MAP STATE
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            Live Autonomous Mission Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized digital twin tracking the autonomous inspection rover, its transit path, destination bridge, and physical repair progress.
          </p>
        </div>

        {/* Destination Bridge Selector */}
        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          <span className="text-slate-400">Target Bridge:</span>
          <select
            value={selectedBridgeId}
            onChange={(e) => onSelectBridge(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-cyan-500"
          >
            {bridges.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} &bull; [{b.priority}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Split-Screen Workspace (Left: 3D Vehicle, Right: Live Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[520px]">
        {/* LEFT PANEL: Interactive 3D Autonomous Vehicle */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
          <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">INTERACTIVE 3D ROVER DIGITAL TWIN</span>
            </div>
            <span className="text-[10px] text-cyan-300">Rotate &bull; Zoom &bull; Click Parts</span>
          </div>

          <div className="flex-1 relative">
            <Rover3DCanvas
              currentState={vehicle.currentState}
              speedKmh={vehicle.speedKmh}
              taskProgressPct={routeProgressPct}
              batteryPct={vehicle.batteryPct}
              onSelectComponent={setSelectedComponent}
              showToolbar={true}
            />
          </div>
        </div>

        {/* RIGHT PANEL: Interactive GIS Route & Live Map */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
          <div className="p-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10 text-xs font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">LIVE GEOSPATIAL TRANSIT MAP</span>
            </div>
            <span className="text-[10px] text-emerald-400">GPS Link: Synchronized</span>
          </div>

          <div className="flex-1 relative">
            <LiveOperationMap
              bridges={bridges}
              vehicle={vehicle}
              destinationBridge={destinationBridge}
              routeWaypoints={routeWaypoints}
              routeProgressPct={routeProgressPct}
              onSelectBridge={onSelectBridge}
              onAssignBridgeToVehicle={(bId) => {
                onSelectBridge(bId);
                handleStartMission();
              }}
              onCenterVehicle={() => {}}
              showRoute={true}
            />
          </div>
        </div>
      </div>

      {/* Mission Control Command Console */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Mission Control Command Panel</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              State: {vehicle.currentState}
            </span>
          </div>

          {/* Speed Multiplier & Quick Actions */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Sim Speed:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setActiveSpeedMultiplier(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  activeSpeedMultiplier === s ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {s}&times;
              </button>
            ))}
          </div>
        </div>

        {/* Working Mission Control Buttons (Validated by state) */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Start Mission */}
          <button
            onClick={handleStartMission}
            disabled={vehicle.currentState === 'Traveling to Site'}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md ${
              vehicle.currentState === 'Traveling to Site'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start Mission</span>
          </button>

          {/* Pause / Resume */}
          <button
            onClick={handlePauseResume}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Begin Inspection */}
          <button
            onClick={handleBeginInspection}
            className="px-3 py-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-cyan-300 border border-blue-700/60 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Begin Inspection</span>
          </button>

          {/* Mandatory Human Engineering Approval */}
          <button
            onClick={handleRequestApproval}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Authorize Simulated Repair</span>
          </button>

          {/* Proceed to Verification Center */}
          <button
            onClick={() => onNavigateTab('verification')}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Open Verification Center</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={handleResetDemo}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 flex items-center gap-1.5 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* 10-State Visualizer Ribbon */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Mission Progress: {routeProgressPct.toFixed(0)}%</span>
            <span>Target: {destinationBridge.name}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${routeProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Panel: Telemetry Analytics, History Chart & Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Telemetry History Graph (Recharts) */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-xs font-mono">Live Battery Discharge & Speed Telemetry</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">48V LiFePO4 Solid-State Core</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="batteryPct" name="Battery %" stroke="#10b981" fill="url(#batteryGrad)" />
                <Area type="monotone" dataKey="speedKmh" name="Velocity (km/h)" stroke="#06b6d4" fill="url(#speedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mission Event Timeline */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 flex flex-col justify-between font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Mission Event Log
            </span>
            <span className="text-[10px] text-cyan-400 animate-pulse">● LIVE</span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] text-slate-400">
            {missionLogs.map((log, idx) => (
              <div key={idx} className="leading-snug">
                <span className="text-cyan-500">&gt;</span> {log}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Safety Interlock: <strong className="text-emerald-400">ARMED</strong></span>
            <span>Link: <strong className="text-cyan-300">5G MIMO RTK</strong></span>
          </div>
        </div>
      </div>

      {/* Engineer Approval Gatekeeper Modal */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Human Engineering Authorization Required</h3>
              </div>
              <button onClick={() => setAuthModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              <strong>Mandatory Civil Defense Invariant:</strong> Autonomous rovers cannot execute surface maintenance or polymer injection based only on AI or satellite screening. A certified civil engineer must validate the defect.
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-[11px]">
              <div>Target Bridge: <span className="text-cyan-300 font-bold">{destinationBridge.name}</span></div>
              <div>Assigned Vehicle: <span className="text-white font-bold">{vehicle.code} ({vehicle.model})</span></div>
              <div>Defect Class: <span className="text-rose-400 font-bold">14mm Longitudinal Deck Crack</span></div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Authorizing Engineer Name & PE License</label>
              <input
                type="text"
                value={engineerSignName}
                onChange={(e) => setEngineerSignName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAuthModal(false)}
                className="px-3.5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthorizeRepair}
                className="px-3.5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Sign & Authorize Repair &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
