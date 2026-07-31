import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { QuotationDocument } from '../../templates/QuotationDocument';
import { getSettings } from '../settings/settings.service';
import * as bookingsService from './bookings.service';

export const createBookingHandler = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingsService.createBooking(req.body);
  res.status(201).json(booking);
});

export const lookupBookingHandler = asyncHandler(async (req: Request, res: Response) => {
  const { code, phone } = req.validatedQuery as { code: string; phone: string };
  res.json(await bookingsService.lookupBooking(code, phone));
});

export const downloadQuotationHandler = asyncHandler(async (req: Request, res: Response) => {
  const phone = req.query.phone as string | undefined;
  if (!phone) throw ApiError.badRequest('phone is required');

  const booking = await bookingsService.getBookingForQuotation(req.params.id as string, phone);
  const data = bookingsService.toQuotationData(booking);
  const settings = await getSettings();
  if (!settings) throw ApiError.badRequest('Business profile is not configured yet');
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const buffer = await renderToBuffer(
    await QuotationDocument({
      booking: data,
      business: { name: settings.businessName, phone: settings.phone, address: settings.address },
    }),
  );

  const safeBusinessName = settings.businessName.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'Booking';
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeBusinessName}-Booking-Summary-${booking.bookingCode}.pdf"`);
  res.send(buffer);
});

export const listBookingsHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await bookingsService.listBookings(req.validatedQuery as never));
});

export const getBookingHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await bookingsService.getBookingById(req.params.id as string));
});

export const updateBookingStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await bookingsService.updateBookingStatus(req.params.id as string, req.body.status));
});
