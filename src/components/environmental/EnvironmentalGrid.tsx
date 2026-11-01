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
          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
          : 'text-amber-700 bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600',
      description: 'Ambient air temperature at slope monitoring station.',
      progress: Math.min(100, Math.max(0, (reading.temperature / 50) * 100)),
      progressBarColor: 'bg-amber-400',
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
          ? 'text-cyan-800 bg-cyan-50 border-cyan-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      iconBg: 'bg-cyan-50 text-cyan-600',
      description: 'Atmospheric moisture level contributing to condensation.',
      progress: reading.humidity,
      progressBarColor: 'bg-cyan-500',
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
          ? 'text-rose-700 bg-rose-50 border-rose-200'
          : rainStatus === 'ELEVATED'
          ? 'text-orange-700 bg-orange-50 border-orange-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      iconBg: 'bg-blue-50 text-blue-600',
      description: 'Live precipitation rate detected on slope surface plate.',
      progress: Math.min(100, (reading.rainfall / 60) * 100),
      progressBarColor: rainStatus === 'CRITICAL' ? 'bg-rose-500' : 'bg-orange-500',
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
          ? 'text-orange-700 bg-orange-50 border-orange-200'
          : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      description: 'Volumetric soil moisture content in active shear zone.',
      progress: reading.soilMoisture,
      progressBarColor: soilStatus === 'SATURATED' ? 'bg-orange-500' : 'bg-emerald-500',
      trendText: 'High saturation risk',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Environmental Telemetry Cards
          </h3>
          <p className="text-xs text-slate-400">
            Real-time atmospheric and geotechnical sensor feeds
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
          Node: {reading.nodeId}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {card.sensorType}
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl ${card.iconBg} shadow-2xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-sm font-bold text-slate-400 font-mono">
                    {card.unit}
                  </span>
                </div>

                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${card.progressBarColor} rounded-full transition-all duration-300`}
                    style={{ width: `${card.progress}%` }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${card.statusColor}`}>
                  {card.statusLabel}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
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
