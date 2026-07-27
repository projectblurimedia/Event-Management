import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { DashboardAnalytics, DashboardOverview } from '@/types/api';

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => (await api.get<DashboardOverview>('/admin/dashboard/overview')).data,
    refetchInterval: 60_000,
  });
}

export function useDashboardAnalytics(from: string, to: string) {
  return useQuery({
    queryKey: ['dashboard', 'analytics', from, to],
    queryFn: async () =>
      (await api.get<DashboardAnalytics>('/admin/dashboard/analytics', { params: { from, to } })).data,
    refetchOnMount: 'always',
  });
}
