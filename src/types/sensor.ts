export type NodeStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface GroundTilt {
  x: number;
  y: number;
  magnitude: number;
}

export interface SensorHealthStatus {
  rainGauge: 'OPERATIONAL' | 'DEGRADED' | 'FAULT' | 'DISCONNECTED';
  soilMoisture: 'OPERATIONAL' | 'DEGRADED' | 'FAULT' | 'DISCONNECTED';
  imu: 'OPERATIONAL' | 'DEGRADED' | 'FAULT' | 'DISCONNECTED'; // ADXL345
  environmental: 'OPERATIONAL' | 'DEGRADED' | 'FAULT' | 'DISCONNECTED'; // DHT11
  vibration?: 'OPERATIONAL' | 'DEGRADED' | 'FAULT' | 'DISCONNECTED';
}

export interface SensorReading {
  id: string;
  nodeId: string;
  timestamp: string;
  rainfall: number; // mm/hr or intensity
  soilMoisture: number; // percentage (0 - 100)
  tilt: GroundTilt;
  vibration: string;
  vibrationMagnitude: number;
  temperature: number; // °C
  humidity: number; // %
  batteryLevel: number;
  signalQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

export interface SensorNode {
  id: string;
  code: string; // e.g. NODE-001
  name: string; // e.g. Western Slope Alpha
  zone: string; // e.g. Monitoring Zone 01
  location: LocationCoordinates;
  status: NodeStatus;
  riskLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  riskScore: number;
  lastCommunication: string;
  latestReading: SensorReading;
  health: SensorHealthStatus;
}

export interface HardwareSensorDetail {
  id: string;
  name: string;
  model: string;
  type: 'RAIN' | 'SOIL_MOISTURE' | 'ENVIRONMENTAL' | 'ACCELEROMETER';
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'UNAVAILABLE';
  currentValue: string;
  unit: string;
  pinInterface: string;
  description: string;
  lastReadingTime: string;
  warningThreshold?: string;
  isOperational: boolean;
}
