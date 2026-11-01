import {
  Activity,
  Layers,
  Thermometer,
  ShieldAlert,
  Cpu,
  LineChart,
  Bell,
  MapPin,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  unreadAlertsCount: number;
}

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  unreadAlertsCount,
}: SidebarProps) => {
  const navItems = [
    { id: 'overview', label: 'System Overview', icon: Layers },
    { id: 'environmental', label: 'Environmental Telemetry', icon: Thermometer },
    { id: 'risk', label: 'Risk Assessment', icon: ShieldAlert },
    { id: 'sensors', label: 'Sensor Hardware Fleet', icon: Cpu },
    { id: 'charts', label: 'Telemetry History', icon: LineChart },
    { id: 'alerts', label: 'Alert Center', icon: Bell, badge: unreadAlertsCount },
    { id: 'map', label: 'Monitoring Location', icon: MapPin },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-white">LANDSense</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  IoT v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Early Warning System</p>
            </div>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sensor Network Active
            </span>
            <span className="font-mono text-[11px] text-slate-400">4 Nodes</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Monitoring Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Project Context Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Academic Prototype</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Western Ghats Slope Monitoring Deployment &bull; Real-time telemetric risk evaluation.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
