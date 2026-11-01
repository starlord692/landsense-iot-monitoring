import {
  LayoutDashboard,
  Activity,
  Cpu,
  ShieldAlert,
  Bell,
  History,
  Settings,
  Mountain,
  CheckCircle2,
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
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'sensors', label: 'Sensor Network', icon: Cpu },
    { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slim Light Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-150 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-[2px_0_12px_rgba(0,0,0,0.02)]`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">LANDSense</span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Early Warning IoT</p>
          </div>
        </div>

        {/* Live Network State Badge */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Network Online
            </span>
            <span className="font-mono text-emerald-700 font-semibold">4 Nodes</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs">
                    {item.badge}
                  </span>
                ) : (
                  isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Card Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              SL
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">Dr. Sarah Lin</div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                Field Officer
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
