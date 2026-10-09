import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Satellite, 
  AlertTriangle, 
  Cpu, 
  Eye, 
  Search, 
  Layers, 
  Plus, 
  Compass, 
  Filter, 
  CheckCircle2,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Bridge, RepairVehicle, InspectionPriority } from '../../types';
import { api } from '../../services/api';

interface BridgeMapProps {
  bridges: Bridge[];
  vehicles: RepairVehicle[];
  selectedBridgeId?: string;
  onSelectBridge: (bridgeId: string) => void;
  onOpenBridgeDetails: (bridge: Bridge) => void;
  onNavigateTab: (tab: string) => void;
  onRefreshBridges: () => void;
}

// Map center adjuster hook
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
};

export const BridgeMap: React.FC<BridgeMapProps> = ({
  bridges,
  vehicles,
  selectedBridgeId,
  onSelectBridge,
  onOpenBridgeDetails,
  onNavigateTab,
  onRefreshBridges
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showThermalOverlay, setShowThermalOverlay] = useState(true);
  const [isDiscoveringOSM, setIsDiscoveringOSM] = useState(false);
  const [discoveredBridges, setDiscoveredBridges] = useState<any[]>([]);
  const [showOverpassModal, setShowOverpassModal] = useState(false);
  const [addBridgeModal, setAddBridgeModal] = useState(false);
  const [newBridgeForm, setNewBridgeForm] = useState({
    name: '',
    lat: '37.7749',
    lng: '-122.4194',
    city: 'San Francisco',
    stateCountry: 'California, USA',
    structureType: 'Concrete Box Girder' as const,
    deckWidthMeters: 28,
    lengthMeters: 800
  });

  const selectedBridge = bridges.find(b => b.id === selectedBridgeId) || bridges[0];
  const mapCenter: [number, number] = selectedBridge
    ? [selectedBridge.location.lat, selectedBridge.location.lng]
    : [37.8282, -122.4828];

  const filteredBridges = bridges.filter(b => {
    if (priorityFilter !== 'All' && b.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.location.city.toLowerCase().includes(q);
    }
    return true;
  });

  // Custom DivIcons for Bridge Markers
  const createBridgeIcon = (bridge: Bridge, isSelected: boolean) => {
    let colorClass = 'bg-emerald-500 border-emerald-300';
    let ringClass = 'ring-emerald-500/30';
    if (bridge.priority === 'Priority Inspection') {
      colorClass = 'bg-rose-500 border-rose-300 animate-pulse';
      ringClass = 'ring-rose-500/50';
    } else if (bridge.priority === 'Review Recommended') {
      colorClass = 'bg-amber-500 border-amber-300';
      ringClass = 'ring-amber-500/40';
    } else if (bridge.priority === 'Insufficient Data') {
      colorClass = 'bg-purple-500 border-purple-300';
      ringClass = 'ring-purple-500/30';
    }

    return L.divIcon({
      className: 'custom-bridge-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full ${colorClass} border-2 flex items-center justify-center text-slate-950 font-black shadow-lg ring-4 ${ringClass} ${isSelected ? 'scale-125 ring-cyan-400' : ''}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14M2 19h20M9 9h6M9 13h6"/></svg>
          </div>
          ${bridge.thermalAnomalyDetected ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 border border-white rounded-full animate-ping"></span>' : ''}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  // Custom DivIcon for Repair Vehicles
  const createVehicleIcon = (vehicle: RepairVehicle) => {
    return L.divIcon({
      className: 'custom-vehicle-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-lg bg-cyan-600 border-2 border-cyan-300 flex items-center justify-center text-white shadow-xl ring-4 ring-cyan-500/30 animate-bounce">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="14" x="3" y="5" rx="2"/><line x1="7" x2="7" y1="9" y2="9.01"/><line x1="17" x2="17" y1="9" y2="9.01"/><path d="M7 15h10"/></svg>
          </div>
          <span class="absolute -bottom-4 px-1 py-0.2 bg-slate-900 border border-cyan-500 text-[9px] font-mono text-cyan-300 rounded whitespace-nowrap">${vehicle.code}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const handleDiscoverOverpass = async () => {
    setIsDiscoveringOSM(true);
    setShowOverpassModal(true);
    try {
      const results = await api.discoverOverpassBridges(selectedBridge.location.lat, selectedBridge.location.lng, 15);
      setDiscoveredBridges(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiscoveringOSM(false);
    }
  };

  const handleImportOSMBridge = async (osm: any) => {
    await api.createBridge({
      name: osm.name,
      location: {
        lat: osm.lat,
        lng: osm.lng,
        city: selectedBridge.location.city,
        stateCountry: selectedBridge.location.stateCountry
      },
      structureType: osm.structureType || 'Steel Truss',
      deckWidthMeters: osm.deckWidthMeters || 24,
      lengthMeters: osm.lengthMeters || 600
    });
    setShowOverpassModal(false);
    onRefreshBridges();
  };

  const handleCreateCustomBridge = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createBridge({
      name: newBridgeForm.name,
      location: {
        lat: Number(newBridgeForm.lat),
        lng: Number(newBridgeForm.lng),
        city: newBridgeForm.city,
        stateCountry: newBridgeForm.stateCountry
      },
      structureType: newBridgeForm.structureType,
      deckWidthMeters: Number(newBridgeForm.deckWidthMeters),
      lengthMeters: Number(newBridgeForm.lengthMeters)
    });
    setAddBridgeModal(false);
    onRefreshBridges();
  };

  return (
    <div className="relative h-[calc(100vh-8.5rem)] rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Map Controls Bar */}
      <div className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bridges on map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded px-2 py-1">
            <span className="text-slate-400">Risk:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none text-xs"
            >
              <option value="All" className="bg-slate-900">All Risk Tiers</option>
              <option value="Priority Inspection" className="bg-slate-900">Priority Inspection</option>
              <option value="Review Recommended" className="bg-slate-900">Review Recommended</option>
              <option value="Routine Monitoring" className="bg-slate-900">Routine Monitoring</option>
              <option value="Insufficient Data" className="bg-slate-900">Insufficient Data</option>
            </select>
          </div>

          <button
            onClick={() => setShowThermalOverlay(!showThermalOverlay)}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded border transition-colors flex items-center gap-1.5 ${
              showThermalOverlay
                ? 'bg-rose-950/60 text-rose-300 border-rose-700/60 shadow-sm shadow-rose-950'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Thermal Anomaly Layer {showThermalOverlay ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleDiscoverOverpass}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900/80 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Overpass OSM Discovery</span>
          </button>

          <button
            onClick={() => setAddBridgeModal(true)}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bridge</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%', background: '#0b1120' }}
          zoomControl={true}
        >
          <MapRecenter center={mapCenter} />

          {/* CartoDB Dark Matter Tiles for aerospace/GIS aesthetic */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {/* Render Bridge Markers */}
          {filteredBridges.map((b) => {
            const isSelected = b.id === selectedBridgeId;
            return (
              <React.Fragment key={b.id}>
                <Marker
                  position={[b.location.lat, b.location.lng]}
                  icon={createBridgeIcon(b, isSelected)}
                  eventHandlers={{
                    click: () => onSelectBridge(b.id)
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs space-y-2 max-w-xs font-sans">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-sm text-cyan-300">{b.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {b.code} &bull; {b.structureType} ({b.deckWidthMeters}m deck)
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span>Risk Tier:</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          b.priority === 'Priority Inspection' ? 'text-rose-400 bg-rose-950/60' : 'text-emerald-400 bg-emerald-950/60'
                        }`}>
                          {b.priority}
                        </span>
                      </div>
                      {b.thermalAnomalyDetected && (
                        <div className="p-1.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[10px] font-mono flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>Satellite surface anomaly flagged!</span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => onOpenBridgeDetails(b)}
                          className="flex-1 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] text-center"
                        >
                          Deep Inspection
                        </button>
                        <button
                          onClick={() => {
                            onSelectBridge(b.id);
                            onNavigateTab('satellite');
                          }}
                          className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] text-center"
                        >
                          Satellite ST
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Simulated Thermal Anomaly Ground Footprint */}
                {showThermalOverlay && b.thermalAnomalyDetected && (
                  <Circle
                    center={[b.location.lat, b.location.lng]}
                    radius={350}
                    pathOptions={{
                      color: '#f43f5e',
                      fillColor: '#ef4444',
                      fillOpacity: 0.25,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Render Autonomous Repair Vehicles */}
          {vehicles.map((v) => (
            <Marker
              key={v.id}
              position={[v.currentLat, v.currentLng]}
              icon={createVehicleIcon(v)}
            >
              <Popup>
                <div className="p-2.5 bg-slate-900 text-slate-100 rounded text-xs space-y-1.5 font-sans">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    {v.name} ({v.code})
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    State: <span className="text-emerald-400 font-semibold">{v.currentState}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Battery: {v.batteryPct.toFixed(0)}% &bull; Speed: {v.speedKmh} km/h
                  </div>
                  <button
                    onClick={() => onNavigateTab('vehicles')}
                    className="w-full mt-1 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-mono text-center"
                  >
                    Open Vehicle Cockpit &rarr;
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Bridge Quick Selector Panel */}
        <div className="absolute bottom-4 left-4 z-[1000] w-72 max-h-56 overflow-y-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl space-y-1.5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-1 flex items-center justify-between">
            <span>Bridges On Canvas ({filteredBridges.length})</span>
            <span className="text-cyan-400">Click to Recenter</span>
          </div>
          {filteredBridges.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBridge(b.id)}
              className={`w-full text-left p-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                b.id === selectedBridgeId
                  ? 'bg-cyan-950/80 border border-cyan-500/60 text-cyan-200'
                  : 'bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="truncate mr-2">
                <div className="font-semibold truncate">{b.name}</div>
                <div className="text-[10px] text-slate-400">{b.location.city}</div>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                b.priority === 'Priority Inspection' ? 'bg-rose-500' :
                b.priority === 'Review Recommended' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
            </button>
          ))}
        </div>
      </div>

      {/* Overpass API Modal */}
      {showOverpassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">OpenStreetMap Overpass Bridge Discovery</h3>
              </div>
              <button
                onClick={() => setShowOverpassModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                Close &times;
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Querying live OpenStreetMap API around coordinates <span className="font-mono text-cyan-300">{selectedBridge.location.lat.toFixed(4)}, {selectedBridge.location.lng.toFixed(4)}</span>:
            </p>

            {isDiscoveringOSM ? (
              <div className="py-8 text-center text-xs font-mono text-cyan-300 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Executing Overpass QL Query (bridge=yes)...</span>
              </div>
            ) : discoveredBridges.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {discoveredBridges.map((osm, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-bold text-slate-200">{osm.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {osm.structureType} &bull; Width: {osm.deckWidthMeters}m &bull; Length: {osm.lengthMeters}m
                      </div>
                    </div>
                    <button
                      onClick={() => handleImportOSMBridge(osm)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold"
                    >
                      Import to DB
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">
                No new unmapped bridge geometries returned within radius.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Bridge Modal */}
      {addBridgeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomBridge} className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Register New Bridge Asset
              </h3>
              <button
                type="button"
                onClick={() => setAddBridgeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Bridge Name</label>
                <input
                  required
                  type="text"
                  value={newBridgeForm.name}
                  onChange={(e) => setNewBridgeForm({ ...newBridgeForm, name: e.target.value })}
                  placeholder="e.g. Chesapeake Bay Bridge Viaduct"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={newBridgeForm.lat}
                    onChange={(e) => setNewBridgeForm({ ...newBridgeForm, lat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={newBridgeForm.lng}
                    onChange={(e) => setNewBridgeForm({ ...newBridgeForm, lng: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">City / Region</label>
                  <input
                    required
                    type="text"
                    value={newBridgeForm.city}
                    onChange={(e) => setNewBridgeForm({ ...newBridgeForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Deck Width (m)</label>
                  <input
                    required
                    type="number"
                    value={newBridgeForm.deckWidthMeters}
                    onChange={(e) => setNewBridgeForm({ ...newBridgeForm, deckWidthMeters: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Structural Type</label>
                <select
                  value={newBridgeForm.structureType}
                  onChange={(e: any) => setNewBridgeForm({ ...newBridgeForm, structureType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                >
                  <option value="Suspension">Suspension</option>
                  <option value="Cable-Stayed">Cable-Stayed</option>
                  <option value="Concrete Box Girder">Concrete Box Girder</option>
                  <option value="Steel Truss">Steel Truss</option>
                  <option value="Arch Bridge">Arch Bridge</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddBridgeModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              >
                Register Bridge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
