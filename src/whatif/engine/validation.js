import { SECTOR_BENCHMARKS } from './benchmarkData';

export function validateOutput(input, output) {
  const warnings = [];
  
  if (output.margin !== undefined && output.margin < SECTOR_BENCHMARKS.targetMargin.safeMin) {
    warnings.push({
      severity: "danger",
      message: `Net marj %${(output.margin * 100).toFixed(1)} — sağlıklı limit %10. Bu fiyat sürdürülemez.`,
    });
  }
  
  if (output.optimalPrice !== undefined && output.breakEvenPrice !== undefined && output.optimalPrice < output.breakEvenPrice) {
    warnings.push({
      severity: "danger",
      message: `Fiyat başabaş (₺${output.breakEvenPrice.toFixed(2)}) altında — her satış zarar.`,
    });
  }
  
  const totalEater = (input.commission || 0) + (input.adSpend || 0) + (input.targetMargin || 0);
  if (totalEater > 0.50) {
    warnings.push({
      severity: "warn",
      message: `Komisyon + Reklam + Marj toplamı %${(totalEater * 100).toFixed(0)} — ürün maliyetin %${((1-totalEater)*100).toFixed(0)}'inden fazla olamaz.`,
    });
  }
  
  if (input.adSpend !== undefined && input.adSpend > 0.15) {
    warnings.push({
      severity: "info",
      message: `Reklam payı %${(input.adSpend * 100).toFixed(1)} — sektör ortalaması %5-12. Bütçeyi gözden geçir.`,
    });
  }
  
  return warnings;
}
