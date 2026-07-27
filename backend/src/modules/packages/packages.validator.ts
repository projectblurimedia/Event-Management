import { z } from 'zod';

const packageStepInputSchema = z.object({
  kind: z.enum(['FOOD', 'SERVICE_CATEGORY']),
  serviceCategoryId: z.string().min(1).optional(),
});

const packageItemInputSchema = z.union([
  z.string().min(1).transform((label) => ({ label, labelTe: undefined as string | undefined })),
  z.object({ label: z.string().min(1), labelTe: z.string().optional() }),
]);

export const createPackageSchema = z.object({
  tier: z.enum(['SILVER', 'GOLD', 'PLATINUM']),
  name: z.string().min(1),
  nameTe: z.string().optional(),
  description: z.string().min(1),
  descriptionTe: z.string().optional(),
  pricePerGuest: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  items: z.array(packageItemInputSchema).default([]),
  steps: z.array(packageStepInputSchema).default([]),
});
export const updatePackageSchema = createPackageSchema.partial();
