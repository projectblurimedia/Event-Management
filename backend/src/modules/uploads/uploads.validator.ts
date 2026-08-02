import { z } from 'zod';

export const signatureRequestSchema = z.object({
  resourceType: z.enum(['image', 'video']).default('image'),
});

export const confirmUploadSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  resourceType: z.enum(['image', 'video']),
});
