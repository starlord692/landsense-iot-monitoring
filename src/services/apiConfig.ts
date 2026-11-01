/**
 * API Configuration for LANDSense Backend Integration
 * Points to the inspected FastAPI backend endpoints at /api/v1
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Toggle between initial academic mock data and live FastAPI backend
// Keeps the frontend decoupled and easy to test standalone or connected
export const USE_MOCK_DATA = true;

export const ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  SENSORS: `${API_BASE_URL}/sensors`,
  SENSOR_DETAIL: (nodeId: string) => `${API_BASE_URL}/sensors/${nodeId}`,
  SENSOR_READINGS: (nodeId: string) => `${API_BASE_URL}/sensors/${nodeId}/readings`,
  RISK_CURRENT: `${API_BASE_URL}/risk/current`,
  RISK_BY_NODE: (nodeId: string) => `${API_BASE_URL}/risk/${nodeId}`,
  ALERTS: `${API_BASE_URL}/alerts`,
  ACKNOWLEDGE_ALERT: (alertId: string) => `${API_BASE_URL}/alerts/${alertId}/acknowledge`,
};

