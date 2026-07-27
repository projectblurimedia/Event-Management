import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UploadResult {
  url: string;
  publicId: string;
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<UploadResult>('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
}
