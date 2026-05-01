export function calcCampaign(input) {
  const { campaignType, discountPct, bundleN, bundleM, demandLift, baseDemand, basePrice, cost, commission, adSpend } = input;
  
  let effectivePrice;
  let effectiveCost;
  let unitsSold = baseDemand * (1 + demandLift);
  
  switch (campaignType) {
    case "discount":
      effectivePrice = basePrice * (1 - discountPct);
      effectiveCost = cost;
      break;
      
    case "bundle":
      // N al M öde: N adet alır, M ödeme.
      const ratio = bundleM / bundleN;
      effectivePrice = basePrice * ratio;
      effectiveCost = cost; 
      unitsSold = unitsSold * bundleN;
      break;
      
    case "freeShipping":
      effectivePrice = basePrice;
      effectiveCost = cost + 40; // Shipping cost mock
      break;
      
    case "gift":
      effectivePrice = basePrice;
      effectiveCost = cost + 20; // Gift cost mock
      break;
      
    default:
      effectivePrice = basePrice;
      effectiveCost = cost;
      break;
  }
  
  const revenue = effectivePrice * unitsSold;
  const netProfit = unitsSold * (effectivePrice * (1 - commission - adSpend) - effectiveCost);
  
  return {
    effectivePrice, 
    unitsSold: Math.round(unitsSold), 
    revenue, 
    netProfit,
    margin: revenue === 0 ? 0 : netProfit / revenue,
  };
}
