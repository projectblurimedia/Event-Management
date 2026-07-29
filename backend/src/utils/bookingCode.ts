/** Derives a 2-4 letter prefix from the business name — initials for a
 * multi-word name ("MS Wedding Planner" -> "MWP"), otherwise the first few
 * letters of the single word. Falls back to "EVT" if no name is set. */
function prefixFromBusinessName(businessName: string): string {
  const words = businessName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'EVT';
  if (words.length === 1) return words[0]!.slice(0, 4).toUpperCase();
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();
}

export function generateBookingCode(businessName: string): string {
  const prefix = prefixFromBusinessName(businessName);
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
}
