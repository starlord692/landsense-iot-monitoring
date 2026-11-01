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
        return { icon: CloudRain, bg: 'bg-blue-50 text-blue-600' };
      case 'SOIL_MOISTURE':
        return { icon: Sprout, bg: 'bg-emerald-50 text-emerald-600' };
      case 'ENVIRONMENTAL':
        return { icon: Thermometer, bg: 'bg-amber-50 text-amber-600' };
      case 'ACCELEROMETER':
        return { icon: Compass, bg: 'bg-purple-50 text-purple-600' };
      default:
        return { icon: Cpu, bg: 'bg-slate-50 text-slate-600' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Required Hardware Sensor Modules */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <span>Hardware Sensor Monitoring (Active IoT Station)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical sensing units, micro-controller pin interfaces, and connection status
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
            Rig Prototype v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sensors.map((sensor) => {
            const { icon: Icon, bg: iconBg } = getSensorIcon(sensor.type);
            const isConnected = sensor.isOperational;

            return (
              <div
                key={sensor.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isConnected
                    ? 'bg-slate-50/50 border-slate-200/70 hover:border-slate-300'
                    : 'bg-amber-50/40 border-amber-200/80'
                }`}
              >
                <div>
                  {/* Header: Icon, Name, and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center shadow-2xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {sensor.name}
                          </h4>
                          {sensor.id === 'sensor-adxl345' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
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
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ONLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          UNAVAILABLE / NOT CONNECTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Output Reading Box */}
                  <div className="mt-4 p-3.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Live Output Reading
                      </span>
                      <span className={`text-lg font-extrabold font-mono ${isConnected ? 'text-slate-900' : 'text-amber-700'}`}>
                        {sensor.currentValue}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Pin Interface
                      </span>
                      <span className="text-xs font-mono font-semibold text-emerald-700">
                        {sensor.pinInterface}
                      </span>
                    </div>
                  </div>

                  {/* Description & Notice for ADXL345 */}
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {sensor.description}
                    </p>

                    {sensor.id === 'sensor-adxl345' && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-amber-900">Prototype Notice: </strong>
                          ADXL345 3-Axis accelerometer is configured on the I2C bus (`0x53`)
                          but is currently physically unattached on this breadboard prototype. Ground tilt and
                          vibration parameters utilize simulated mathematical baseline values.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Threshold info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Threshold: {sensor.warningThreshold}</span>
                  <span>Sync: {sensor.lastReadingTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sensor Fleet Nodes Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Multi-Node Fleet Deployment</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select any remote field node to view localized telemetry
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono">
            {nodes.length} Registered Stations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId || node.code === selectedNodeId;
            const isOnline = node.status === 'ONLINE';

            return (
              <button
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {node.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOnline
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {node.status}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-sm font-bold text-slate-800 truncate">{node.name}</div>
                  <div className="text-xs text-slate-400 truncate">{node.zone}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Risk: <strong className="text-slate-800">{node.riskLevel}</strong></span>
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
