import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  // The SMTP login (SMTP_USER) is often just an opaque auth credential (e.g.
  // Brevo's generated login), not a real mailbox — the "From" address must be
  // the actual verified sender identity, which can differ. Falls back to
  // SMTP_USER when unset (true for providers like Gmail where they're the same).
  SMTP_FROM_EMAIL: z.string().optional().default(''),
  ADMIN_NOTIFICATION_EMAIL: z.string().optional().default(''),

  FAST2SMS_API_KEY: z.string().optional().default(''),
  OTP_DAILY_SMS_LIMIT: z.coerce.number().default(5),

  BUSINESS_NAME: z.string().default('MS Wedding Planner'),
  BUSINESS_PHONE: z.string().default('8790160102'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
