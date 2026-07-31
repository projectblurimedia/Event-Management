import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { cloudinary } from '../../config/cloudinary';
import * as setupService from './setup.service';

function uploadToCloudinary(file: Express.Multer.File, folder: string) {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error || !result) return reject(error ?? new Error('Image upload failed'));
      resolve(result.secure_url);
    });
    stream.end(file.buffer);
  });
}

export const getSetupStatusHandler = asyncHandler(async (_req: Request, res: Response) => {
  const isSetup = await setupService.isSetupComplete();
  res.json({ isSetup });
});

export const completeSetupHandler = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const logoFile = files?.logo?.[0];
  const introImageFile = files?.introImage?.[0];

  const [logoUrl, businessIntroImageUrl] = await Promise.all([
    logoFile ? uploadToCloudinary(logoFile, 'event-management-logos') : Promise.resolve(undefined),
    introImageFile ? uploadToCloudinary(introImageFile, 'event-management-intro') : Promise.resolve(undefined),
  ]);

  const result = await setupService.completeSetup(req.body, { logoUrl, businessIntroImageUrl });
  res.status(201).json(result);
});
