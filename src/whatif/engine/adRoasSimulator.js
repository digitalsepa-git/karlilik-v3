export function calcAdRoas(input) {
  const { currentBudget, budgetMultiplier, decayFactor, currentRoas, profitMargin } = input;
  
  const newBudget = currentBudget * budgetMultiplier;
  const log2Mul = Math.log2(budgetMultiplier > 0 ? budgetMultiplier : 1);
  const newRoas = currentRoas * Math.pow(decayFactor, log2Mul);
  
  const currentRevenue = currentBudget * currentRoas;
  const newRevenue = newBudget * newRoas;
  
  const currentNetProfit = currentRevenue * profitMargin - currentBudget;
  const newNetProfit = newRevenue * profitMargin - newBudget;
  
  return {
    newBudget, newRoas, newRevenue, newNetProfit,
    revenueChange: newRevenue - currentRevenue,
    profitChange: newNetProfit - currentNetProfit,
    breakEvenRoas: profitMargin === 0 ? 0 : 1 / profitMargin,
  };
}
