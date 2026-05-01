import React, { useState } from 'react';
import { Grid, Target, LineChart, BarChart2, PieChart, LayoutDashboard, Type, Image as ImageIcon, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const WIDGET_CATEGORIES = [
  { name: "KPI & METRİK", widgets: ["KPICard", "GoalGauge", "Sparkline"] },
  { name: "GRAFİKLER", widgets: ["LineChart", "BarChart", "PieChart"] },
  { name: "TABLO & LİSTE", widgets: ["DataTable", "PivotTable"] },
  { name: "METİN & MEDYA", widgets: ["Heading", "ImageBlock"] },
];

const WIDGET_LABELS = {
  KPICard: "KPI Kartı",
  GoalGauge: "Hedef Göstergesi",
  Sparkline: "Sparkline",
  LineChart: "Line Chart",
  BarChart: "Bar Chart",
  PieChart: "Pie Chart",
  DataTable: "Data Tablosu",
  PivotTable: "Pivot Tablo",
  Heading: "Başlık",
  ImageBlock: "Görsel"
};

const WIDGET_ICONS = {
  KPICard: Grid,
  GoalGauge: Target,
  Sparkline: LineChart,
  LineChart: LineChart,
  BarChart: BarChart2,
  PieChart: PieChart,
  DataTable: LayoutDashboard,
  PivotTable: LayoutDashboard,
  Heading: Type,
  ImageBlock: ImageIcon
};

export function WidgetLibrary({ className }) {
  const [search, setSearch] = useState("");
  
  return (
    <aside className={cn("w-60 bg-white border-r border-[#EDEDF0] flex flex-col h-full shrink-0", className)}>
      <div className="p-4 border-b border-[#EDEDF0]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 text-[#B4B4C8]" size={14} />
          <input
            placeholder="Widget Ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#FAFAFB] border border-[#EDEDF0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#514BEE]"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {WIDGET_CATEGORIES.map(cat => {
          const filtered = cat.widgets.filter(w => 
            WIDGET_LABELS[w].toLowerCase().includes(search.toLowerCase())
          );
          if (filtered.length === 0) return null;

          return (
            <div key={cat.name}>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7D7DA6] mb-2">
                {cat.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {filtered.map(w => (
                  <DraggableWidgetTile key={w} type={w} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

import { useBuilderStore } from '../store/builderStore';
import { createSmartDefaultWidget } from '../utils/smartDefaults';

function DraggableWidgetTile({ type }) {
  const Icon = WIDGET_ICONS[type] || Grid;
  const { setDraggedWidgetType, addWidget, selectWidget, layout } = useBuilderStore();

  const handleAddClick = () => {
    const widget = createSmartDefaultWidget(type);
    
    // Find highest Y in layout to place the new widget at the bottom
    let maxY = 0;
    if (layout.lg && layout.lg.length > 0) {
      maxY = Math.max(...layout.lg.map(item => item.y + item.h));
    }
    
    const position = { x: 0, y: maxY, w: 4, h: 4, i: widget.id };
    addWidget(widget, position);
    selectWidget(widget.id);
  };

  return (
    <div
      draggable={true}
      unselectable="on"
      onClick={handleAddClick}
      onDragStart={e => {
        setDraggedWidgetType(type);
        e.dataTransfer.setData("text/plain", type);
        e.dataTransfer.effectAllowed = "copy";
      }}
      className="bg-[#FAFAFB] border border-[#EDEDF0] rounded-lg p-2.5 flex flex-col items-center justify-center text-center cursor-grab hover:border-[#514BEE] hover:shadow-sm transition-all group"
    >
      <Icon size={18} className="text-[#7D7DA6] mb-1.5 group-hover:text-[#514BEE] pointer-events-none" />
      <span className="text-[10px] font-medium text-[#0F1223] leading-tight pointer-events-none">{WIDGET_LABELS[type]}</span>
    </div>
  );
}
