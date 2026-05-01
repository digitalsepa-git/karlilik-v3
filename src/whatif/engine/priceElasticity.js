export function calcPriceElasticity(input) {
  const { currentPrice, priceChange, elasticity, currentDemand, cost, commission, adSpend } = input;
  
  const newPrice = currentPrice * (1 + priceChange);
  const demandChange = elasticity * priceChange;
  const newDemand = currentDemand * (1 + demandChange);
  
  const currentRevenue = currentPrice * currentDemand;
  const newRevenue = newPrice * newDemand;
  
  const currentNetProfit = currentDemand * (currentPrice * (1 - commission - adSpend) - cost);
  const newNetProfit = newDemand * (newPrice * (1 - commission - adSpend) - cost);
  
  return {
    newPrice: newPrice,
    newDemand: Math.round(newDemand),
    currentRevenue, newRevenue,
    revenueChange: newRevenue - currentRevenue,
    revenueChangePct: currentRevenue === 0 ? 0 : (newRevenue - currentRevenue) / currentRevenue,
    currentNetProfit, newNetProfit,
    profitChange: newNetProfit - currentNetProfit,
    margin: newRevenue === 0 ? 0 : newNetProfit / newRevenue,
  };
}
