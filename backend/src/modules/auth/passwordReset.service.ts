import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { OtpChannel } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { sendMail } from '../../config/mailer';
import { sendSms } from '../../config/sms';
import { ApiError } from '../../utils/ApiError';
import { compareOtp, generateOtp, hashOtp, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from '../../utils/otp';
import { isStrongPassword, PASSWORD_RULES_DESCRIPTION } from '../../utils/passwordPolicy';
import type { RequestOtpInput, ResetPasswordInput, VerifyOtpInput } from './passwordReset.validator';

const GENERIC_REQUEST_MESSAGE =
  'If an admin account matches those details, an OTP has been sent. Please check and enter it below.';

const RESET_TOKEN_PURPOSE = 'password-reset';

function findAdminByIdentifier(identifier: string, channel: OtpChannel) {
  return channel === 'EMAIL'
    ? prisma.adminUser.findUnique({ where: { email: identifier } })
    : prisma.adminUser.findUnique({ where: { phone: identifier } });
}

/**
 * SMS costs money (Fast2SMS Quick SMS route), unlike email which is free via
 * SMTP — so only the MOBILE channel is capped, system-wide, per rolling 24h,
 * to guard against burning through the paid quota from a bug or abuse.
 */
async function hasReachedDailySmsLimit(): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.passwordResetOtp.count({
    where: { channel: 'MOBILE', createdAt: { gte: since } },
  });
  return count >= env.OTP_DAILY_SMS_LIMIT;
}

export async function requestPasswordResetOtp({ identifier, channel }: RequestOtpInput) {
  if (channel === 'MOBILE' && (await hasReachedDailySmsLimit())) {
    throw ApiError.badRequest(
      "Today's SMS OTP limit has been reached. Please try again tomorrow, or reset via email instead.",
    );
  }

  const admin = await findAdminByIdentifier(identifier, channel);

  if (!admin) {
    console.info(`[passwordReset] OTP requested for unknown ${channel} identifier — ignoring silently`);
    return { message: GENERIC_REQUEST_MESSAGE };
  }

  await prisma.passwordResetOtp.updateMany({
    where: { adminId: admin.id, channel, consumed: false },
    data: { consumed: true },
  });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.passwordResetOtp.create({
    data: { adminId: admin.id, channel, otpHash, expiresAt },
  });

  if (channel === 'EMAIL') {
    await sendMail({
      to: admin.email,
      subject: 'Your password reset OTP',
      html: `
        <h2>Password reset requested</h2>
        <p>Your OTP is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p>
        <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>
      `,
    });
  } else if (admin.phone) {
    await sendSms(admin.phone, `${otp} is your ${env.BUSINESS_NAME} admin password reset OTP. Valid for ${OTP_EXPIRY_MINUTES} minutes.`);
  }

  return { message: GENERIC_REQUEST_MESSAGE };
}

export async function verifyPasswordResetOtp({ identifier, channel, otp }: VerifyOtpInput) {
  const admin = await findAdminByIdentifier(identifier, channel);
  if (!admin) throw ApiError.badRequest('Incorrect OTP. Please try again or request a new one.');

  const record = await prisma.passwordResetOtp.findFirst({
    where: { adminId: admin.id, channel, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) throw ApiError.badRequest('This OTP has expired. Please request a new one.');
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw ApiError.badRequest('Too many incorrect attempts. Please request a new OTP.');
  }

  const valid = await compareOtp(otp, record.otpHash);
  if (!valid) {
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw ApiError.badRequest('Incorrect OTP. Please try again.');
  }

  await prisma.passwordResetOtp.update({ where: { id: record.id }, data: { consumed: true } });

  const resetToken = jwt.sign({ adminId: admin.id, purpose: RESET_TOKEN_PURPOSE }, env.JWT_SECRET, {
    expiresIn: '10m',
  });

  return { resetToken };
}

export async function resetPassword({ resetToken, newPassword }: ResetPasswordInput) {
  let payload: { adminId: string; purpose: string };
  try {
    payload = jwt.verify(resetToken, env.JWT_SECRET) as typeof payload;
  } catch {
    throw ApiError.unauthorized('This reset session has expired. Please start again.');
  }

  if (payload.purpose !== RESET_TOKEN_PURPOSE) throw ApiError.unauthorized('Invalid reset session.');
  if (!isStrongPassword(newPassword)) throw ApiError.badRequest(PASSWORD_RULES_DESCRIPTION);

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.adminUser.update({ where: { id: payload.adminId }, data: { passwordHash } });

  return { message: 'Password updated successfully. You can now log in with your new password.' };
}
