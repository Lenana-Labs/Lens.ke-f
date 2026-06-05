import type { DashboardMetrics } from '@/types/contributor';

/**
 * Mock Contributor API.
 * When backend connection details arrive, replace these with real `apiClient` calls.
 * Example: `apiClient.get<DashboardMetrics>('/api/contributor/metrics/')`
 */
export const contributorApi = {
  /**
   * MOCK: Fetches contributor dashboard summary metrics.
   * Expected real endpoint: GET /api/contributor/metrics/
   */
  getMetrics: async (): Promise<DashboardMetrics> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return {
      totalEarnings: 45200,
      earningsChange: '+12.5%',
      earningsPositive: true,
      totalViews: 124500,
      viewsChange: '+5.2%',
      viewsPositive: true,
      totalDownloads: 342,
      downloadsChange: '-2.1%',
      downloadsPositive: false,
      activePhotos: 128,
      photosChange: '+4',
      photosPositive: true,
    };
  },
};
