import type { EventType } from '@/types/api';

export const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'RECEPTION', label: 'Reception' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'HOUSEWARMING', label: 'Housewarming' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'CORPORATE', label: 'Corporate Event' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
  { value: 'NAMING_CEREMONY', label: 'Naming Ceremony' },
  { value: 'BABY_SHOWER', label: 'Baby Shower' },
  { value: 'OTHER', label: 'Other' },
];
