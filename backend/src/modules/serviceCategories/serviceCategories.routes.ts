import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
  createServiceOptionSchema,
  updateServiceOptionSchema,
} from './serviceCategories.validator';

export const serviceCategories = createCrudRouters({
  delegate: prisma.serviceCategory,
  createSchema: createServiceCategorySchema,
  updateSchema: updateServiceCategorySchema,
  publicWhere: { isActive: true },
  orderBy: { order: 'asc' },
});

export const serviceOptions = createCrudRouters({
  delegate: prisma.serviceOption,
  createSchema: createServiceOptionSchema,
  updateSchema: updateServiceOptionSchema,
  publicWhere: { isActive: true },
  orderBy: { order: 'asc' },
});
