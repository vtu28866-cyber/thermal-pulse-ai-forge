import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Eye, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  Satellite, 
  Layers, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Navigation
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Bridge, AuditLogItem } from '../../types';

interface DashboardOverviewProps {
  bridges: Bridge[];
  auditLogs: AuditLogItem[];
  onSelectBridge: (bridgeId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenBridgeModal: (bridge: Bridge) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  bridges,
  auditLogs,
  onSelectBridge,
  onNavigateTab,
  onOpenBridgeModal
}) => {
  const totalBridges = bridges.length;
  const requiringInspection = bridges.filter(
    (b) => b.priority === 'Priority Inspection' || b.priority === 'Review Recommended'
  ).length;
  const openDefects = bridges.reduce((acc, b) => acc + b.activeDefectCount, 0);
  const activeRepairJobs = bridges.filter((b) => b.status === 'Under Repair').length;
  const awaitingVerification = bridges.filter((b) => b.status === 'Verification Pending').length;
  const verifiedCompleted = bridges.filter((b) => b.status === 'Operational').length;

  const chartData = [
    { month: 'May 2026', observations: 14, anomalies: 3, repairsCompleted: 2 },
    { month: 'Jun 2026', observations: 18, anomalies: 4, repairsCompleted: 3 },
    { month: 'Jul 2026', observations: 24, anomalies: 7, repairsCompleted: 5 },
    { month: 'Aug 2026', observations: 21, anomalies: 5, repairsCompleted: 4 },
    { month: 'Sep 2026', observations: 28, anomalies: 8, repairsCompleted: 6 },
    { month: 'Oct 2026', observations: 22, anomalies: 5, repairsCompleted: 5 }
  ];

  const metrics = [
    {
      label: 'Registered Bridges',
      value: totalBridges,
      change: '+2 this month',
      icon: Building2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/30 border-cyan-800/40',
      onClick: () => onNavigateTab('map')
    },
    {
      label: 'Requiring Inspection',
      value: requiringInspection,
      change: '2 Critical Action',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/30 border-rose-800/40',
      onClick: () => onNavigateTab('priority')
    },
    {
      label: 'Open Defect Reports',
      value: openDefects,
      change: 'Cracks & Spallings',
      icon: Eye,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/30 border-amber-800/40',
      onClick: () => onNavigateTab('defects')
    },
    {
      label: 'Active Repair Jobs',
      value: activeRepairJobs,
      change: 'Simulated Rover Fleet',
      icon: Cpu,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/30 border-blue-800/40',
      onClick: () => onNavigateTab('vehicles')
    },
    {
      label: 'Awaiting Verification',
      value: awaitingVerification,
      change: 'Human Inspector Sign-off',
      icon: Clock,
      color: 'text-amber-300',
      bgColor: 'bg-amber-950/20 border-amber-700/40',
      onClick: () => onNavigateTab('verification')
    },
    {
      label: 'Verified Safe Repairs',
      value: verifiedCompleted,
      change: '100% Closed Audits',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30 border-emerald-800/40',
      onClick: () => onNavigateTab('reports')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero SDG / Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border border-cyan-900/40 p-5 md:p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                SDG-9 Resilient Infrastructure
              </span>
              <span className="text-slate-400 text-xs font-mono">&bull; Real-time Civil Defense</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              ThermalPulse Operations Command
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Detect early thermal anomalies with Landsat & Copernicus satellite data, verify visible cracks with ground-level computer vision, and coordinate autonomous maintenance rovers with strict human verification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigateTab('operations')}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Live Vehicle Tracking</span>
            </button>
            <button
              onClick={() => onNavigateTab('simulator3d')}
              className="px-3.5 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-medium text-xs flex items-center gap-1.5 transition-all border border-purple-700/80"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              <span>3D Rover Simulator</span>
            </button>
            <button
              onClick={() => onNavigateTab('map')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GIS Map</span>
            </button>
          </div>
        </div>

        {/* 5-Step Guided Process Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div 
            onClick={() => onNavigateTab('satellite')}
            className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-cyan-900/30 cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] border border-cyan-800">1</span>
            <span className="text-slate-300 text-[11px] truncate">1. Satellite L2 ST</span>
          </div>
          <div 
            onClick={() => onNavigateTab('defects')}
            className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-cyan-900/30 cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] border border-cyan-800">2</span>
            <span className="text-slate-300 text-[11px] truncate">2. Ground CV Scan</span>
          </div>
          <div 
            onClick={() => onNavigateTab('priority')}
            className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-cyan-900/30 cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] border border-cyan-800">3</span>
            <span className="text-slate-300 text-[11px] truncate">3. Risk Scoring</span>
          </div>
          <div 
            onClick={() => onNavigateTab('operations')}
            className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-cyan-900/30 cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] border border-cyan-800">4</span>
            <span className="text-slate-300 text-[11px] truncate">4. 3D Ops & Rover</span>
          </div>
          <div 
            onClick={() => onNavigateTab('verification')}
            className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-cyan-900/30 cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] border border-cyan-800">5</span>
            <span className="text-slate-300 text-[11px] truncate">5. Human Sign-Off</span>
          </div>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              onClick={m.onClick}
              className={`p-3.5 rounded-xl border ${m.bgColor} cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 leading-tight">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">{m.value}</span>
                <div className="text-[10px] text-slate-400 mt-1 font-mono truncate">{m.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Time-Series Trend */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Satellite Thermal Observations & Repair Trend
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly Landsat/Sentinel observations vs flagged thermal anomalies vs verified repairs
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="observations"
                  name="Satellite Passes"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorObs)"
                />
                <Area
                  type="monotone"
                  dataKey="anomalies"
                  name="Thermal Anomalies"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAnom)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Status Breakdown Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Infrastructure Readiness Breakdown
            </h2>
            <p className="text-xs text-slate-400 mb-4">Current distribution by inspection risk tier</p>

            <div className="space-y-3">
              {bridges.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onOpenBridgeModal(b)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-semibold text-slate-200 truncate">{b.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{b.code} &bull; {b.location.city}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 ${
                      b.priority === 'Priority Inspection'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : b.priority === 'Review Recommended'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : b.priority === 'Insufficient Data'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {b.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('priority')}
            className="w-full mt-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <span>Open Risk Prioritization Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Live Civil Operations Event Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable pipeline events: satellite ingestions, AI defect reviews, vehicle telemetries, and human sign-offs
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('audit')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            View Full Audit Trail &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Entity ID</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Actor Role</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">{log.entityId}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 capitalize font-sans">{log.user}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans max-w-xs truncate">{log.details}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigateTab('audit')}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline text-[11px]"
                    >
                      Audit &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
