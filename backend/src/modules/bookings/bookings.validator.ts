import { z } from 'zod';

export const eventTypeEnum = z.enum([
  'WEDDING',
  'RECEPTION',
  'BIRTHDAY',
  'HOUSEWARMING',
  'ENGAGEMENT',
  'CORPORATE',
  'ANNIVERSARY',
  'NAMING_CEREMONY',
  'BABY_SHOWER',
  'OTHER',
]);

export const bookingStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);
export const dietaryPreferenceEnum = z.enum(['VEG', 'NON_VEG', 'BOTH']);

export const createBookingSchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(6),
  altPhone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().min(1),

  eventDate: z.coerce.date(),
  eventTime: z.string().min(1),
  eventType: eventTypeEnum,
  guestCount: z.number().int().positive(),

  packageId: z.string().optional(),
  dietaryPreference: dietaryPreferenceEnum.optional(),
  items: z
    .array(z.object({ itemId: z.string().min(1), quantity: z.number().int().positive() }))
    .default([]),

  specialRequirements: z.string().optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const quoteSchema = createBookingSchema.pick({
  guestCount: true,
  packageId: true,
  items: true,
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export const bookingLookupSchema = z.object({
  code: z.string().min(1),
  phone: z.string().min(6),
});

export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum,
});

export const bookingFiltersSchema = z.object({
  status: bookingStatusEnum.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
