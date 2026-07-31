import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import { createEventTypeSchema, updateEventTypeSchema } from './eventTypes.validator';

export const eventTypes = createCrudRouters({
  delegate: prisma.eventType,
  createSchema: createEventTypeSchema,
  updateSchema: updateEventTypeSchema,
  publicWhere: { isActive: true },
  orderBy: { order: 'asc' },
});
