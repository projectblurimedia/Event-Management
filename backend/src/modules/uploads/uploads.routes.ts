import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { cloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { signatureRequestSchema, confirmUploadSchema } from './uploads.validator';

// Videos are far more expensive against Cloudinary's free-tier storage/
// bandwidth credits than images, so they're capped sitewide (across every
// field that can hold an uploaded URL — item images, hero image, intro
// image, ...) rather than per-field.
const VIDEO_LIMIT = 4;
const FOLDER = 'ms-wedding-planner';

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);

uploadsRouter.get(
  '/usage',
  asyncHandler(async (_req, res) => {
    const videoCount = await prisma.mediaAsset.count({ where: { resourceType: 'VIDEO' } });
    res.json({ videoCount, videoLimit: VIDEO_LIMIT });
  }),
);

// The file itself is uploaded straight from the browser to Cloudinary, not
// routed through this backend — Vercel's Node.js Serverless Functions cap
// the request body at ~4.5MB, which almost any real video exceeds, and the
// resulting rejection surfaces to the customer as a misleading "no internet
// connection" error. This endpoint only hands out a short-lived signature
// (and enforces the sitewide video cap) — both tiny, ordinary JSON calls.
uploadsRouter.post(
  '/signature',
  validateRequest({ body: signatureRequestSchema }),
  asyncHandler(async (req, res) => {
    const { resourceType } = req.body as { resourceType: 'image' | 'video' };

    if (resourceType === 'video') {
      const videoCount = await prisma.mediaAsset.count({ where: { resourceType: 'VIDEO' } });
      if (videoCount >= VIDEO_LIMIT) {
        throw ApiError.badRequest(
          `You've reached the sitewide limit of ${VIDEO_LIMIT} videos. Delete an existing video before uploading a new one.`,
        );
      }
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder: FOLDER }, env.CLOUDINARY_API_SECRET);

    res.json({
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder: FOLDER,
      resourceType,
    });
  }),
);

// Called after the browser's direct-to-Cloudinary upload succeeds, so we can
// track it for the sitewide video cap (and clean it up later via delete).
uploadsRouter.post(
  '/confirm',
  validateRequest({ body: confirmUploadSchema }),
  asyncHandler(async (req, res) => {
    const { publicId, url, resourceType } = req.body as {
      publicId: string;
      url: string;
      resourceType: 'image' | 'video';
    };

    await prisma.mediaAsset.create({
      data: { publicId, url, resourceType: resourceType === 'video' ? 'VIDEO' : 'IMAGE' },
    });

    res.status(201).json({ url, publicId, resourceType });
  }),
);

uploadsRouter.delete(
  '/:publicId',
  asyncHandler(async (req, res) => {
    const publicId = decodeURIComponent(req.params.publicId as string);
    const asset = await prisma.mediaAsset.findUnique({ where: { publicId } });

    await cloudinary.uploader.destroy(publicId, {
      resource_type: asset?.resourceType === 'VIDEO' ? 'video' : 'image',
    });
    if (asset) await prisma.mediaAsset.delete({ where: { publicId } });

    res.status(204).send();
  }),
);
