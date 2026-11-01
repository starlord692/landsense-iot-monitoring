import {
  MapPin,
  Navigation,
  Compass,
  Mountain,
  Info,
  AlertTriangle,
} from 'lucide-react';
import type { SensorNode } from '../../types/sensor';

interface MonitoringLocationMapProps {
  nodes: SensorNode[];
  selectedNodeId: string;
}

export const MonitoringLocationMap = ({
  nodes,
  selectedNodeId,
}: MonitoringLocationMapProps) => {
  const selectedNode = nodes.find(n => n.id === selectedNodeId || n.code === selectedNodeId) || nodes[0];

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Landslide Monitoring Location (Field Station Overview)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Geographic placement and terrain zoning for deployed academic prototype monitoring stations
          </p>
        </div>

        {/* Placeholder Advisory Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-mono">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Placeholder GPS Coordinates</span>
        </div>
      </div>

      {/* Main Map Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map / Terrain Schematic (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden h-80 sm:h-96 flex flex-col justify-between p-5">
          {/* Topographic Background Simulation Lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Contour Curves */}
              <path
                d="M-50,220 Q200,80 400,180 T900,140"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <path
                d="M-50,270 Q250,130 500,230 T950,190"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <path
                d="M-50,320 Q300,180 600,280 T1000,240"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Top Map Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md text-xs font-mono text-slate-300 flex items-center gap-2">
              <Mountain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sector: Western Ghats Hill Pass (Station Zone 01)</span>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400">
              Contour Interval: 10m
            </div>
          </div>

          {/* Center: Interactive Node Markers Schematic */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNode.id;
              const isOnline = node.status === 'ONLINE';

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-lg border backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-slate-900/95 border-cyan-500 shadow-lg ring-1 ring-cyan-500/40 scale-105'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {node.code}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                      }`}
                    />
                  </div>
                  <div className="text-xs font-medium text-white truncate">{node.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Alt: {node.location.altitude}m
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Map Bar: GPS Coordinate Readout */}
          <div className="relative z-10 p-3 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Coordinates: <strong>{selectedNode.location.latitude.toFixed(4)}° N</strong>,{' '}
                <strong>{selectedNode.location.longitude.toFixed(4)}° E</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Datum: WGS 84 (Estimated Placement)
            </span>
          </div>
        </div>

        {/* Location Details & Terrain Properties (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Geological Site Specs</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Monitoring Sector:</span>
                <span className="font-semibold text-white">{selectedNode.zone}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Active Node:</span>
                <span className="font-mono text-cyan-300">{selectedNode.code} ({selectedNode.name})</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Station Elevation:</span>
                <span className="font-mono text-white">{selectedNode.location.altitude} meters MSL</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Slope Profile:</span>
                <span className="text-amber-300 font-medium">32° - 42° Steeper Gradient</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Soil Stratum:</span>
                <span className="text-white">Lateritic Debris over Basalt Bedrock</span>
              </div>
            </div>
          </div>

          {/* Academic Restriction Notice */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Location Policy Notice</span>
            </div>
            <p className="leading-relaxed">
              This academic IoT prototype uses placeholder coordinates for the demonstration
              deployment. Dedicated GPS transceiver modules (NEO-6M / GNSS) can be mapped directly
              to each station without altering frontend display components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
