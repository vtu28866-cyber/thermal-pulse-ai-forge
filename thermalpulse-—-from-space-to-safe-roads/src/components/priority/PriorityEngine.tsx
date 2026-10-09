import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  Info, 
  UserCheck, 
  FileText, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Cpu,
  RotateCcw
} from 'lucide-react';
import { Bridge, BridgePriorityAssessment, InspectionPriority, UserRole } from '../../types';
import { api } from '../../services/api';

interface PriorityEngineProps {
  bridges: Bridge[];
  selectedBridgeId: string;
  onSelectBridge: (id: string) => void;
  currentRole: UserRole;
  onRefreshBridges: () => void;
  onNavigateTab: (tab: string) => void;
}

export const PriorityEngine: React.FC<PriorityEngineProps> = ({
  bridges,
  selectedBridgeId,
  onSelectBridge,
  currentRole,
  onRefreshBridges,
  onNavigateTab
}) => {
  const [assessment, setAssessment] = useState<BridgePriorityAssessment | null>(null);
  const [overrideModal, setOverrideModal] = useState(false);
  const [overridePriority, setOverridePriority] = useState<InspectionPriority>('Priority Inspection');
  const [overrideReason, setOverrideReason] = useState('');
  const [inspectorName, setInspectorName] = useState('Inspector Sarah Chen, PE');

  const selectedBridge = bridges.find(b => b.id === selectedBridgeId) || bridges[0];

  React.useEffect(() => {
    async function load() {
      const data = await api.getBridge(selectedBridge.id);
      if (data?.assessment) {
        setAssessment(data.assessment);
        setOverridePriority(data.assessment.priorityCategory);
      }
    }
    load();
  }, [selectedBridge.id]);

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason) return;
    try {
      await api.overridePriority(selectedBridge.id, overridePriority, inspectorName, overrideReason);
      setOverrideModal(false);
      onRefreshBridges();
      // Reload assessment
      const data = await api.getBridge(selectedBridge.id);
      if (data?.assessment) {
        setAssessment(data.assessment);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityBadgeClass = (p: InspectionPriority) => {
    switch (p) {
      case 'Priority Inspection':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-950';
      case 'Review Recommended':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950';
      case 'Insufficient Data':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-950';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              Explainable Risk Matrix
            </span>
            <span className="text-slate-400 text-xs font-mono">Multi-Factor Evidence Fusion</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Inspection Prioritization & Risk Assessment Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Fuses satellite thermal repeatability, ground computer vision defect detections, structural geometry, and traffic criticality.
            Provides human engineers with an explainable justification trail rather than an opaque black box.
          </p>
        </div>

        <button
          onClick={() => setOverrideModal(true)}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shrink-0"
        >
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Manual PE Override</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Bridge Selection & Summary Score */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-mono text-slate-400 block">Bridge Selection</label>
            <select
              value={selectedBridgeId}
              onChange={(e) => onSelectBridge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {bridges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} &bull; [{b.priority}]
                </option>
              ))}
            </select>
          </div>

          {/* Current Priority Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="text-xs font-mono text-slate-400">Current Computed Assessment</div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${getPriorityBadgeClass(assessment?.priorityCategory || selectedBridge.priority)}`}>
                {assessment?.priorityCategory || selectedBridge.priority}
              </span>
              <div className="mt-2">
                <span className="text-4xl font-black font-mono text-white">
                  {assessment?.overallScore ?? 84}
                </span>
                <span className="text-slate-400 text-xs font-mono"> / 100</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Data Quality:{' '}
                <span className="text-cyan-300 font-semibold">
                  {assessment?.dataQualityStatus || 'Adequate Quality'}
                </span>
              </div>
            </div>

            {/* Inspector Override Notice if present */}
            {assessment?.inspectorOverride && (
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Manual Override In Effect</span>
                </div>
                <div className="text-[11px] text-slate-300 font-sans">
                  By {assessment.inspectorOverride.inspectorName}: &ldquo;{assessment.inspectorOverride.reason}&rdquo;
                </div>
              </div>
            )}

            {/* Recommended Action Box */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Recommended Action
              </span>
              <p className="text-slate-200 font-sans leading-relaxed">
                {assessment?.recommendedAction || 'Immediate on-site ultrasound inspection and autonomous rover sealing dispatch.'}
              </p>
            </div>
          </div>

          {/* Mandatory Engineering Governance Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 leading-relaxed font-sans">
            <strong>Engineering Guardrail:</strong> This platform prioritizes maintenance based on visible anomaly indicators.
            It does not declare a structure safe or unsafe without certified physical nondestructive testing (NDT).
          </div>
        </div>

        {/* Center/Right: Detailed Explainable Factor Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Contributing Evidence Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Weight-adjusted scoring across satellite, ground vision, traffic volume, and sensor quality
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                Formula: Weighted Linear Sum
              </span>
            </div>

            {/* Factor Bars */}
            <div className="space-y-4">
              {(assessment?.factors || [
                { name: 'Ground-Image Defect Confirmation', weight: 35, score: 92, status: 'Critical', description: 'Inspector confirmed 14mm longitudinal deck crack with spalling.' },
                { name: 'Thermal Anomaly Repeatability', weight: 25, score: 88, status: 'Critical', description: 'Landsat-9 recorded +4.2°C delta; Landsat-8 previously recorded +2.3°C delta.' },
                { name: 'Bridge Criticality & Traffic Volume', weight: 25, score: 85, status: 'Moderate', description: 'Strategic arterial (112,000 daily vehicles) built in 1937.' },
                { name: 'Satellite Observation Quality', weight: 15, score: 70, status: 'Moderate', description: '4.2% cloud cover; clear radiometric signal over bridge polygon.' }
              ]).map((factor, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{factor.name}</span>
                      <span className="text-[10px] text-slate-400">({factor.weight}% Weight)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        factor.status === 'Critical' ? 'text-rose-400 bg-rose-950/60' :
                        factor.status === 'Moderate' ? 'text-amber-400 bg-amber-950/60' : 'text-emerald-400 bg-emerald-950/60'
                      }`}>
                        {factor.status}
                      </span>
                      <span className="font-bold text-cyan-300">{factor.score} / 100</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        factor.score >= 80 ? 'bg-gradient-to-r from-orange-500 to-rose-500' :
                        factor.score >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                        'bg-gradient-to-r from-cyan-500 to-emerald-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Uncertainty & Limitations Explanation */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Uncertainty & Resolution Context
              </span>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {assessment?.uncertaintyExplanation || 'Landsat 9 thermal resolution (30m) required sub-pixel de-mixing. High confidence supported by repeated +4.2°C thermal delta on consecutive passes.'}
              </p>
            </div>

            {/* Direct Workflow Forwarder */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-300">
                Bridge requires maintenance? Dispatch autonomous repair rover.
              </span>
              <button
                onClick={() => onNavigateTab('vehicles')}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
              >
                <span>Dispatch Autonomous Fleet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Inspector Override Modal */}
      {overrideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleApplyOverride} className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Certified Engineer Risk Override
              </h3>
              <button
                type="button"
                onClick={() => setOverrideModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Target Bridge</label>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded text-slate-200">
                  {selectedBridge.name} ({selectedBridge.code})
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">New Inspection Priority Tier</label>
                <select
                  value={overridePriority}
                  onChange={(e: any) => setOverridePriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                >
                  <option value="Priority Inspection">Priority Inspection (Immediate field crew)</option>
                  <option value="Review Recommended">Review Recommended (Secondary crawl)</option>
                  <option value="Routine Monitoring">Routine Monitoring (Nominal cycle)</option>
                  <option value="Insufficient Data">Insufficient Data (Resolution gap)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Authorized Inspector Name / PE License</label>
                <input
                  required
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Engineering Justification (Logged to Audit Trail)</label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. In-situ ultrasonic testing identified active delamination beneath wearing course..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOverrideModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              >
                Commit Override
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
