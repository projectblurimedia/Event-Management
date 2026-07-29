import { createResourceHooks } from './resourceHooks';
import type { Category, CategoryType, Item, Package, Testimonial } from '@/types/api';

export const categoryHooks = createResourceHooks<Category>('categories');
export const categoryTypeHooks = createResourceHooks<CategoryType>('category-types');
export const itemHooks = createResourceHooks<Item>('items');
export const packageHooks = createResourceHooks<Package>('packages');
export const testimonialHooks = createResourceHooks<Testimonial>('testimonials');
