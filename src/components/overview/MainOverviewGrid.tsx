import { useState } from 'react';
import {
  Sun,
  CloudRain,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Navigation,
  Radio,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RiskAssessment } from '../../types/risk';
import { RISK_THRESHOLDS } from '../../types/risk';
import type { SensorNode, SensorReading } from '../../types/sensor';
import type { Alert } from '../../types/alert';
import type { TelemetryPoint } from '../../services/mockData';

interface MainOverviewGridProps {
  currentRisk: RiskAssessment;
  reading: SensorReading;
  nodes: SensorNode[];
  alerts: Alert[];
  telemetryHistory: TelemetryPoint[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  onAcknowledgeAlert: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  isRealHardware?: boolean;
}

export const MainOverviewGrid = ({
  currentRisk,
  reading,
  nodes,
  alerts,
  telemetryHistory,
  selectedNodeId,
  onSelectNode,
  onAcknowledgeAlert,
  onNavigateTab,
  isRealHardware = false,
}: MainOverviewGridProps) => {
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [metricCarouselIndex, setMetricCarouselIndex] = useState<number>(0);
  const [chartMetric, setChartMetric] = useState<'soilMoisture' | 'rainfall' | 'temperature' | 'humidity'>('soilMoisture');

  const selectedNode = nodes.find(n => n.id === selectedNodeId || n.code === selectedNodeId) || nodes[0];
  const riskMeta = RISK_THRESHOLDS[currentRisk.riskLevel] || RISK_THRESHOLDS.NORMAL;

  const displayTemp = tempUnit === 'C'
    ? `${reading.temperature.toFixed(1)}°C`
    : `${((reading.temperature * 9) / 5 + 32).toFixed(1)}°F`;

  // Carousel items for the center hero card
  const carouselItems = [
    {
      label: 'Landslide Risk Score',
      value: `${currentRisk.riskScore}%`,
      subtitle: currentRisk.riskLevel,
      badgeColor: riskMeta.badgeBg + ' ' + riskMeta.badgeText + ' ' + riskMeta.borderColor,
      description: currentRisk.explanation,
    },
    {
      label: 'Soil Moisture Saturation',
      value: `${reading.soilMoisture.toFixed(1)}%`,
      subtitle: reading.soilMoisture > 75 ? 'Critical Saturation' : 'Elevated Moisture',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Pore-water pressure reduces soil cohesion on 35° incline.',
    },
    {
      label: 'Rainfall Intensity Rate',
      value: `${reading.rainfall.toFixed(1)} mm/hr`,
      subtitle: reading.rainfall > 35 ? 'Heavy Monsoon Rains' : 'Moderate Precipitation',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Surface run-off accelerating shear zone percolation.',
    },
    {
      label: 'Ground Tilt Inclination',
      value: `+${reading.tilt.magnitude.toFixed(1)}°`,
      subtitle: 'ADXL345 Disabled',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Physical ADXL345 accelerometer currently disabled in firmware.',
    },
  ];

  const currentCarousel = carouselItems[metricCarouselIndex];

  const handlePrevMetric = () => {
    setMetricCarouselIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleNextMetric = () => {
    setMetricCarouselIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const statStack = [
    { label: 'Sites :', value: `${nodes.length}`, tab: 'map' },
    { label: 'Nodes :', value: `${nodes.filter(n => n.status === 'ONLINE').length} / ${nodes.length}`, tab: 'sensors' },
    { label: 'Gateways :', value: '2 Active', tab: 'sensors' },
    { label: 'Incidents :', value: `${alerts.filter(a => !a.isAcknowledged).length}`, tab: 'alerts' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Row: 3 Prominent Cards matching the reference layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Weather / Station Overview Card (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Top Bar: Green Location Pill & Unit Toggle */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-xs">
                <MapPin className="w-3 h-3" />
                Sector 01 &bull; Western Slope
              </span>

              {/* C / F Unit Toggle */}
              <div className="flex items-center bg-slate-100 rounded-full p-0.5 text-xs font-bold">
                <button
                  onClick={() => setTempUnit('C')}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    tempUnit === 'C' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  C
                </button>
                <button
                  onClick={() => setTempUnit('F')}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    tempUnit === 'F' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  F
                </button>
              </div>
            </div>

            {/* Date and Weather Illustration */}
            <div className="mt-6 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Monday</h3>
                <p className="text-xs text-slate-400 font-medium">18 Sep, 2026</p>
              </div>

              {/* Soft Sun/Cloud Illustration */}
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center relative">
                <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />
                <CloudRain className="w-6 h-6 text-cyan-600 absolute -bottom-1 -right-1" />
              </div>
            </div>

            {/* Large Temperature Value */}
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                {displayTemp}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                High: 30° &bull; Low: 22°
              </p>
            </div>
          </div>

          {/* Bottom Condition Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800">
                {isRealHardware ? 'ESP32 Live Feed' : 'Monsoon Rainfall'}
              </span>
              <p className="text-[11px] text-slate-400">
                {isRealHardware ? 'Telemetry streaming every 3s' : 'Feels like 29° • High Saturation'}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 ${
                isRealHardware
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Radio className="w-3 h-3" />
              {isRealHardware ? 'Hardware Live' : 'Mock Baseline'}
            </span>
          </div>
        </div>

        {/* Card 2: Central Metric Carousel Card (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Top Pill & Arrow Controls */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {selectedNode.name}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMetric}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Previous Metric"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMetric}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Next Metric"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Metric Value */}
            <div className="mt-6 text-center space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {currentCarousel.label}
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-mono">
                {currentCarousel.value}
              </div>
              <div className="inline-block mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentCarousel.badgeColor}`}>
                  {currentCarousel.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Bottom Metric Columns */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Moisture</span>
              <span className="font-bold text-emerald-600 font-mono mt-0.5 block">
                {reading.soilMoisture.toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Rainfall</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                {reading.rainfall.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Slope Tilt</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                +{reading.tilt.magnitude}°
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Air Temp</span>
              <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                {reading.temperature.toFixed(0)}°C
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Recent Alerts Table (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Recent alerts :</h3>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs text-slate-400 hover:text-emerald-600 font-medium transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>

            {/* Clean Table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 text-[11px] font-semibold border-b border-slate-50">
                    <th className="pb-2 text-left">Level</th>
                    <th className="pb-2 text-left">Node</th>
                    <th className="pb-2 text-left">Hazard Title</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {alerts.slice(0, 4).map((alert) => {
                    const isCritical = alert.severity === 'CRITICAL';
                    const isWarning = alert.severity === 'WARNING';

                    return (
                      <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700'
                                : isWarning
                                ? 'bg-orange-50 text-orange-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-slate-600 font-medium">
                          {alert.nodeCode}
                        </td>
                        <td className="py-2.5 font-medium text-slate-800 max-w-[120px] truncate" title={alert.title}>
                          {alert.title}
                        </td>
                        <td className="py-2.5 text-right">
                          {alert.isAcknowledged ? (
                            <span className="text-emerald-600 font-semibold text-[11px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Ack
                            </span>
                          ) : (
                            <button
                              onClick={() => onAcknowledgeAlert(alert.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Ack
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Critical alerts active</span>
            <span className="font-bold text-rose-600">
              {alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).length} Unacknowledged
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Stat Stack, Center Map, and Right Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Stat Stack Cards (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3.5">
          {statStack.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between hover:border-slate-200 transition-colors"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-400">{item.label}</span>
                <div className="text-xl font-extrabold text-slate-900 font-mono">{item.value}</div>
              </div>

              <button
                onClick={() => onNavigateTab(item.tab)}
                className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title={`Open ${item.tab}`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Center: Monitoring Map Panel (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden min-h-[340px]">
          <div className="absolute inset-0 bg-[#eef6f0] pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="light-grid" width="45" height="45" patternUnits="userSpaceOnUse">
                  <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#dcf0e2" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#light-grid)" />
              <path d="M-20,180 Q120,90 280,160 T600,110" fill="none" stroke="#ffffff" strokeWidth="12" />
              <path d="M120,-20 Q160,180 230,360" fill="none" stroke="#ffffff" strokeWidth="8" />
              <path d="M-20,180 Q120,90 280,160 T600,110" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M-40,280 Q200,210 450,300" fill="none" stroke="#a7f3d0" strokeWidth="3" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs">
              <Navigation className="w-3 h-3 text-emerald-600" />
              Western Ghats Station Pass
            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/90 text-slate-500 border border-slate-200">
              Placeholder Coordinates
            </span>
          </div>

          <div className="relative z-10 py-6 space-y-4">
            <div className="flex items-center gap-2 max-w-fit mx-auto cursor-pointer" onClick={() => onSelectNode('node-001')}>
              <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-200 shadow-sm flex items-center gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Node 001</div>
                  <div className="text-[10px] text-slate-400">Western Slope</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">
                  {isRealHardware ? 'Live ESP32' : '1 Alert'}
                </span>
              </div>
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-white shadow-md animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto mr-6 cursor-pointer" onClick={() => onSelectNode('node-003')}>
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 ring-4 ring-white shadow-md" />
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-rose-200 shadow-sm flex items-center gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Node 003</div>
                  <div className="text-[10px] text-slate-400">Southern Ravine</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  Critical
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-6 cursor-pointer" onClick={() => onSelectNode('node-002')}>
              <div className="relative flex items-center justify-center">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-white shadow-md" />
              </div>
              <div className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-[11px] font-bold text-slate-700">
                Node 002 &bull; Eastern Ridge
              </div>
            </div>
          </div>

          <div className="relative z-10 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>10.8505° N, 76.2711° E</span>
            <span>Elevation: 480m MSL</span>
          </div>
        </div>

        {/* Right: Telemetry Chart Card (lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Sensor Analytics :</h3>

              <div className="relative">
                <select
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value as any)}
                  className="appearance-none bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full pl-3 pr-7 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="soilMoisture">Soil Moisture (%)</option>
                  <option value="rainfall">Rainfall (mm/hr)</option>
                  <option value="temperature">Temperature (°C)</option>
                  <option value="humidity">Humidity (%)</option>
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-700 text-xs">
                  ⌵
                </span>
              </div>
            </div>

            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lightGreenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMetric}
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#lightGreenGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400 font-medium">
            Time-Series Progression &bull; Updating Live every 3s
          </div>
        </div>
      </div>
    </div>
  );
};
