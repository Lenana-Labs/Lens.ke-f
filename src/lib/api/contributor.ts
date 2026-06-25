import { apiClient } from './client';
import type { DashboardMetrics } from '@/types/contributor';

export const contributorApi = {
  /**
   * Fetches contributor metrics for the dashboard home.
   * GET /api/v1/contributor/dashboard
   */
  getMetrics: async (): Promise<DashboardMetrics> => {
    const { data } = await apiClient.get<DashboardMetrics>('/api/v1/contributor/dashboard');
    return data;
  },

  /**
   * Updates payout configuration details (M-Pesa / Bank).
   * POST /api/v1/contributor/payout-method
   */
  updatePayoutMethod: async (payload: Record<string, any>): Promise<any> => {
    const { data } = await apiClient.post<any>('/api/v1/contributor/payout-method', payload);
    return data;
  },

  /**
   * Submits a cash withdrawal request to the backend.
   * POST /api/v1/contributor/withdraw
   */
  requestWithdrawal: async (payload: {
    amount: number;
    method: 'mpesa' | 'bank';
    details: Record<string, any>;
  }): Promise<any> => {
    const { data } = await apiClient.post<any>('/api/v1/contributor/withdraw', payload);
    return data;
  },
};
