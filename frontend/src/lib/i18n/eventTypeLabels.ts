import type { TranslationKey } from './translations';
import type { EventType } from '@/types/api';

export const eventTypeLabelKeys: Record<EventType, TranslationKey> = {
  WEDDING: 'eventType.wedding',
  RECEPTION: 'eventType.reception',
  BIRTHDAY: 'eventType.birthday',
  HOUSEWARMING: 'eventType.housewarming',
  ENGAGEMENT: 'eventType.engagement',
  CORPORATE: 'eventType.corporate',
  ANNIVERSARY: 'eventType.anniversary',
  NAMING_CEREMONY: 'eventType.namingCeremony',
  BABY_SHOWER: 'eventType.babyShower',
  OTHER: 'eventType.other',
};
