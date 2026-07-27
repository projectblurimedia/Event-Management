import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../middlewares/requireAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { createEnquirySchema } from './enquiries.validator';

export const enquiriesPublicRouter = Router();

enquiriesPublicRouter.post(
  '/',
  validateRequest({ body: createEnquirySchema }),
  asyncHandler(async (req, res) => {
    const enquiry = await prisma.contactEnquiry.create({ data: req.body });
    res.status(201).json(enquiry);
  }),
);

export const enquiriesAdminRouter = Router();
enquiriesAdminRouter.use(requireAuth);

enquiriesAdminRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const enquiries = await prisma.contactEnquiry.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(enquiries);
  }),
);

enquiriesAdminRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const enquiry = await prisma.contactEnquiry.update({
      where: { id: req.params.id as string },
      data: { isRead: true },
    });
    res.json(enquiry);
  }),
);

enquiriesAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.contactEnquiry.findUnique({ where: { id: req.params.id as string } });
    if (!existing) throw ApiError.notFound('Enquiry not found');
    await prisma.contactEnquiry.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  }),
);
