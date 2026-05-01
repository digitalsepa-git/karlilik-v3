export function calcReversePricing(input) {
  const { cost, targetMargin, baseShipping = 0, baseAdUnit = 0, baseFixedUnit = 0, commissionRate = 0, taxRate = 0.20 } = input;
  
  const taxMultiplier = 1 + taxRate; // usually 1.2
  const bufferNumerator = cost + baseShipping + (taxMultiplier * baseAdUnit) + (taxMultiplier * baseFixedUnit);
  const denominator = 1 - commissionRate - (taxMultiplier * targetMargin);
  
  const breakEvenDenominator = 1 - commissionRate;
  const breakEvenPrice = breakEvenDenominator > 0 ? bufferNumerator / breakEvenDenominator : 0;
  
  if (denominator <= 0) {
    return {
      optimalPrice: null,
      error: "Hedef marj çok yüksek — KDV ve komisyon kesintileri sonrasında bu marja ulaşılamıyor.",
      breakEvenPrice: breakEvenPrice,
      fullyLoadedCost: 0
    };
  }
  
  const optimalPrice = bufferNumerator / denominator;
  const netProfit = optimalPrice * targetMargin;
  const fullyLoadedCost = optimalPrice - netProfit;
  
  const kdvFactor = 1 - (1 / taxMultiplier);
  const cogsVat = cost * kdvFactor;
  const shippingVat = baseShipping * kdvFactor;

  // Calculate costs AT the break-even point to ensure consistency between "Giydirilmiş Maliyet" and "Zararına Satış Noktası"
  const breakEvenCommissionAmt = breakEvenPrice * commissionRate;
  const breakEvenOutputVat = breakEvenPrice * kdvFactor;
  const breakEvenCommissionVat = breakEvenCommissionAmt * kdvFactor;
  const breakEvenTaxAmt = Math.max(0, breakEvenOutputVat - cogsVat - shippingVat - breakEvenCommissionVat);
  
  return {
    optimalPrice: optimalPrice,
    netProfit: netProfit,
    grossProfit: optimalPrice - cost, // basic gross difference
    breakEvenPrice: breakEvenPrice,
    margin: targetMargin,
    fullyLoadedCost: breakEvenPrice,
    costBreakdown: {
      cogs: cost,
      shipping: baseShipping,
      commission: breakEvenCommissionAmt,
      fixedCost: baseFixedUnit,
      adSpend: baseAdUnit,
      tax: breakEvenTaxAmt
    }
  };
}
