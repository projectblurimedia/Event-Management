export type PricingMode = 'FLAT' | 'PER_PERSON';

export interface PricingInput {
  items: { price: number; pricingMode: PricingMode; quantity: number }[];
}

export interface PricingBreakdown {
  perPersonCost: number;
  flatCost: number;
  grandTotal: number;
}

/**
 * Packages carry no price of their own — the total is purely the sum of
 * whatever items the customer selects. Each item's pricing mode comes from
 * its parent Category (set once by the admin, not chosen per item); for
 * PER_PERSON items, `quantity` is expected to already reflect the guest
 * count (mirrors how per-plate food quantities worked previously).
 */
export function calculatePricing(input: PricingInput): PricingBreakdown {
  let perPersonCost = 0;
  let flatCost = 0;

  for (const item of input.items) {
    const lineTotal = item.price * item.quantity;
    if (item.pricingMode === 'PER_PERSON') {
      perPersonCost += lineTotal;
    } else {
      flatCost += lineTotal;
    }
  }

  return {
    perPersonCost: round(perPersonCost),
    flatCost: round(flatCost),
    grandTotal: round(perPersonCost + flatCost),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
