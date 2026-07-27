import { z } from 'zod';

export const updateSettingsSchema = z.object({
  businessName: z.string().min(1).optional(),
  organiser: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  whatsapp: z.string().min(1).optional(),
  email: z.string().email().optional(),
  address: z.string().min(1).optional(),
  mapEmbedUrl: z.string().url().optional(),
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
