import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      // Videos are much bigger than the 20s default timeout allows for,
      // especially over mobile data — give uploads room to actually finish
      // instead of aborting (and surfacing a misleading "no connection")
      // partway through a slow-but-working upload.
      const { data } = await api.post<UploadResult>('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 58_000,
      });
      return data;
    },
    onSuccess: (data) => {
      if (data.resourceType === 'video') queryClient.invalidateQueries({ queryKey: ['uploads', 'usage'] });
    },
  });
}

/** Deletes a previously-uploaded Cloudinary asset by its public ID — used to
 * clean up the old file when a field's image/video is replaced. Fire-and-forget
 * from callers' perspective; failures here shouldn't block the UI. */
export function useDeleteUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await api.delete(`/admin/uploads/${encodeURIComponent(publicId)}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['uploads', 'usage'] }),
  });
}

/** Sitewide video-slot usage (videos are capped across the whole app, not per-field). */
export function useUploadUsage() {
  return useQuery({
    queryKey: ['uploads', 'usage'],
    queryFn: async () => (await api.get<{ videoCount: number; videoLimit: number }>('/admin/uploads/usage')).data,
  });
}
