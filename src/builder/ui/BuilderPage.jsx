import React from 'react';
import { WidgetLibrary } from './WidgetLibrary';
import { FilterBar } from './FilterBar';
import { Canvas } from './Canvas';
import { AISidebar } from './AISidebar';
import { InlineEditPanel } from './InlineEditPanel';
import { useBuilderStore } from '../store/builderStore';
import { Bot, ChevronRight } from 'lucide-react';

export function BuilderPage() {
  const { isAISidebarOpen, toggleAISidebar, selectedWidgetId } = useBuilderStore();
  
  return (
    <div className="flex h-full min-h-[800px] w-full bg-white font-sans overflow-hidden border border-[#EDEDF0] rounded-xl shadow-sm">
      <WidgetLibrary />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        <FilterBar />
        <Canvas />
        
        {/* Inline Edit Panel when a widget is selected */}
        {selectedWidgetId && <InlineEditPanel />}
      </main>
      
      
      
      {/* Global Styles for Builder Scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D0D0DC; border-radius: 10px; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
