import { z } from 'zod';

// No .default() here — used as-is (fully optional) for updates, so a
// partial payload never silently resets an unspecified field to a default.
const itemShape = {
  categoryTypeId: z.string().min(1),
  name: z.string().min(1),
  nameTe: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  images: z.array(z.string().url()).max(4, 'Up to 4 images allowed'),
  isVeg: z.boolean().optional(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  order: z.number().int(),
};

export const createItemSchema = z.object({
  ...itemShape,
  images: itemShape.images.default([]),
  isAvailable: itemShape.isAvailable.default(true),
  isFeatured: itemShape.isFeatured.default(false),
  order: itemShape.order.default(0),
});
export const updateItemSchema = z.object(itemShape).partial();
