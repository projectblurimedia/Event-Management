import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import type { z } from 'zod';
import type { createPackageSchema, updatePackageSchema } from './packages.validator';

const include = {
  categories: {
    orderBy: { order: 'asc' as const },
    include: {
      category: {
        include: {
          types: {
            orderBy: { order: 'asc' as const },
            include: { items: { where: { isAvailable: true }, orderBy: { order: 'asc' as const } } },
          },
        },
      },
    },
  },
};

export async function listPackages(onlyActive: boolean) {
  return prisma.package.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    include,
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function getPackage(id: string) {
  const pkg = await prisma.package.findUnique({ where: { id }, include });
  if (!pkg) throw ApiError.notFound('Package not found');
  return pkg;
}

export async function createPackage(input: z.infer<typeof createPackageSchema>) {
  const { categoryIds, ...data } = input;
  return prisma.package.create({
    data: {
      ...data,
      categories: { create: categoryIds.map((categoryId, order) => ({ categoryId, order })) },
    },
    include,
  });
}

export async function updatePackage(id: string, input: z.infer<typeof updatePackageSchema>) {
  const { categoryIds, ...data } = input;

  return prisma.$transaction(async (tx) => {
    if (categoryIds) {
      await tx.packageCategory.deleteMany({ where: { packageId: id } });
      await tx.packageCategory.createMany({
        data: categoryIds.map((categoryId, order) => ({ packageId: id, categoryId, order })),
      });
    }
    return tx.package.update({ where: { id }, data, include });
  });
}

export async function deletePackage(id: string) {
  await prisma.package.delete({ where: { id } });
}
