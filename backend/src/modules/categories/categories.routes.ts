import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import {
  createCategorySchema,
  updateCategorySchema,
  createCategoryTypeSchema,
  updateCategoryTypeSchema,
} from './categories.validator';

export const categories = createCrudRouters({
  delegate: prisma.category,
  createSchema: createCategorySchema,
  updateSchema: updateCategorySchema,
  publicWhere: { isActive: true },
  orderBy: { order: 'asc' },
});

export const categoryTypes = createCrudRouters({
  delegate: prisma.categoryType,
  createSchema: createCategoryTypeSchema,
  updateSchema: updateCategoryTypeSchema,
  orderBy: { order: 'asc' },
});
