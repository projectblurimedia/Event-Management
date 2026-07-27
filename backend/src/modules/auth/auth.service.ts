import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import type { LoginInput } from './auth.validator';

export async function login({ email, password }: LoginInput) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const payload = { id: admin.id, email: admin.email, name: admin.name };
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return { token, admin: payload };
}
