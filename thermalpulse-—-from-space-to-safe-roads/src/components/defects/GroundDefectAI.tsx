import React, { useState } from 'react';
import { 
  Eye, 
  Upload, 
  Check, 
  X, 
  Cpu, 
  AlertTriangle, 
  Camera, 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { Bridge, InspectionImage, DefectDetection, UserRole } from '../../types';
import { api } from '../../services/api';

interface GroundDefectAIProps {
  bridges: Bridge[];
  selectedBridgeId: string;
  onSelectBridge: (id: string) => void;
  currentRole: UserRole;
  onNavigateTab: (tab: string) => void;
}

export const GroundDefectAI: React.FC<GroundDefectAIProps> = ({
  bridges,
  selectedBridgeId,
  onSelectBridge,
  currentRole,
  onNavigateTab
}) => {
  const [images, setImages] = useState<InspectionImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelResultInfo, setModelResultInfo] = useState<string | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<'Ground Photo' | 'Drone Inspection' | 'Crawler Camera'>('Ground Photo');
  const [activeTab, setActiveTab] = useState<'view' | 'compare'>('view');

  const selectedBridge = bridges.find(b => b.id === selectedBridgeId) || bridges[0];

  // Fetch images for bridge
  React.useEffect(() => {
    async function load() {
      const data = await api.getBridge(selectedBridge.id);
      if (data?.images) {
        setImages(data.images);
        if (data.images.length > 0 && !activeImageId) {
          setActiveImageId(data.images[0].id);
        }
      }
    }
    load();
  }, [selectedBridge.id]);

  const activeImage = images.find(img => img.id === activeImageId) || images[0];

  const handleRunAIDefectModel = async () => {
    if (!activeImage) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeInspectionDefects(activeImage.id);
      if (res?.data) {
        setModelResultInfo(res.modelName || 'ThermalPulse Analytical Edge-Morphology Detector v2.4 (OpenCV Baseline)');
        activeImage.detections = res.data;
        setImages([...images]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReviewDefect = async (defectId: string, decision: 'CONFIRM' | 'REJECT') => {
    if (!activeImage) return;
    try {
      await api.reviewDefect(
        activeImage.id,
        defectId,
        decision,
        currentRole === 'inspector' ? 'Inspector Sarah Chen, PE' : 'Lead Engineer Alvarez',
        decision === 'CONFIRM' ? 'Defect validated by certified civil engineer.' : 'False positive / surface discoloration.'
      );
      const updated = activeImage.detections.map(d => {
        if (d.id === defectId) {
          return {
            ...d,
            confirmedStatus: decision === 'CONFIRM' ? 'Confirmed' as const : 'Rejected' as const,
            confirmedBy: 'Inspector Sarah Chen, PE',
            confirmedAt: new Date().toISOString()
          };
        }
        return d;
      });
      activeImage.detections = updated;
      setImages([...images]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRepairOrder = async (defect: DefectDetection) => {
    try {
      await api.createRepairJob({
        bridgeId: selectedBridge.id,
        defectId: defect.id,
        defectSummary: `${defect.defectType} (${defect.severity} severity, ${(defect.confidence * 100).toFixed(0)}% AI confidence) on ${selectedBridge.name}`,
        priority: defect.severity === 'Severe' || defect.severity === 'High' ? 'Urgent' : 'Medium',
        assignedVehicleId: 'veh-tx4',
        beforeImageUrl: activeImage.imageUrl
      });
      onNavigateTab('vehicles');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl) return;
    const created = await api.uploadInspectionImage({
      bridgeId: selectedBridge.id,
      title: newImageTitle || 'Ground Bridge Deck Inspection',
      imageUrl: newImageUrl,
      sourceType: selectedSourceType,
      inspectorName: 'Inspector Sarah Chen'
    });
    setImages([created, ...images]);
    setActiveImageId(created.id);
    setUploadModal(false);
    setNewImageUrl('');
    setNewImageTitle('');
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              Ground Computer Vision Pipeline
            </span>
            <span className="text-slate-400 text-xs font-mono">Independent Evidence Stream</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Civil Infrastructure Defect & Crack Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Upload and analyze close-range photographic inspections using trained defect detection models.
            Detects visible surface cracks, asphalt potholes, concrete spalling, and deterioration before dispatching repair vehicles.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setUploadModal(true)}
            className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-900/40"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Inspection Photo</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Bridge & Photos Gallery */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-mono text-slate-400 block">Bridge Selection</label>
            <select
              value={selectedBridgeId}
              onChange={(e) => onSelectBridge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {bridges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.activeDefectCount} active defects)
                </option>
              ))}
            </select>
          </div>

          {/* Photos Thumbnails list */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Inspection Photos ({images.length})</span>
              <span className="text-[10px] text-cyan-400">Select to View</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setActiveImageId(img.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                    img.id === activeImage?.id
                      ? 'bg-cyan-950/60 border-cyan-500/60 shadow-md shadow-cyan-950'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-14 h-14 object-cover rounded border border-slate-700 shrink-0"
                  />
                  <div className="truncate flex-1">
                    <div className="text-xs font-semibold text-slate-200 truncate">{img.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{img.sourceType} &bull; {new Date(img.capturedAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                      {img.detections?.length || 0} candidate detections
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Meta Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Detection Engine</div>
            <div className="text-slate-200 font-medium">
              {modelResultInfo || 'ThermalPulse Analytical Edge-Morphology Detector v2.4 (OpenCV Baseline)'}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              Evaluates high-frequency spatial gradients, aspect ratios, and edge-connectivity. Pretrained civil defect weights.
            </p>
          </div>
        </div>

        {/* Center & Right Column: Interactive Inspection Canvas & Annotations */}
        <div className="lg:col-span-2 space-y-4">
          {activeImage ? (
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    {activeImage.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Photographed by: {activeImage.inspectorName} &bull; Source: {activeImage.sourceType}
                  </div>
                </div>

                <button
                  onClick={handleRunAIDefectModel}
                  disabled={isAnalyzing}
                  className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md shadow-cyan-900/40 flex items-center gap-1.5"
                >
                  {isAnalyzing ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  )}
                  <span>Run Defect Detection Model</span>
                </button>
              </div>

              {/* Interactive Image Canvas with Bounding Boxes */}
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
                <img
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  className="w-full h-full object-cover"
                />

                {/* Render Normalized Bounding Boxes */}
                {activeImage.detections?.map((d) => {
                  const borderColor =
                    d.confirmedStatus === 'Confirmed'
                      ? 'border-emerald-400'
                      : d.confirmedStatus === 'Rejected'
                      ? 'border-slate-500 line-through'
                      : 'border-rose-500';

                  const badgeBg =
                    d.confirmedStatus === 'Confirmed'
                      ? 'bg-emerald-600'
                      : d.confirmedStatus === 'Rejected'
                      ? 'bg-slate-700'
                      : 'bg-rose-600';

                  return (
                    <div
                      key={d.id}
                      style={{
                        position: 'absolute',
                        left: `${d.bbox.x * 100}%`,
                        top: `${d.bbox.y * 100}%`,
                        width: `${d.bbox.width * 100}%`,
                        height: `${d.bbox.height * 100}%`
                      }}
                      className={`border-2 ${borderColor} rounded transition-all bg-rose-500/10 pointer-events-auto group`}
                    >
                      <div className="absolute -top-6 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-lg whitespace-nowrap z-20"
                        style={{ backgroundColor: d.confirmedStatus === 'Confirmed' ? '#059669' : '#dc2626' }}
                      >
                        <span>{d.defectType}</span>
                        <span>({(d.confidence * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detections List & Inspector Confirmation Panel */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-slate-200">
                    Candidate Defect Regions ({activeImage.detections?.length || 0})
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Requires Authorized Engineer Review
                  </span>
                </div>

                {activeImage.detections?.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-slate-400 bg-slate-950 rounded-lg">
                    No defects currently identified on this scan. Click &quot;Run Defect Detection Model&quot; to inspect.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeImage.detections?.map((d) => (
                      <div
                        key={d.id}
                        className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          d.confirmedStatus === 'Confirmed'
                            ? 'bg-emerald-950/20 border-emerald-700/50'
                            : d.confirmedStatus === 'Rejected'
                            ? 'bg-slate-950/60 border-slate-800 opacity-60'
                            : 'bg-slate-950 border-rose-900/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{d.defectType}</span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-cyan-300">
                              Confidence: {(d.confidence * 100).toFixed(1)}%
                            </span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                              d.severity === 'Severe' || d.severity === 'High' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                            }`}>
                              {d.severity} Severity
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-1">
                            Status:{' '}
                            <span className={`font-semibold ${
                              d.confirmedStatus === 'Confirmed' ? 'text-emerald-400' :
                              d.confirmedStatus === 'Rejected' ? 'text-slate-400' : 'text-amber-400'
                            }`}>
                              {d.confirmedStatus}
                            </span>
                            {d.confirmedBy && ` by ${d.confirmedBy}`}
                          </div>
                        </div>

                        {/* Inspector Confirmation Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {d.confirmedStatus === 'Pending Review' ? (
                            <>
                              <button
                                onClick={() => handleReviewDefect(d.id, 'CONFIRM')}
                                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm Defect</span>
                              </button>
                              <button
                                onClick={() => handleReviewDefect(d.id, 'REJECT')}
                                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : d.confirmedStatus === 'Confirmed' ? (
                            <button
                              onClick={() => handleCreateRepairOrder(d)}
                              className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-900/40"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Create Repair Order &rarr;</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400">Rejected by Reviewer</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
              No inspection photograph selected. Upload a photo or select one from the left pane.
            </div>
          )}
        </div>
      </div>

      {/* Upload Photo Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUploadPhoto} className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Upload Ground Inspection Photo
              </h3>
              <button
                type="button"
                onClick={() => setUploadModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Photo Title / Zone</label>
                <input
                  required
                  type="text"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  placeholder="e.g. Deck Expansion Joint Pier 3"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Image URL or Sample</label>
                <input
                  required
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
                {/* Preset Sample Buttons */}
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1200&q=80')}
                    className="px-2 py-1 bg-slate-800 text-[10px] text-cyan-300 rounded hover:bg-slate-700"
                  >
                    Sample Asphalt Crack
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewImageUrl('https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80')}
                    className="px-2 py-1 bg-slate-800 text-[10px] text-cyan-300 rounded hover:bg-slate-700"
                  >
                    Sample Concrete Spall
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Capture Methodology</label>
                <select
                  value={selectedSourceType}
                  onChange={(e: any) => setSelectedSourceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                >
                  <option value="Ground Photo">Ground Photo (Field Inspector DSLR)</option>
                  <option value="Drone Inspection">Drone Inspection (UAV High-Res RGB)</option>
                  <option value="Crawler Camera">Crawler Camera (Robotic Underside Scan)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setUploadModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              >
                Upload & Attach
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
