import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createBookingSchema,
  bookingLookupSchema,
  updateBookingStatusSchema,
  bookingFiltersSchema,
} from './bookings.validator';
import {
  createBookingHandler,
  lookupBookingHandler,
  downloadQuotationHandler,
  listBookingsHandler,
  getBookingHandler,
  updateBookingStatusHandler,
} from './bookings.controller';
import { exportBookingsExcelHandler, exportBookingsPdfHandler } from './bookings.export';

export const bookingsPublicRouter = Router();

bookingsPublicRouter.post('/', validateRequest({ body: createBookingSchema }), createBookingHandler);
bookingsPublicRouter.get('/lookup', validateRequest({ query: bookingLookupSchema }), lookupBookingHandler);
bookingsPublicRouter.get('/:id/quotation.pdf', downloadQuotationHandler);

export const bookingsAdminRouter = Router();
bookingsAdminRouter.use(requireAuth);

bookingsAdminRouter.get('/', validateRequest({ query: bookingFiltersSchema }), listBookingsHandler);
bookingsAdminRouter.get(
  '/export.xlsx',
  validateRequest({ query: bookingFiltersSchema }),
  exportBookingsExcelHandler,
);
bookingsAdminRouter.get(
  '/export.pdf',
  validateRequest({ query: bookingFiltersSchema }),
  exportBookingsPdfHandler,
);
bookingsAdminRouter.get('/:id', getBookingHandler);
bookingsAdminRouter.patch(
  '/:id/status',
  validateRequest({ body: updateBookingStatusSchema }),
  updateBookingStatusHandler,
);
