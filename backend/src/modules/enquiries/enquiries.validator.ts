import { z } from 'zod';

export const createEnquirySchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  message: z.string().min(1),
});
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
