import { Router } from 'express';
import type { ZodType } from 'zod';
import { requireAuth } from '../middlewares/requireAuth';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from './asyncHandler';
import { ApiError } from './ApiError';

// Prisma's per-model delegate types are individually generic and don't
// structurally unify under one interface — `any` here is intentional so a
// single factory can drive every catalogue resource's delegate.
interface Delegate {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
}

interface CrudOptions {
  delegate: Delegate;
  createSchema: ZodType;
  updateSchema: ZodType;
  publicWhere?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Builds a public (read-only, optionally filtered) router and an admin
 * (auth-protected, full CRUD) router for a simple catalogue-style resource
 * (menu items, decorations, services, gallery, testimonials, FAQs...).
 */
export function createCrudRouters({ delegate, createSchema, updateSchema, publicWhere, orderBy }: CrudOptions) {
  const publicRouter = Router();
  publicRouter.get(
    '/',
    asyncHandler(async (_req, res) => {
      const items = await delegate.findMany({ where: publicWhere, orderBy });
      res.json(items);
    }),
  );

  const adminRouter = Router();
  adminRouter.use(requireAuth);

  adminRouter.get(
    '/',
    asyncHandler(async (_req, res) => {
      const items = await delegate.findMany({ orderBy });
      res.json(items);
    }),
  );

  adminRouter.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const item = await delegate.findUnique({ where: { id: req.params.id } });
      if (!item) throw ApiError.notFound('Not found');
      res.json(item);
    }),
  );

  adminRouter.post(
    '/',
    validateRequest({ body: createSchema }),
    asyncHandler(async (req, res) => {
      const item = await delegate.create({ data: req.body });
      res.status(201).json(item);
    }),
  );

  adminRouter.put(
    '/:id',
    validateRequest({ body: updateSchema }),
    asyncHandler(async (req, res) => {
      const item = await delegate.update({ where: { id: req.params.id }, data: req.body });
      res.json(item);
    }),
  );

  adminRouter.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await delegate.delete({ where: { id: req.params.id } });
      res.status(204).send();
    }),
  );

  return { publicRouter, adminRouter };
}
