import {
  Thermometer,
  Droplets,
  CloudRain,
  Sprout,
  ArrowUpRight,
} from 'lucide-react';
import type { SensorReading } from '../../types/sensor';

interface EnvironmentalGridProps {
  reading: SensorReading;
}

export const EnvironmentalGrid = ({ reading }: EnvironmentalGridProps) => {
  // Determine contextual statuses
  const tempStatus =
    reading.temperature > 35 ? 'HIGH' : reading.temperature < 15 ? 'LOW' : 'NOMINAL';
  const humidityStatus =
    reading.humidity > 80 ? 'HIGH' : reading.humidity < 40 ? 'LOW' : 'NOMINAL';
  const rainStatus =
    reading.rainfall > 35 ? 'CRITICAL' : reading.rainfall > 20 ? 'ELEVATED' : 'NOMINAL';
  const soilStatus =
    reading.soilMoisture > 75 ? 'SATURATED' : reading.soilMoisture > 50 ? 'MOIST' : 'DRY';

  const cards = [
    {
      id: 'temperature',
      title: 'Temperature',
      value: reading.temperature.toFixed(1),
      unit: '°C',
      sensorType: 'DHT11 Environmental Sensor',
      icon: Thermometer,
      statusLabel: tempStatus,
      statusColor:
        tempStatus === 'NOMINAL'
          ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
          : 'text-amber-400 bg-amber-950/60 border-amber-800/40',
      description: 'Ambient air temperature at slope monitoring station.',
      progress: Math.min(100, Math.max(0, (reading.temperature / 50) * 100)),
      progressBarColor: 'bg-amber-400',
      thresholdNote: 'Baseline: 20°C - 32°C',
      trendIcon: ArrowUpRight,
      trendText: '+0.6°C from last hr',
    },
    {
      id: 'humidity',
      title: 'Relative Humidity',
      value: reading.humidity.toFixed(1),
      unit: '%',
      sensorType: 'DHT11 Environmental Sensor',
      icon: Droplets,
      statusLabel: humidityStatus,
      statusColor:
        humidityStatus === 'HIGH'
          ? 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40'
          : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      description: 'Atmospheric moisture level contributing to evaporation rate.',
      progress: reading.humidity,
      progressBarColor: 'bg-cyan-400',
      thresholdNote: 'High humidity (>80%) slows slope drying',
      trendIcon: ArrowUpRight,
      trendText: '+3% rise observed',
    },
    {
      id: 'rainfall',
      title: 'Rain Sensor Reading',
      value: reading.rainfall.toFixed(1),
      unit: 'mm/hr',
      sensorType: 'FC-37 / YL-83 Rain Gauge Module',
      icon: CloudRain,
      statusLabel: rainStatus,
      statusColor:
        rainStatus === 'CRITICAL'
          ? 'text-rose-400 bg-rose-950/60 border-rose-800/40'
          : rainStatus === 'ELEVATED'
          ? 'text-orange-400 bg-orange-950/60 border-orange-800/40'
          : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      description: 'Live precipitation rate detected on slope surface plate.',
      progress: Math.min(100, (reading.rainfall / 60) * 100),
      progressBarColor: rainStatus === 'CRITICAL' ? 'bg-rose-500' : 'bg-orange-500',
      thresholdNote: 'Critical threshold: > 35.0 mm/hr',
      trendIcon: ArrowUpRight,
      trendText: 'Sustained monsoon rain',
    },
    {
      id: 'soil_moisture',
      title: 'Soil Moisture',
      value: reading.soilMoisture.toFixed(1),
      unit: '%',
      sensorType: 'Capacitive Soil Moisture Probe v1.2',
      icon: Sprout,
      statusLabel: soilStatus,
      statusColor:
        soilStatus === 'SATURATED'
          ? 'text-orange-400 bg-orange-950/60 border-orange-800/40'
          : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      description: 'Volumetric soil moisture content in active shear zone.',
      progress: reading.soilMoisture,
      progressBarColor: soilStatus === 'SATURATED' ? 'bg-orange-500' : 'bg-emerald-500',
      thresholdNote: 'Shear risk elevated above 70%',
      trendIcon: ArrowUpRight,
      trendText: 'High saturation risk',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Environmental Telemetry Cards
          </h3>
          <p className="text-xs text-slate-400">
            Real-time atmospheric and geotechnical sensor feeds
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Node: {reading.nodeId}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendIcon;

          return (
            <div
              key={card.id}
              className="rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-5 flex flex-col justify-between transition-colors shadow-xs"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {card.sensorType}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Primary Metric Display */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-sm font-semibold text-slate-400 font-mono">
                    {card.unit}
                  </span>
                </div>

                {/* Progress bar gauge */}
                <div className="mt-3 space-y-1">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${card.progressBarColor} rounded-full transition-all duration-300`}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>

                {/* Card description */}
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Card Footer: Status & Trend */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono border ${card.statusColor}`}
                >
                  {card.statusLabel}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <TrendIcon className="w-3 h-3 text-slate-400" />
                  {card.trendText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
