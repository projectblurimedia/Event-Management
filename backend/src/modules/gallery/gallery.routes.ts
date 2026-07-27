import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import { createGalleryImageSchema, updateGalleryImageSchema } from './gallery.validator';

export const gallery = createCrudRouters({
  delegate: prisma.galleryImage,
  createSchema: createGalleryImageSchema,
  updateSchema: updateGalleryImageSchema,
  orderBy: { order: 'asc' },
});
