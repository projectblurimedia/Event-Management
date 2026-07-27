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
    revenueAgg,
    recentCustomers,
    packageGroups,
    menuItemGroups,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.aggregate({
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: { grandTotal: true },
    }),
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
    prisma.bookingMenuItem.groupBy({
      by: ['menuItemId'],
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

  const menuItemIds = menuItemGroups.map((g) => g.menuItemId);
  const menuItems = menuItemIds.length
    ? await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } })
    : [];
  const popularFoodItems = menuItemGroups.map((g) => ({
    menuItem: menuItems.find((m) => m.id === g.menuItemId) ?? null,
    totalQuantity: g._sum.quantity ?? 0,
  }));

  return {
    todayBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    completedEvents,
    revenue: Number(revenueAgg._sum.grandTotal ?? 0),
    recentCustomers,
    popularPackages,
    popularFoodItems,
  };
}

/**
 * Full breakdown for a chosen date range (day/month/year, resolved to
 * from/to boundaries on the client) — revenue realised from completed
 * events, revenue expected from confirmed-but-not-yet-completed events,
 * and every customer/booking that falls in the range so admin can see
 * everything at a glance.
 */
export async function getAnalytics(from: Date, to: Date) {
  const bookings = await prisma.booking.findMany({
    where: { eventDate: { gte: from, lte: to } },
    include: { package: true },
    orderBy: { eventDate: 'asc' },
  });

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  const completedRevenue = round(completedBookings.reduce((sum, b) => sum + Number(b.grandTotal), 0));
  const confirmedRevenue = round(confirmedBookings.reduce((sum, b) => sum + Number(b.grandTotal), 0));

  const byStatus = {
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: confirmedBookings.length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
    COMPLETED: completedBookings.length,
  };

  return {
    from,
    to,
    totalBookings: bookings.length,
    completedRevenue,
    confirmedRevenue,
    projectedRevenue: round(completedRevenue + confirmedRevenue),
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
      grandTotal: Number(b.grandTotal),
      status: b.status,
    })),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
