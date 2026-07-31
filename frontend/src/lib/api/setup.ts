import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export interface SetupInput {
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  businessName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  logo?: File | null;
  introImage?: File | null;
}

interface SetupResult {
  token: string;
  admin: { id: string; email: string; name: string };
}

export function useSetupStatus() {
  return useQuery({
    queryKey: ['setup-status'],
    queryFn: async () => (await api.get<{ isSetup: boolean }>('/setup/status')).data,
    staleTime: 0,
  });
}

export function useCompleteSetup() {
  return useMutation({
    mutationFn: async ({ logo, introImage, ...fields }: SetupInput) => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== '') formData.append(key, String(value));
      }
      if (logo) formData.append('logo', logo);
      if (introImage) formData.append('introImage', introImage);

      return (await api.post<SetupResult>('/setup', formData)).data;
    },
  });
}
