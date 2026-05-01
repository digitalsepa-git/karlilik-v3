import { useBuilderStore } from "../store/builderStore";
import { executeQuery } from "../data/dataCatalog";
import { TEMPLATES } from "../templates/templates";
import { v4 as uuid } from "uuid";

// A simple utility to find the next available row (y) in the layout for smart placement
function findOptimalPosition(layout, type) {
  let maxY = 0;
  layout.forEach(l => {
    if (l.y + l.h > maxY) maxY = l.y + l.h;
  });
  
  // Basic sizing rules
  let w = 6;
  let h = 4;
  if (type === "KPICard" || type === "GoalGauge" || type === "Sparkline") {
    w = 3; h = 2;
  } else if (type === "DataTable" || type === "PivotTable") {
    w = 12; h = 5;
  }
  
  return { x: 0, y: maxY, w, h };
}

export async function executeTool(name, args) {
  const store = useBuilderStore.getState();

  switch (name) {
    case "queryData":
      return await executeQuery(args);

    case "addWidget": {
      const id = uuid();
      const position = args.position ?? findOptimalPosition(store.layout.lg, args.type);
      const widget = {
        id,
        i: id, // for react-grid-layout
        type: args.type,
        title: args.title,
        subtitle: args.subtitle,
        query: args.query,
        config: args.config ?? {},
      };
      store.addWidget(widget, position);
      return { success: true, widgetId: id, message: `${args.title} eklendi` };
    }

    case "updateFilter":
      store.updateFilter(args);
      return { success: true, filters: store.filters };

    case "saveReport": {
      const reportId = store.saveReport(args.name, args.description);
      return { success: true, reportId, name: args.name };
    }

    case "loadTemplate": {
      const tmpl = TEMPLATES[args.templateId];
      if (!tmpl) return { error: "Template not found" };
      store.loadTemplate(tmpl);
      return { success: true, templateId: args.templateId, widgetCount: tmpl.widgets.length };
    }

    case "suggestNextStep":
      // Read-only — just show in chat, no side-effect
      return { success: true, suggestion: args.suggestion };

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
