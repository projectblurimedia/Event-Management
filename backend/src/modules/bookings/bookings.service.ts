import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { calculatePricing } from '../../utils/pricingEngine';
import { generateBookingCode } from '../../utils/bookingCode';
import { sendBookingNotificationEmail } from '../../jobs/emailNotifier';
import type { CreateBookingInput, QuoteInput } from './bookings.validator';

const bookingInclude = {
  package: true,
  menuItems: { include: { menuItem: true } },
  serviceOptions: { include: { serviceOption: { include: { category: true } } } },
};

async function resolveSelection(input: QuoteInput) {
  const [pkg, menuItemRows, serviceOptionRows] = await Promise.all([
    input.packageId
      ? prisma.package.findUnique({ where: { id: input.packageId } })
      : Promise.resolve(null),
    input.menuItems.length
      ? prisma.menuItem.findMany({ where: { id: { in: input.menuItems.map((m) => m.menuItemId) } } })
      : Promise.resolve([]),
    input.serviceOptions.length
      ? prisma.serviceOption.findMany({ where: { id: { in: input.serviceOptions.map((s) => s.serviceOptionId) } } })
      : Promise.resolve([]),
  ]);

  if (input.packageId && !pkg) throw ApiError.badRequest('Selected package does not exist');

  const menuItemMap = new Map(menuItemRows.map((item) => [item.id, item]));
  for (const sel of input.menuItems) {
    if (!menuItemMap.has(sel.menuItemId)) {
      throw ApiError.badRequest(`Menu item ${sel.menuItemId} does not exist`);
    }
  }
  const serviceOptionMap = new Map(serviceOptionRows.map((s) => [s.id, s]));
  for (const sel of input.serviceOptions) {
    if (!serviceOptionMap.has(sel.serviceOptionId)) {
      throw ApiError.badRequest(`Service option ${sel.serviceOptionId} does not exist`);
    }
  }

  const pricing = calculatePricing({
    guestCount: input.guestCount,
    package: pkg ? { pricePerGuest: Number(pkg.pricePerGuest) } : null,
    menuItems: input.menuItems.map((sel) => ({
      price: Number(menuItemMap.get(sel.menuItemId)!.price),
      quantity: sel.quantity,
    })),
    serviceOptions: input.serviceOptions.map((sel) => {
      const option = serviceOptionMap.get(sel.serviceOptionId)!;
      return { price: Number(option.price), unit: option.unit, quantity: sel.quantity };
    }),
  });

  return { pkg, menuItemMap, serviceOptionMap, pricing };
}

export async function getQuote(input: QuoteInput) {
  const { pricing } = await resolveSelection(input);
  return pricing;
}

export async function createBooking(input: CreateBookingInput) {
  const { pkg, menuItemMap, serviceOptionMap, pricing } = await resolveSelection(input);

  let bookingCode = generateBookingCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.booking.findUnique({ where: { bookingCode } });
    if (!existing) break;
    bookingCode = generateBookingCode();
  }

  const booking = await prisma.booking.create({
    data: {
      bookingCode,
      customerName: input.customerName,
      phone: input.phone,
      altPhone: input.altPhone,
      email: input.email,
      address: input.address,
      eventDate: input.eventDate,
      eventTime: input.eventTime,
      eventType: input.eventType,
      guestCount: input.guestCount,
      packageId: pkg?.id,
      dietaryPreference: input.dietaryPreference,
      specialRequirements: input.specialRequirements,
      foodCost: pricing.foodCost,
      addOnsCost: pricing.addOnsCost,
      packageCost: pricing.packageCost,
      grandTotal: pricing.grandTotal,
      menuItems: {
        create: input.menuItems.map((sel) => ({
          menuItemId: sel.menuItemId,
          quantity: sel.quantity,
          priceAtBooking: menuItemMap.get(sel.menuItemId)!.price,
        })),
      },
      serviceOptions: {
        create: input.serviceOptions.map((sel) => ({
          serviceOptionId: sel.serviceOptionId,
          quantity: sel.quantity,
          priceAtBooking: serviceOptionMap.get(sel.serviceOptionId)!.price,
        })),
      },
    },
    include: bookingInclude,
  });

  sendBookingNotificationEmail(booking).catch((err) => {
    console.error('Failed to send booking notification email:', err);
  });

  return booking;
}

export async function lookupBooking(code: string, phone: string) {
  const booking = await prisma.booking.findFirst({
    where: { bookingCode: code, OR: [{ phone }, { altPhone: phone }] },
    select: {
      bookingCode: true,
      status: true,
      eventDate: true,
      eventTime: true,
      eventType: true,
      guestCount: true,
      grandTotal: true,
      createdAt: true,
    },
  });
  if (!booking) throw ApiError.notFound('No booking found for that Booking ID and phone number');
  return booking;
}

export async function getBookingForQuotation(id: string, phone: string) {
  const booking = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  if (!booking || (booking.phone !== phone && booking.altPhone !== phone)) {
    throw ApiError.notFound('Booking not found');
  }
  return booking;
}

function groupServicesByCategory(
  serviceOptions: Awaited<ReturnType<typeof getBookingForQuotation>>['serviceOptions'],
) {
  const groups = new Map<string, { name: string; quantity: number; priceAtBooking: number }[]>();
  for (const sel of serviceOptions) {
    const categoryName = sel.serviceOption.category.name;
    const list = groups.get(categoryName) ?? [];
    list.push({
      name: sel.serviceOption.name,
      quantity: sel.quantity,
      priceAtBooking: Number(sel.priceAtBooking),
    });
    groups.set(categoryName, list);
  }
  return Array.from(groups.entries()).map(([categoryName, items]) => ({ categoryName, items }));
}

export function toQuotationData(booking: Awaited<ReturnType<typeof getBookingForQuotation>>) {
  return {
    bookingCode: booking.bookingCode,
    customerName: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    address: booking.address,
    eventDate: booking.eventDate,
    eventTime: booking.eventTime,
    eventType: booking.eventType,
    guestCount: booking.guestCount,
    package: booking.package
      ? { name: booking.package.name, pricePerGuest: Number(booking.package.pricePerGuest) }
      : null,
    menuItems: booking.menuItems.map((mi) => ({
      name: mi.menuItem.name,
      quantity: mi.quantity,
      priceAtBooking: Number(mi.priceAtBooking),
    })),
    groupedServices: groupServicesByCategory(booking.serviceOptions),
    foodCost: Number(booking.foodCost),
    addOnsCost: Number(booking.addOnsCost),
    packageCost: Number(booking.packageCost),
    grandTotal: Number(booking.grandTotal),
  };
}

export async function listBookings(filters: { status?: string; from?: Date; to?: Date }) {
  return prisma.booking.findMany({
    where: {
      status: filters.status as never,
      eventDate:
        filters.from || filters.to
          ? { gte: filters.from, lte: filters.to }
          : undefined,
    },
    include: { package: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  if (!booking) throw ApiError.notFound('Booking not found');
  return booking;
}

export async function updateBookingStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
  return prisma.booking.update({ where: { id }, data: { status } });
}
