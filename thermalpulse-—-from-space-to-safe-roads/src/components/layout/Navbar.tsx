import React, { useState } from 'react';
import { 
  Satellite, 
  ShieldAlert, 
  Bell, 
  Sliders, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Cpu, 
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';
import { NotificationItem, UserRole } from '../../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: NotificationItem[];
  onNotificationsRead: () => void;
  onOpenSettings: () => void;
  onSelectBridge: (bridgeId: string) => void;
  onNavigateTab: (tab: string) => void;
  onResetScenario: (scenario: 'default' | 'scenario-pass' | 'scenario-fail') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  notifications,
  onNotificationsRead,
  onOpenSettings,
  onSelectBridge,
  onNavigateTab,
  onResetScenario
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-900/30 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
            <Satellite className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-slate-100 flex items-center gap-1.5 font-mono">
                THERMAL<span className="text-cyan-400">PULSE</span>
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded">
                v2.6 Civil Ops
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight hidden sm:block">
              From Space to Safe Roads &bull; <span className="text-slate-400">Detect Early. Inspect Smart. Repair Responsibly.</span>
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative flex-1 max-w-xs md:max-w-md hidden lg:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bridges, scenes, coordinates, work orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                onNavigateTab('map');
              }
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all font-mono"
          />
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Scenario & Demo Pill */}
          <div className="relative">
            <button
              onClick={() => setShowScenarioMenu(!showScenarioMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>DEMO SCENARIOS</span>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </button>

            {showScenarioMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 text-xs text-slate-200">
                <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800">
                  Select Interactive Flow
                </div>
                <button
                  onClick={() => {
                    onResetScenario('default');
                    setShowScenarioMenu(false);
                    onNavigateTab('dashboard');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-100">Default Baseline Inventory</div>
                    <div className="text-[11px] text-slate-400">6 bridges across US/Europe with active Landsat passes.</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onResetScenario('scenario-pass');
                    setShowScenarioMenu(false);
                    onNavigateTab('verification');
                    onSelectBridge('br-01');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2 border-t border-slate-800/60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-100">Scenario 1: Verified Repair Pass</div>
                    <div className="text-[11px] text-slate-400">Golden Gate rover completed crack seal &rarr; ready for inspector verification.</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onResetScenario('default');
                    setShowScenarioMenu(false);
                    onNavigateTab('verification');
                    onSelectBridge('br-02');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2 border-t border-slate-800/60"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-100">Scenario 2: Defect Remains Visible</div>
                    <div className="text-[11px] text-slate-400">Brooklyn Viaduct span &rarr; post-repair crawl shows residual fissure.</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Role Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <span className="hidden sm:inline-block px-2 text-slate-400 text-[11px]">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 text-xs font-medium py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              <option value="inspector" className="bg-slate-900">Inspector (PE)</option>
              <option value="administrator" className="bg-slate-900">Administrator</option>
              <option value="maintenance_operator" className="bg-slate-900">Fleet Operator</option>
            </select>
          </div>

          {/* Notification Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 text-xs overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-slate-200">Alert Center</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                      {notifications.length} Total
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onNotificationsRead}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.bridgeId) onSelectBridge(n.bridgeId);
                        if (n.linkTab) onNavigateTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className={`p-3 transition-colors cursor-pointer hover:bg-slate-800/60 ${
                        !n.read ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            n.severity === 'critical'
                              ? 'bg-rose-500'
                              : n.severity === 'warning'
                              ? 'bg-amber-400'
                              : n.severity === 'success'
                              ? 'bg-emerald-400'
                              : 'bg-cyan-400'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200 text-xs">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors"
            title="API Connections & Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
