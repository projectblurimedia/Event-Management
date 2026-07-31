import type { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { asyncHandler } from '../../utils/asyncHandler';
import { BookingsExportDocument } from '../../templates/BookingsExportDocument';
import { getSettings } from '../settings/settings.service';
import * as bookingsService from './bookings.service';

function safeFilenamePart(businessName: string) {
  return businessName.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'Bookings';
}

export const exportBookingsExcelHandler = asyncHandler(async (req: Request, res: Response) => {
  const [bookings, settings] = await Promise.all([
    bookingsService.listBookings(req.validatedQuery as never),
    getSettings(),
  ]);
  const businessName = settings?.businessName ?? 'Bookings';

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Bookings');
  sheet.columns = [
    { header: 'Booking ID', key: 'bookingCode', width: 16 },
    { header: 'Customer', key: 'customerName', width: 22 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Event Type', key: 'eventType', width: 16 },
    { header: 'Event Date', key: 'eventDate', width: 14 },
    { header: 'Guests', key: 'guestCount', width: 10 },
    { header: 'Package', key: 'packageName', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const b of bookings) {
    sheet.addRow({
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      phone: b.phone,
      email: b.email,
      eventType: b.eventType,
      eventDate: new Date(b.eventDate).toLocaleDateString('en-IN'),
      guestCount: b.guestCount,
      packageName: b.package?.name ?? '-',
      status: b.status,
    });
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilenamePart(businessName)}-Bookings.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

export const exportBookingsPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const [bookings, settings] = await Promise.all([
    bookingsService.listBookings(req.validatedQuery as never),
    getSettings(),
  ]);
  const businessName = settings?.businessName ?? 'Bookings';
  const rows = bookings.map((b) => ({
    bookingCode: b.bookingCode,
    customerName: b.customerName,
    phone: b.phone,
    eventType: b.eventType,
    eventDate: b.eventDate,
    guestCount: b.guestCount,
    status: b.status,
  }));

  const { renderToBuffer } = await import('@react-pdf/renderer');
  const buffer = await renderToBuffer(await BookingsExportDocument({ bookings: rows, businessName }));
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilenamePart(businessName)}-Bookings.pdf"`);
  res.send(buffer);
});
