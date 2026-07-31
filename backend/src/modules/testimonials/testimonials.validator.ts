import { z } from 'zod';

export const createTestimonialSchema = z.object({
  customerName: z.string().min(1),
  eventTypeId: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).default(5),
  message: z.string().min(1),
  messageTe: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isPublished: z.boolean().default(true),
  order: z.number().int().default(0),
});
export const updateTestimonialSchema = createTestimonialSchema.partial();
