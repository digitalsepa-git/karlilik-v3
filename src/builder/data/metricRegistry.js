export const METRIC_REGISTRY = {
  net_profit: {
    id: "net_profit",
    label: "Net Kâr",
    source: "orders",
    field: "netProfit",
    aggregation: "sum",
    format: "currency",
    description: "Reklam, iade, kargo, komisyon sonrası net kâr toplamı",
  },
  gross_revenue: {
    id: "gross_revenue",
    label: "Brüt Ciro",
    source: "orders",
    field: "grossRevenue",
    aggregation: "sum",
    format: "currency",
    description: "İskonto öncesi toplam ciro",
  },
  order_count: {
    id: "order_count",
    label: "Sipariş Adedi",
    source: "orders",
    field: "id",
    aggregation: "count",
    format: "number",
    description: "Toplam sipariş sayısı",
  },
  avg_order_value: {
    id: "avg_order_value",
    label: "Ortalama Sepet",
    source: "orders",
    field: "grossRevenue",
    aggregation: "avg",
    format: "currency",
    description: "Ortalama sipariş değeri",
  },
  return_rate: {
    id: "return_rate",
    label: "İade Oranı",
    source: "returns",
    field: "rate",
    aggregation: "avg",
    format: "percent",
    description: "İade edilen siparişlerin yüzdesi",
  },
  roas: {
    id: "roas",
    label: "ROAS",
    source: "adSpend",
    field: "roas",
    aggregation: "avg",
    format: "number",
    description: "Reklam harcaması başına gelir oranı",
  },
  ltv: {
    id: "ltv",
    label: "Müşteri Yaşam Boyu Değeri",
    source: "customers",
    field: "ltv",
    aggregation: "avg",
    format: "currency",
    description: "Ortalama LTV",
  },
  // Add more metrics as needed
};

export function getMetricsBySource(source) {
  return Object.values(METRIC_REGISTRY).filter(m => m.source === source);
}
