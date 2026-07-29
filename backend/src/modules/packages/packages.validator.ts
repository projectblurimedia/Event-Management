import { z } from 'zod';

// No .default() here — used as-is (fully optional) for updates, so a
// partial payload never silently resets an unspecified field to a default.
const packageShape = {
  name: z.string().min(1),
  nameTe: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  order: z.number().int(),
  /// Ordered list of bulletins (categories) this package walks the customer
  /// through — no price of its own, the total comes purely from item picks.
  categoryIds: z.array(z.string().min(1)),
};

export const createPackageSchema = z.object({
  ...packageShape,
  isFeatured: packageShape.isFeatured.default(false),
  isActive: packageShape.isActive.default(true),
  order: packageShape.order.default(0),
  categoryIds: packageShape.categoryIds.default([]),
});
export const updatePackageSchema = z.object(packageShape).partial();
