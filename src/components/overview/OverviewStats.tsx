import {
  ShieldAlert,
  Server,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import type { RiskAssessment } from '../../types/risk';
import { RISK_THRESHOLDS } from '../../types/risk';
import type { SensorNode } from '../../types/sensor';

interface OverviewStatsProps {
  currentRisk: RiskAssessment;
  nodes: SensorNode[];
  lastUpdated: string;
}

export const OverviewStats = ({
  currentRisk,
  nodes,
  lastUpdated,
}: OverviewStatsProps) => {
  const riskMeta = RISK_THRESHOLDS[currentRisk.riskLevel] || RISK_THRESHOLDS.NORMAL;
  const onlineCount = nodes.filter((n) => n.status === 'ONLINE').length;
  const offlineCount = nodes.filter((n) => n.status === 'OFFLINE').length;
  const totalCount = nodes.length;

  return (
    <div className="space-y-4">
      {/* Primary Overview Banner: Overall Landslide Risk Status */}
      <div
        className={`relative overflow-hidden rounded-xl border p-5 sm:p-6 transition-all ${riskMeta.borderColor} ${riskMeta.badgeBg} backdrop-blur-xs`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Primary Landslide Risk Level
              </span>
              <span className="inline-block w-2 h-2 rounded-full animate-ping bg-current" style={{ color: riskMeta.accentColor }} />
            </div>

            <div className="flex items-center gap-3">
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${riskMeta.textColor}`}
              >
                {currentRisk.riskLevel}
              </h2>
              <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 font-mono text-sm font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Score: {currentRisk.riskScore}/100</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentRisk.explanation}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700/80 text-slate-300 flex items-center gap-2 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Last Sync: {lastUpdated}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700/80 text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Trend: <strong className="text-white">{currentRisk.trend}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sensor Nodes */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Sensor Nodes
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{totalCount}</span>
            <span className="text-xs text-slate-400">deployed nodes</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Station Zone 01 & 02 fleet</p>
        </div>

        {/* Online Status */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Online Nodes
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{onlineCount}</span>
            <span className="text-xs text-slate-400">of {totalCount} active</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry transmitting</span>
          </div>
        </div>

        {/* Offline Nodes */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Offline / Degraded
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${offlineCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {offlineCount}
            </span>
            <span className="text-xs text-slate-400">attention needed</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {offlineCount > 0 ? 'NODE-003 signal disconnected' : 'All nodes nominal'}
          </p>
        </div>

        {/* Early Warning State */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Early Warning State
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{currentRisk.riskScore}%</span>
            <span className="text-xs text-amber-400 font-medium">Elevated risk</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Rain & soil saturation triggers</p>
        </div>
      </div>
    </div>
  );
};
