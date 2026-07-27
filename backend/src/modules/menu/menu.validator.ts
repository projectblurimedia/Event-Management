import { z } from 'zod';

export const createMenuCategorySchema = z.object({
  name: z.string().min(1),
  nameTe: z.string().optional(),
  slug: z.string().min(1),
  order: z.number().int().default(0),
});
export const updateMenuCategorySchema = createMenuCategorySchema.partial();

export const createMenuItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  nameTe: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});
export const updateMenuItemSchema = createMenuItemSchema.partial();
