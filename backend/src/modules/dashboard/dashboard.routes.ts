import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { asyncHandler } from '../../utils/asyncHandler';
import { analyticsQuerySchema } from './dashboard.validator';
import { getOverview, getAnalytics } from './dashboard.service';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    res.json(await getOverview());
  }),
);

dashboardRouter.get(
  '/analytics',
  validateRequest({ query: analyticsQuerySchema }),
  asyncHandler(async (req, res) => {
    const { from, to } = req.validatedQuery as { from: Date; to: Date };
    res.json(await getAnalytics(from, to));
  }),
);
