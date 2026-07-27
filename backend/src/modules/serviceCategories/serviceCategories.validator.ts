import { z } from 'zod';

export const createServiceCategorySchema = z.object({
  name: z.string().min(1),
  nameTe: z.string().optional(),
  slug: z.string().min(1),
  description: z.string().optional(),
  descriptionTe: z.string().optional(),
  imageUrl: z.string().url().optional(),
  allowMultiple: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});
export const updateServiceCategorySchema = createServiceCategorySchema.partial();

export const createServiceOptionSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  nameTe: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  unit: z.enum(['FLAT', 'PER_GUEST']).default('FLAT'),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});
export const updateServiceOptionSchema = createServiceOptionSchema.partial();
