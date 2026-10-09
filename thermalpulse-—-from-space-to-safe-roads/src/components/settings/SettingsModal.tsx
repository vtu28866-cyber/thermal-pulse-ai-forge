import React from 'react';
import { 
  Sliders, 
  X, 
  Satellite, 
  Globe2, 
  Compass, 
  Cpu, 
  Sparkles, 
  Mail, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetScenario: (scenario: 'default' | 'scenario-pass' | 'scenario-fail') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetScenario
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-xs font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">API Integrations & Platform Diagnostics</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Status Cards */}
        <div className="space-y-3">
          {/* USGS Landsat */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Satellite className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">USGS Landsat Collection 2 Level-2 ST</div>
                <div className="text-[10px] text-slate-400">TIRS-1 & TIRS-2 30m Resampled Surface Temperature</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              OPERATIONAL
            </span>
          </div>

          {/* Copernicus Sentinel */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe2 className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">Copernicus Data Space Ecosystem</div>
                <div className="text-[10px] text-slate-400">Sentinel-2 MSI (Optical) & Sentinel-3 SLSTR (Thermal)</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              SYNCHRONIZED
            </span>
          </div>

          {/* OpenStreetMap Overpass */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">OpenStreetMap Overpass API</div>
                <div className="text-[10px] text-slate-400">Real-time geospatial bridge way queries</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              ONLINE
            </span>
          </div>

          {/* Gemini Vision Defect Model */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">Civil Vision Defect Model</div>
                <div className="text-[10px] text-slate-400">Gemini 2.5 Flash Vision + Edge Morphology Fallback</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              ACTIVE
            </span>
          </div>

          {/* Autonomous Fleet Mesh */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">Autonomous Rover Telemetry Stream</div>
                <div className="text-[10px] text-slate-400">Server-Sent Events (SSE) live simulation bridge</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
              STREAMING
            </span>
          </div>

          {/* Email Adapter */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200">Emergency Dispatch Email Relay</div>
                <div className="text-[10px] text-slate-400">SMTP Municipal Infrastructure Adapter</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-bold border border-cyan-800">
              CONFIGURED
            </span>
          </div>
        </div>

        {/* Demo Mode Quick Scenario Resets */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-slate-300 font-bold text-xs">Demo Environment Preset Scenarios</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                onResetScenario('default');
                onClose();
              }}
              className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left transition-colors"
            >
              <div className="font-bold text-slate-200">Default Baseline</div>
              <div className="text-[10px] text-slate-400">Standard 6-bridge inventory</div>
            </button>
            <button
              onClick={() => {
                onResetScenario('scenario-pass');
                onClose();
              }}
              className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left transition-colors"
            >
              <div className="font-bold text-emerald-400">Scenario 1: Pass</div>
              <div className="text-[10px] text-slate-400">Rover verified crack seal</div>
            </button>
            <button
              onClick={() => {
                onResetScenario('default');
                onClose();
              }}
              className="p-2.5 rounded bg-slate-900 border border-slate-800 hover:border-rose-500 text-left transition-colors"
            >
              <div className="font-bold text-rose-400">Scenario 2: Residual</div>
              <div className="text-[10px] text-slate-400">Defect remains visible</div>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
