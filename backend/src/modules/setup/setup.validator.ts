import { z } from 'zod';

export const setupSchema = z.object({
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Enter a valid email'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  whatsapp: z.string().min(1).optional(),
  email: z.string().email().optional(),
  address: z.string().min(1, 'Address is required'),
  // Sent as multipart form fields, so these arrive as strings — coerce to
  // numbers. Both must be present together for a map to be shown.
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export type SetupInput = z.infer<typeof setupSchema>;
