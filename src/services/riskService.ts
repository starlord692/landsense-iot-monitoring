import type { RiskAssessment } from '../types/risk';
import { MOCK_RISK_ASSESSMENT } from './mockData';
import { ENDPOINTS, USE_MOCK_DATA } from './apiConfig';

export const riskService = {
  /**
   * Fetch latest risk assessment payload for the primary dashboard monitoring zone
   */
  async getCurrentRisk(): Promise<RiskAssessment> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_RISK_ASSESSMENT);
    }

    try {
      const response = await fetch(ENDPOINTS.RISK_CURRENT);
      if (!response.ok) {
        throw new Error(`Failed to fetch current risk assessment: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('API error, falling back to mock risk assessment:', err);
      return MOCK_RISK_ASSESSMENT;
    }
  },

  /**
   * Fetch risk assessment for a specific node
   */
  async getRiskByNode(nodeId: string): Promise<RiskAssessment> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(MOCK_RISK_ASSESSMENT);
    }

    try {
      const response = await fetch(ENDPOINTS.RISK_BY_NODE(nodeId));
      if (!response.ok) {
        throw new Error(`Failed to fetch risk for node ${nodeId}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`API error for risk node ${nodeId}, falling back to mock:`, err);
      return MOCK_RISK_ASSESSMENT;
    }
  },
};
