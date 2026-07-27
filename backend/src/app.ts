import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';

import { authRouter } from './modules/auth/auth.routes';
import { settingsRouter, adminSettingsRouter } from './modules/settings/settings.routes';
import { menuCategories, menuItems } from './modules/menu/menu.routes';
import { packagesPublicRouter, packagesAdminRouter } from './modules/packages/packages.routes';
import { serviceCategories, serviceOptions } from './modules/serviceCategories/serviceCategories.routes';
import { gallery } from './modules/gallery/gallery.routes';
import { testimonials } from './modules/testimonials/testimonials.routes';
import { faqs } from './modules/faqs/faqs.routes';
import { enquiriesPublicRouter, enquiriesAdminRouter } from './modules/enquiries/enquiries.routes';
import { bookingsPublicRouter, bookingsAdminRouter } from './modules/bookings/bookings.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { uploadsRouter } from './modules/uploads/uploads.routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/api', apiRateLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ---- Public routes ----
app.use('/api/settings', settingsRouter);
app.use('/api/menu-categories', menuCategories.publicRouter);
app.use('/api/menu-items', menuItems.publicRouter);
app.use('/api/packages', packagesPublicRouter);
app.use('/api/service-categories', serviceCategories.publicRouter);
app.use('/api/service-options', serviceOptions.publicRouter);
app.use('/api/gallery', gallery.publicRouter);
app.use('/api/testimonials', testimonials.publicRouter);
app.use('/api/faqs', faqs.publicRouter);
app.use('/api/enquiries', enquiriesPublicRouter);
app.use('/api/bookings', bookingsPublicRouter);

// ---- Admin routes (JWT protected inside each router) ----
app.use('/api/admin/auth', authRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/admin/menu-categories', menuCategories.adminRouter);
app.use('/api/admin/menu-items', menuItems.adminRouter);
app.use('/api/admin/packages', packagesAdminRouter);
app.use('/api/admin/service-categories', serviceCategories.adminRouter);
app.use('/api/admin/service-options', serviceOptions.adminRouter);
app.use('/api/admin/gallery', gallery.adminRouter);
app.use('/api/admin/testimonials', testimonials.adminRouter);
app.use('/api/admin/faqs', faqs.adminRouter);
app.use('/api/admin/enquiries', enquiriesAdminRouter);
app.use('/api/admin/bookings', bookingsAdminRouter);
app.use('/api/admin/dashboard', dashboardRouter);
app.use('/api/admin/uploads', uploadsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
