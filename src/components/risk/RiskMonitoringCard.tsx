import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  CloudRain,
  Compass,
  Droplets,
  Zap,
} from 'lucide-react';
import type { RiskAssessment, RiskLevel } from '../../types/risk';
import { RISK_THRESHOLDS } from '../../types/risk';

interface RiskMonitoringCardProps {
  risk: RiskAssessment;
}

export const RiskMonitoringCard = ({ risk }: RiskMonitoringCardProps) => {
  const currentThreshold = RISK_THRESHOLDS[risk.riskLevel] || RISK_THRESHOLDS.NORMAL;

  // Arc gauge calculation (circumference of r=58 is ~364.4)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk.riskScore / 100) * circumference;

  const factors = [
    {
      key: 'rainfall',
      title: risk.contributions.rainfall.factor,
      label: risk.contributions.rainfall.label,
      score: risk.contributions.rainfall.score,
      maxScore: risk.contributions.rainfall.maxScore,
      valueString: risk.contributions.rainfall.valueString,
      status: risk.contributions.rainfall.status,
      icon: CloudRain,
      barColor: 'bg-cyan-500',
      description: 'Precipitation accumulation accelerating pore-pressure.',
    },
    {
      key: 'soilMoisture',
      title: risk.contributions.soilMoisture.factor,
      label: risk.contributions.soilMoisture.label,
      score: risk.contributions.soilMoisture.score,
      maxScore: risk.contributions.soilMoisture.maxScore,
      valueString: risk.contributions.soilMoisture.valueString,
      status: risk.contributions.soilMoisture.status,
      icon: Droplets,
      barColor: 'bg-emerald-500',
      description: 'Ground moisture reducing effective soil shear strength.',
    },
    {
      key: 'groundMovement',
      title: risk.contributions.groundMovement.factor,
      label: risk.contributions.groundMovement.label,
      score: risk.contributions.groundMovement.score,
      maxScore: risk.contributions.groundMovement.maxScore,
      valueString: risk.contributions.groundMovement.valueString,
      status: risk.contributions.groundMovement.status,
      icon: Compass,
      barColor: 'bg-amber-500',
      description: 'Slope displacement and angle inclination shift.',
    },
    {
      key: 'vibration',
      title: risk.contributions.vibration.factor,
      label: risk.contributions.vibration.label,
      score: risk.contributions.vibration.score,
      maxScore: risk.contributions.vibration.maxScore,
      valueString: risk.contributions.vibration.valueString,
      status: risk.contributions.vibration.status,
      icon: Zap,
      barColor: 'bg-purple-500',
      description: 'Micro-seismic activity or dynamic slope disturbance.',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/40';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/70 border-orange-800/40';
      case 'ELEVATED':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/40';
      default:
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/40';
    }
  };

  const allLevels: RiskLevel[] = ['NORMAL', 'WATCH', 'WARNING', 'CRITICAL'];

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Landslide Risk Monitoring & Assessment Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated multi-factor evaluation combining real-time rainfall, soil moisture, and slope stability
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
            {risk.locationName}
          </span>
        </div>
      </div>

      {/* Main Risk Body: Gauge on Left, Contributing Readings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Large Visual Risk Indicator Gauge (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Background Track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              {/* Animated Value Stroke */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={currentThreshold.accentColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                {risk.riskScore}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Score / 100
              </span>
              <span
                className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase border ${currentThreshold.badgeBg} ${currentThreshold.badgeText} ${currentThreshold.borderColor}`}
              >
                {risk.riskLevel}
              </span>
            </div>
          </div>

          {/* Risk Level Spectrum Meter */}
          <div className="w-full mt-6 space-y-2">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider text-center">
              Risk Classification Spectrum
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {allLevels.map((lvl) => {
                const meta = RISK_THRESHOLDS[lvl];
                const isSelected = risk.riskLevel === lvl;
                return (
                  <div
                    key={lvl}
                    className={`py-1.5 px-1 rounded text-[10px] font-mono font-bold transition-all border ${
                      isSelected
                        ? `${meta.badgeBg} ${meta.badgeText} ${meta.borderColor} ring-1 ring-white/20 shadow-xs scale-105`
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    {lvl}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-center text-slate-400 mt-2 italic">
              {currentThreshold.description}
            </p>
          </div>
        </div>

        {/* Sensor Readings Contributing to Risk (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sensor Readings Contributing to Risk Score</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual weight breakdown calculated by the early warning risk evaluation matrix
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {factors.map((factor) => {
              const Icon = factor.icon;
              const percent = Math.min(100, Math.round((factor.score / factor.maxScore) * 100));

              return (
                <div
                  key={factor.key}
                  className="rounded-lg bg-slate-950/40 border border-slate-800 p-3.5 space-y-2.5 hover:border-slate-700/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-800 text-cyan-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        {factor.label}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                        factor.status
                      )}`}
                    >
                      {factor.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-white font-mono">
                      {factor.valueString}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Weight: <strong className="text-slate-200">{factor.score}</strong>/{factor.maxScore} pts
                    </span>
                  </div>

                  {/* Factor progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${factor.barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {factor.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Explanation narrative */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-200">Geotechnical Analysis:</span>
              <p className="text-slate-400 leading-relaxed">{risk.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
