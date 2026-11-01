import { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import type { Alert, AlertSeverity } from '../../types/alert';

interface RecentAlertsListProps {
  alerts: Alert[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export const RecentAlertsList = ({
  alerts,
  onAcknowledgeAlert,
}: RecentAlertsListProps) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'ALL') return true;
    return alert.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: AlertOctagon,
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          dotBg: 'bg-rose-500',
          borderLeft: 'border-l-rose-500',
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
          dotBg: 'bg-orange-500',
          borderLeft: 'border-l-orange-500',
        };
      case 'WATCH':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          dotBg: 'bg-amber-500',
          borderLeft: 'border-l-amber-500',
        };
      case 'INFO':
      default:
        return {
          icon: Info,
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
          dotBg: 'bg-slate-400',
          borderLeft: 'border-l-emerald-500',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Early Warning Alerts & Geotechnical Incidents
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated threshold exceedances and operator acknowledgment log
            </p>
          </div>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 text-xs">
            {['ALL', 'CRITICAL', 'WARNING', 'WATCH'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-xs">
            No active alerts matching the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityBadge(alert.severity);

            return (
              <div
                key={alert.id}
                className={`rounded-2xl bg-slate-50/60 border border-slate-100 p-4 sm:p-5 border-l-4 ${style.borderLeft} transition-all hover:bg-slate-50 hover:shadow-2xs`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    {/* Severity, Node Code, and Timestamp */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badgeBg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dotBg} animate-pulse`} />
                        {alert.severity}
                      </span>

                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                        {alert.nodeCode} &bull; {alert.zone}
                      </span>

                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {alert.timestamp}
                      </span>
                    </div>

                    {/* Alert Title */}
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                      {alert.title}
                    </h4>

                    {/* Alert Description */}
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>

                    {/* Trigger Readings Breakdown */}
                    {alert.triggerReadings && (
                      <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                        {alert.triggerReadings.rainfall !== undefined && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            Rain: <strong className="text-blue-600">{alert.triggerReadings.rainfall} mm/hr</strong>
                          </span>
                        )}
                        {alert.triggerReadings.soilMoisture !== undefined && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            Moisture: <strong className="text-emerald-600">{alert.triggerReadings.soilMoisture}%</strong>
                          </span>
                        )}
                        {alert.triggerReadings.tiltMagnitude !== undefined && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            Tilt: <strong className="text-amber-600">+{alert.triggerReadings.tiltMagnitude}°</strong>
                          </span>
                        )}
                        {alert.triggerReadings.vibration && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            Vibe: <strong className="text-purple-600">{alert.triggerReadings.vibration}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Acknowledgment Button / Status */}
                  <div className="shrink-0 pt-1 sm:pt-0">
                    {alert.isAcknowledged ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Acknowledged
                        </span>
                        {alert.acknowledgedBy && (
                          <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                            By: {alert.acknowledgedBy}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
