import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

declare global {
  namespace Express {
    interface Request {
      // Express 5 makes `req.query` a getter-only accessor, so validated/
      // coerced query values (e.g. z.coerce.date()) are attached here
      // instead of reassigning req.query.
      validatedQuery?: unknown;
    }
  }
}

export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      next();
    } catch (err) {
      next(err);
    }
  };
}
