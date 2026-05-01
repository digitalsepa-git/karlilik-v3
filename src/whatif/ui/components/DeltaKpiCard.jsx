import React from 'react';
import { formatValue } from '../../utils/format';
import { cn } from '../../../lib/utils';

export function DeltaKpiCard({ label, value, previousValue, format, size = "medium" }) {
  const sizeClass = {
    huge: "text-3xl py-4",
    medium: "text-2xl py-2",
    small: "text-xl py-1",
  }[size];
  
  const delta = previousValue !== undefined ? value - previousValue : null;
  const deltaColor = delta === null ? "" : delta > 0 ? "text-emerald-600 bg-emerald-50" : delta < 0 ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-50";
  const deltaIcon = delta === null ? "" : delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  
  return (
    <div className="rounded-xl border border-[#EDEDF0] bg-white p-5 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#7D7DA6] mb-2">{label}</div>
      
      <div className={cn("font-bold text-[#0F1223] tracking-tight", sizeClass)}>
        {formatValue(value, format)}
      </div>
      
      {delta !== null && (
        <div className="flex items-center gap-2 mt-2">
          <div className={cn("text-xs font-bold px-2 py-1 rounded-md inline-flex items-center gap-1", deltaColor)}>
            {deltaIcon} {formatValue(Math.abs(delta), format)}
          </div>
          {previousValue !== undefined && (
            <span className="text-xs font-medium text-[#B4B4C8]">
              (Önceki: {formatValue(previousValue, format)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
