import { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewStats } from './components/overview/OverviewStats';
import { EnvironmentalGrid } from './components/environmental/EnvironmentalGrid';
import { RiskMonitoringCard } from './components/risk/RiskMonitoringCard';
import { SensorFleetMonitoring } from './components/sensors/SensorFleetMonitoring';
import { TelemetryCharts } from './components/charts/TelemetryCharts';
import { RecentAlertsList } from './components/alerts/RecentAlertsList';
import { MonitoringLocationMap } from './components/map/MonitoringLocationMap';

import { sensorService } from './services/sensorService';
import { riskService } from './services/riskService';
import { alertService } from './services/alertService';
import {
  MOCK_NODES,
  MOCK_RISK_ASSESSMENT,
  MOCK_TELEMETRY_HISTORY,
  MOCK_ALERTS,
} from './services/mockData';
import type { SensorNode } from './types/sensor';
import type { RiskAssessment } from './types/risk';
import type { Alert } from './types/alert';
import type { TelemetryPoint } from './services/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-001');

  // Application Data States initialized with realistic baseline data
  const [nodes, setNodes] = useState<SensorNode[]>(MOCK_NODES);
  const [currentRisk, setCurrentRisk] = useState<RiskAssessment>(MOCK_RISK_ASSESSMENT);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(MOCK_TELEMETRY_HISTORY);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [lastUpdated, setLastUpdated] = useState<string>('12:48 PM');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Derive the active node and hardware sensors dynamically
  const selectedNode = nodes.find(n => n.id === selectedNodeId || n.code === selectedNodeId) || nodes[0];
  const hardwareSensors = sensorService.getHardwareSensors(selectedNode);

  // Load / refresh telemetry & diagnostics
  const refreshDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [fetchedNodes, fetchedRisk, fetchedHistory, fetchedAlerts] = await Promise.all([
        sensorService.getSensorNodes(),
        riskService.getCurrentRisk(),
        sensorService.getTelemetryHistory(selectedNodeId),
        alertService.getAlerts(),
      ]);

      setNodes(fetchedNodes);
      setCurrentRisk(fetchedRisk);
      setTelemetryHistory(fetchedHistory);
      setAlerts(fetchedAlerts);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedNodeId]);

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const updated = await alertService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a => (a.id === alertId ? updated : a)));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const primaryReading = selectedNode?.latestReading || {
    id: 'fallback',
    nodeId: 'NODE-001',
    timestamp: 'Now',
    rainfall: 42.5,
    soilMoisture: 78.2,
    tilt: { x: 1.2, y: 0.9, magnitude: 1.5 },
    vibration: 'ELEVATED',
    vibrationMagnitude: 0.42,
    temperature: 27.4,
    humidity: 84.0,
    batteryLevel: 88.0,
    signalQuality: 'EXCELLENT',
  };

  const unreadAlertsCount = alerts.filter(a => !a.isAcknowledged && (a.severity === 'CRITICAL' || a.severity === 'WARNING')).length;
  const onlineCount = nodes.filter(n => n.status === 'ONLINE').length;
  const totalCount = nodes.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => setSelectedNodeId(id)}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={refreshDashboardData}
          onlineCount={onlineCount}
          totalCount={totalCount}
        />

        {/* Dynamic Main Body Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Tab 1: Full System Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 1. Overview Section */}
              <OverviewStats
                currentRisk={currentRisk}
                nodes={nodes}
                lastUpdated={lastUpdated}
              />

              {/* 2. Environmental Monitoring */}
              <EnvironmentalGrid reading={primaryReading} />

              {/* 3. Risk Monitoring */}
              <RiskMonitoringCard risk={currentRisk} />

              {/* 4. Sensor Monitoring */}
              <SensorFleetMonitoring
                sensors={hardwareSensors}
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />

              {/* 5. Telemetry Charts */}
              <TelemetryCharts data={telemetryHistory} />

              {/* 6. Recent Alerts */}
              <RecentAlertsList
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />

              {/* 7. Monitoring Location Map */}
              <MonitoringLocationMap
                nodes={nodes}
                selectedNodeId={selectedNodeId}
              />
            </div>
          )}

          {/* Tab 2: Environmental Telemetry Focused View */}
          {activeTab === 'environmental' && (
            <div className="space-y-6">
              <EnvironmentalGrid reading={primaryReading} />
              <TelemetryCharts data={telemetryHistory} />
            </div>
          )}

          {/* Tab 3: Risk Assessment Focused View */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <RiskMonitoringCard risk={currentRisk} />
              <RecentAlertsList
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>
          )}

          {/* Tab 4: Sensor Hardware Fleet Focused View */}
          {activeTab === 'sensors' && (
            <div className="space-y-6">
              <SensorFleetMonitoring
                sensors={hardwareSensors}
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
            </div>
          )}

          {/* Tab 5: Telemetry History Focused View */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              <TelemetryCharts data={telemetryHistory} />
            </div>
          )}

          {/* Tab 6: Alert Center Focused View */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <RecentAlertsList
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>
          )}

          {/* Tab 7: Location Map Focused View */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <MonitoringLocationMap
                nodes={nodes}
                selectedNodeId={selectedNodeId}
              />
            </div>
          )}
        </main>

        {/* Dashboard Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-400">
          <div>
            <strong>LANDSense</strong> &bull; IoT-Based Landslide Monitoring & Early Warning System
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-400">
            FastAPI Schema Compliant &bull; Academic Prototype Release v1.0
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
