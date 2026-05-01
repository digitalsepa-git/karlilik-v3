import { v4 as uuid } from 'uuid';

export function createSmartDefaultWidget(type) {
  const id = uuid();
  switch (type) {
    case "KPICard":
      return {
        id, type, title: "Net Kâr",
        query: { source: "orders", metrics: ["net_profit"], filters: { date: "last30days" } },
        config: { comparisonMode: "previousPeriod" },
      };
    case "LineChart":
    case "Sparkline":
      return {
        id, type, title: "Net Kâr Trendi",
        query: { source: "orders", metrics: ["net_profit"], dimensions: ["date"], filters: { date: "last30days" } },
        config: { showLegend: true, color: "#514BEE" },
      };
    case "BarChart":
      return {
        id, type, title: "Kanal Kârları",
        query: { source: "orders", metrics: ["net_profit"], dimensions: ["channel"], filters: { date: "last30days" } },
        config: { showValues: true },
      };
    case "PieChart":
      return {
        id, type, title: "Ciro Dağılımı (Kategori)",
        query: { source: "orders", metrics: ["gross_revenue"], dimensions: ["category"], filters: { date: "last30days" } },
        config: { showLegend: true },
      };
    case "DataTable":
    case "PivotTable":
      return {
        id, type, title: "Detaylı Tablo",
        query: { source: "orders", metrics: ["gross_revenue", "net_profit", "quantity"], dimensions: ["sku"], filters: { date: "last30days" }, limit: 10 },
        config: { pagination: true },
      };
    case "GoalGauge":
      return {
        id, type, title: "Aylık Hedef Durumu",
        query: { source: "orders", metrics: ["net_profit"], filters: { date: "thisMonth" } },
        config: { goal: 50000 },
      };
    case "Heading":
      return {
        id, type, title: "Rapor Bölümü",
        query: { source: "orders", metrics: [] },
        config: { level: 2 },
      };
    case "ImageBlock":
      return {
        id, type, title: "Görsel",
        query: { source: "orders", metrics: [] },
        config: { url: "" },
      };
    default:
      return {
        id, type, title: "Yeni Widget",
        query: { source: "orders", metrics: ["net_profit"], filters: { date: "last30days" } },
        config: {},
      };
  }
}
