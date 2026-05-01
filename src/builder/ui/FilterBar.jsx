import React from 'react';
import { useBuilderStore } from '../store/builderStore';

export function FilterBar() {
  const { filters, updateFilter, activeReportName, saveReport } = useBuilderStore();
  
  return (
    <div className="h-14 border-b border-[#EDEDF0] bg-[#FAFAFB] flex items-center px-6 gap-4">
      <input
        value={activeReportName}
        onChange={e => useBuilderStore.setState({ activeReportName: e.target.value })}
        className="font-bold text-lg text-[#0F1223] bg-transparent border-0 outline-none w-64 focus:ring-2 focus:ring-[#514BEE] rounded px-2 -ml-2"
        placeholder="Rapor Adı"
      />
      
      <div className="flex-1" />
      
      {/* Global filters */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-[#B4B4C8] uppercase tracking-wider mr-1">Tarih:</span>
        <select 
          value={filters.date} 
          onChange={e => updateFilter({ date: e.target.value })}
          className="text-xs font-semibold bg-white border border-[#EDEDF0] rounded-lg px-2.5 py-1 outline-none focus:border-[#514BEE]"
        >
          <option value="today">Bugün</option>
          <option value="yesterday">Dün</option>
          <option value="last7days">Son 7 Gün</option>
          <option value="last30days">Son 30 Gün</option>
          <option value="last90days">Son 90 Gün</option>
          <option value="thisMonth">Bu Ay</option>
          <option value="lastMonth">Geçen Ay</option>
          <option value="ytd">YTD</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-[#B4B4C8] uppercase tracking-wider mr-1">Kanal:</span>
        <select 
          value={filters.channel || ""} 
          onChange={e => updateFilter({ channel: e.target.value || undefined })}
          className="text-xs font-semibold bg-white border border-[#EDEDF0] rounded-lg px-2.5 py-1 outline-none focus:border-[#514BEE]"
        >
          <option value="">Tümü</option>
          <option value="Trendyol">Trendyol</option>
          <option value="Hepsiburada">Hepsiburada</option>
          <option value="Web Sitesi (ikas)">ikas</option>
        </select>
      </div>
      
      <div className="w-px h-6 bg-[#EDEDF0] mx-2" />
      
      <button onClick={() => saveReport(activeReportName)} className="px-4 py-1.5 rounded-lg bg-[#514BEE] text-white text-sm font-semibold hover:bg-[#3A35B8] transition-colors shadow-sm">
        Kaydet
      </button>
    </div>
  );
}
