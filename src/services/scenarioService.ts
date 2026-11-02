import { ENDPOINTS, USE_MOCK_DATA, API_FETCH_HEADERS } from './apiConfig';

export type RiskScenarioType = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type ModeType = 'LIVE' | 'SCENARIO';

export interface ScenarioState {
  mode: ModeType;
  scenario: RiskScenarioType | null;
  risk_score: number | null;
  led_status: string | null;
  simulated_rainfall: number | null;
  simulated_soil_moisture: number | null;
  simulated_temperature: number | null;
  simulated_humidity: number | null;
  activated_at: string | null;
  expires_at: string | null;
  expires_in_seconds: number;
}

export const SCENARIO_PRESETS: Record<RiskScenarioType, {
  name: RiskScenarioType;
  riskScore: number;
  ledStatus: string;
  ledPin: string;
  ledColor: string;
  blinkMode: string;
  rainfall: number;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  description: string;
}> = {
  NORMAL: {
    name: 'NORMAL',
    riskScore: 15,
    ledStatus: 'Green LED ON',
    ledPin: 'GPIO 26',
    ledColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    blinkMode: 'Solid ON',
    rainfall: 0.0,
    soilMoisture: 18.0,
    temperature: 24.5,
    humidity: 62.0,
    description: 'Dry slope conditions. Base stability maintained with no pore pressure.'
  },
  WATCH: {
    name: 'WATCH',
    riskScore: 40,
    ledStatus: 'Yellow LED ON',
    ledPin: 'GPIO 27',
    ledColor: 'text-amber-700 bg-amber-50 border-amber-200',
    blinkMode: 'Solid ON',
    rainfall: 16.5,
    soilMoisture: 45.0,
    temperature: 23.0,
    humidity: 78.0,
    description: 'Moderate rain detected. Topsoil saturation rising steadily.'
  },
  WARNING: {
    name: 'WARNING',
    riskScore: 65,
    ledStatus: 'Yellow LED Blinking',
    ledPin: 'GPIO 27',
    ledColor: 'text-orange-700 bg-orange-50 border-orange-200',
    blinkMode: 'Blinking (500ms)',
    rainfall: 38.0,
    soilMoisture: 68.0,
    temperature: 21.5,
    humidity: 89.0,
    description: 'Heavy precipitation. High moisture approaching shear-plane failure threshold.'
  },
  CRITICAL: {
    name: 'CRITICAL',
    riskScore: 90,
    ledStatus: 'Red LED Blinking',
    ledPin: 'GPIO 14',
    ledColor: 'text-rose-700 bg-rose-50 border-rose-200',
    blinkMode: 'Blinking (250ms)',
    rainfall: 54.0,
    soilMoisture: 88.0,
    temperature: 20.0,
    humidity: 96.0,
    description: 'CRITICAL RISK: Slope failure imminent. Saturated slip plane detected.'
  }
};

const DEFAULT_LIVE_STATE: ScenarioState = {
  mode: 'LIVE',
  scenario: null,
  risk_score: null,
  led_status: null,
  simulated_rainfall: null,
  simulated_soil_moisture: null,
  simulated_temperature: null,
  simulated_humidity: null,
  activated_at: null,
  expires_at: null,
  expires_in_seconds: 0
};

export const scenarioService = {
  /**
   * Fetch current demonstration scenario state from the backend
   */
  async getScenarioState(): Promise<ScenarioState> {
    if (USE_MOCK_DATA) {
      return DEFAULT_LIVE_STATE;
    }

    try {
      const response = await fetch(ENDPOINTS.SCENARIO, { headers: API_FETCH_HEADERS });
      if (!response.ok) {
        throw new Error(`Failed to fetch scenario state: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('Could not fetch scenario state:', err);
      return DEFAULT_LIVE_STATE;
    }
  },

  /**
   * Activate demonstration scenario and instruct physical ESP32 LEDs
   */
  async setScenario(scenario: RiskScenarioType, durationSeconds: number = 300): Promise<ScenarioState> {
    if (USE_MOCK_DATA) {
      const preset = SCENARIO_PRESETS[scenario];
      return {
        mode: 'SCENARIO',
        scenario,
        risk_score: preset.riskScore,
        led_status: preset.ledStatus,
        simulated_rainfall: preset.rainfall,
        simulated_soil_moisture: preset.soilMoisture,
        simulated_temperature: preset.temperature,
        simulated_humidity: preset.humidity,
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + durationSeconds * 1000).toISOString(),
        expires_in_seconds: durationSeconds
      };
    }

    try {
      const response = await fetch(ENDPOINTS.SCENARIO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...API_FETCH_HEADERS,
        },
        body: JSON.stringify({
          mode: 'SCENARIO',
          scenario,
          duration_seconds: durationSeconds
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to set scenario' }));
        throw new Error(errorData.detail || `Server error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('Backend scenario endpoint unreachable, activating client demonstration preset:', err);
      const preset = SCENARIO_PRESETS[scenario];
      return {
        mode: 'SCENARIO',
        scenario,
        risk_score: preset.riskScore,
        led_status: preset.ledStatus,
        simulated_rainfall: preset.rainfall,
        simulated_soil_moisture: preset.soilMoisture,
        simulated_temperature: preset.temperature,
        simulated_humidity: preset.humidity,
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + durationSeconds * 1000).toISOString(),
        expires_in_seconds: durationSeconds
      };
    }
  },

  /**
   * Return immediately to Live Hardware Mode
   */
  async resetToLive(): Promise<ScenarioState> {
    if (USE_MOCK_DATA) {
      return DEFAULT_LIVE_STATE;
    }

    try {
      const response = await fetch(ENDPOINTS.SCENARIO_RESET, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Failed to reset scenario: ${response.status}`);
      }

      return await response.json();
    } catch {
      return DEFAULT_LIVE_STATE;
    }
  }
};

