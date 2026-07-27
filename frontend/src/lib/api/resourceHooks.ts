import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

/**
 * Mirrors the backend's generic CRUD factory (crudFactory.ts) — one call
 * per catalogue resource (menu items, decorations, services, gallery,
 * testimonials, FAQs, packages) instead of hand-writing the same
 * list/create/update/delete hooks eight times.
 */
export function createResourceHooks<T>(resource: string) {
  const publicKey = [resource, 'public'];
  const adminKey = [resource, 'admin'];

  function usePublicList() {
    return useQuery({
      queryKey: publicKey,
      queryFn: async () => (await api.get<T[]>(`/${resource}`)).data,
    });
  }

  function useAdminList() {
    return useQuery({
      queryKey: adminKey,
      queryFn: async () => (await api.get<T[]>(`/admin/${resource}`)).data,
    });
  }

  function useAdminCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (data: Partial<T>) => (await api.post<T>(`/admin/${resource}`, data)).data,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKey });
        queryClient.invalidateQueries({ queryKey: publicKey });
      },
    });
  }

  function useAdminUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) =>
        (await api.put<T>(`/admin/${resource}/${id}`, data)).data,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKey });
        queryClient.invalidateQueries({ queryKey: publicKey });
      },
    });
  }

  function useAdminDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        await api.delete(`/admin/${resource}/${id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: adminKey });
        queryClient.invalidateQueries({ queryKey: publicKey });
      },
    });
  }

  return { usePublicList, useAdminList, useAdminCreate, useAdminUpdate, useAdminDelete };
}
