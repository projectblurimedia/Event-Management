import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { updateSettingsSchema } from './settings.validator';
import { getSettingsHandler, updateSettingsHandler } from './settings.controller';

export const settingsRouter = Router();
settingsRouter.get('/', getSettingsHandler);

export const adminSettingsRouter = Router();
adminSettingsRouter.put(
  '/',
  requireAuth,
  validateRequest({ body: updateSettingsSchema }),
  updateSettingsHandler,
);
