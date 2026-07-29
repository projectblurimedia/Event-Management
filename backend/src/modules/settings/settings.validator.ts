import { z } from 'zod';

export const updateSettingsSchema = z.object({
  businessName: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  organiser: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  whatsapp: z.string().min(1).optional(),
  email: z.string().email().optional(),
  address: z.string().min(1).optional(),
  // mapEmbedUrl is derived server-side from latitude/longitude, never set
  // directly — a hand-typed embed URL is how imprecise/broken maps happened
  // before. Send null for both to clear the pin and hide the map again.
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  heroHeadline: z.string().min(1).optional(),
  heroHeadlineTe: z.string().optional(),
  heroSubheadline: z.string().min(1).optional(),
  heroSubheadlineTe: z.string().optional(),
  heroImageUrl: z.string().url().optional(),
  businessIntroTitle: z.string().min(1).optional(),
  businessIntroTitleTe: z.string().optional(),
  businessIntroText: z.string().min(1).optional(),
  businessIntroTextTe: z.string().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
