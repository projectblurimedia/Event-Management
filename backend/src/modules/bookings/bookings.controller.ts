import type { Request, Response } from 'express';
import { renderToBuffer } from '@react-pdf/renderer';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { QuotationDocument } from '../../templates/QuotationDocument';
import { getSettings } from '../settings/settings.service';
import * as bookingsService from './bookings.service';

export const getQuoteHandler = asyncHandler(async (req: Request, res: Response) => {
  res.json(await bookingsService.getQuote(req.body));
});

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
  const buffer = await renderToBuffer(
    QuotationDocument({
      booking: data,
      business: { name: settings.businessName, phone: settings.phone, address: settings.address },
    }),
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${booking.bookingCode}-quotation.pdf"`);
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
