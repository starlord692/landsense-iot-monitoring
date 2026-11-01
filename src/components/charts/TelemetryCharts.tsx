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

// Custom Light Tooltip matching the reference visual aesthetic
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-3 shadow-lg">
        <div className="text-xs font-mono font-semibold text-slate-400 mb-2 border-b border-slate-100 pb-1">
          Time: {label}
        </div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-900">
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ChartIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Sensor Analytics & Historical Trends
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Time-series progression for Temperature, Humidity, Rainfall, and Soil Moisture
          </p>
        </div>

        {/* Tab Filter Controls */}
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveChart('grid')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeChart === 'grid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All 4 Charts
          </button>
          <button
            onClick={() => setActiveChart('temperature')}
            className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'temperature'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp</span>
          </button>
          <button
            onClick={() => setActiveChart('humidity')}
            className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'humidity'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Humidity</span>
          </button>
          <button
            onClick={() => setActiveChart('rainfall')}
            className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'rainfall'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain</span>
          </button>
          <button
            onClick={() => setActiveChart('soilMoisture')}
            className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeChart === 'soilMoisture'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Soil</span>
          </button>
        </div>
      </div>

      {/* Grid View: 4 Light-Themed Charts */}
      {activeChart === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Temperature History */}
          <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Temperature History</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Ambient DHT11 (°C)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600">
                {data[data.length - 1]?.temperature ?? 27.4}°C
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempLightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[20, 35]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    unit="°C"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tempLightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Humidity History */}
          <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Humidity History</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Relative Humidity (%)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-700">
                {data[data.length - 1]?.humidity ?? 84}%
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="humidityLightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[50, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity"
                    unit="%"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#humidityLightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Rain Sensor History */}
          <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Rain Sensor History</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Intensity (mm/hr)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600">
                {data[data.length - 1]?.rainfall ?? 42.5} mm/hr
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rainLightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 60]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rainfall"
                    name="Rainfall Rate"
                    unit="mm/hr"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#rainLightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Soil Moisture History */}
          <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Sprout className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Soil Moisture History</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Saturation Level (%)</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {data[data.length - 1]?.soilMoisture ?? 78.2}%
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="soilLightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[30, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="soilMoisture"
                    name="Soil Moisture"
                    unit="%"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#soilLightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Single Chart */}
      {activeChart !== 'grid' && (
        <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 capitalize">
              Expanded {activeChart} Time-Series Progression
            </h4>
            <span className="text-xs text-slate-400 font-mono">7-Hour Window</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={activeChart}
                  name={activeChart}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
