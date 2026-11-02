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
  isSimulated?: boolean;
}

export const RiskMonitoringCard = ({ risk, isSimulated = false }: RiskMonitoringCardProps) => {
  const currentThreshold = RISK_THRESHOLDS[risk.riskLevel] || RISK_THRESHOLDS.NORMAL;

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
      iconBg: 'bg-cyan-50 text-cyan-600',
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
      iconBg: 'bg-emerald-50 text-emerald-600',
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
      iconBg: 'bg-amber-50 text-amber-600',
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
      iconBg: 'bg-purple-50 text-purple-600',
      description: 'Micro-seismic activity or dynamic slope disturbance.',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'HIGH':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'ELEVATED':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  const allLevels: RiskLevel[] = ['NORMAL', 'WATCH', 'WARNING', 'CRITICAL'];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Landslide Risk Analysis & Contributing Factors
            </h3>
            {isSimulated && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                Simulated Scenario
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isSimulated ? 'Demonstration scenario risk level active — driving ESP32 physical LEDs' : 'Deterministic multi-factor evaluation combining live rainfall, soil saturation, and slope inclination'}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto font-mono">
          {risk.locationName}
        </span>
      </div>

      {/* Main Grid: Visual Gauge on Left, Contributing Readings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Risk Indicator Gauge (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50/80 border border-slate-100">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="10"
                fill="none"
              />
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

            <div className="absolute flex flex-col items-center text-center">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-slate-900">
                {risk.riskScore}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Score / 100
              </span>
              <span
                className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${currentThreshold.badgeBg} ${currentThreshold.badgeText} ${currentThreshold.borderColor}`}
              >
                {risk.riskLevel}
              </span>
            </div>
          </div>

          {/* Risk Level Spectrum */}
          <div className="w-full mt-6 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Risk Classification Spectrum
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {allLevels.map((lvl) => {
                const meta = RISK_THRESHOLDS[lvl];
                const isSelected = risk.riskLevel === lvl;
                return (
                  <div
                    key={lvl}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                      isSelected
                        ? `${meta.badgeBg} ${meta.badgeText} ${meta.borderColor} shadow-xs ring-2 ring-emerald-500/20 scale-105`
                        : 'bg-white text-slate-400 border-slate-100'
                    }`}
                  >
                    {lvl}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
              {currentThreshold.description}
            </p>
          </div>
        </div>

        {/* Factors Contributing to Risk (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sensor Readings Contributing to Risk Score
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {factors.map((factor) => {
              const Icon = factor.icon;
              const percent = Math.min(100, Math.round((factor.score / factor.maxScore) * 100));

              return (
                <div
                  key={factor.key}
                  className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2.5 shadow-2xs hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${factor.iconBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {factor.label}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        factor.status
                      )}`}
                    >
                      {factor.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {factor.valueString}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Score: <strong className="text-slate-800">{factor.score}</strong>/{factor.maxScore}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${factor.barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    {factor.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Explanation narrative */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-900">Geotechnical Explanation: </strong>
              <span className="text-amber-800 leading-relaxed">{risk.explanation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
