export type EventType =
  | 'WEDDING'
  | 'RECEPTION'
  | 'BIRTHDAY'
  | 'HOUSEWARMING'
  | 'ENGAGEMENT'
  | 'CORPORATE'
  | 'ANNIVERSARY'
  | 'NAMING_CEREMONY'
  | 'BABY_SHOWER'
  | 'OTHER';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type GalleryCategory = 'FOOD' | 'DECORATION' | 'EVENT';
export type DietaryPreference = 'VEG' | 'NON_VEG' | 'BOTH';
/** FLAT: one fee for the whole booking. PER_PERSON: multiplied by guest count. Set on the Category, inherited by every Item under it. */
export type PricingMode = 'FLAT' | 'PER_PERSON';

export interface Item {
  id: string;
  categoryTypeId: string;
  categoryType?: CategoryType & { category: Category };
  name: string;
  nameTe: string | null;
  description: string | null;
  images: string[];
  isVeg: boolean | null;
  isAvailable: boolean;
  isFeatured: boolean;
  order: number;
}

export interface CategoryType {
  id: string;
  categoryId: string;
  name: string;
  nameTe: string | null;
  order: number;
  items?: Item[];
}

export interface Category {
  id: string;
  name: string;
  nameTe: string | null;
  slug: string;
  description: string | null;
  descriptionTe: string | null;
  imageUrl: string | null;
  pricingMode: PricingMode;
  isFood: boolean;
  allowMultiple: boolean;
  isActive: boolean;
  order: number;
  types?: CategoryType[];
}

export interface PackageCategory {
  id: string;
  packageId: string;
  categoryId: string;
  category: Category;
  order: number;
}

export interface Package {
  id: string;
  name: string;
  nameTe: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  categories: PackageCategory[];
}

export interface GalleryImage {
  id: string;
  category: GalleryCategory;
  imageUrl: string;
  caption: string | null;
  captionTe: string | null;
  order: number;
}

export interface Testimonial {
  id: string;
  customerName: string;
  eventType: EventType | null;
  rating: number;
  message: string;
  messageTe: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  order: number;
}

export interface FAQ {
  id: string;
  question: string;
  questionTe: string | null;
  answer: string;
  answerTe: string | null;
  order: number;
  isPublished: boolean;
}

export interface SiteSettings {
  id: string;
  businessName: string;
  logoUrl: string | null;
  organiser: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  mapEmbedUrl: string | null;
  heroHeadline: string;
  heroHeadlineTe: string | null;
  heroSubheadline: string;
  heroSubheadlineTe: string | null;
  heroImageUrl: string | null;
  businessIntroTitle: string;
  businessIntroTitleTe: string | null;
  businessIntroText: string;
  businessIntroTextTe: string | null;
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  phone: string;
  altPhone: string | null;
  email: string | null;
  address: string;
  eventDate: string;
  eventTime: string;
  eventType: EventType;
  guestCount: number;
  packageId: string | null;
  package: Package | null;
  dietaryPreference: DietaryPreference | null;
  specialRequirements: string | null;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingItemDetail {
  id: string;
  quantity: number;
  item: Item;
}

export interface BookingDetail extends Booking {
  items: BookingItemDetail[];
}

export interface BookingStatusResult {
  bookingCode: string;
  status: BookingStatus;
  eventDate: string;
  eventTime: string;
  eventType: EventType;
  guestCount: number;
  createdAt: string;
}

export interface DashboardOverview {
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedEvents: number;
  recentCustomers: {
    id: string;
    customerName: string;
    phone: string;
    eventType: EventType;
    status: BookingStatus;
    createdAt: string;
  }[];
  popularPackages: { package: Package | null; bookingCount: number }[];
  popularFoodItems: { menuItem: Item | null; totalQuantity: number }[];
}

export interface DashboardAnalyticsBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  phone: string;
  email: string | null;
  eventType: EventType;
  eventDate: string;
  guestCount: number;
  packageName: string | null;
  status: BookingStatus;
}

export interface DashboardAnalytics {
  from: string;
  to: string;
  totalBookings: number;
  byStatus: Record<BookingStatus, number>;
  bookings: DashboardAnalyticsBooking[];
}

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}
