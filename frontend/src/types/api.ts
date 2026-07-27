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

export type PackageTier = 'SILVER' | 'GOLD' | 'PLATINUM';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type ServiceUnit = 'FLAT' | 'PER_GUEST';
export type GalleryCategory = 'FOOD' | 'DECORATION' | 'EVENT';
export type PackageStepKind = 'FOOD' | 'SERVICE_CATEGORY';
export type DietaryPreference = 'VEG' | 'NON_VEG' | 'BOTH';

export interface MenuCategory {
  id: string;
  name: string;
  nameTe: string | null;
  slug: string;
  order: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameTe: string | null;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface PackageItem {
  id: string;
  label: string;
  labelTe: string | null;
  order: number;
}

export interface ServiceOption {
  id: string;
  categoryId: string;
  name: string;
  nameTe: string | null;
  description: string | null;
  price: string;
  unit: ServiceUnit;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameTe: string | null;
  slug: string;
  description: string | null;
  descriptionTe: string | null;
  imageUrl: string | null;
  allowMultiple: boolean;
  isActive: boolean;
  order: number;
  options?: ServiceOption[];
}

export interface PackageStep {
  id: string;
  packageId: string;
  order: number;
  kind: PackageStepKind;
  serviceCategoryId: string | null;
  serviceCategory: ServiceCategory | null;
}

export interface Package {
  id: string;
  tier: PackageTier;
  name: string;
  nameTe: string | null;
  description: string;
  descriptionTe: string | null;
  pricePerGuest: string;
  imageUrl: string | null;
  isActive: boolean;
  items: PackageItem[];
  steps: PackageStep[];
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
  organiser: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
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

export interface PricingBreakdown {
  packageCost: number;
  foodCost: number;
  addOnsCost: number;
  grandTotal: number;
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
  foodCost: string;
  addOnsCost: string;
  packageCost: string;
  grandTotal: string;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingMenuItemDetail {
  id: string;
  quantity: number;
  priceAtBooking: string;
  menuItem: MenuItem;
}

export interface BookingServiceOptionDetail {
  id: string;
  quantity: number;
  priceAtBooking: string;
  serviceOption: ServiceOption & { category: ServiceCategory };
}

export interface BookingDetail extends Booking {
  menuItems: BookingMenuItemDetail[];
  serviceOptions: BookingServiceOptionDetail[];
}

export interface BookingStatusResult {
  bookingCode: string;
  status: BookingStatus;
  eventDate: string;
  eventTime: string;
  eventType: EventType;
  guestCount: number;
  grandTotal: string;
  createdAt: string;
}

export interface DashboardOverview {
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedEvents: number;
  revenue: number;
  recentCustomers: {
    id: string;
    customerName: string;
    phone: string;
    eventType: EventType;
    status: BookingStatus;
    createdAt: string;
  }[];
  popularPackages: { package: Package | null; bookingCount: number }[];
  popularFoodItems: { menuItem: MenuItem | null; totalQuantity: number }[];
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
  grandTotal: number;
  status: BookingStatus;
}

export interface DashboardAnalytics {
  from: string;
  to: string;
  totalBookings: number;
  completedRevenue: number;
  confirmedRevenue: number;
  projectedRevenue: number;
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
