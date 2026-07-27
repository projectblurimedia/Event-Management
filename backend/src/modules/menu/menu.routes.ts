import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import {
  createMenuCategorySchema,
  updateMenuCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} from './menu.validator';

export const menuCategories = createCrudRouters({
  delegate: prisma.menuCategory,
  createSchema: createMenuCategorySchema,
  updateSchema: updateMenuCategorySchema,
  orderBy: { order: 'asc' },
});

export const menuItems = createCrudRouters({
  delegate: prisma.menuItem,
  createSchema: createMenuItemSchema,
  updateSchema: updateMenuItemSchema,
  publicWhere: { isAvailable: true },
  orderBy: { name: 'asc' },
});
