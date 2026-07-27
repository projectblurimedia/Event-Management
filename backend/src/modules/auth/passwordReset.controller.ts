import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as passwordResetService from './passwordReset.service';

export const requestOtpHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await passwordResetService.requestPasswordResetOtp(req.body);
  res.json(result);
});

export const verifyOtpHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await passwordResetService.verifyPasswordResetOtp(req.body);
  res.json(result);
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await passwordResetService.resetPassword(req.body);
  res.json(result);
});
