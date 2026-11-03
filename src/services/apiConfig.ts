/**
 * API Configuration for LANDSense Backend Integration
 * Supports dynamic switching between Localhost, Cloud/Tunnel HTTPS URLs, and user overrides.
 */

const DEFAULT_LOCAL_URL = 'http://localhost:8000/api/v1';
export const DEFAULT_TUNNEL_URL = 'https://nevertheless-until-heat-antique.trycloudflare.com/api/v1';

/**
 * Resolves the active backend API Base URL:
 * 1. User manual override stored in localStorage ('landsense_api_base_url')
 * 2. Environment variable VITE_API_BASE_URL (if provided at build time)
 * 3. Auto-detected HTTPS cloud deployment (e.g., Vercel) -> defaults to HTTPS tunnel
 * 4. Fallback to local development endpoint
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('landsense_api_base_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  // When deployed to HTTPS (e.g. Vercel), default to the public HTTPS tunnel to prevent Mixed Content blocking
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return DEFAULT_TUNNEL_URL;
  }

  return DEFAULT_LOCAL_URL;
}

export function setApiBaseUrl(url: string | null): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '') {
      localStorage.removeItem('landsense_api_base_url');
    } else {
      localStorage.setItem('landsense_api_base_url', url.trim().replace(/\/+$/, ''));
    }
  }
}

// Toggle between initial academic mock data and live FastAPI backend
export const USE_MOCK_DATA = false;

// Standard headers for all API requests (includes tunnel bypass)
export const API_FETCH_HEADERS: HeadersInit = {
  'Bypass-Tunnel-Reminder': 'true',
};

export const ENDPOINTS = {
  get HEALTH() { return `${getApiBaseUrl()}/health`; },
  get SENSORS() { return `${getApiBaseUrl()}/sensors`; },
  SENSOR_DETAIL: (nodeId: string) => `${getApiBaseUrl()}/sensors/${nodeId}`,
  SENSOR_READINGS: (nodeId: string) => `${getApiBaseUrl()}/sensors/${nodeId}/readings`,
  READINGS_LATEST: (nodeId: string = 'NODE-001') => `${getApiBaseUrl()}/readings/latest?node_id=${nodeId}`,
  READINGS_HISTORY: (nodeId: string = 'NODE-001', limit: number = 20) => `${getApiBaseUrl()}/readings/history?node_id=${nodeId}&limit=${limit}`,
  get RISK_CURRENT() { return `${getApiBaseUrl()}/risk/current`; },
  RISK_BY_NODE: (nodeId: string) => `${getApiBaseUrl()}/risk/${nodeId}`,
  get ALERTS() { return `${getApiBaseUrl()}/alerts`; },
  ACKNOWLEDGE_ALERT: (alertId: string) => `${getApiBaseUrl()}/alerts/${alertId}/acknowledge`,
  get SCENARIO() { return `${getApiBaseUrl()}/scenario`; },
  get SCENARIO_RESET() { return `${getApiBaseUrl()}/scenario/reset`; },
};
