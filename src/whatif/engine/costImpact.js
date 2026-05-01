export function calcCostImpact(input) {
  const { price, currentCommission, currentShipping, currentCost, commissionDelta, shippingDelta, costDelta, adSpend } = input;
  
  const newCommission = currentCommission + commissionDelta;
  const newShipping = currentShipping + shippingDelta;
  const newCost = currentCost * (1 + costDelta);
  
  const currentNetProfit = price * (1 - currentCommission - adSpend) - currentCost - currentShipping;
  const newNetProfit = price * (1 - newCommission - adSpend) - newCost - newShipping;
  
  const currentMargin = currentNetProfit / price;
  const newMargin = newNetProfit / price;
  
  return {
    currentNetProfit, newNetProfit,
    profitChange: newNetProfit - currentNetProfit,
    currentMargin, newMargin,
    marginChange: newMargin - currentMargin,
  };
}
