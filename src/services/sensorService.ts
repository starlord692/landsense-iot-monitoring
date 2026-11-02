import type { SensorNode, HardwareSensorDetail, SensorReading } from '../types/sensor';
import { MOCK_NODES, MOCK_TELEMETRY_HISTORY, MOCK_PRIMARY_READING } from './mockData';
import type { TelemetryPoint } from './mockData';
import type { RiskAssessment } from '../types/risk';
import { MOCK_RISK_ASSESSMENT } from './mockData';
import { ENDPOINTS, USE_MOCK_DATA, API_FETCH_HEADERS } from './apiConfig';
import type { ScenarioState } from './scenarioService';

export interface LiveTelemetryResponse {
  isBackendConnected: boolean;
  isRealHardware: boolean;
  secondsAgo: number;
  reading: SensorReading;
  risk: RiskAssessment;
  history: TelemetryPoint[];
  scenario?: ScenarioState;
}

export const sensorService = {
  /**
   * Fetch all registered monitoring sensor nodes
   */
  async getSensorNodes(): Promise<SensorNode[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_NODES);
    }

    try {
      const response = await fetch(ENDPOINTS.SENSORS, { headers: API_FETCH_HEADERS });
      if (!response.ok) {
        throw new Error(`Failed to fetch sensor nodes: ${response.statusText}`);
      }
      return await response.json();
    } catch {
      // Fallback to local nodes so dashboard never breaks
      return MOCK_NODES;
    }
  },

  /**
   * Fetch diagnostic details for a specific sensor node
   */
  async getNodeById(nodeId: string): Promise<SensorNode | null> {
    if (USE_MOCK_DATA) {
      const node = MOCK_NODES.find(n => n.id === nodeId || n.code === nodeId);
      return Promise.resolve(node || MOCK_NODES[0]);
    }

    try {
      const response = await fetch(ENDPOINTS.SENSOR_DETAIL(nodeId), { headers: API_FETCH_HEADERS });
      if (!response.ok) {
        throw new Error(`Failed to fetch node ${nodeId}`);
      }
      return await response.json();
    } catch {
      return MOCK_NODES.find(n => n.id === nodeId || n.code === nodeId) || MOCK_NODES[0];
    }
  },

  /**
   * Fetch live hardware telemetry and risk calculated by the backend engine
   * Polled every 3 seconds
   */
  async getLiveTelemetry(nodeId: string = 'NODE-001'): Promise<LiveTelemetryResponse> {
    if (USE_MOCK_DATA) {
      return {
        isBackendConnected: false,
        isRealHardware: false,
        secondsAgo: 0,
        reading: MOCK_PRIMARY_READING,
        risk: MOCK_RISK_ASSESSMENT,
        history: MOCK_TELEMETRY_HISTORY,
      };
    }

    try {
      const [latestRes, historyRes] = await Promise.all([
        fetch(ENDPOINTS.READINGS_LATEST(nodeId), { headers: API_FETCH_HEADERS }),
        fetch(ENDPOINTS.READINGS_HISTORY(nodeId, 20), { headers: API_FETCH_HEADERS }),
      ]);

      if (!latestRes.ok) {
        throw new Error(`Backend status: ${latestRes.status}`);
      }

      const latestData = await latestRes.json();
      const historyData = historyRes.ok ? await historyRes.json() : [];

      const reading: SensorReading = latestData.reading || MOCK_PRIMARY_READING;
      const risk: RiskAssessment = latestData.risk || MOCK_RISK_ASSESSMENT;
      const isRealHardware: boolean = latestData.is_live ?? false;
      const secondsAgo: number = latestData.seconds_ago ?? 9999;

      const history: TelemetryPoint[] = Array.isArray(historyData) && historyData.length > 0
        ? historyData
        : MOCK_TELEMETRY_HISTORY;

      return {
        isBackendConnected: true,
        isRealHardware,
        secondsAgo,
        reading,
        risk,
        history,
        scenario: latestData.scenario,
      };
    } catch (err) {
      console.warn('Backend live telemetry fetch error, using fallback:', err);
      return {
        isBackendConnected: false,
        isRealHardware: false,
        secondsAgo: 9999,
        reading: MOCK_PRIMARY_READING,
        risk: MOCK_RISK_ASSESSMENT,
        history: MOCK_TELEMETRY_HISTORY,
      };
    }
  },

  /**
   * Retrieve the list of active/installed hardware sensors for display
   * Specifically includes: Rain sensor, Soil moisture sensor, DHT11, and ADXL345 (unavailable)
   */
  getHardwareSensors(primaryNode?: SensorNode, liveReading?: SensorReading, isRealHardware?: boolean): HardwareSensorDetail[] {
    const reading = liveReading || primaryNode?.latestReading || MOCK_PRIMARY_READING;
    const rainStatus = isRealHardware ? 'ONLINE' : (primaryNode?.health.rainGauge === 'OPERATIONAL' ? 'ONLINE' : 'DEGRADED');
    const soilStatus = isRealHardware ? 'ONLINE' : (primaryNode?.health.soilMoisture === 'OPERATIONAL' ? 'ONLINE' : 'DEGRADED');
    const dhtStatus = isRealHardware ? 'ONLINE' : (primaryNode?.health.environmental === 'OPERATIONAL' ? 'ONLINE' : 'DEGRADED');

    return [
      {
        id: 'sensor-rain',
        name: 'Rain Sensor',
        model: 'FC-37 / YL-83 Tipping/Plate Rain Detector',
        type: 'RAIN',
        status: rainStatus,
        currentValue: `${reading?.rainfall !== undefined ? reading.rainfall.toFixed(1) : '0.0'} mm/hr`,
        unit: 'mm/hr',
        pinInterface: 'ESP32 GPIO 34 (Analog)',
        description: 'Measures precipitation intensity on analog pin GPIO 34 to detect sudden heavy storm rainfall.',
        lastReadingTime: reading?.timestamp ?? 'Just now',
        warningThreshold: '> 35.0 mm/hr',
        isOperational: true,
      },
      {
        id: 'sensor-soil',
        name: 'Soil Moisture Sensor',
        model: 'Capacitive Soil Moisture Sensor v1.2',
        type: 'SOIL_MOISTURE',
        status: soilStatus,
        currentValue: `${reading?.soilMoisture !== undefined ? reading.soilMoisture.toFixed(1) : '0.0'} %`,
        unit: '%',
        pinInterface: 'ESP32 GPIO 35 (Analog)',
        description: 'Capacitive probe on analog GPIO 35 tracking ground pore-water saturation in the topsoil.',
        lastReadingTime: reading?.timestamp ?? 'Just now',
        warningThreshold: '> 70.0 %',
        isOperational: true,
      },
      {
        id: 'sensor-dht11',
        name: 'DHT11 Sensor',
        model: 'DHT11 Digital Temperature & Humidity Sensor',
        type: 'ENVIRONMENTAL',
        status: dhtStatus,
        currentValue: `${reading?.temperature !== undefined ? reading.temperature.toFixed(1) : '25.0'}°C / ${reading?.humidity !== undefined ? reading.humidity.toFixed(1) : '70.0'}%`,
        unit: '°C & %RH',
        pinInterface: 'ESP32 GPIO 25 (Digital Data)',
        description: 'Single-wire digital sensor on GPIO 25 tracking ambient temperature and relative humidity.',
        lastReadingTime: reading?.timestamp ?? 'Just now',
        warningThreshold: '> 80% RH',
        isOperational: true,
      },
      {
        id: 'sensor-adxl345',
        name: 'ADXL345 Sensor',
        model: 'ADXL345 3-Axis Digital Accelerometer',
        type: 'ACCELEROMETER',
        status: 'UNAVAILABLE',
        currentValue: 'Not Connected',
        unit: '° & g',
        pinInterface: 'I2C Bus (SDA / SCL)',
        description: 'Digital 3-axis accelerometer for slope tilt & vibration. Kept disabled in firmware until hardware soldering is finalized.',
        lastReadingTime: 'Hardware Standby',
        warningThreshold: 'Threshold N/A',
        isOperational: false,
      },
    ];
  },

  /**
   * Get telemetry history for charting
   */
  async getTelemetryHistory(nodeId?: string): Promise<TelemetryPoint[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_TELEMETRY_HISTORY);
    }

    try {
      const response = await fetch(ENDPOINTS.READINGS_HISTORY(nodeId || 'NODE-001', 20), { headers: API_FETCH_HEADERS });
      if (!response.ok) {
        throw new Error('Failed to fetch historical readings');
      }
      const raw = await response.json();
      if (Array.isArray(raw) && raw.length > 0) {
        return raw;
      }
      return MOCK_TELEMETRY_HISTORY;
    } catch {
      return MOCK_TELEMETRY_HISTORY;
    }
  },
};
