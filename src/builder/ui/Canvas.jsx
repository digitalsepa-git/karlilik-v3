import React from 'react';
import { Responsive as ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useBuilderStore } from '../store/builderStore';
import { WidgetRenderer } from './WidgetRenderer';
import { cn } from '../../lib/utils';
import { Plus } from 'lucide-react';
import { createSmartDefaultWidget } from '../utils/smartDefaults';

export function Canvas({ className, mode = 'edit' }) {
  const { widgets, layout, updateLayout, addWidget, selectWidget, selectedWidgetId, draggedWidgetType, setDraggedWidgetType } = useBuilderStore();
  const { width, containerRef } = useContainerWidth();
  
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "copy";
  };
  
  const handleDrop = (newLayout, item, e) => {
    // Attempt to get from dataTransfer, fallback to global variable (needed for some RGL/browser combos)
    const widgetType = e?.dataTransfer?.getData("text/plain") || draggedWidgetType;
    if (!widgetType) return;
    
    // We create a smart default widget based on type
    const widget = createSmartDefaultWidget(widgetType);
    const position = { ...item, i: widget.id, w: Math.max(item.w || 4, 4), h: Math.max(item.h || 4, 4) };
    addWidget(widget, position);
    selectWidget(widget.id);
    setDraggedWidgetType(null); // Clear the dragged type
  };

  if (widgets.length === 0) {
    return (
      <div 
        ref={containerRef} 
        className={cn("flex-1 relative overflow-auto bg-[#FAFAFB]", className)}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-[#A1A1AA] pointer-events-none z-10">
          <div className="w-full max-w-lg h-64 border-2 border-dashed border-[#EDEDF0] rounded-2xl flex flex-col items-center justify-center bg-white/50">
            <Plus size={32} className="mb-4 text-[#D4D4D8]" />
            <p className="font-semibold text-sm text-[#7D7DA6]">Widget'ları buraya sürükleyin</p>
            <p className="text-xs mt-1">Sol panelden bir bileşen seçip tuvale bırakın</p>
          </div>
        </div>
        {width > 0 && (
          <ResponsiveGridLayout
            width={width}
            className="layout w-full h-full"
            style={{ minHeight: '600px' }}
            layouts={layout}
          breakpoints={{ lg: 1200, md: 768, sm: 0 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={60}
          onDrop={handleDrop}
          isDroppable={mode === 'edit'}
          droppingItem={{ i: "__dropping-elem__", w: 4, h: 4 }}
        >
          {/* Empty but drop area enabled */}
        </ResponsiveGridLayout>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn("flex-1 bg-[#FAFAFB] relative overflow-auto p-4 custom-scrollbar", className)}
      onDragOver={handleDragOver}
    >
      {width > 0 && (
      <ResponsiveGridLayout
        width={width}
        className="layout w-full h-full"
        style={{ minHeight: '600px' }}
        layouts={layout}
        onLayoutChange={(currentLayout, allLayouts) => {
          // Sync layout back to store
          // Note: we might only want to sync on drag stop to prevent constant re-renders
          updateLayout(currentLayout, "lg");
        }}
        breakpoints={{ lg: 1200, md: 768, sm: 0 }}
        cols={{ lg: 12, md: 8, sm: 4 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={mode === 'edit'}
        isResizable={mode === 'edit'}
        isDroppable={mode === 'edit'}
        droppingItem={{ i: "__dropping-elem__", w: 4, h: 4 }}
        onDrop={handleDrop}
        compactType="vertical"
      >
        {widgets.map(w => (
          <div
            key={w.id}
            onClick={() => mode === 'edit' && selectWidget(w.id)}
            className={cn(
              "rounded-xl border bg-white p-4 transition-all shadow-sm cursor-pointer",
              selectedWidgetId === w.id 
                ? "ring-2 ring-[#514BEE] border-[#514BEE]" 
                : "border-[#EDEDF0] hover:border-[#B4B4C8]"
            )}
          >
            <WidgetRenderer widget={w} />
          </div>
        ))}
      </ResponsiveGridLayout>
      )}
    </div>
  );
}
