import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import { createItemSchema, updateItemSchema } from './items.validator';

// Every item read joins its categoryType -> category so the frontend knows
// pricingMode (flat vs per-person) and isFood without extra round-trips.
const include = {
  categoryType: { include: { category: true } },
};

export const items = createCrudRouters({
  delegate: prisma.item,
  createSchema: createItemSchema,
  updateSchema: updateItemSchema,
  publicWhere: { isAvailable: true },
  orderBy: { order: 'asc' },
  include,
});
