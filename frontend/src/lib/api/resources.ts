import { createResourceHooks } from './resourceHooks';
import type { Category, CategoryType, Item, Package, GalleryImage, Testimonial, FAQ } from '@/types/api';

export const categoryHooks = createResourceHooks<Category>('categories');
export const categoryTypeHooks = createResourceHooks<CategoryType>('category-types');
export const itemHooks = createResourceHooks<Item>('items');
export const packageHooks = createResourceHooks<Package>('packages');
export const galleryHooks = createResourceHooks<GalleryImage>('gallery');
export const testimonialHooks = createResourceHooks<Testimonial>('testimonials');
export const faqHooks = createResourceHooks<FAQ>('faqs');
