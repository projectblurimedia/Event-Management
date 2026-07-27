import type { TranslationKey } from './translations';
import type { BookingStatus } from '@/types/api';

export const statusLabelKeys: Record<BookingStatus, TranslationKey> = {
  PENDING: 'status.PENDING',
  CONFIRMED: 'status.CONFIRMED',
  CANCELLED: 'status.CANCELLED',
  COMPLETED: 'status.COMPLETED',
};
