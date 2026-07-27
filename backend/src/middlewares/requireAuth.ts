import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export interface AuthPayload {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(ApiError.unauthorized('Missing or invalid authorization header'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.admin = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
