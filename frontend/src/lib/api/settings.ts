import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { SiteSettings } from '@/types/api';

const key = ['settings'];

export function useSettings() {
  return useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<SiteSettings>('/settings')).data,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SiteSettings>) =>
      (await api.put<SiteSettings>('/admin/settings', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
