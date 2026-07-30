import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Prisma driver-adapter errors carry a `.code` (e.g. 'P2002') without being instanceof any specific class. */
function prismaErrorCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', details: err.flatten() });
  }

  if (prismaErrorCode(err) === 'P2002') {
    return res.status(409).json({ message: 'A record with that value already exists. Please use a different name.' });
  }

  // Foreign key constraint failure — most commonly hit deleting an Item that
  // was part of a real booking. That block is intentional (booking history
  // must stay accurate), so surface a clear reason instead of a generic 500.
  if (prismaErrorCode(err) === 'P2003') {
    return res.status(409).json({
      message: "This can't be deleted because it's still referenced elsewhere (e.g. a past booking). Try marking it unavailable/inactive instead.",
    });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again in a moment.' });
}
