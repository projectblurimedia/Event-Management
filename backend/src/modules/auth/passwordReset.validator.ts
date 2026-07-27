import { z } from 'zod';
import { PASSWORD_REGEX, PASSWORD_RULES_DESCRIPTION } from '../../utils/passwordPolicy';

export const otpChannelSchema = z.enum(['EMAIL', 'MOBILE']);

export const requestOtpSchema = z.object({
  identifier: z.string().min(3, 'Enter your email or mobile number'),
  channel: otpChannelSchema,
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3),
  channel: otpChannelSchema,
  otp: z.string().length(6, 'Enter the 6-digit OTP'),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(10),
  newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_RULES_DESCRIPTION),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
