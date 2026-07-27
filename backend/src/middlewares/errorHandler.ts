import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', details: err.flatten() });
  }

  console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({
    message: env.NODE_ENV === 'production' ? 'Internal server error' : message,
  });
}
