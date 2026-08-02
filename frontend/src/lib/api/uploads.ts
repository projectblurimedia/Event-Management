import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video';
}

interface SignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: 'image' | 'video';
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

      // 1. Ask our backend for a short-lived signature (also enforces the
      // sitewide video cap) — a tiny JSON round trip either way.
      const { data: sig } = await api.post<SignatureResult>('/admin/uploads/signature', { resourceType });

      // 2. Upload the actual file straight to Cloudinary from the browser.
      // Routing it through our own Vercel serverless function instead would
      // hit that platform's ~4.5MB request body ceiling — almost any real
      // video exceeds it, and the resulting rejection surfaces here as a
      // misleading "no internet connection" error.
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file', file);
      cloudinaryForm.append('api_key', sig.apiKey);
      cloudinaryForm.append('timestamp', String(sig.timestamp));
      cloudinaryForm.append('signature', sig.signature);
      cloudinaryForm.append('folder', sig.folder);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
        { method: 'POST', body: cloudinaryForm },
      );
      if (!cloudinaryResponse.ok) throw new Error('Upload to Cloudinary failed');
      const cloudinaryResult = await cloudinaryResponse.json();

      // 3. Register the asset with our backend for the sitewide video count.
      const { data } = await api.post<UploadResult>('/admin/uploads/confirm', {
        publicId: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
        resourceType: sig.resourceType,
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
