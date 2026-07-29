import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { calculatePricing } from '../../utils/pricingEngine';
import { generateBookingCode } from '../../utils/bookingCode';
import { sendBookingNotificationEmail } from '../../jobs/emailNotifier';
import { getSettings } from '../settings/settings.service';
import type { CreateBookingInput, QuoteInput } from './bookings.validator';

const bookingInclude = {
  package: true,
  items: { include: { item: { include: { categoryType: { include: { category: true } } } } } },
};

async function resolveSelection(input: QuoteInput) {
  const [pkg, itemRows] = await Promise.all([
    input.packageId
      ? prisma.package.findUnique({ where: { id: input.packageId } })
      : Promise.resolve(null),
    input.items.length
      ? prisma.item.findMany({
          where: { id: { in: input.items.map((i) => i.itemId) } },
          include: { categoryType: { include: { category: true } } },
        })
      : Promise.resolve([]),
  ]);

  if (input.packageId && !pkg) throw ApiError.badRequest('Selected package does not exist');

  const itemMap = new Map(itemRows.map((item) => [item.id, item]));
  for (const sel of input.items) {
    if (!itemMap.has(sel.itemId)) {
      throw ApiError.badRequest(`Item ${sel.itemId} does not exist`);
    }
  }

  const pricing = calculatePricing({
    items: input.items.map((sel) => {
      const item = itemMap.get(sel.itemId)!;
      return {
        price: Number(item.price),
        pricingMode: item.categoryType.category.pricingMode,
        quantity: sel.quantity,
      };
    }),
  });

  return { pkg, itemMap, pricing };
}

export async function getQuote(input: QuoteInput) {
  const { pricing } = await resolveSelection(input);
  return pricing;
}

export async function createBooking(input: CreateBookingInput) {
  const [{ pkg, itemMap, pricing }, settings] = await Promise.all([resolveSelection(input), getSettings()]);
  const businessName = settings?.businessName ?? '';

  let bookingCode = generateBookingCode(businessName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.booking.findUnique({ where: { bookingCode } });
    if (!existing) break;
    bookingCode = generateBookingCode(businessName);
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
      perPersonCost: pricing.perPersonCost,
      flatCost: pricing.flatCost,
      grandTotal: pricing.grandTotal,
      items: {
        create: input.items.map((sel) => ({
          itemId: sel.itemId,
          quantity: sel.quantity,
          priceAtBooking: itemMap.get(sel.itemId)!.price,
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

function groupItemsByCategory(items: Awaited<ReturnType<typeof getBookingForQuotation>>['items']) {
  const groups = new Map<string, { name: string; quantity: number; priceAtBooking: number }[]>();
  for (const sel of items) {
    const categoryName = sel.item.categoryType.category.name;
    const list = groups.get(categoryName) ?? [];
    list.push({
      name: sel.item.name,
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
    package: booking.package ? { name: booking.package.name } : null,
    groupedItems: groupItemsByCategory(booking.items),
    perPersonCost: Number(booking.perPersonCost),
    flatCost: Number(booking.flatCost),
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
