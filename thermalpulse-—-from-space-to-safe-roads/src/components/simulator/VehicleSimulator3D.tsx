import React, { useState } from 'react';
import { 
  Cpu, 
  RotateCcw, 
  Layers, 
  Radio, 
  Crosshair, 
  Maximize2, 
  Wrench, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Battery, 
  Compass, 
  Download,
  Info,
  Play,
  Pause,
  Thermometer,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Rover3DCanvas, ROVER_COMPONENTS } from '../vehicle/Rover3DCanvas';
import { RoverComponentId, RoverComponentInfo, VehicleState } from '../../types';

interface VehicleSimulator3DProps {
  onNavigateTab: (tab: string) => void;
}

export const VehicleSimulator3D: React.FC<VehicleSimulator3DProps> = ({ onNavigateTab }) => {
  const [selectedComponentId, setSelectedComponentId] = useState<RoverComponentId>('arm_effector');
  const [simState, setSimState] = useState<VehicleState>('Repair In Progress');
  const [testSpeed, setTestSpeed] = useState<number>(0);
  const [toolTemp, setToolTemp] = useState<number>(165);
  const [diagnosticLog, setDiagnosticLog] = useState<string[]>([
    'Diagnostic Engine Ready: TX-4 Digital Twin initialized.',
    '6x In-Hub Brushless telemetry nominal.',
    '32-Channel LiDAR rangefinder online (120m range).',
    'Robotic Arm Kinematics solver: Passed zero-backlash verification.'
  ]);

  const activeComponent = ROVER_COMPONENTS[selectedComponentId];

  const handleRunSubsystemDiagnostic = (testName: string) => {
    setDiagnosticLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Executing test: "${testName}" -> OK (100% PASS)`,
      ...prev
    ]);
  };

  const handleExportDiagnostics = () => {
    const report = {
      vehicle: 'ThermalPulse AutoPatch Mk-IV NDT (ROVER-TX4)',
      timestamp: new Date().toISOString(),
      firmware: 'v2.6.4-rtk-production',
      subsystems: ROVER_COMPONENTS,
      diagnosticsLog: diagnosticLog
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rover_tx4_diagnostic_report_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              High-Precision 3D Simulator Lab
            </span>
            <span className="text-slate-400 text-xs font-mono">Hardware-in-the-Loop Digital Twin</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            TX-4 Autonomous Bridge-Inspection Rover 3D Workbench
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-scale three-dimensional model with 6-wheel independent in-hub drives, active rocker-bogie suspension, 32-channel spinning LiDAR, 2-axis macro gimbal, and articulated repair arm.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={handleExportDiagnostics}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CAD Diagnostics</span>
          </button>
          <button
            onClick={() => onNavigateTab('operations')}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-900/40"
          >
            <span>Live Mission Ops &rarr;</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas + Component Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left/Center: High-Fidelity 3D Viewport (Span 2 cols) */}
        <div className="lg:col-span-2 relative h-[560px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
          <Rover3DCanvas
            currentState={simState}
            speedKmh={testSpeed}
            taskProgressPct={75}
            batteryPct={92}
            onSelectComponent={(comp) => setSelectedComponentId(comp.id)}
            showToolbar={true}
          />

          {/* Bottom Simulation Mode Selector inside 3D Viewport */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 flex items-center gap-1 text-[11px] font-mono">
            <span className="text-slate-400 px-1.5">Kinematic Mode:</span>
            <button
              onClick={() => {
                setSimState('Idle');
                setTestSpeed(0);
              }}
              className={`px-2 py-1 rounded ${simState === 'Idle' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Stowed / Idle
            </button>
            <button
              onClick={() => {
                setSimState('Traveling to Site');
                setTestSpeed(16.5);
              }}
              className={`px-2 py-1 rounded ${simState === 'Traveling to Site' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Wheel Transit (16.5 km/h)
            </button>
            <button
              onClick={() => {
                setSimState('Assessing Defect');
                setTestSpeed(0);
              }}
              className={`px-2 py-1 rounded ${simState === 'Assessing Defect' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Gimbal Inspection
            </button>
            <button
              onClick={() => {
                setSimState('Repair In Progress');
                setTestSpeed(1.2);
              }}
              className={`px-2 py-1 rounded ${simState === 'Repair In Progress' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Robotic Arm Repair
            </button>
          </div>
        </div>

        {/* Right: Subsystem Explorer & Interactive Diagnostic Testing */}
        <div className="space-y-4">
          {/* Active Component Deep Dive Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Subsystem Inspector</span>
              <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                {activeComponent.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{activeComponent.name}</h3>
              <span className="text-[11px] text-slate-400">Class: {activeComponent.category}</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {activeComponent.description}
            </p>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-200">
              <strong>Specifications:</strong> {activeComponent.specs}
            </div>
          </div>

          {/* Quick Subsystem Selector List */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-2 font-mono text-xs">
            <span className="font-bold text-slate-200 text-xs block">Select Component to Focus:</span>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {Object.values(ROVER_COMPONENTS).map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComponentId(comp.id)}
                  className={`p-2 rounded text-left truncate text-[11px] transition-all border ${
                    comp.id === selectedComponentId
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {comp.name.split(' ')[0]} {comp.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Bench Diagnostics Buttons */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-2.5 font-mono text-xs">
            <span className="font-bold text-slate-200 text-xs block">Benchtop Hardware Tests:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRunSubsystemDiagnostic('Tire Grip & In-Hub Torque')}
                className="p-2 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] text-left"
              >
                &bull; Test In-Hub Drives
              </button>
              <button
                onClick={() => handleRunSubsystemDiagnostic('LiDAR Range Beam Calibration')}
                className="p-2 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] text-left"
              >
                &bull; Calibrate LiDAR
              </button>
              <button
                onClick={() => handleRunSubsystemDiagnostic('Gimbal Dual-Axis Saccade')}
                className="p-2 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] text-left"
              >
                &bull; Pan-Tilt Gimbal
              </button>
              <button
                onClick={() => handleRunSubsystemDiagnostic('Heater Core 165°C Extrusion')}
                className="p-2 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] text-left"
              >
                &bull; Tool Nozzle Heat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
