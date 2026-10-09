import React, { useState } from 'react';
import { 
  Satellite, 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Download, 
  Search, 
  Info, 
  ExternalLink,
  Layers,
  Thermometer,
  CloudRain,
  Maximize2
} from 'lucide-react';
import { Bridge, SatelliteObservation } from '../../types';
import { api } from '../../services/api';

interface SatelliteScreeningProps {
  bridges: Bridge[];
  selectedBridgeId: string;
  onSelectBridge: (id: string) => void;
  observations: SatelliteObservation[];
  onRefreshObservations: () => void;
  onNavigateTab: (tab: string) => void;
}

export const SatelliteScreening: React.FC<SatelliteScreeningProps> = ({
  bridges,
  selectedBridgeId,
  onSelectBridge,
  observations,
  onRefreshObservations,
  onNavigateTab
}) => {
  const [selectedSensor, setSelectedSensor] = useState<'Landsat-9 TIRS-2' | 'Landsat-8 TIRS' | 'Sentinel-3 SLSTR'>('Landsat-9 TIRS-2');
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeObservationId, setActiveObservationId] = useState<string | null>(null);

  const selectedBridge = bridges.find(b => b.id === selectedBridgeId) || bridges[0];
  const bridgeObservations = observations.filter(o => o.bridgeId === selectedBridge.id);
  const currentObservation = bridgeObservations.find(o => o.id === activeObservationId) || bridgeObservations[0] || observations[0];

  // Sensor GSD resolution
  const sensorGsd = selectedSensor === 'Sentinel-3 SLSTR' ? 1000 : 30;
  const isResolutionSufficient = selectedBridge ? selectedBridge.deckWidthMeters >= (sensorGsd * 0.7) : true;

  const handleRunThermalScreening = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await api.analyzeThermal({
        bridgeId: selectedBridge.id,
        sensor: selectedSensor,
        rawTempKelvin: 298.65, // ~25.5°C
        baselineTempCelsius: 21.3,
        cloudCoverPct: 4.2
      });
      setAnalysisResult(res);
      onRefreshObservations();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [selectedBridge.location.lng, selectedBridge.location.lat]
          },
          properties: {
            bridgeId: selectedBridge.id,
            name: selectedBridge.name,
            sensor: selectedSensor,
            deckWidthMeters: selectedBridge.deckWidthMeters,
            resolutionSuitability: isResolutionSufficient ? 'PASS' : 'FAIL',
            observation: currentObservation
          }
        }
      ]
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thermalpulse_${selectedBridge.code}_observation.geojson`;
    a.click();
  };

  // Color helper for 5x5 thermal grid cells
  const getThermalCellColor = (tempC: number, baseline: number) => {
    const delta = tempC - baseline;
    if (delta > 3.5) return 'bg-rose-600 text-white font-bold';
    if (delta > 2.0) return 'bg-orange-500 text-slate-950 font-semibold';
    if (delta > 0.8) return 'bg-amber-400 text-slate-950';
    if (delta > -0.5) return 'bg-cyan-900/60 text-cyan-200';
    return 'bg-blue-950/80 text-blue-300';
  };

  return (
    <div className="space-y-5">
      {/* Top Header & USGS/Copernicus Info */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
              Spaceborne Thermography Pipeline
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
              DEMO DATA ENGINE ACTIVE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Satellite className="w-5 h-5 text-cyan-400" />
            Landsat Collection 2 L2 & Copernicus Thermal Screening
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Ingests USGS Landsat Collection 2 Level-2 Surface Temperature (ST) products and Copernicus Sentinel-3 SLSTR.
            Identifies surface temperature differentials ($\Delta T$) against reference roadway baselines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportGeoJSON}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export GeoJSON</span>
          </button>
          <a
            href="https://www.usgs.gov/landsat-missions/landsat-collection-2"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-mono flex items-center gap-1.5 border border-cyan-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>USGS Specs</span>
          </a>
        </div>
      </div>

      {/* Bridge Selector & Resolution Suitability Gatekeeper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Target Bridge Infrastructure</label>
            <select
              value={selectedBridgeId}
              onChange={(e) => onSelectBridge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              {bridges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.deckWidthMeters}m deck) &bull; {b.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">Earth Observation Sensor</label>
            <select
              value={selectedSensor}
              onChange={(e: any) => setSelectedSensor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="Landsat-9 TIRS-2">Landsat-9 TIRS-2 (30m L2 Resampled ST)</option>
              <option value="Landsat-8 TIRS">Landsat-8 TIRS (30m L2 Resampled ST)</option>
              <option value="Sentinel-3 SLSTR">Sentinel-3 SLSTR (1000m Native Thermal IR)</option>
            </select>
          </div>

          {/* Explicit Resolution Suitability Check (Requirement) */}
          <div className="p-3.5 rounded-lg border bg-slate-950/60 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Deck Width:</span>
              <span className="font-bold text-slate-200">{selectedBridge?.deckWidthMeters} meters</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Sensor Pixel GSD:</span>
              <span className="font-bold text-slate-200">{sensorGsd} meters</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              {isResolutionSufficient ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Resolution Sufficient for Bridge Footprint</span>
                </div>
              ) : (
                <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Insufficient spatial resolution for bridge-level thermal assessment.</span>
                  </div>
                  <p className="text-[10px] text-rose-300 font-sans leading-tight">
                    Deck width ({selectedBridge?.deckWidthMeters}m) is smaller than sensor pixel ({sensorGsd}m). Pixel values reflect water/ground background rather than structure.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleRunThermalScreening}
            disabled={isAnalyzing}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Flame className="w-4 h-4 text-amber-300" />
            )}
            <span>Execute Level-2 Thermal Analysis</span>
          </button>

          {/* Scientific Disclaimer Requirement */}
          <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 leading-relaxed font-sans">
            <strong>Geospatial Rule:</strong> Thermal anomalies are strictly labeled as <em>unusual temperature observations</em>, not confirmed structural cracks. Ground inspection is required before structural conclusions.
          </div>
        </div>

        {/* Observation Results & Thermal Matrix Display */}
        <div className="lg:col-span-2 space-y-4">
          {/* Analysis Warning Banner if failed */}
          {analysisResult?.resolutionSuitability === 'FAILED' && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs font-mono space-y-1">
              <div className="font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                {analysisResult.warning}
              </div>
              <p className="text-[11px] text-rose-300/80 font-sans">
                {analysisResult.details?.explanation}
              </p>
            </div>
          )}

          {/* Detailed Observation Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Scene: {currentObservation?.sceneId || 'LC09_L2SP_044034_20261004_02_T1'}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {currentObservation?.sensor || 'Landsat-9 TIRS-2'} Level-2 Surface Observation
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                Acquired: {new Date(currentObservation?.acquisitionDate || Date.now()).toLocaleDateString()}
              </span>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Deck Surface Temp</span>
                <span className="text-lg font-bold text-cyan-300">
                  {currentObservation?.surfaceTemperatureCelsius ?? 25.5}&deg;C
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ({currentObservation?.surfaceTemperatureKelvin ?? 298.65} K)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Roadway Baseline</span>
                <span className="text-lg font-bold text-slate-200">
                  {currentObservation?.baselineTempCelsius ?? 21.3}&deg;C
                </span>
                <span className="text-[10px] text-slate-400 block">Surrounding ref</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Thermal Differential (&Delta;T)</span>
                <span className={`text-lg font-bold ${
                  (currentObservation?.temperatureAnomalyDeltaC ?? 4.2) > 2.5 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  +{(currentObservation?.temperatureAnomalyDeltaC ?? 4.2)}&deg;C
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {(currentObservation?.temperatureAnomalyDeltaC ?? 4.2) > 2.5 ? 'ANOMALOUS' : 'NOMINAL'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Cloud Cover</span>
                <span className="text-lg font-bold text-slate-200">
                  {currentObservation?.cloudCoverPct ?? 4.2}%
                </span>
                <span className="text-[10px] text-emerald-400 block">Cloud-free deck</span>
              </div>
            </div>

            {/* 5x5 False-Color Surface Temperature Grid */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-400" />
                  5&times;5 Resampled Pixel Matrix Overlay (Center = Bridge Deck Polygon)
                </span>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded bg-blue-950 border border-blue-700" /> Baseline (~21&deg;)
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Warm (~23&deg;)
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded bg-rose-600" /> Hot Anomaly (&ge;25&deg;)
                  </span>
                </div>
              </div>

              {/* Render Matrix */}
              <div className="grid grid-cols-5 gap-1.5 max-w-sm mx-auto p-2 bg-slate-900 rounded-lg border border-slate-800">
                {(currentObservation?.thermalGrid || [
                  [21.1, 21.4, 21.2, 21.5, 21.3],
                  [21.4, 23.8, 25.1, 24.0, 21.6],
                  [21.2, 24.9, 25.5, 25.2, 21.4],
                  [21.5, 23.5, 24.8, 23.7, 21.5],
                  [21.0, 21.3, 21.2, 21.4, 21.1]
                ]).map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-11 rounded flex flex-col items-center justify-center font-mono text-[11px] transition-transform hover:scale-105 cursor-pointer shadow-sm ${getThermalCellColor(
                        val,
                        currentObservation?.baselineTempCelsius || 21.3
                      )} ${rIdx === 2 && cIdx === 2 ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950 font-black' : ''}`}
                      title={`Pixel (${rIdx},${cIdx}): ${val}°C`}
                    >
                      <span>{val.toFixed(1)}&deg;</span>
                      {rIdx === 2 && cIdx === 2 && (
                        <span className="text-[8px] uppercase tracking-tighter">DECK</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              <p className="text-[10px] text-center font-mono text-slate-400">
                Center cell corresponds to bridge deck centroid. Elevated thermal gradient suggests potential asphalt delamination or moisture retention.
              </p>
            </div>

            {/* Quick Next Step Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-300">
                Identified candidate thermal anomaly? Correlate with ground inspection evidence.
              </span>
              <button
                onClick={() => onNavigateTab('defects')}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shrink-0 transition-colors"
              >
                Inspect Ground Photographs &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
