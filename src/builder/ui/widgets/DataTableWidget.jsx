import React from 'react';
import { METRIC_REGISTRY } from '../../data/metricRegistry';

export function DataTableWidget({ widget, data }) {
  if (!data || data.length === 0) return null;
  
  const metrics = widget.query.metrics || [];
  const dimensions = widget.query.dimensions || [];
  
  const columns = [...dimensions, ...metrics];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <span className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider">
          {widget.title || "Tablo"}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              {columns.map(col => {
                const isMetric = metrics.includes(col);
                const label = isMetric ? (METRIC_REGISTRY[col]?.label || col) : col;
                return (
                  <th key={col} className="pb-2 pt-1 px-2 font-bold text-[#7D7DA6] border-b border-[#EDEDF0] whitespace-nowrap">
                    {label.toUpperCase()}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-[#EDEDF0] hover:bg-[#FAFAFB]">
                {columns.map(col => {
                  const isMetric = metrics.includes(col);
                  let value = row[col];
                  
                  if (isMetric) {
                    const format = METRIC_REGISTRY[col]?.format;
                    if (format === 'currency') {
                      value = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value || 0);
                    } else if (format === 'percent') {
                      value = `%${((value || 0) * 100).toFixed(1)}`;
                    } else {
                      value = new Intl.NumberFormat('tr-TR').format(value || 0);
                    }
                  }
                  
                  return (
                    <td key={col} className="py-2 px-2 text-[#0F1223] font-medium whitespace-nowrap">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
