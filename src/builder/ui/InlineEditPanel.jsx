import React from 'react';
import { useBuilderStore } from '../store/builderStore';
import { X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function InlineEditPanel() {
  const { selectedWidgetId, widgets, updateWidget, removeWidget, selectWidget } = useBuilderStore();
  const widget = widgets.find(w => w.id === selectedWidgetId);
  
  if (!widget) return null;
  
  return (
    <aside className="absolute right-0 top-14 bottom-0 w-80 bg-white border-l border-[#EDEDF0] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 z-10">
      <div className="flex justify-between items-center p-4 border-b border-[#EDEDF0]">
        <div>
          <h3 className="font-bold text-[#0F1223] text-sm">Widget Ayarları</h3>
          <p className="text-[10px] text-[#7D7DA6] uppercase">{widget.type} Seçili</p>
        </div>
        <button onClick={() => selectWidget(null)} className="text-[#B4B4C8] hover:text-[#0F1223] rounded p-1 hover:bg-[#FAFAFB]">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Title */}
        <div>
          <label className="text-[11px] font-bold text-[#0F1223] uppercase tracking-wider block mb-2">Başlık</label>
          <input 
            value={widget.title || ""} 
            onChange={e => updateWidget(widget.id, { title: e.target.value })} 
            className="w-full text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none" 
          />
        </div>
        
        {/* Data Source */}
        <div>
          <label className="text-[11px] font-bold text-[#0F1223] uppercase tracking-wider block mb-2">Veri Kaynağı</label>
          <select 
            value={widget.query?.source || "orders"}
            onChange={e => updateWidget(widget.id, { query: { ...widget.query, source: e.target.value } })}
            className="w-full text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none bg-white"
          >
            <option value="orders">Siparişler</option>
            {/* Will add more dynamically later */}
          </select>
        </div>
        
        {/* Metrics */}
        <div>
          <label className="text-[11px] font-bold text-[#0F1223] uppercase tracking-wider block mb-2">Metrik</label>
          <select 
            value={widget.query?.metrics?.[0] || ""}
            onChange={e => updateWidget(widget.id, { query: { ...widget.query, metrics: [e.target.value] } })}
            className="w-full text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none bg-white"
          >
            <option value="net_profit">Net Kâr</option>
            <option value="gross_revenue">Brüt Ciro</option>
            <option value="order_count">Sipariş Adedi</option>
            <option value="avg_order_value">Ortalama Sepet</option>
            <option value="quantity">Satılan Ürün Adedi</option>
          </select>
        </div>
        
        {/* Dimensions (if applicable for charts) */}
        {['LineChart', 'BarChart', 'PieChart', 'DataTable'].includes(widget.type) && (
          <div>
            <label className="text-[11px] font-bold text-[#0F1223] uppercase tracking-wider block mb-2">Gruplama</label>
            <select 
              value={widget.query?.dimensions?.[0] || ""}
              onChange={e => updateWidget(widget.id, { query: { ...widget.query, dimensions: [e.target.value] } })}
              className="w-full text-sm border border-[#EDEDF0] rounded-lg p-2 focus:border-[#514BEE] outline-none bg-white"
            >
              <option value="date">Tarih</option>
              <option value="channel">Kanal</option>
              <option value="category">Kategori</option>
              <option value="sku">Ürün (SKU)</option>
            </select>
          </div>
        )}
      </div>

      <div className="border-t border-[#EDEDF0] p-4 bg-[#FAFAFB]">
        <button 
          onClick={() => removeWidget(widget.id)} 
          className="w-full flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Trash2 size={16} /> Widget'ı Sil
        </button>
      </div>
    </aside>
  );
}
