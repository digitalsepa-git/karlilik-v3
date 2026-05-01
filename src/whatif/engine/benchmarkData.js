export const SECTOR_BENCHMARKS = {
  commissionRates: {
    trendyol: { min: 0.15, max: 0.25, avg: 0.18, label: "Trendyol komisyon" },
    hepsiburada: { min: 0.13, max: 0.23, avg: 0.17, label: "HB komisyon" },
    amazon: { min: 0.08, max: 0.15, avg: 0.12, label: "Amazon komisyon" },
    ikas: { min: 0, max: 0.05, avg: 0.025, label: "ikas işlem ücreti" },
    n11: { min: 0.10, max: 0.20, avg: 0.15, label: "N11 komisyon" },
  },
  adSpendRatio: {
    avg: 0.08,
    min: 0.02,
    max: 0.20,
    label: "E-tic reklam payı (cironun %)",
  },
  returnRate: {
    avg: 0.08,
    min: 0.02,
    max: 0.20,
    byCategory: {
      "Giyim": 0.18,
      "Elektronik": 0.05,
      "Kozmetik": 0.04,
      "Ev Yaşam": 0.08,
      "Aksesuar": 0.06,
    },
  },
  shippingCost: {
    avg: 25,
    min: 15,
    max: 50,
    label: "Kargo maliyeti per sipariş (₺)",
  },
  targetMargin: {
    safeMin: 0.10,
    healthy: 0.20,
    excellent: 0.30,
    label: "Sağlıklı net marj e-tic için",
  },
  priceElasticity: {
    inelastic: -0.5,
    avg: -1.5,
    elastic: -2.5,
    label: "Fiyat esneklik katsayısı",
  },
  roasDecay: {
    avg: 0.7,
    aggressive: 0.5,
    mild: 0.85,
  },
  defaultRoas: {
    meta: 3.5,
    google: 4.0,
    trendyolAds: 5.0,
  },
};
