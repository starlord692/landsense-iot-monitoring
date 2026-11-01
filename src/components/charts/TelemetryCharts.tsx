import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  LineChart as ChartIcon,
  Thermometer,
  Droplets,
  CloudRain,
  Sprout,
} from 'lucide-react';
import type { TelemetryPoint } from '../../services/mockData';

interface TelemetryChartsProps {
  data: TelemetryPoint[];
}

// Custom Dark Navy Tooltip declared outside component to prevent re-creation
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-slate-900/95 border border-slate-700/80 p-3 shadow-xl backdrop-blur-md">
        <div className="text-xs font-mono font-semibold text-slate-400 mb-2 border-b border-slate-800 pb-1">
          Timestamp: {label}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {entry.value} {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const TelemetryCharts = ({ data }: TelemetryChartsProps) => {
  const [activeChart, setActiveChart] = useState<'grid' | 'temperature' | 'humidity' | 'rainfall' | 'soilMoisture'>('grid');

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Chart Header & View Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Sensor Telemetry History & Time-Series Trends
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical progression for Temperature, Humidity, Rainfall, and Soil Moisture
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveChart('grid')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeChart === 'grid'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 4 Charts
          </button>
          <button
            onClick={() => setActiveChart('temperature')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'temperature'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3 h-3" />
            <span>Temp</span>
          </button>
          <button
            onClick={() => setActiveChart('humidity')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'humidity'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>Humidity</span>
          </button>
          <button
            onClick={() => setActiveChart('rainfall')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'rainfall'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3 h-3" />
            <span>Rain</span>
          </button>
          <button
            onClick={() => setActiveChart('soilMoisture')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'soilMoisture'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3 h-3" />
            <span>Soil</span>
          </button>
        </div>
      </div>

      {/* Grid View: All 4 charts side by side */}
      {activeChart === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Temperature History */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Temperature History</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Ambient DHT11 (°C)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                Current: {data[data.length - 1]?.temperature ?? 27.4}°C
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[20, 35]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    unit="°C"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tempGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Humidity History */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Humidity History</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Relative Humidity (%)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Current: {data[data.length - 1]?.humidity ?? 84}%
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[50, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity"
                    unit="%"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#humidityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Rain Sensor History */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Rain Sensor History</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Intensity (mm/hr)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">
                Peak: {data[data.length - 1]?.rainfall ?? 42.5} mm/hr
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 60]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rainfall"
                    name="Rainfall Rate"
                    unit="mm/hr"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rainGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Soil Moisture History */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Soil Moisture History</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Saturation Level (%)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Current: {data[data.length - 1]?.soilMoisture ?? 78.2}%
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[30, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="soilMoisture"
                    name="Soil Moisture"
                    unit="%"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#soilGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Single Chart View */}
      {activeChart !== 'grid' && (
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white capitalize">
              Expanded {activeChart} Historical Telemetry
            </h4>
            <span className="text-xs text-slate-400 font-mono">7-Hour Time Horizon</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={activeChart}
                  name={activeChart}
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="#06b6d4"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
