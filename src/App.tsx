import { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MainOverviewGrid } from './components/overview/MainOverviewGrid';
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
import { Server, ShieldCheck, Sliders } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Slim Light Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navigation */}
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => setSelectedNodeId(id)}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={refreshDashboardData}
          unreadAlertsCount={unreadAlertsCount}
        />

        {/* Dynamic Main Dashboard Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          {/* Tab 1: Primary Overview (matches the layout of the reference image) */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Reference-Inspired Hero Layout */}
              <MainOverviewGrid
                currentRisk={currentRisk}
                reading={primaryReading}
                nodes={nodes}
                alerts={alerts}
                telemetryHistory={telemetryHistory}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />

              {/* Environmental Monitoring Cards */}
              <EnvironmentalGrid reading={primaryReading} />

              {/* Risk Analysis Card */}
              <RiskMonitoringCard risk={currentRisk} />

              {/* Sensor Network Fleet with ADXL345 Standby Status */}
              <SensorFleetMonitoring
                sensors={hardwareSensors}
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />

              {/* Telemetry History Analytics */}
              <TelemetryCharts data={telemetryHistory} />

              {/* Alerts and Notifications */}
              <RecentAlertsList
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />

              {/* Monitoring Map */}
              <MonitoringLocationMap
                nodes={nodes}
                selectedNodeId={selectedNodeId}
              />
            </div>
          )}

          {/* Tab 2: Live Monitoring Focused View */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <EnvironmentalGrid reading={primaryReading} />
              <TelemetryCharts data={telemetryHistory} />
            </div>
          )}

          {/* Tab 3: Sensor Network Focused View */}
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

          {/* Tab 4: Risk Analysis Focused View */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <RiskMonitoringCard risk={currentRisk} />
              <RecentAlertsList
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>
          )}

          {/* Tab 5: Alerts Focused View */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <RecentAlertsList
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            </div>
          )}

          {/* Tab 6: History Analytics Focused View */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <TelemetryCharts data={telemetryHistory} />
            </div>
          )}

          {/* Tab 7: Settings / System Diagnostics View */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">LANDSense System Settings & Diagnostics</h3>
                  <p className="text-xs text-slate-400">Microcontroller calibration, API endpoint configuration, and deployment parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Server className="w-4 h-4 text-emerald-600" />
                    <span>FastAPI Backend Integration</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    Connected to <code className="px-1.5 py-0.5 rounded bg-white text-emerald-700 font-mono">http://localhost:8000/api/v1</code>. Toggle <code className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono">USE_MOCK_DATA = false</code> in <code className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono">apiConfig.ts</code> to direct all requests directly to the live Python server.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Hardware Sensor Calibration</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    FC-37 Rain Gauge trigger threshold: <strong className="text-slate-800">&gt; 35.0 mm/hr</strong>. Capacitive Soil Moisture threshold: <strong className="text-slate-800">&gt; 70%</strong>. ADXL345 Accelerometer status: <span className="font-bold text-amber-700">Hardware Standby (Mocked on I2C 0x53)</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Dashboard Clean Light Footer */}
        <footer className="border-t border-slate-100 bg-white/60 px-8 py-5 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-400 font-medium">
          <div>
            <strong className="text-slate-700 font-bold">LANDSense</strong> &bull; IoT-Based Landslide Monitoring & Early Warning System
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px] text-slate-400">
            Academic Prototype Release v2.0 &bull; Light Modern UI
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
