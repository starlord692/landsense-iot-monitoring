export type RiskLevel = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface RiskThreshold {
  level: RiskLevel;
  minScore: number;
  maxScore: number;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

export const RISK_THRESHOLDS: Record<RiskLevel, RiskThreshold> = {
  NORMAL: {
    level: 'NORMAL',
    minScore: 0,
    maxScore: 25,
    description: 'Sensor parameters are within baseline safety levels. Minimal landslide hazard.',
    badgeBg: 'bg-emerald-950/70',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    accentColor: '#10b981',
  },
  WATCH: {
    level: 'WATCH',
    minScore: 26,
    maxScore: 50,
    description: 'Elevated precipitation or moderate soil saturation. Monitoring frequency accelerated.',
    badgeBg: 'bg-amber-950/70',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    accentColor: '#f59e0b',
  },
  WARNING: {
    level: 'WARNING',
    minScore: 51,
    maxScore: 75,
    description: 'Heavy rainfall and significant soil saturation detected. High likelihood of slope instability.',
    badgeBg: 'bg-orange-950/70',
    badgeText: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    accentColor: '#f97316',
  },
  CRITICAL: {
    level: 'CRITICAL',
    minScore: 76,
    maxScore: 100,
    description: 'Dangerous ground displacement or saturated shear failure risk. Immediate evacuation advisory.',
    badgeBg: 'bg-rose-950/70',
    badgeText: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-400',
    accentColor: '#ef4444',
  },
};

export interface RiskFactorContribution {
  factor: string;
  score: number;
  maxScore: number;
  label: string;
  valueString: string;
  status: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export interface RiskContributions {
  rainfall: RiskFactorContribution;
  soilMoisture: RiskFactorContribution;
  groundMovement: RiskFactorContribution;
  vibration: RiskFactorContribution;
}

export interface RiskAssessment {
  id: string;
  node_id?: string;
  locationId: string;
  locationName: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  timestamp: string;
  explanation: string;
  contributions: RiskContributions;
  trend: 'STABLE' | 'RISING' | 'FALLING' | 'DECREASING';
}
