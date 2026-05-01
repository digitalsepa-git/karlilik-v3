import { calcReversePricing } from './reversePricing';

export function calcNewProductLaunch(input) {
  // Same formula, different defaults and channel extraction
  const result = calcReversePricing({
    cost: input.cost,
    targetMargin: input.targetMargin,
    commission: 0.18, // fallback, UI should pass it from channel
    adSpend: 0.10, // default launch ad spend 10%
  });
  
  return result;
}
