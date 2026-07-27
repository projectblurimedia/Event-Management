import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ContactEnquiry } from '@/types/api';

export interface CreateEnquiryInput {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export function useCreateEnquiry() {
  return useMutation({
    mutationFn: async (data: CreateEnquiryInput) =>
      (await api.post<ContactEnquiry>('/enquiries', data)).data,
  });
}

export function useAdminEnquiries() {
  return useQuery({
    queryKey: ['enquiries', 'admin'],
    queryFn: async () => (await api.get<ContactEnquiry[]>('/admin/enquiries')).data,
    refetchOnMount: 'always',
  });
}

export function useMarkEnquiryRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.patch(`/admin/enquiries/${id}/read`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enquiries', 'admin'] }),
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/enquiries/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enquiries', 'admin'] }),
  });
}
