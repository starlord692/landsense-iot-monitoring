import type { Alert } from '../types/alert';
import { MOCK_ALERTS } from './mockData';
import { ENDPOINTS, USE_MOCK_DATA } from './apiConfig';

export const alertService = {
  /**
   * Fetch all active and recent system alerts
   */
  async getAlerts(): Promise<Alert[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...MOCK_ALERTS]);
    }

    try {
      const response = await fetch(ENDPOINTS.ALERTS);
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API error, falling back to mock alerts:', err);
      return [...MOCK_ALERTS];
    }
  },

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<Alert> {
    if (USE_MOCK_DATA) {
      const alert = MOCK_ALERTS.find(a => a.id === alertId);
      if (alert) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = 'Duty Operator (Dashboard)';
        alert.acknowledgedAt = 'Just now';
        return Promise.resolve({ ...alert });
      }
      throw new Error(`Alert ${alertId} not found`);
    }

    try {
      const response = await fetch(ENDPOINTS.ACKNOWLEDGE_ALERT(alertId), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`API error acknowledging alert ${alertId}, modifying locally:`, err);
      const alert = MOCK_ALERTS.find(a => a.id === alertId);
      if (alert) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = 'Duty Operator (Dashboard)';
        alert.acknowledgedAt = 'Just now';
        return { ...alert };
      }
      throw err;
    }
  },
};
