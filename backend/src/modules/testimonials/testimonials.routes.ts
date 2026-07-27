import { prisma } from '../../config/prisma';
import { createCrudRouters } from '../../utils/crudFactory';
import { createTestimonialSchema, updateTestimonialSchema } from './testimonials.validator';

export const testimonials = createCrudRouters({
  delegate: prisma.testimonial,
  createSchema: createTestimonialSchema,
  updateSchema: updateTestimonialSchema,
  publicWhere: { isPublished: true },
  orderBy: { order: 'asc' },
});
