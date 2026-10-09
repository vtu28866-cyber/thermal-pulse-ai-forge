import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Camera, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  FileText, 
  ArrowRight,
  ExternalLink,
  Sliders,
  Send
} from 'lucide-react';
import { RepairJob, Bridge, UserRole } from '../../types';
import { api } from '../../services/api';

interface RepairVerificationProps {
  bridges: Bridge[];
  selectedBridgeId: string;
  onSelectBridge: (id: string) => void;
  currentRole: UserRole;
  onRefreshAll: () => void;
  onNavigateTab: (tab: string) => void;
}

export const RepairVerification: React.FC<RepairVerificationProps> = ({
  bridges,
  selectedBridgeId,
  onSelectBridge,
  currentRole,
  onRefreshAll,
  onNavigateTab
}) => {
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [verifierNotes, setVerifierNotes] = useState('');
  const [verifierName, setVerifierName] = useState('Inspector Sarah Chen, PE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const allJobs = await api.getRepairJobs();
      setJobs(allJobs);
      if (allJobs.length > 0 && !selectedJobId) {
        // Pick first pending or first job
        const pending = allJobs.find(j => j.status === 'Verification Pending');
        setSelectedJobId(pending ? pending.id : allJobs[0].id);
      }
    }
    load();
  }, [selectedBridgeId]);

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const assignedBridge = bridges.find(b => b.id === activeJob?.bridgeId) || bridges[0];

  const handleDecision = async (
    outcome:
      | 'Repair verified by authorized reviewer'
      | 'Defect remains visible; additional work required'
      | 'Unable to verify: evidence insufficient'
      | 'Manual inspection required'
  ) => {
    if (!activeJob) return;
    setIsSubmitting(true);
    try {
      await api.verifyRepair(
        activeJob.id,
        outcome,
        verifierNotes || `Evaluated by certified inspector ${verifierName}.`,
        verifierName,
        activeJob.afterImageUrl || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
      );
      onRefreshAll();
      const updated = await api.getRepairJobs();
      setJobs(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmailNotification = () => {
    setEmailStatus('Dispatching SMTP dispatch alert to Municipal Civil Engineering Department...');
    setTimeout(() => {
      setEmailStatus('Dispatched: Verification audit report sent to dot-bridge-safety@infrastructure.gov (Simulated Adapter).');
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              Human-in-the-Loop Governance
            </span>
            <span className="text-slate-400 text-xs font-mono">ASTM & DOT Verification Protocol</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Post-Repair Visual Verification & Engineer Sign-Off
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Evaluates post-cure ground crawler and drone imagery against baseline pre-repair scans.
            Robotic completion alone does not clear a defect; authorized professional engineer confirmation is required.
          </p>
        </div>

        <button
          onClick={handleSendEmailNotification}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Test Email Adapter</span>
        </button>
      </div>

      {emailStatus && (
        <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-200 text-xs font-mono">
          {emailStatus}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Jobs List */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Repair Work Orders ({jobs.length})</span>
              <span className="text-cyan-400 text-[10px]">Select to Inspect</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {jobs.map((job) => {
                const isSelected = job.id === activeJob?.id;
                const b = bridges.find(br => br.id === job.bridgeId);
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-950'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400">{job.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        job.status === 'Verification Pending' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700' :
                        job.status === 'Verified Completed' ? 'bg-emerald-950 text-emerald-300' :
                        job.status === 'Additional Work Required' ? 'bg-rose-950 text-rose-300' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 mt-1 truncate">{b?.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{job.defectSummary}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mandatory Verification Standard Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Integrity Standard
            </span>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Never automatically report that a crack is resolved simply because the vehicle&apos;s simulated task reached 100%. Field evidence must be certified by a human inspector.
            </p>
          </div>
        </div>

        {/* Center/Right: Side-by-Side Photographic Comparison & Decision Form */}
        <div className="lg:col-span-2 space-y-4">
          {activeJob ? (
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    Evaluating Job: {activeJob.id} &bull; Bridge: {assignedBridge?.code}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{assignedBridge?.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeJob.defectSummary}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Current Decision State</span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-950 text-cyan-300 border border-slate-800">
                    {activeJob.verificationOutcome || 'Awaiting Inspector Review'}
                  </span>
                </div>
              </div>

              {/* Before vs After Visual Comparison Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    PRE-REPAIR DEFECT EVIDENCE
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    POST-REPAIR CURE SCAN
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className="relative rounded-lg overflow-hidden border border-rose-900/50 bg-black aspect-video group">
                    <img
                      src={activeJob.beforeImageUrl}
                      alt="Pre-repair baseline"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 text-rose-300 text-[10px] font-mono rounded border border-rose-800">
                      Baseline: Crack Visible
                    </div>
                  </div>

                  {/* After */}
                  <div className="relative rounded-lg overflow-hidden border border-emerald-900/50 bg-black aspect-video group">
                    <img
                      src={
                        activeJob.afterImageUrl ||
                        'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt="Post-repair evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 text-emerald-300 text-[10px] font-mono rounded border border-emerald-800">
                      Post-Repair Scan (Rover TX-4 Camera)
                    </div>
                  </div>
                </div>
              </div>

              {/* Inspector Decision Actions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    Authorized Professional Inspector Sign-Off
                  </span>
                  <span className="text-slate-400 text-[11px]">ASTM D6690 Standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">Inspector / Reviewer Signature</label>
                    <input
                      type="text"
                      value={verifierName}
                      onChange={(e) => setVerifierName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Review Notes & Acoustic Observations</label>
                    <input
                      type="text"
                      value={verifierNotes}
                      onChange={(e) => setVerifierNotes(e.target.value)}
                      placeholder="e.g. Sealant cured, zero hairline fissures detected."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-sans"
                    />
                  </div>
                </div>

                {/* 4 Standard Outcomes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleDecision('Repair verified by authorized reviewer')}
                    disabled={isSubmitting}
                    className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>&quot;Repair verified by authorized reviewer&quot;</span>
                  </button>

                  <button
                    onClick={() => handleDecision('Defect remains visible; additional work required')}
                    disabled={isSubmitting}
                    className="p-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-950"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>&quot;Defect remains visible; additional work required&quot;</span>
                  </button>

                  <button
                    onClick={() => handleDecision('Unable to verify: evidence insufficient')}
                    disabled={isSubmitting}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>&quot;Unable to verify: evidence insufficient&quot;</span>
                  </button>

                  <button
                    onClick={() => handleDecision('Manual inspection required')}
                    disabled={isSubmitting}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                  >
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>&quot;Manual inspection required&quot;</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
              No repair job selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
