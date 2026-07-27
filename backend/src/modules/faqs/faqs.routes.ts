import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import { createFaqSchema, updateFaqSchema } from './faqs.validator';

export const faqs = createCrudRouters({
  delegate: prisma.fAQ,
  createSchema: createFaqSchema,
  updateSchema: updateFaqSchema,
  publicWhere: { isPublished: true },
  orderBy: { order: 'asc' },
});
