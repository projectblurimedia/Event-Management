import { prisma } from '../../config/prisma';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getOverview() {
  const todayStart = startOfToday();

  const [
    todayBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    completedEvents,
    recentCustomers,
    packageGroups,
    menuItemGroups,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, customerName: true, phone: true, eventType: true, createdAt: true, status: true },
    }),
    prisma.booking.groupBy({
      by: ['packageId'],
      where: { packageId: { not: null } },
      _count: { packageId: true },
      orderBy: { _count: { packageId: 'desc' } },
      take: 5,
    }),
    prisma.bookingItem.groupBy({
      by: ['itemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  const packageIds = packageGroups.map((g) => g.packageId).filter((id): id is string => !!id);
  const packages = packageIds.length
    ? await prisma.package.findMany({ where: { id: { in: packageIds } } })
    : [];
  const popularPackages = packageGroups.map((g) => ({
    package: packages.find((p) => p.id === g.packageId) ?? null,
    bookingCount: g._count.packageId,
  }));

  const itemIds = menuItemGroups.map((g) => g.itemId);
  const popularItems = itemIds.length
    ? await prisma.item.findMany({ where: { id: { in: itemIds } } })
    : [];
  const popularFoodItems = menuItemGroups.map((g) => ({
    menuItem: popularItems.find((m) => m.id === g.itemId) ?? null,
    totalQuantity: g._sum.quantity ?? 0,
  }));

  return {
    todayBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    completedEvents,
    recentCustomers,
    popularPackages,
    popularFoodItems,
  };
}

/**
 * Full breakdown for a chosen date range (day/month/year, resolved to
 * from/to boundaries on the client) — every customer/booking that falls in
 * the range, grouped by status, so admin can see everything at a glance.
 */
export async function getAnalytics(from: Date, to: Date) {
  const bookings = await prisma.booking.findMany({
    where: { eventDate: { gte: from, lte: to } },
    include: { package: true, eventType: true },
    orderBy: { eventDate: 'asc' },
  });

  const byStatus = {
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
  };

  return {
    from,
    to,
    totalBookings: bookings.length,
    byStatus,
    bookings: bookings.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      phone: b.phone,
      email: b.email,
      eventType: b.eventType,
      eventDate: b.eventDate,
      guestCount: b.guestCount,
      packageName: b.package?.name ?? null,
      status: b.status,
    })),
  };
}
