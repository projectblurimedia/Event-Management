/**
 * Static fallback business identity (from the brochure). Once the backend
 * `/api/settings` endpoint is wired (Phase 2), these values are overridden
 * by admin-editable SiteSettings — this file only serves as the seed/fallback.
 */
export const siteConfig = {
  businessName: 'MS Wedding Planner',
  organiser: 'Haritha Kotha',
  tagline: 'Food Catalogue Book',
  phone: '9391522508',
  phoneDisplay: '+91 93915 22508',
  whatsappUrl: 'https://wa.me/919391522508',
  email: 'harithakotha6131@gmail.com',
  address: 'Yerrampeta, Eluru, Andhra Pradesh, India',
  mapEmbedUrl: 'https://www.google.com/maps?q=Yerrampeta,Eluru,Andhra+Pradesh,India&output=embed',
} as const;
