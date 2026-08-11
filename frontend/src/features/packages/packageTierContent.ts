/** Static per-tier content matching the printed catalogue exactly — package
 * inclusions read as marketing copy ("Royal Food Menu") that differs by tier
 * for what is, underneath, the same shared Category (e.g. "Food"). The data
 * model has no way to give one Category three different display names, so
 * tier cards render from this fixed catalogue text instead of the live
 * category list. Falls back to the dynamic category list for any package
 * name that isn't one of these three (e.g. a future custom tier). */
export interface PackageTierContent {
  /** Tailwind gradient classes for the medallion background. */
  badgeGradient: string;
  /** Tailwind text color class for the medallion's ring/icon/text. */
  badgeAccent: string;
  tagline: string;
  features: string[];
}

export const PACKAGE_TIER_CONTENT: Record<string, PackageTierContent> = {
  silver: {
    badgeGradient: 'from-slate-200 via-slate-100 to-slate-400',
    badgeAccent: 'text-slate-600',
    tagline: 'SIMPLE · ELEGANT · MEMORABLE',
    features: [
      'Delicious Food Menu',
      'Basic Decoration',
      'Welcome Drinks',
      'Sound System',
      'Event Manager',
      'Clean & Premium Service',
    ],
  },
  gold: {
    badgeGradient: 'from-amber-200 via-yellow-300 to-amber-500',
    badgeAccent: 'text-amber-700',
    tagline: 'PREMIUM · STYLISH · PERFECT',
    features: [
      'Premium Food Menu',
      'Elegant Decoration',
      'Welcome Drinks & Mocktails',
      'Sound & Lighting',
      'Anchoring',
      'Photography',
      'Event Manager',
      'Clean & Premium Service',
    ],
  },
  platinum: {
    badgeGradient: 'from-zinc-300 via-neutral-100 to-zinc-500',
    badgeAccent: 'text-zinc-700',
    tagline: 'LUXURY · GRAND · UNFORGETTABLE',
    features: [
      'Royal Food Menu (Multi Cuisine)',
      'Grand Decoration & Theme',
      'Welcome Drinks, Mocktails & Live Counters',
      'Sound, Lighting & LED Setup',
      'Professional Anchoring',
      'Photography & Videography',
      'Entertainment (Live Acts/DJ)',
      'Bridal Services Support',
      'Event Manager (Full Support)',
      'Clean, Premium & Luxury Service',
    ],
  },
};

export function getPackageTierContent(packageName: string): PackageTierContent | undefined {
  return PACKAGE_TIER_CONTENT[packageName.trim().toLowerCase()];
}
