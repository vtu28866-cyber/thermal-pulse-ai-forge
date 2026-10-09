import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { BridgeMap } from './components/map/BridgeMap';
import { SatelliteScreening } from './components/satellite/SatelliteScreening';
import { GroundDefectAI } from './components/defects/GroundDefectAI';
import { PriorityEngine } from './components/priority/PriorityEngine';
import { RepairVehiclePanel } from './components/vehicle/RepairVehiclePanel';
import { RepairVerification } from './components/verification/RepairVerification';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { AuditLogView } from './components/audit/AuditLogView';
import { BridgeDetailModal } from './components/bridge/BridgeDetailModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { OperationsCenter } from './components/operations/OperationsCenter';
import { VehicleSimulator3D } from './components/simulator/VehicleSimulator3D';
import { Bridge, RepairVehicle, NotificationItem, AuditLogItem, UserRole, SatelliteObservation } from './types';
import { api } from './services/api';

export default function App() {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [selectedBridgeId, setSelectedBridgeId] = useState<string>('br-01');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('inspector');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [vehicles, setVehicles] = useState<RepairVehicle[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [observations, setObservations] = useState<SatelliteObservation[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bridgeModalTarget, setBridgeModalTarget] = useState<Bridge | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initial Data Load
  const reloadData = async () => {
    try {
      const [bList, vList, nList, aList] = await Promise.all([
        api.getBridges(),
        api.getVehicles(),
        api.getNotifications(),
        api.getAuditLogs()
      ]);
      setBridges(bList);
      setVehicles(vList);
      setNotifications(nList);
      setAuditLogs(aList);

      if (bList.length > 0) {
        const obs = await api.getObservations(selectedBridgeId || bList[0].id);
        setObservations(obs);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Live SSE Telemetry Stream for Vehicles
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/vehicles/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.vehicles) {
            setVehicles(data.vehicles);
          }
        } catch (e) {
          // ignore parsing error
        }
      };
    } catch (e) {
      console.warn('SSE stream error, using polling fallback');
    }

    const interval = setInterval(async () => {
      try {
        const [vList, nList] = await Promise.all([
          api.getVehicles(),
          api.getNotifications()
        ]);
        setVehicles(vList);
        setNotifications(nList);
      } catch (err) {
        // ignore
      }
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  // Update observations when selected bridge changes
  useEffect(() => {
    if (!selectedBridgeId) return;
    api.getObservations(selectedBridgeId).then(setObservations).catch(console.error);
  }, [selectedBridgeId]);

  const handleNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleResetScenario = async (scenario: 'default' | 'scenario-pass' | 'scenario-fail') => {
    await api.resetDemoScenario(scenario);
    await reloadData();
  };

  const badges = {
    requiringInspection: bridges.filter(
      b => b.priority === 'Priority Inspection' || b.priority === 'Review Recommended'
    ).length,
    pendingVerification: bridges.filter(b => b.status === 'Verification Pending').length,
    activeVehicles: vehicles.filter(v => v.currentState === 'Repair In Progress').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        onNotificationsRead={handleNotificationsRead}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectBridge={(id) => {
          setSelectedBridgeId(id);
          const b = bridges.find(br => br.id === id);
          if (b) setBridgeModalTarget(b);
        }}
        onNavigateTab={setCurrentTab}
        onResetScenario={handleResetScenario}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          badges={badges}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7 space-y-6">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              bridges={bridges}
              auditLogs={auditLogs}
              onSelectBridge={setSelectedBridgeId}
              onNavigateTab={setCurrentTab}
              onOpenBridgeModal={setBridgeModalTarget}
            />
          )}

          {currentTab === 'operations' && (
            <OperationsCenter
              bridges={bridges}
              selectedBridgeId={selectedBridgeId}
              onSelectBridge={setSelectedBridgeId}
              currentRole={currentRole}
              onNavigateTab={setCurrentTab}
              onRefreshAll={reloadData}
            />
          )}

          {currentTab === 'simulator3d' && (
            <VehicleSimulator3D
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'map' && (
            <BridgeMap
              bridges={bridges}
              vehicles={vehicles}
              selectedBridgeId={selectedBridgeId}
              onSelectBridge={setSelectedBridgeId}
              onOpenBridgeDetails={setBridgeModalTarget}
              onNavigateTab={setCurrentTab}
              onRefreshBridges={reloadData}
            />
          )}

          {currentTab === 'satellite' && (
            <SatelliteScreening
              bridges={bridges}
              selectedBridgeId={selectedBridgeId}
              onSelectBridge={setSelectedBridgeId}
              observations={observations}
              onRefreshObservations={reloadData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'defects' && (
            <GroundDefectAI
              bridges={bridges}
              selectedBridgeId={selectedBridgeId}
              onSelectBridge={setSelectedBridgeId}
              currentRole={currentRole}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'priority' && (
            <PriorityEngine
              bridges={bridges}
              selectedBridgeId={selectedBridgeId}
              onSelectBridge={setSelectedBridgeId}
              currentRole={currentRole}
              onRefreshBridges={reloadData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'vehicles' && (
            <RepairVehiclePanel
              bridges={bridges}
              vehicles={vehicles}
              selectedBridgeId={selectedBridgeId}
              currentRole={currentRole}
              onRefreshVehicles={reloadData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'verification' && (
            <RepairVerification
              bridges={bridges}
              selectedBridgeId={selectedBridgeId}
              onSelectBridge={setSelectedBridgeId}
              currentRole={currentRole}
              onRefreshAll={reloadData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsAnalytics
              bridges={bridges}
            />
          )}

          {currentTab === 'audit' && (
            <AuditLogView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <BridgeDetailModal
        bridge={bridgeModalTarget}
        onClose={() => setBridgeModalTarget(null)}
        onNavigateTab={setCurrentTab}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetScenario={handleResetScenario}
      />
    </div>
  );
}
