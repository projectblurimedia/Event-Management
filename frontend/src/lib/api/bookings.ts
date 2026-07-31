import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Booking, BookingDetail, BookingStatus, BookingStatusResult, DietaryPreference } from '@/types/api';

export interface BookingSelection {
  guestCount: number;
  packageId?: string;
  items: { itemId: string }[];
}

export interface CreateBookingInput extends BookingSelection {
  customerName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address: string;
  eventDate: string;
  eventTime: string;
  eventTypeId: string;
  dietaryPreference?: DietaryPreference;
  specialRequirements?: string;
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (data: CreateBookingInput) => (await api.post<Booking>('/bookings', data)).data,
  });
}

export function useBookingLookup() {
  return useMutation({
    mutationFn: async ({ code, phone }: { code: string; phone: string }) =>
      (await api.get<BookingStatusResult>('/bookings/lookup', { params: { code, phone } })).data,
  });
}

export function quotationDownloadUrl(bookingId: string, phone: string) {
  const base = import.meta.env.VITE_API_URL ?? '/api';
  return `${base}/bookings/${bookingId}/quotation.pdf?phone=${encodeURIComponent(phone)}`;
}

export interface AdminBookingsFilters {
  status?: BookingStatus;
  from?: string;
  to?: string;
}

export function useAdminBookings(filters: AdminBookingsFilters) {
  return useQuery({
    queryKey: ['bookings', 'admin', 'list', filters],
    queryFn: async () => (await api.get<Booking[]>('/admin/bookings', { params: filters })).data,
    refetchOnMount: 'always',
  });
}

export function useAdminBooking(id: string | undefined) {
  return useQuery({
    queryKey: ['bookings', 'admin', 'detail', id],
    queryFn: async () => (await api.get<BookingDetail>(`/admin/bookings/${id}`)).data,
    enabled: !!id,
    refetchOnMount: 'always',
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) =>
      (await api.patch<Booking>(`/admin/bookings/${id}/status`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings', 'admin'] }),
  });
}

/**
 * The export endpoints are JWT-protected, so a plain `<a href>` can't carry
 * the Authorization header — fetch as a blob via the authenticated `api`
 * client instead and trigger the download manually.
 */
export async function downloadBookingsExport(type: 'xlsx' | 'pdf', filters: AdminBookingsFilters) {
  const response = await api.get(`/admin/bookings/export.${type}`, {
    params: filters,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `bookings.${type}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
