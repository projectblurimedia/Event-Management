import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export function compareOtp(otp: string, otpHash: string): Promise<boolean> {
  return bcrypt.compare(otp, otpHash);
}

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
