import React, { useState, useMemo } from 'react';
import { Download, AlertCircle, TrendingUp, TrendingDown, Wand2, Box, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const C = {
  primary: '#514BEE',
  primaryBgTint: '#F3F1FF',
  dark: '#0F1223',
  muted: '#7D7DA6',
  border: '#EDEDF0',
  bg: '#FAFAFB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B'
};

export const EmptyState = ({ icon: Icon = Box, title = 'Veri Yok', message, action }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center bg-[#FAFAFB] rounded-xl border border-dashed border-[#EDEDF0] min-h-[220px]">
    <div className="w-12 h-12 rounded-full bg-white border border-[#EDEDF0] flex items-center justify-center mb-4 text-[#7D7DA6] opacity-60">
      <Icon size={24} />
    </div>
    <h3 className="text-sm font-bold text-[#0F1223] mb-1.5">{title}</h3>
    <p className="text-xs text-[#7D7DA6] max-w-sm mb-4 leading-relaxed">{message}</p>
    {action && (
      <button onClick={action.onClick} className="text-xs font-semibold text-[#514BEE] hover:underline flex items-center gap-1">
        {action.label}
      </button>
    )}
  </div>
);

export const KpiCard = ({ title, value, delta, spark, tone = 'neutral', empty, previousValueStr, tooltip }) => {
  if (empty) {
    return (
      <div className="bg-white rounded-xl border border-[#EDEDF0] p-5 flex flex-col justify-between opacity-80">
        <h3 className="text-[13px] font-semibold text-[#7D7DA6] mb-2">{title}</h3>
        <p className="text-2xl font-bold text-[#0F1223]">—</p>
        <p className="text-[11px] text-[#7D7DA6] mt-2 italic flex items-center gap-1.5">
          <AlertCircle size={10} /> Yeterli veri yok
        </p>
      </div>
    );
  }

  let toneColor = 'text-[#7D7DA6] bg-[#FAFAFB]';
  if (tone === 'positive') toneColor = 'text-[#10B981] bg-[#ECFDF5]';
  if (tone === 'negative') toneColor = 'text-[#EF4444] bg-[#FEF2F2]';
  if (tone === 'warning') toneColor = 'text-[#F59E0B] bg-[#FFFBEB]';

  return (
    <div className="bg-white rounded-xl border border-[#EDEDF0] p-5 flex flex-col relative group hover:-translate-y-0.5 hover:shadow-sm hover:z-50 transition-all duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[13px] font-semibold text-[#0F1223] flex items-center gap-1.5 relative group/tooltip w-max">
          {title}
          {tooltip && (
            <>
              <Info size={14} className="text-[#A1A1AA] cursor-help" />
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block w-[280px] p-3 bg-[#18181B] text-white text-xs leading-relaxed font-normal rounded-lg shadow-2xl z-[999] whitespace-normal border border-[#3F3F46]">
                {tooltip}
                <div className="absolute bottom-full left-4 w-2 h-2 bg-[#18181B] border-t border-l border-[#3F3F46] transform rotate-45 -mb-[5px]"></div>
              </div>
            </>
          )}
        </h3>
        {delta && (
          <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-0.5", toneColor)}>
            {delta.startsWith('+') ? <TrendingUp size={10} /> : (delta.startsWith('-') ? <TrendingDown size={10} /> : null)}
            {delta}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between flex-1 mt-1">
        <div>
          <p className="text-2xl font-bold text-[#0F1223] tracking-tight">{value}</p>
          {previousValueStr && <p className="text-[11px] text-[#7D7DA6] mt-1">{previousValueStr}</p>}
        </div>
        {spark && (
          <div className="w-16 h-8 flex items-end gap-0.5 opacity-60 mix-blend-multiply pb-1">
            {spark.map((v, i) => (
               <div key={i} className="flex-1 rounded-sm bg-[#514BEE]" style={{ height: `${Math.max(10, v)}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChartCard = ({ title, subtitle, tooltip, chart, empty, action }) => {
  return (
    <div className="bg-white rounded-xl border border-[#EDEDF0] flex flex-col h-full">
      <div className="px-6 py-5 border-b border-[#EDEDF0] flex justify-between items-start bg-[#FAFAFB]/50 rounded-t-xl">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-bold text-[#0F1223]">{title}</h3>
            {tooltip && (
              <div className="group/tooltip flex items-center relative">
                  <Info className="h-3.5 w-3.5 text-[#7D7DA6] cursor-help hover:text-[#514BEE] transition-colors" />
                  <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none w-72 p-3 bg-[#0F1223] text-white text-[11.5px] rounded-xl shadow-xl z-[999] text-left font-normal leading-relaxed">
                      {tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[5px] border-transparent border-t-[#0F1223]"></div>
                  </div>
              </div>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-[#7D7DA6] mt-0.5">{subtitle}</p>}
        </div>
        {action ? action : (
          <button className="text-[#7D7DA6] hover:text-[#0F1223] transition-colors p-1" title="Dışa Aktar">
            <Download size={14} />
          </button>
        )}
      </div>
      <div className="p-6 flex-1 min-h-[260px]">
        {empty ? <EmptyState title="Grafik Oluşturulamadı" message="Yeterli işlem veya geçmiş verisi bulunamadı." /> : chart}
      </div>
    </div>
  );
};

export const TableCard = ({ title, columns, rows, empty, loading, action, pageSize, onSort, sortConfig }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedRows = useMemo(() => {
    if (!pageSize) return rows;
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  const totalPages = pageSize ? Math.ceil(rows.length / pageSize) : 1;

  return (
    <div className="bg-white rounded-xl border border-[#EDEDF0] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#EDEDF0] flex justify-between items-center bg-[#FAFAFB]">
        <h3 className="text-[14px] font-bold text-[#0F1223]">{title}</h3>
        {action}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-[#EDEDF0]">
              {columns.map((c, i) => (
                <th 
                   key={i} 
                   onClick={() => onSort && c.sortable !== false ? onSort(c.key) : undefined}
                   className={cn(
                     "px-6 py-3 text-[11px] font-semibold uppercase text-[#7D7DA6] tracking-wider transition-colors", 
                     c.align === 'right' ? 'text-right' : '',
                     onSort && c.sortable !== false ? 'cursor-pointer hover:bg-slate-50 hover:text-[#0F1223]' : ''
                   )}
                >
                  <div className={cn("flex items-center gap-1", c.align === 'right' ? 'justify-end' : '')}>
                    {c.label}
                    {sortConfig?.key === c.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-[#514BEE]" /> : <ChevronDown size={14} className="text-[#514BEE]" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F8]">
            {empty ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState title="Tablo Boş" message={"Bu döneme ait kayıt bulunamadı."} />
                </td>
              </tr>
            ) : paginatedRows.map((r, i) => (
              <tr key={i} className={cn("hover:bg-[#FAFAFB] transition-colors", r.rowClassName)}>
                {columns.map((c, j) => (
                  <td key={j} className={cn("px-6 py-4 text-sm", c.align === 'right' ? 'text-right' : '', c.className)}>
                    {r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageSize && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#EDEDF0] flex items-center justify-between text-sm text-[#7D7DA6]">
          <div>
            Toplam {rows.length} kayıttan {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, rows.length)} arası gösteriliyor.
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-[#EDEDF0] rounded disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Önceki
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-[#EDEDF0] rounded disabled:opacity-50 hover:bg-slate-50 transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const InsightCard = ({ type = 'info', title, body, action }) => {
  let Icon = Info;
  let bg = 'bg-[#FAFAFB]';
  let border = 'border-[#EDEDF0]';
  let iconBg = 'bg-white';
  let iconCol = 'text-[#7D7DA6]';

  if (type === 'alert') { Icon = AlertCircle; bg = 'bg-[#FEF2F2]'; border = 'border-[#FECACA]'; iconBg = 'bg-[#FEE2E2]'; iconCol = 'text-[#EF4444]'; }
  if (type === 'trend') { Icon = TrendingUp; bg = 'bg-[#F0F9FF]'; border = 'border-[#BAE6FD]'; iconBg = 'bg-[#E0F2FE]'; iconCol = 'text-[#0EA5E9]'; }
  if (type === 'suggestion') { Icon = Wand2; bg = 'bg-[#F3F1FF]'; border = 'border-[#E0DDFF]'; iconBg = 'bg-[#ECE9FF]'; iconCol = 'text-[#514BEE]'; }

  return (
    <div className={cn("p-4 rounded-xl border flex items-start gap-3", bg, border)}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm", iconBg, iconCol)}>
        <Icon size={14} />
      </div>
      <div>
        <h4 className="text-[13px] font-bold text-[#0F1223] mb-1 leading-tight">{title}</h4>
        <p className={cn("text-[11px] leading-relaxed", type === 'alert' ? 'text-[#991B1B]' : 'text-[#475569]')}>{body}</p>
        {action && (
          <button className={cn("mt-2 text-[11px] font-bold hover:underline", iconCol)} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export const CashRunwayDial = ({ months }) => {
  if (months === null || months === undefined) {
    return (
      <div className="bg-white rounded-xl border border-[#EDEDF0] p-6 flex flex-col items-center justify-center h-full min-h-[220px]">
        <h3 className="text-[13px] font-semibold text-[#7D7DA6] mb-4">Cash Runway</h3>
        <div className="relative w-32 h-16 bg-[#FAFAFB] rounded-t-full flex items-end justify-center border-t border-l border-r border-[#EDEDF0]">
            <p className="text-xl font-bold text-[#B4B4C8] mb-1">—</p>
        </div>
      </div>
    );
  }

  const color = months > 6 ? C.success : (months >= 3 ? C.warning : C.danger);
  
  return (
    <div className="bg-white rounded-xl border border-[#EDEDF0] p-6 flex flex-col items-center justify-center h-full min-h-[220px]">
      <h3 className="text-[13px] font-semibold text-[#0F1223] mb-4 text-center">Tahmini Cash Runway</h3>
      
      <div className="relative w-40 h-20 overflow-hidden flex items-end justify-center">
        {/* Background Arc */}
        <div className="absolute top-0 left-0 w-full h-40 border-[16px] border-[#F4F4F8] rounded-full box-border" />
        {/* Value Arc - Rotate based on max 12 months */}
        <div 
          className="absolute top-0 left-0 w-full h-40 border-[16px] border-b-transparent border-l-transparent rounded-full box-border transition-all duration-1000 ease-out"
          style={{ borderColor: `${color} ${color} transparent transparent`, transform: `rotate(${Math.min(180, (months / 12) * 180) - 45}deg)` }}
        />
        <div className="text-center z-10 pb-1">
          <p className="text-3xl font-bold text-[#0F1223] leading-none mb-1">{months === Infinity ? '∞' : months.toFixed(1)}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D7DA6]">AY</p>
        </div>
      </div>
      {months < 3 && <p className="text-[11px] text-[#EF4444] mt-3 font-medium bg-[#FEF2F2] px-2.5 py-1 rounded-full">Kritik Seviye</p>}
      {months >= 3 && months <= 6 && <p className="text-[11px] text-[#F59E0B] mt-3 font-medium bg-[#FFFBEB] px-2.5 py-1 rounded-full">Dikkat</p>}
      {months > 6 && <p className="text-[11px] text-[#10B981] mt-3 font-medium bg-[#ECFDF5] px-2.5 py-1 rounded-full">Güvenli</p>}
    </div>
  );
};
