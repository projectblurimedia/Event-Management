import { prisma } from '../../config/prisma';
import type { UpdateSettingsInput } from './settings.validator';

const DEFAULTS = {
  id: 'singleton',
  businessName: 'MS Wedding Planner',
  organiser: 'Manikanta Satish',
  phone: '8790160102',
  whatsapp: '918790160102',
  email: 'contact@msweddingplanner.example',
  address: 'Hyderabad, Telangana, India',
  mapEmbedUrl: 'https://www.google.com/maps?q=Hyderabad,Telangana,India&output=embed',
  heroHeadline: 'Crafting Unforgettable Weddings & Celebrations',
  heroSubheadline:
    'Full-service wedding planning, catering, decoration and event management for every occasion.',
  businessIntroTitle: 'A Premium Event Partner for Every Occasion',
  businessIntroText:
    'MS Wedding Planner brings together catering, decoration, photography and entertainment under one roof.',
};

export async function getSettings() {
  return prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: DEFAULTS,
  });
}

export async function updateSettings(data: UpdateSettingsInput) {
  return prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { ...DEFAULTS, ...data },
  });
}
