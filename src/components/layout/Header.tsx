import { Menu, RefreshCw, Server, Clock, ChevronDown } from 'lucide-react';
import type { SensorNode } from '../../types/sensor';

interface HeaderProps {
  onToggleSidebar: () => void;
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onlineCount: number;
  totalCount: number;
}

export const Header = ({
  onToggleSidebar,
  nodes,
  selectedNodeId,
  onSelectNode,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onlineCount,
  totalCount,
}: HeaderProps) => {
  const selectedNode = nodes.find(n => n.id === selectedNodeId || n.code === selectedNodeId) || nodes[0];

  return (
    <header className="sticky top-0 z-30 h-18 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>LANDSense Monitoring Dashboard</span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
              Station Zone 01
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time IoT slope telemetry & geological risk prediction
          </p>
        </div>
      </div>

      {/* Right: Node Selector, Status Counters, Refresh */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Fleet Online Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Fleet:</span>
          <span className="font-semibold text-emerald-400">{onlineCount} Online</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{totalCount} Total</span>
        </div>

        {/* Node Dropdown Selector */}
        <div className="relative">
          <select
            value={selectedNode?.id || ''}
            onChange={(e) => onSelectNode(e.target.value)}
            className="appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id} className="bg-slate-900 text-slate-200">
                {node.code} – {node.name} ({node.status})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Last Updated Timestamp */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Updated: {lastUpdated}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
          title="Refresh sensor data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
};
