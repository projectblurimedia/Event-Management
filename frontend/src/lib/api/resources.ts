import { createResourceHooks } from './resourceHooks';
import type {
  MenuCategory,
  MenuItem,
  Package,
  ServiceCategory,
  ServiceOption,
  GalleryImage,
  Testimonial,
  FAQ,
} from '@/types/api';

export const menuCategoryHooks = createResourceHooks<MenuCategory>('menu-categories');
export const menuItemHooks = createResourceHooks<MenuItem>('menu-items');
export const packageHooks = createResourceHooks<Package>('packages');
export const serviceCategoryHooks = createResourceHooks<ServiceCategory>('service-categories');
export const serviceOptionHooks = createResourceHooks<ServiceOption>('service-options');
export const galleryHooks = createResourceHooks<GalleryImage>('gallery');
export const testimonialHooks = createResourceHooks<Testimonial>('testimonials');
export const faqHooks = createResourceHooks<FAQ>('faqs');
