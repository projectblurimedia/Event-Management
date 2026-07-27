import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { asyncHandler } from '../../utils/asyncHandler';
import { createPackageSchema, updatePackageSchema } from './packages.validator';
import * as packagesService from './packages.service';

export const packagesPublicRouter = Router();
packagesPublicRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await packagesService.listPackages(true));
  }),
);
packagesPublicRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await packagesService.getPackage(req.params.id as string));
  }),
);

export const packagesAdminRouter = Router();
packagesAdminRouter.use(requireAuth);

packagesAdminRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await packagesService.listPackages(false));
  }),
);

packagesAdminRouter.post(
  '/',
  validateRequest({ body: createPackageSchema }),
  asyncHandler(async (req, res) => {
    res.status(201).json(await packagesService.createPackage(req.body));
  }),
);

packagesAdminRouter.put(
  '/:id',
  validateRequest({ body: updatePackageSchema }),
  asyncHandler(async (req, res) => {
    res.json(await packagesService.updatePackage(req.params.id as string, req.body));
  }),
);

packagesAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await packagesService.deletePackage(req.params.id as string);
    res.status(204).send();
  }),
);
