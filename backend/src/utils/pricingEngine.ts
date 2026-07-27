export type ServiceUnit = 'FLAT' | 'PER_GUEST';

export interface PricingInput {
  guestCount: number;
  package: { pricePerGuest: number } | null;
  menuItems: { price: number; quantity: number }[];
  serviceOptions: { price: number; unit: ServiceUnit; quantity: number }[];
}

export interface PricingBreakdown {
  packageCost: number;
  foodCost: number;
  addOnsCost: number;
  grandTotal: number;
}

export function calculatePricing(input: PricingInput): PricingBreakdown {
  const packageCost = input.package ? round(input.package.pricePerGuest * input.guestCount) : 0;

  const foodCost = round(
    input.menuItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  const addOnsCost = round(input.serviceOptions.reduce((sum, s) => sum + s.price * s.quantity, 0));

  const grandTotal = round(packageCost + foodCost + addOnsCost);

  return { packageCost, foodCost, addOnsCost, grandTotal };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
