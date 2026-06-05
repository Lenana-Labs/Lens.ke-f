import useSWR from 'swr';
import { contributorApi } from '@/lib/api/contributor';
import type { DashboardMetrics } from '@/types/contributor';

export function useDashboardMetrics() {
  const { data, error, isLoading, mutate } = useSWR<DashboardMetrics>(
    '/api/contributor/metrics/',
    contributorApi.getMetrics
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate,
  };
}
