import { z } from 'zod';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Plain shape with no .default() on any field — used as-is (fully optional)
// for updates, so a partial payload never silently resets an unspecified
// field back to a default value. Defaults are only added on the create
// variant below.
const categoryShape = {
  name: z.string().min(1),
  nameTe: z.string().optional(),
  // Never asked for in the admin UI — auto-derived from `name` on create,
  // left untouched on update (so URLs/links to a category don't shift just
  // because someone renamed it).
  slug: z.string().optional(),
  description: z.string().optional(),
  descriptionTe: z.string().optional(),
  imageUrl: z.string().url().optional(),
  pricingMode: z.enum(['FLAT', 'PER_PERSON']),
  isFood: z.boolean(),
  isDecoration: z.boolean(),
  allowMultiple: z.boolean(),
  isActive: z.boolean(),
  order: z.number().int(),
};

export const createCategorySchema = z
  .object({
    ...categoryShape,
    pricingMode: categoryShape.pricingMode.default('FLAT'),
    isFood: categoryShape.isFood.default(false),
    isDecoration: categoryShape.isDecoration.default(false),
    allowMultiple: categoryShape.allowMultiple.default(false),
    isActive: categoryShape.isActive.default(true),
    order: categoryShape.order.default(0),
  })
  .transform((data) => ({
    ...data,
    slug: slugify(data.slug?.trim() ? data.slug : data.name) || `category-${Date.now()}`,
  }));

export const updateCategorySchema = z.object(categoryShape).partial();

export const createCategoryTypeSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  nameTe: z.string().optional(),
  order: z.number().int().default(0),
});
export const updateCategoryTypeSchema = z
  .object({
    categoryId: z.string().min(1),
    name: z.string().min(1),
    nameTe: z.string().optional(),
    order: z.number().int(),
  })
  .partial();
