import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middlewares/requireAuth';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { cloudinary } from '../../config/cloudinary';
import { prisma } from '../../config/prisma';

// Videos are far more expensive against Cloudinary's free-tier storage/
// bandwidth credits than images, so they're capped sitewide (across every
// field that can hold an uploaded URL — item images, hero image, intro
// image, ...) rather than per-field.
const VIDEO_LIMIT = 4;

const upload = multer({
  storage: multer.memoryStorage(),
  // Generous enough for a short video clip, not just a photo.
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);

uploadsRouter.get(
  '/usage',
  asyncHandler(async (_req, res) => {
    const videoCount = await prisma.mediaAsset.count({ where: { resourceType: 'VIDEO' } });
    res.json({ videoCount, videoLimit: VIDEO_LIMIT });
  }),
);

uploadsRouter.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded (expected form field "file")');

    const isVideo = req.file.mimetype.startsWith('video/');
    if (isVideo) {
      const videoCount = await prisma.mediaAsset.count({ where: { resourceType: 'VIDEO' } });
      if (videoCount >= VIDEO_LIMIT) {
        throw ApiError.badRequest(
          `You've reached the sitewide limit of ${VIDEO_LIMIT} videos. Delete an existing video before uploading a new one.`,
        );
      }
    }

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ms-wedding-planner', resource_type: isVideo ? 'video' : 'image' },
        (error, uploadResult) => {
          if (error || !uploadResult) return reject(error ?? new Error('Upload failed'));
          resolve(uploadResult);
        },
      );
      stream.end(req.file!.buffer);
    });

    await prisma.mediaAsset.create({
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        resourceType: isVideo ? 'VIDEO' : 'IMAGE',
      },
    });

    res.status(201).json({ url: result.secure_url, publicId: result.public_id, resourceType: isVideo ? 'video' : 'image' });
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
