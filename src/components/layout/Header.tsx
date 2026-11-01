import {
  Menu,
  RefreshCw,
  Search,
  Bell,
  Clock,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import type { SensorNode } from '../../types/sensor';

interface HeaderProps {
  onToggleSidebar: () => void;
  nodes: SensorNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  unreadAlertsCount: number;
}

export const Header = ({
  onToggleSidebar,
  nodes,
  selectedNodeId,
  onSelectNode,
  lastUpdated,
  isRefreshing,
  onRefresh,
  unreadAlertsCount,
}: HeaderProps) => {
  const selectedNode = nodes.find(n => n.id === selectedNodeId || n.code === selectedNodeId) || nodes[0];

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Welcome Greeting matching reference */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning !</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Optimize landslide early warning with Real-Time sensor telemetry
          </p>
        </div>
      </div>

      {/* Right: Search, Station Selector, Alerts, Profile & Sync */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Field */}
        <div className="relative hidden xl:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search telemetry or nodes..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/70 rounded-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-52"
          />
        </div>

        {/* Current Monitoring Station Selector Pill (styled like the green pills in reference) */}
        <div className="relative">
          <div className="flex items-center gap-1.5 pl-3 pr-8 py-2 bg-emerald-600 text-white rounded-full font-semibold text-xs shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5" />
            <select
              value={selectedNode?.id || ''}
              onChange={(e) => onSelectNode(e.target.value)}
              className="appearance-none bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id} className="bg-white text-slate-800">
                  {node.code} &bull; {node.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/80 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Sync Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Synced: {lastUpdated}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onRefresh}
          className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 transition-colors cursor-pointer"
          title="Notifications & Refresh"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* Refresh Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Profile Avatar Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-50 border border-slate-100">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
            SL
          </div>
          <span className="text-xs font-bold text-slate-800">Dr. Sarah Lin</span>
        </div>
      </div>
    </header>
  );
};
