import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { issueToken } from '../auth/auth.service';
import type { SetupInput } from './setup.validator';

export async function isSetupComplete() {
  const count = await prisma.adminUser.count();
  return count > 0;
}

export async function completeSetup(
  input: SetupInput,
  images: { logoUrl?: string; businessIntroImageUrl?: string },
) {
  const { logoUrl, businessIntroImageUrl } = images;
  if (await isSetupComplete()) {
    throw ApiError.forbidden('Setup has already been completed');
  }

  const passwordHash = await bcrypt.hash(input.adminPassword, 10);
  // Convention used throughout the app: `phone` is the bare 10-digit number,
  // `whatsapp` carries the country code (e.g. wa.me links, tel: hrefs).
  const whatsapp = input.whatsapp || `91${input.phone}`;
  const email = input.email || input.adminEmail;
  // The map is only ever shown on the public site when we have real
  // coordinates from the browser's Geolocation API — a manually-typed
  // address alone isn't reliable enough to plot accurately.
  const hasCoords = input.latitude !== undefined && input.longitude !== undefined;
  const mapEmbedUrl = hasCoords
    ? `https://www.google.com/maps?q=${input.latitude},${input.longitude}&output=embed`
    : null;

  const admin = await prisma.$transaction(async (tx) => {
    const createdAdmin = await tx.adminUser.create({
      data: { name: input.adminName, email: input.adminEmail, passwordHash },
    });

    await tx.siteSettings.create({
      data: {
        id: 'singleton',
        businessName: input.businessName,
        logoUrl,
        organiser: input.adminName,
        phone: input.phone,
        whatsapp,
        email,
        address: input.address,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        mapEmbedUrl,
        heroHeadline: `Welcome to ${input.businessName}`,
        heroSubheadline: 'Full-service event management and catering, tailored to your celebration.',
        businessIntroTitle: `About ${input.businessName}`,
        businessIntroText: `${input.businessName} plans and delivers memorable events from start to finish.`,
        businessIntroImageUrl,
      },
    });

    return createdAdmin;
  });

  return issueToken(admin);
}
