import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Satellite, 
  ScanSearch, 
  AlertTriangle, 
  Cpu, 
  CheckCircle, 
  BarChart3, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  Globe2 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  badges: {
    requiringInspection: number;
    pendingVerification: number;
    activeVehicles: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  badges
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { 
      id: 'operations', 
      label: 'Live Vehicle Tracking', 
      icon: Radio,
      badge: 'SPLIT-OPS',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    },
    { 
      id: 'simulator3d', 
      label: '3D Vehicle Simulator', 
      icon: Cpu,
      badge: '3D LAB',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    },
    { id: 'map', label: 'Bridge Map', icon: MapIcon },
    { id: 'satellite', label: 'Satellite Observations', icon: Satellite },
    { 
      id: 'defects', 
      label: 'AI Defect Inspection', 
      icon: ScanSearch,
      badge: badges.requiringInspection > 0 ? badges.requiringInspection : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    },
    { id: 'priority', label: 'Risk Prioritization', icon: AlertTriangle },
    { 
      id: 'vehicles', 
      label: 'Repair Missions', 
      icon: Cpu,
      badge: badges.activeVehicles > 0 ? `${badges.activeVehicles} LIVE` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    },
    { 
      id: 'verification', 
      label: 'Verification Center', 
      icon: CheckCircle,
      badge: badges.pendingVerification > 0 ? badges.pendingVerification : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: History }
  ];

  return (
    <aside
      className={`relative z-30 flex flex-col justify-between bg-slate-950 border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Nav List */}
      <div className="py-4">
        <div className="flex items-center justify-between px-3 mb-3">
          {!collapsed && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Operations Center
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors ml-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-700/50 shadow-md shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="tracking-tight">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                NASA Landsat C2
              </span>
              <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                Copernicus Hub
              </span>
              <span className="text-emerald-400 text-[10px]">SYNCED</span>
            </div>
            <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
              Rover Mesh: 3 Active Units
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Telemetry Live" />
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
