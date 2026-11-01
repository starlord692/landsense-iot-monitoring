import type { SensorNode, HardwareSensorDetail } from '../types/sensor';
import { MOCK_NODES, MOCK_HARDWARE_SENSORS, MOCK_TELEMETRY_HISTORY } from './mockData';
import type { TelemetryPoint } from './mockData';
import { ENDPOINTS, USE_MOCK_DATA } from './apiConfig';

export const sensorService = {
  /**
   * Fetch all registered monitoring sensor nodes
   */
  async getSensorNodes(): Promise<SensorNode[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_NODES);
    }

    try {
      const response = await fetch(ENDPOINTS.SENSORS);
      if (!response.ok) {
        throw new Error(`Failed to fetch sensor nodes: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API error, falling back to mock sensor nodes:', err);
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
      const response = await fetch(ENDPOINTS.SENSOR_DETAIL(nodeId));
      if (!response.ok) {
        throw new Error(`Failed to fetch node ${nodeId}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`API error for node ${nodeId}, falling back to mock:`, err);
      return MOCK_NODES.find(n => n.id === nodeId || n.code === nodeId) || MOCK_NODES[0];
    }
  },

  /**
   * Retrieve the list of active/installed hardware sensors for display
   * Specifically includes: Rain sensor, Soil moisture sensor, DHT11, and ADXL345 (unavailable)
   */
  getHardwareSensors(primaryNode?: SensorNode): HardwareSensorDetail[] {
    if (!primaryNode) return MOCK_HARDWARE_SENSORS;

    // Dynamically synchronize live readings with the hardware sensor cards
    const reading = primaryNode.latestReading;
    return [
      {
        id: 'sensor-rain',
        name: 'Rain Sensor',
        model: 'FC-37 / YL-83 Tipping/Plate Rain Detector',
        type: 'RAIN',
        status: primaryNode.health.rainGauge === 'OPERATIONAL' ? 'ONLINE' : 'DEGRADED',
        currentValue: `${reading?.rainfall ?? 42.5} mm/hr`,
        unit: 'mm/hr',
        pinInterface: 'Analog A0 / Digital D2',
        description: 'Measures precipitation intensity to detect intense localized rainstorm trigger events.',
        lastReadingTime: reading?.timestamp ?? 'Just now',
        warningThreshold: '> 35.0 mm/hr',
        isOperational: primaryNode.health.rainGauge === 'OPERATIONAL',
      },
      {
        id: 'sensor-soil',
        name: 'Soil Moisture Sensor',
        model: 'Capacitive Soil Moisture Sensor v1.2',
        type: 'SOIL_MOISTURE',
        status: primaryNode.health.soilMoisture === 'OPERATIONAL' ? 'ONLINE' : 'DEGRADED',
        currentValue: `${reading?.soilMoisture ?? 78.2} %`,
        unit: '%',
        pinInterface: 'Analog A1',
        description: 'Corrosion-resistant capacitive probe tracking ground pore-water saturation in the topsoil.',
        lastReadingTime: reading?.timestamp ?? 'Just now',
        warningThreshold: '> 70.0 %',
        isOperational: primaryNode.health.soilMoisture === 'OPERATIONAL',
      },
      {
        id: 'sensor-dht11',
        name: 'DHT11 Sensor',
        model: 'DHT11 Digital Temperature & Humidity Sensor',
        type: 'ENVIRONMENTAL',
        status: primaryNode.health.environmental === 'OPERATIONAL' ? 'ONLINE' : 'DEGRADED',
        currentValue: `${reading?.temperature ?? 27.4}°C / ${reading?.humidity ?? 84.0}%`,
        unit: '°C & %RH',
        pinInterface: 'Digital D4',
        description: 'Single-wire digital sensor tracking ambient temperature and relative air moisture.',
        lastReadingTime: reading?.timestamp ?? 'Just now',
        warningThreshold: '> 80% RH',
        isOperational: primaryNode.health.environmental === 'OPERATIONAL',
      },
      {
        id: 'sensor-adxl345',
        name: 'ADXL345 Sensor',
        model: 'ADXL345 3-Axis Digital Accelerometer',
        type: 'ACCELEROMETER',
        status: 'UNAVAILABLE',
        currentValue: 'Not Connected',
        unit: '° & g',
        pinInterface: 'I2C (SDA/SCL - 0x53)',
        description: 'Digital triple-axis sensor for slope angle tilt and vibration. Currently marked as unavailable/not connected on this node prototype.',
        lastReadingTime: 'Module Disconnected',
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
      const response = await fetch(ENDPOINTS.SENSOR_READINGS(nodeId || 'NODE-001'));
      if (!response.ok) {
        throw new Error('Failed to fetch historical readings');
      }
      const raw = await response.json();
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((r: any) => ({
          time: r.timestamp || '00:00',
          temperature: r.temperature,
          humidity: r.humidity,
          rainfall: r.rainfall,
          soilMoisture: r.soilMoisture,
        })).reverse();
      }
      return MOCK_TELEMETRY_HISTORY;
    } catch (err) {
      console.warn('API error, falling back to mock telemetry history:', err);
      return MOCK_TELEMETRY_HISTORY;
    }
  },
};
