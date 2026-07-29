import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { cloudinary } from '../../config/cloudinary';
import * as setupService from './setup.service';

export const getSetupStatusHandler = asyncHandler(async (_req: Request, res: Response) => {
  const isSetup = await setupService.isSetupComplete();
  res.json({ isSetup });
});

export const completeSetupHandler = asyncHandler(async (req: Request, res: Response) => {
  let logoUrl: string | undefined;

  if (req.file) {
    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'event-management-logos' },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Logo upload failed'));
          resolve(result);
        },
      );
      stream.end(req.file!.buffer);
    });
    logoUrl = uploaded.secure_url;
  }

  const result = await setupService.completeSetup(req.body, logoUrl);
  res.status(201).json(result);
});
