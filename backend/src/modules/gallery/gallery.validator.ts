import { z } from 'zod';

export const createGalleryImageSchema = z.object({
  category: z.enum(['FOOD', 'DECORATION', 'EVENT']),
  imageUrl: z.string().url(),
  caption: z.string().optional(),
  captionTe: z.string().optional(),
  order: z.number().int().default(0),
});
export const updateGalleryImageSchema = createGalleryImageSchema.partial();
