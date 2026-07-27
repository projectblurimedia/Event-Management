import { Router } from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import { loginSchema } from './auth.validator';
import { loginHandler } from './auth.controller';
import { requestOtpSchema, resetPasswordSchema, verifyOtpSchema } from './passwordReset.validator';
import { requestOtpHandler, resetPasswordHandler, verifyOtpHandler } from './passwordReset.controller';

export const authRouter = Router();

authRouter.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), loginHandler);

authRouter.post(
  '/forgot-password/request',
  authRateLimiter,
  validateRequest({ body: requestOtpSchema }),
  requestOtpHandler,
);
authRouter.post(
  '/forgot-password/verify',
  authRateLimiter,
  validateRequest({ body: verifyOtpSchema }),
  verifyOtpHandler,
);
authRouter.post(
  '/forgot-password/reset',
  authRateLimiter,
  validateRequest({ body: resetPasswordSchema }),
  resetPasswordHandler,
);
