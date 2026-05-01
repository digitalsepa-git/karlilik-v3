export function calcReversePricing(input) {
  const { cost, targetMargin, commission, adSpend } = input;
  const denominator = 1 - (commission + adSpend + targetMargin);
  
  if (denominator <= 0) {
    return {
      optimalPrice: null,
      error: "Hedef marj çok yüksek — komisyon + reklam + marj toplamı %100'ü geçiyor",
      breakEvenPrice: cost / (1 - commission - adSpend),
    };
  }
  
  const optimalPrice = cost / denominator;
  const grossProfit = optimalPrice - cost;
  const netProfit = optimalPrice * targetMargin;
  const breakEvenPrice = cost / (1 - commission - adSpend);
  
  return {
    optimalPrice: optimalPrice,
    netProfit: netProfit,
    grossProfit: grossProfit,
    breakEvenPrice: breakEvenPrice,
    margin: targetMargin,
  };
}
