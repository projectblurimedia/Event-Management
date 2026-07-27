import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import type { z } from 'zod';
import type { createPackageSchema, updatePackageSchema } from './packages.validator';

const include = {
  items: { orderBy: { order: 'asc' as const } },
  steps: {
    orderBy: { order: 'asc' as const },
    include: {
      serviceCategory: {
        include: {
          options: { where: { isActive: true }, orderBy: { order: 'asc' as const } },
        },
      },
    },
  },
};

export async function listPackages(onlyActive: boolean) {
  return prisma.package.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    include,
    orderBy: { pricePerGuest: 'asc' },
  });
}

export async function getPackage(id: string) {
  const pkg = await prisma.package.findUnique({ where: { id }, include });
  if (!pkg) throw ApiError.notFound('Package not found');
  return pkg;
}

export async function createPackage(input: z.infer<typeof createPackageSchema>) {
  const { items, steps, ...data } = input;
  return prisma.package.create({
    data: {
      ...data,
      items: { create: items.map((item, order) => ({ label: item.label, labelTe: item.labelTe, order })) },
      steps: {
        create: steps.map((step, order) => ({
          order,
          kind: step.kind,
          serviceCategoryId: step.kind === 'SERVICE_CATEGORY' ? step.serviceCategoryId : undefined,
        })),
      },
    },
    include,
  });
}

export async function updatePackage(id: string, input: z.infer<typeof updatePackageSchema>) {
  const { items, steps, ...data } = input;

  return prisma.$transaction(async (tx) => {
    if (items) {
      await tx.packageItem.deleteMany({ where: { packageId: id } });
      await tx.packageItem.createMany({
        data: items.map((item, order) => ({ packageId: id, label: item.label, labelTe: item.labelTe, order })),
      });
    }
    if (steps) {
      await tx.packageStep.deleteMany({ where: { packageId: id } });
      await tx.packageStep.createMany({
        data: steps.map((step, order) => ({
          packageId: id,
          order,
          kind: step.kind,
          serviceCategoryId: step.kind === 'SERVICE_CATEGORY' ? step.serviceCategoryId : undefined,
        })),
      });
    }
    return tx.package.update({ where: { id }, data, include });
  });
}

export async function deletePackage(id: string) {
  await prisma.package.delete({ where: { id } });
}
