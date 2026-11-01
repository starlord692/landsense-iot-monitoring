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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Landslide Monitoring Location & Terrain Zoning
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic placement and slope sector demarcation for academic prototype deployment
          </p>
        </div>

        {/* Placeholder Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Provisional GPS Coordinates</span>
        </div>
      </div>

      {/* Main Map Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Map / Terrain Schematic (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-3xl bg-[#eef6f0] border border-slate-200/80 relative overflow-hidden h-96 flex flex-col justify-between p-6 shadow-inner">
          {/* Topographic Background Simulation Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="light-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dcf0e2" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#light-map-grid)" />
              {/* Roads / Valley paths */}
              <path d="M-50,220 Q200,80 400,180 T900,140" fill="none" stroke="#ffffff" strokeWidth="14" />
              <path d="M-50,220 Q200,80 400,180 T900,140" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M120,-30 Q160,200 240,400" fill="none" stroke="#ffffff" strokeWidth="10" />
              <path d="M-50,300 Q250,150 500,250 T950,210" fill="none" stroke="#a7f3d0" strokeWidth="3" />
            </svg>
          </div>

          {/* Top Map Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-semibold text-slate-800 flex items-center gap-2">
              <Mountain className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sector: Western Ghats Hill Pass (Station Zone 01)</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[11px] font-mono text-slate-500">
              Contour Interval: 10m
            </div>
          </div>

          {/* Center: Interactive Node Markers Schematic */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-auto">
            {nodes.map((node) => {
              const isSelected = node.id === selectedNode.id;
              const isOnline = node.status === 'ONLINE';

              return (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 scale-105'
                      : 'bg-white/90 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      {node.code}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate">{node.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Alt: {node.location.altitude}m
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Map Bar: GPS Coordinate Readout */}
          <div className="relative z-10 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-700">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Coordinates: <strong>{selectedNode.location.latitude.toFixed(4)}° N</strong>,{' '}
                <strong>{selectedNode.location.longitude.toFixed(4)}° E</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Datum: WGS 84 (Field Reference)
            </span>
          </div>
        </div>

        {/* Location Details & Terrain Properties (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl bg-slate-50/80 border border-slate-100 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Geological Site Specs</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-400">Monitoring Sector:</span>
                <span className="font-bold text-slate-800">{selectedNode.zone}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-400">Active Node:</span>
                <span className="font-mono text-emerald-700 font-bold">{selectedNode.code} ({selectedNode.name})</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-400">Station Elevation:</span>
                <span className="font-mono text-slate-800 font-bold">{selectedNode.location.altitude} meters MSL</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-400">Slope Profile:</span>
                <span className="text-amber-700 font-bold">32° - 42° Steeper Gradient</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Soil Stratum:</span>
                <span className="text-slate-800 font-medium">Lateritic Debris over Basalt Bedrock</span>
              </div>
            </div>
          </div>

          {/* Academic Restriction Notice */}
          <div className="p-4 rounded-3xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Location Policy Notice</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              This academic IoT prototype uses placeholder coordinates for demonstration.
              Dedicated GPS transceiver modules (NEO-6M / GNSS) will map directly to each station once deployed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
