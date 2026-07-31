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
const eventTypeShape = {
  name: z.string().min(1),
  nameTe: z.string().optional(),
  // Never asked for in the admin UI — auto-derived from `name` on create,
  // left untouched on update (so links to an event type don't shift just
  // because someone renamed it).
  slug: z.string().optional(),
  description: z.string().optional(),
  descriptionTe: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
  order: z.number().int(),
};

export const createEventTypeSchema = z
  .object({
    ...eventTypeShape,
    isActive: eventTypeShape.isActive.default(true),
    order: eventTypeShape.order.default(0),
  })
  .transform((data) => ({
    ...data,
    slug: slugify(data.slug?.trim() ? data.slug : data.name) || `event-type-${Date.now()}`,
  }));

export const updateEventTypeSchema = z.object(eventTypeShape).partial();
