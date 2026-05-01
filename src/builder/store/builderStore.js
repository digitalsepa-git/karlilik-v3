import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";

export const useBuilderStore = create()(
  persist(
    (set, get) => ({
      widgets: [],
      layout: { lg: [], md: [], sm: [] },
      filters: { date: "last30days" },
      activeReportId: null,
      activeReportName: "Yeni Rapor",
      savedReports: {},
      aiMessages: [],
      selectedWidgetId: null,
      isAISidebarOpen: false,
      draggedWidgetType: null,

      setDraggedWidgetType: (type) => set({ draggedWidgetType: type }),

      addWidget: (widget, position) => set(state => ({
        widgets: [...state.widgets, widget],
        layout: {
          lg: [...state.layout.lg, { ...position, i: widget.id }],
          md: [...state.layout.md, { ...position, w: Math.min(position.w || 6, 8), i: widget.id }],
          sm: [...state.layout.sm, { ...position, w: 4, x: 0, y: 999, i: widget.id }],
        },
      })),

      removeWidget: (id) => set(state => ({
        widgets: state.widgets.filter(w => w.id !== id),
        layout: {
          lg: state.layout.lg.filter(g => g.i !== id),
          md: state.layout.md.filter(g => g.i !== id),
          sm: state.layout.sm.filter(g => g.i !== id),
        },
        selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
      })),

      updateWidget: (id, patch) => set(state => ({
        widgets: state.widgets.map(w => w.id === id ? { ...w, ...patch } : w),
      })),

      updateLayout: (newLayout, breakpoint = "lg") => set(state => ({
        layout: { ...state.layout, [breakpoint]: newLayout },
      })),

      updateFilter: (patch) => set(state => ({
        filters: { ...state.filters, ...patch },
      })),

      selectWidget: (id) => set({ selectedWidgetId: id }),
      toggleAISidebar: () => set(state => ({ isAISidebarOpen: !state.isAISidebarOpen })),

      saveReport: (name, description) => {
        const state = get();
        const id = state.activeReportId ?? uuid();
        const report = {
          id,
          name,
          description,
          widgets: state.widgets,
          layout: state.layout,
          filters: state.filters,
          createdAt: state.savedReports[id]?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({
          savedReports: { ...state.savedReports, [id]: report },
          activeReportId: id,
          activeReportName: name,
        }));
        return id;
      },

      loadReport: (id) => {
        const state = get();
        const r = state.savedReports[id];
        if (!r) return;
        set({
          widgets: r.widgets,
          layout: r.layout,
          filters: r.filters,
          activeReportId: id,
          activeReportName: r.name,
          selectedWidgetId: null,
        });
      },

      loadTemplate: (tmpl) => set({
        widgets: tmpl.widgets || [],
        layout: tmpl.layout || { lg: [], md: [], sm: [] },
        filters: tmpl.filters || { date: "last30days" },
        activeReportId: null,
        activeReportName: tmpl.name,
        selectedWidgetId: null,
      }),

      resetCanvas: () => set({
        widgets: [],
        layout: { lg: [], md: [], sm: [] },
        filters: { date: "last30days" },
        activeReportId: null,
        activeReportName: "Yeni Rapor",
        selectedWidgetId: null,
      }),

      appendAIMessage: (msg) => set(state => ({
        aiMessages: [...state.aiMessages, { ...msg, timestamp: Date.now() }].slice(-50),
      })),

      clearAIMessages: () => set({ aiMessages: [] }),
    }),
    {
      name: "gilan-builder-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedReports: state.savedReports,
        activeReportId: state.activeReportId,
        activeReportName: state.activeReportName,
        widgets: state.widgets,
        layout: state.layout,
        filters: state.filters,
      }),
    }
  )
);
