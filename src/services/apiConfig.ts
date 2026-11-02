/**
 * API Configuration for LANDSense Backend Integration
 * Points to the FastAPI backend endpoints at /api/v1
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Toggle between initial academic mock data and live FastAPI backend
// When false, dashboard actively communicates with the live backend every 3 seconds
export const USE_MOCK_DATA = false;

export const ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  SENSORS: `${API_BASE_URL}/sensors`,
  SENSOR_DETAIL: (nodeId: string) => `${API_BASE_URL}/sensors/${nodeId}`,
  SENSOR_READINGS: (nodeId: string) => `${API_BASE_URL}/sensors/${nodeId}/readings`,
  READINGS_LATEST: (nodeId: string = 'NODE-001') => `${API_BASE_URL}/readings/latest?node_id=${nodeId}`,
  READINGS_HISTORY: (nodeId: string = 'NODE-001', limit: number = 20) => `${API_BASE_URL}/readings/history?node_id=${nodeId}&limit=${limit}`,
  RISK_CURRENT: `${API_BASE_URL}/risk/current`,
  RISK_BY_NODE: (nodeId: string) => `${API_BASE_URL}/risk/${nodeId}`,
  ALERTS: `${API_BASE_URL}/alerts`,
  ACKNOWLEDGE_ALERT: (alertId: string) => `${API_BASE_URL}/alerts/${alertId}/acknowledge`,
  SCENARIO: `${API_BASE_URL}/scenario`,
  SCENARIO_RESET: `${API_BASE_URL}/scenario/reset`,
};
