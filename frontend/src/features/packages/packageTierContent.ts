/** Static per-tier content matching the printed catalogue exactly — package
 * inclusions read as marketing copy ("Royal Food Menu") that differs by tier
 * for what is, underneath, the same shared Category (e.g. "Food"). The data
 * model has no way to give one Category three different display names, so
 * tier cards render from this fixed catalogue text instead of the live
 * category list. Falls back to the dynamic category list for any package
 * name that isn't one of these three (e.g. a future custom tier). */
export interface PackageTierContent {
  emoji: string;
  tagline: string;
  features: { emoji: string; text: string }[];
}

export const PACKAGE_TIER_CONTENT: Record<string, PackageTierContent> = {
  silver: {
    emoji: '🥈',
    tagline: 'SIMPLE · ELEGANT · MEMORABLE',
    features: [
      { emoji: '🍽️', text: 'Delicious Food Menu' },
      { emoji: '🎨', text: 'Basic Decoration' },
      { emoji: '🥤', text: 'Welcome Drinks' },
      { emoji: '🔊', text: 'Sound System' },
      { emoji: '🧑‍💼', text: 'Event Manager' },
      { emoji: '✨', text: 'Clean & Premium Service' },
    ],
  },
  gold: {
    emoji: '🥇',
    tagline: 'PREMIUM · STYLISH · PERFECT',
    features: [
      { emoji: '🍽️', text: 'Premium Food Menu' },
      { emoji: '🎨', text: 'Elegant Decoration' },
      { emoji: '🍹', text: 'Welcome Drinks & Mocktails' },
      { emoji: '💡', text: 'Sound & Lighting' },
      { emoji: '🎤', text: 'Anchoring' },
      { emoji: '📸', text: 'Photography' },
      { emoji: '🧑‍💼', text: 'Event Manager' },
      { emoji: '✨', text: 'Clean & Premium Service' },
    ],
  },
  platinum: {
    emoji: '💎',
    tagline: 'LUXURY · GRAND · UNFORGETTABLE',
    features: [
      { emoji: '🍽️', text: 'Royal Food Menu (Multi Cuisine)' },
      { emoji: '🎨', text: 'Grand Decoration & Theme' },
      { emoji: '🍹', text: 'Welcome Drinks, Mocktails & Live Counters' },
      { emoji: '💡', text: 'Sound, Lighting & LED Setup' },
      { emoji: '🎤', text: 'Professional Anchoring' },
      { emoji: '📸', text: 'Photography & Videography' },
      { emoji: '🎉', text: 'Entertainment (Live Acts/DJ)' },
      { emoji: '👰', text: 'Bridal Services Support' },
      { emoji: '🧑‍💼', text: 'Event Manager (Full Support)' },
      { emoji: '🧹', text: 'Clean, Premium & Luxury Service' },
    ],
  },
};

export function getPackageTierContent(packageName: string): PackageTierContent | undefined {
  return PACKAGE_TIER_CONTENT[packageName.trim().toLowerCase()];
}
