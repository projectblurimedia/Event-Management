import { prisma } from '../../config/prisma';
import type { UpdateSettingsInput } from './settings.validator';

/**
 * The singleton SiteSettings row is created by the one-time setup flow
 * (see modules/setup), not seeded or defaulted here — until setup runs,
 * this returns null rather than fabricating a placeholder business identity.
 */
export async function getSettings() {
  return prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
}

export async function updateSettings(data: UpdateSettingsInput) {
  const { latitude, longitude, ...rest } = data;
  const payload: UpdateSettingsInput & { mapEmbedUrl?: string | null } = { ...rest };

  if (latitude !== undefined || longitude !== undefined) {
    if (latitude != null && longitude != null) {
      payload.latitude = latitude;
      payload.longitude = longitude;
      payload.mapEmbedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&output=embed`;
    } else {
      // Explicit clear, or only one coordinate supplied — treat as clearing
      // the pin rather than leaving a half-set, inconsistent location.
      payload.latitude = null;
      payload.longitude = null;
      payload.mapEmbedUrl = null;
    }
  }

  return prisma.siteSettings.update({ where: { id: 'singleton' }, data: payload });
}
