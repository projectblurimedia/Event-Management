import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PageLoader } from '@/components/ui/PageLoader';

import { HomePage } from '@/pages/HomePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { PackagesPage } from '@/pages/PackagesPage';
import { MenuPage } from '@/pages/MenuPage';
import { EventTypesPage } from '@/pages/EventTypesPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { TestimonialsPage } from '@/pages/TestimonialsPage';
import { FaqPage } from '@/pages/FaqPage';
import { ContactPage } from '@/pages/ContactPage';
import { BookingPage } from '@/pages/BookingPage';
import { BookingStatusPage } from '@/pages/BookingStatusPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Admin surface is never needed by public visitors — code-split it into its
// own lazy-loaded chunk so the public bundle stays small.
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const AdminBookingsPage = lazy(() => import('@/pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })));
const AdminEnquiriesPage = lazy(() => import('@/pages/admin/AdminEnquiriesPage').then((m) => ({ default: m.AdminEnquiriesPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminItemsPage = lazy(() => import('@/pages/admin/AdminItemsPage').then((m) => ({ default: m.AdminItemsPage })));
const AdminPackagesPage = lazy(() => import('@/pages/admin/AdminPackagesPage').then((m) => ({ default: m.AdminPackagesPage })));
const AdminGalleryPage = lazy(() => import('@/pages/admin/AdminGalleryPage').then((m) => ({ default: m.AdminGalleryPage })));
const AdminTestimonialsPage = lazy(() => import('@/pages/admin/AdminTestimonialsPage').then((m) => ({ default: m.AdminTestimonialsPage })));
const AdminFaqsPage = lazy(() => import('@/pages/admin/AdminFaqsPage').then((m) => ({ default: m.AdminFaqsPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/packages', element: <PackagesPage /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '/event-types', element: <EventTypesPage /> },
      { path: '/gallery', element: <GalleryPage /> },
      { path: '/testimonials', element: <TestimonialsPage /> },
      { path: '/faq', element: <FaqPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/booking', element: <BookingPage /> },
      { path: '/booking/status', element: <BookingStatusPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin/login', element: withSuspense(<AdminLoginPage />) },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: withSuspense(<AdminLayout />),
        children: [
          { index: true, element: withSuspense(<AdminOverviewPage />) },
          { path: 'bookings', element: withSuspense(<AdminBookingsPage />) },
          { path: 'enquiries', element: withSuspense(<AdminEnquiriesPage />) },
          { path: 'categories', element: withSuspense(<AdminCategoriesPage />) },
          { path: 'items', element: withSuspense(<AdminItemsPage />) },
          { path: 'packages', element: withSuspense(<AdminPackagesPage />) },
          { path: 'gallery', element: withSuspense(<AdminGalleryPage />) },
          { path: 'testimonials', element: withSuspense(<AdminTestimonialsPage />) },
          { path: 'faqs', element: withSuspense(<AdminFaqsPage />) },
          { path: 'settings', element: withSuspense(<AdminSettingsPage />) },
        ],
      },
    ],
  },
]);
