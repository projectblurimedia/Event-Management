import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middlewares/requireAuth';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { cloudinary } from '../../config/cloudinary';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth);

uploadsRouter.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded (expected form field "file")');

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ms-wedding-planner' },
        (error, uploadResult) => {
          if (error || !uploadResult) return reject(error ?? new Error('Upload failed'));
          resolve(uploadResult);
        },
      );
      stream.end(req.file!.buffer);
    });

    res.status(201).json({ url: result.secure_url, publicId: result.public_id });
  }),
);

uploadsRouter.delete(
  '/:publicId',
  asyncHandler(async (req, res) => {
    await cloudinary.uploader.destroy(decodeURIComponent(req.params.publicId as string));
    res.status(204).send();
  }),
);
