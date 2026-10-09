import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Layers, 
  Search, 
  Crosshair, 
  Maximize2, 
  Eye, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Battery,
  Wifi,
  Cpu,
  Info
} from 'lucide-react';
import { Bridge, RepairVehicle, RouteWaypoint } from '../../types';

interface LiveOperationMapProps {
  bridges: Bridge[];
  vehicle: RepairVehicle;
  destinationBridge: Bridge;
  routeWaypoints: RouteWaypoint[];
  routeProgressPct: number;
  onSelectBridge: (bridgeId: string) => void;
  onAssignBridgeToVehicle: (bridgeId: string) => void;
  onCenterVehicle: () => void;
  showRoute?: boolean;
}

// Controller to auto-pan / center map
const MapAutoRecenter: React.FC<{ center: [number, number]; zoom?: number; shouldFollow: boolean }> = ({ center, zoom, shouldFollow }) => {
  const map = useMap();
  useEffect(() => {
    if (shouldFollow) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, shouldFollow, map]);
  return null;
};

export const LiveOperationMap: React.FC<LiveOperationMapProps> = ({
  bridges,
  vehicle,
  destinationBridge,
  routeWaypoints,
  routeProgressPct,
  onSelectBridge,
  onAssignBridgeToVehicle,
  onCenterVehicle,
  showRoute = true
}) => {
  const [followVehicle, setFollowVehicle] = useState(true);
  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [showLegend, setShowLegend] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic Tile URL based on layer
  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  // Custom DivIcon for Autonomous Rover with Live Heading Indicator
  const createRoverIcon = (v: RepairVehicle) => {
    // Heading in degrees
    const heading = v.speedKmh > 0 ? (v.currentState === 'Traveling to Site' ? 320 : 45) : 0;
    return L.divIcon({
      className: 'rover-map-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <!-- Pulse radar ring -->
          <span class="absolute w-12 h-12 rounded-full bg-cyan-400/20 border border-cyan-400/50 animate-ping pointer-events-none"></span>
          
          <!-- Rover Core Hexagon -->
          <div class="w-9 h-9 rounded-xl bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-2xl ring-4 ring-cyan-500/30 transform transition-transform duration-300" style="transform: rotate(${heading}deg);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>

          <!-- Live Label Pill -->
          <div class="absolute -bottom-5 px-1.5 py-0.2 bg-slate-950/90 border border-cyan-500 text-[9px] font-mono font-bold text-cyan-300 rounded shadow whitespace-nowrap">
            ${v.code} (${v.taskProgressPct.toFixed(0)}%)
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  // Custom DivIcon for Bridges
  const createBridgeIcon = (bridge: Bridge, isDestination: boolean) => {
    const isPriority = bridge.priority === 'Priority Inspection';
    const isReview = bridge.priority === 'Review Recommended';

    const colorClass = isPriority 
      ? 'bg-rose-500 border-rose-300 ring-rose-500/50' 
      : isReview 
      ? 'bg-amber-500 border-amber-300 ring-amber-500/40' 
      : 'bg-emerald-500 border-emerald-300 ring-emerald-500/30';

    return L.divIcon({
      className: 'bridge-map-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full ${colorClass} border-2 flex items-center justify-center text-slate-950 font-black shadow-lg ring-4 ${isDestination ? 'scale-125 ring-cyan-400 border-cyan-300' : ''}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14M2 19h20M9 9h6M9 13h6"/></svg>
          </div>
          ${isDestination ? '<span class="absolute -top-6 px-1.5 py-0.5 bg-cyan-600 text-[8px] font-mono text-white rounded font-bold shadow">DESTINATION</span>' : ''}
          ${bridge.thermalAnomalyDetected ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 border border-white rounded-full animate-ping"></span>' : ''}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  const polylineCoords: [number, number][] = routeWaypoints.map(w => [w.lat, w.lng]);

  const filteredBridges = bridges.filter(b => {
    if (filterPriority !== 'All' && b.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.location.city.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Top Map Control Bar */}
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2 z-10 text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search bridge coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Layer Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-[11px]">
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2 py-0.5 rounded ${mapLayer === 'dark' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2 py-0.5 rounded ${mapLayer === 'satellite' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapLayer('streets')}
              className={`px-2 py-0.5 rounded ${mapLayer === 'streets' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
            >
              OSM
            </button>
          </div>

          {/* Follow Rover Toggle */}
          <button
            onClick={() => {
              setFollowVehicle(!followVehicle);
              if (!followVehicle) onCenterVehicle();
            }}
            className={`px-2.5 py-1 rounded border flex items-center gap-1 transition-colors ${
              followVehicle ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Center Rover</span>
          </button>

          {/* Legend Toggle */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`px-2 py-1 rounded border flex items-center gap-1 ${
              showLegend ? 'bg-slate-800 text-cyan-300 border-cyan-700' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Legend</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Toggle Map Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={[vehicle.currentLat, vehicle.currentLng]}
          zoom={14}
          style={{ height: '100%', width: '100%', background: '#060b14' }}
          zoomControl={true}
        >
          <MapAutoRecenter
            center={[vehicle.currentLat, vehicle.currentLng]}
            shouldFollow={followVehicle}
          />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url={tileUrls[mapLayer]}
            maxZoom={19}
          />

          {/* Demonstration Navigation Route Line */}
          {showRoute && polylineCoords.length > 1 && (
            <>
              {/* Outer Cyan Glow Track */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: '#06b6d4',
                  weight: 6,
                  opacity: 0.35,
                  lineCap: 'round'
                }}
              />
              {/* Core Route Line with Dashes */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 3,
                  opacity: 0.9,
                  dashArray: '8, 8'
                }}
              />
            </>
          )}

          {/* Render Autonomous Rover Marker */}
          <Marker
            position={[vehicle.currentLat, vehicle.currentLng]}
            icon={createRoverIcon(vehicle)}
            zIndexOffset={1000}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs space-y-2 max-w-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-sm text-cyan-300">{vehicle.name}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{vehicle.currentState}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  ID: <span className="text-white">{vehicle.code}</span> &bull; Model: {vehicle.model}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 p-2 rounded border border-slate-800">
                  <div>Battery: <span className="text-emerald-400 font-bold">{vehicle.batteryPct.toFixed(0)}%</span></div>
                  <div>Velocity: <span className="text-cyan-300 font-bold">{vehicle.speedKmh} km/h</span></div>
                  <div>Link: <span className="text-slate-300">{vehicle.connectivity}</span></div>
                  <div>Progress: <span className="text-cyan-300 font-bold">{vehicle.taskProgressPct.toFixed(0)}%</span></div>
                </div>
                <div className="text-[10px] text-slate-400">
                  Target: <span className="text-cyan-300 font-semibold">{destinationBridge.name}</span>
                </div>
                <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                  GPS: {vehicle.currentLat.toFixed(6)}, {vehicle.currentLng.toFixed(6)} (Simulated)
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Render Bridge Infrastructure Markers */}
          {filteredBridges.map((b) => {
            const isDest = b.id === destinationBridge.id;
            return (
              <React.Fragment key={b.id}>
                <Marker
                  position={[b.location.lat, b.location.lng]}
                  icon={createBridgeIcon(b, isDest)}
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
                        <div className="p-1 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[10px] font-mono flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>Satellite surface anomaly flagged!</span>
                        </div>
                      )}
                      <div className="pt-1">
                        <button
                          onClick={() => onAssignBridgeToVehicle(b.id)}
                          className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold text-center transition-colors"
                        >
                          Assign Rover to this Bridge &rarr;
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Thermal anomaly footprint circle */}
                {b.thermalAnomalyDetected && (
                  <Circle
                    center={[b.location.lat, b.location.lng]}
                    radius={280}
                    pathOptions={{
                      color: '#f43f5e',
                      fillColor: '#ef4444',
                      fillOpacity: 0.2,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Live Coordinate HUD Overlay */}
        {showCoordinates && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-xl">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Compass className="w-3 h-3" /> ROVER TELEMETRY:
            </span>
            <span>LAT: {vehicle.currentLat.toFixed(5)}</span>
            <span>LNG: {vehicle.currentLng.toFixed(5)}</span>
            <span className="text-slate-400">ROUTE PROGRESS: <strong className="text-cyan-300">{routeProgressPct.toFixed(0)}%</strong></span>
          </div>
        )}

        {/* Interactive Map Legend Overlay */}
        {showLegend && (
          <div className="absolute top-14 right-3 z-[1000] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs font-mono space-y-2 shadow-2xl max-w-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-200 font-bold text-[11px]">
              <span>MAP SYMBOLOGY</span>
              <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white" />
                <span>Autonomous Rover TX-4 (Active Location)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 bg-cyan-400 rounded" />
                <span>Simulated Transit Route Track</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300" />
                <span>Priority Inspection Bridge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300" />
                <span>Review Recommended Bridge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300" />
                <span>Routine Monitoring / Safe Bridge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border border-dashed border-rose-500 bg-rose-500/20" />
                <span>Satellite Thermal Anomaly Footprint</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
