export type AlertSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface AlertTriggerReadings {
  rainfall?: number;
  soilMoisture?: number;
  tiltMagnitude?: number;
  vibration?: string;
  temperature?: number;
  humidity?: number;
}

export interface Alert {
  id: string;
  nodeId: string;
  nodeCode: string;
  zone: string;
  severity: AlertSeverity;
  riskLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  triggerReadings?: AlertTriggerReadings;
}

