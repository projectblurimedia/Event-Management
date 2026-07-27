import type { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { asyncHandler } from '../../utils/asyncHandler';
import { BookingsExportDocument } from '../../templates/BookingsExportDocument';
import * as bookingsService from './bookings.service';

export const exportBookingsExcelHandler = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await bookingsService.listBookings(req.validatedQuery as never);

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
    { header: 'Grand Total', key: 'grandTotal', width: 14 },
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
      grandTotal: Number(b.grandTotal),
      status: b.status,
    });
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
});

export const exportBookingsPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await bookingsService.listBookings(req.validatedQuery as never);
  const rows = bookings.map((b) => ({
    bookingCode: b.bookingCode,
    customerName: b.customerName,
    phone: b.phone,
    eventType: b.eventType,
    eventDate: b.eventDate,
    guestCount: b.guestCount,
    grandTotal: Number(b.grandTotal),
    status: b.status,
  }));

  const { renderToBuffer } = await import('@react-pdf/renderer');
  const buffer = await renderToBuffer(await BookingsExportDocument({ bookings: rows }));
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings.pdf"');
  res.send(buffer);
});
