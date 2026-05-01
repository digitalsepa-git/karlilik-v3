import { Type } from "@google/genai";

export const queryDataDeclaration = {
  name: "queryData",
  description: "Mevcut uygulama verisinden sorgulama yapar. Adapter pattern ile data dosyalarına erişir. Result olarak normalize edilmiş JSON döner.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      source: { type: Type.STRING, enum: ["orders", "products", "channels", "returns", "expenses", "adSpend", "customers", "competitors"] },
      metrics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Metric ID array. Allowed: net_profit, gross_revenue, order_count, vs." },
      dimensions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Group-by alanlar: date, channel, category, sku" },
      filters: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, enum: ["today", "yesterday", "last7days", "last30days", "last90days", "thisMonth", "lastMonth", "ytd"] },
          channel: { type: Type.STRING },
          category: { type: Type.STRING },
          productSku: { type: Type.STRING },
        },
      },
      sort: { type: Type.OBJECT, properties: { field: { type: Type.STRING }, dir: { type: Type.STRING, enum: ["asc", "desc"] } } },
      limit: { type: Type.NUMBER },
    },
    required: ["source", "metrics"],
  },
};

export const addWidgetDeclaration = {
  name: "addWidget",
  description: "Belirtilen widget tipini kanvasa ekler. Position belirtilmezse en uygun yere smart-default ile yerleştirir.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ["KPICard", "GoalGauge", "Sparkline", "LineChart", "BarChart", "PieChart", "DataTable", "PivotTable", "Heading", "ImageBlock"] },
      title: { type: Type.STRING },
      subtitle: { type: Type.STRING },
      query: { 
        type: Type.OBJECT,
        properties: {
            source: { type: Type.STRING },
            metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
            dimensions: { type: Type.ARRAY, items: { type: Type.STRING } },
            filters: { type: Type.OBJECT }
        }
      },
      config: {
        type: Type.OBJECT,
        properties: {
          showLegend: { type: Type.BOOLEAN },
          showValues: { type: Type.BOOLEAN },
          color: { type: Type.STRING },
          comparisonMode: { type: Type.STRING, enum: ["none", "previousPeriod", "yearAgo"] },
        },
      },
      position: {
        type: Type.OBJECT,
        properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER }, w: { type: Type.NUMBER }, h: { type: Type.NUMBER } },
      },
    },
    required: ["type", "title", "query"],
  },
};

export const updateFilterDeclaration = {
  name: "updateFilter",
  description: "Sayfanın üstündeki global filter'ı değiştirir. Sadece global filter — widget-level filter yok (MVP).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, enum: ["today", "yesterday", "last7days", "last30days", "last90days", "thisMonth", "lastMonth", "ytd"] },
      channel: { type: Type.STRING },
      category: { type: Type.STRING },
    },
  },
};

export const saveReportDeclaration = {
  name: "saveReport",
  description: "Mevcut canvas state'ini verilen isimle localStorage'a kaydet.",
  parameters: {
    type: Type.OBJECT,
    properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
    required: ["name"],
  },
};

export const loadTemplateDeclaration = {
  name: "loadTemplate",
  description: "Önceden tanımlı şablondan birini canvasa yükle.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      templateId: {
        type: Type.STRING,
        enum: ["financial-summary", "channel-profitability", "product-deep-dive", "ad-roi", "stock-health", "customer-rfm", "return-analysis", "tax-prep", "daily-ops", "competitor-watch", "ceo-overview", "blank"],
      },
    },
    required: ["templateId"],
  },
};

export const suggestNextStepDeclaration = {
  name: "suggestNextStep",
  description: "Kullanıcının kanvasına bakarak akıllı sonraki adım önerir. Read-only.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: { type: Type.STRING },
      suggestion: { type: Type.STRING },
    },
    required: ["suggestion"],
  },
};

export const TOOLS_DECLARATIONS = [
  queryDataDeclaration,
  addWidgetDeclaration,
  updateFilterDeclaration,
  saveReportDeclaration,
  loadTemplateDeclaration,
  suggestNextStepDeclaration,
];
