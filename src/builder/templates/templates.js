import { v4 as uuid } from 'uuid';

export const TEMPLATES = {
  "blank": {
    name: "Boş Sayfa",
    filters: { date: "last30days" },
    widgets: [],
    layout: { lg: [], md: [], sm: [] }
  },
  "financial-summary": {
    name: "Finansal Özet",
    filters: { date: "thisMonth" },
    widgets: [
      {
        id: "w_fs_1",
        type: "KPICard",
        title: "Net Kâr",
        query: { source: "orders", metrics: ["net_profit"] },
        config: {}
      },
      {
        id: "w_fs_2",
        type: "KPICard",
        title: "Brüt Ciro",
        query: { source: "orders", metrics: ["gross_revenue"] },
        config: {}
      },
      {
        id: "w_fs_3",
        type: "LineChart",
        title: "Kâr Trendi",
        query: { source: "orders", metrics: ["net_profit"], dimensions: ["date"] },
        config: { color: "#514BEE" }
      }
    ],
    layout: {
      lg: [
        { i: "w_fs_1", x: 0, y: 0, w: 3, h: 2 },
        { i: "w_fs_2", x: 3, y: 0, w: 3, h: 2 },
        { i: "w_fs_3", x: 0, y: 2, w: 6, h: 4 }
      ],
      md: [], sm: []
    }
  }
};
