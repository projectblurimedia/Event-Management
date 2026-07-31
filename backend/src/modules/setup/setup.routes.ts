import { Router } from 'express';
import multer from 'multer';
import { validateRequest } from '../../middlewares/validateRequest';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { setupSchema } from './setup.validator';
import { getSetupStatusHandler, completeSetupHandler } from './setup.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const setupRouter = Router();

setupRouter.get('/status', getSetupStatusHandler);
setupRouter.post(
  '/',
  authRateLimiter,
  // Logo and intro image are optional files, sent as multipart/form-data
  // alongside the other setup fields — multer must parse the body before
  // zod validates it.
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'introImage', maxCount: 1 },
  ]),
  validateRequest({ body: setupSchema }),
  completeSetupHandler,
);
