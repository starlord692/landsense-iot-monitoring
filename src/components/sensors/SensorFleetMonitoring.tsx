import {
  CloudRain,
  Sprout,
  Thermometer,
  Compass,
  CheckCircle2,
  XCircle,
  Cpu,
  Info,
  Layers,
} from 'lucide-react';
import type { HardwareSensorDetail, SensorNode } from '../../types/sensor';

interface SensorFleetMonitoringProps {
  sensors: HardwareSensorDetail[];
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
}

export const SensorFleetMonitoring = ({
  sensors,
  nodes,
  selectedNodeId,
  onSelectNode,
}: SensorFleetMonitoringProps) => {
  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'RAIN':
        return CloudRain;
      case 'SOIL_MOISTURE':
        return Sprout;
      case 'ENVIRONMENTAL':
        return Thermometer;
      case 'ACCELEROMETER':
        return Compass;
      default:
        return Cpu;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Required Sensor Hardware Modules */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Hardware Sensor Monitoring (IoT Station)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Diagnostic status, pin assignments, and live readings across all physical sensing units
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Active Prototype Rig
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sensors.map((sensor) => {
            const Icon = getSensorIcon(sensor.type);
            const isConnected = sensor.isOperational;

            return (
              <div
                key={sensor.id}
                className={`rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  isConnected
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-900/50 border-amber-500/30 ring-1 ring-amber-500/10'
                }`}
              >
                <div>
                  {/* Card Header: Icon, Name, and Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isConnected
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {sensor.name}
                          </h4>
                          {sensor.id === 'sensor-adxl345' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-700/50 font-mono font-medium">
                              Standby
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{sensor.model}</p>
                      </div>
                    </div>

                    {/* Operational Status Pill */}
                    <div>
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono bg-amber-950/80 text-amber-400 border border-amber-700/50">
                          <XCircle className="w-3.5 h-3.5 text-amber-400" />
                          UNAVAILABLE / NOT CONNECTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Sensor Reading Display */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Live Output Reading
                      </span>
                      <span
                        className={`text-lg font-bold font-mono tracking-tight ${
                          isConnected ? 'text-white' : 'text-amber-400/90'
                        }`}
                      >
                        {sensor.currentValue}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Pin Interface
                      </span>
                      <span className="text-xs font-mono text-cyan-300">
                        {sensor.pinInterface}
                      </span>
                    </div>
                  </div>

                  {/* Sensor Description & Special Notice for ADXL345 */}
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sensor.description}
                    </p>

                    {sensor.id === 'sensor-adxl345' && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/30 text-xs text-amber-300 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-amber-200">
                            Prototype Notice:
                          </strong>{' '}
                          ADXL345 3-Axis accelerometer is configured on the I2C bus schema
                          but physically unattached on this breadboard prototype. Ground tilt and
                          vibration parameters utilize simulated mathematical baseline values until hardware
                          soldering is finalized.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Threshold: {sensor.warningThreshold}</span>
                  <span>Sync: {sensor.lastReadingTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Sensor Fleet Nodes Overview */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Multi-Node Fleet Deployment</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select any remote field node to inspect localized environmental metrics
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {nodes.length} Registered Stations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId || node.code === selectedNodeId;
            const isOnline = node.status === 'ONLINE';

            return (
              <button
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {node.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      isOnline
                        ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/40'
                        : 'bg-rose-950/70 text-rose-400 border-rose-800/40'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                      }`}
                    />
                    {node.status}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-semibold text-white truncate">{node.name}</div>
                  <div className="text-xs text-slate-400 truncate">{node.zone}</div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Risk: <strong className="text-white">{node.riskLevel}</strong></span>
                  <span>{node.lastCommunication}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
