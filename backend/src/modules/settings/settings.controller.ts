import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as settingsService from './settings.service';

export const getSettingsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSettings();
  res.json(settings);
});

export const updateSettingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateSettings(req.body);
  res.json(settings);
});
