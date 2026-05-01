import React from 'react';
import { METRIC_REGISTRY } from '../../data/metricRegistry';

export function KPICard({ widget, data, goalMode }) {
  if (!data || data.length === 0) return null;
  
  const metricId = widget.query.metrics[0];
  const metricDef = METRIC_REGISTRY[metricId];
  if (!metricDef) return <div>Invalid metric</div>;

  const value = data[0][metricId] || 0;
  
  let formattedValue = value;
  if (metricDef.format === 'currency') {
    formattedValue = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
  } else if (metricDef.format === 'percent') {
    formattedValue = `%${(value * 100).toFixed(1)}`;
  } else {
    formattedValue = new Intl.NumberFormat('tr-TR').format(value);
  }

  // Calculate goal percentage if goalMode is true
  let goalPercent = null;
  if (goalMode && widget.config?.goal) {
    goalPercent = (value / widget.config.goal) * 100;
  }

  return (
    <div className="flex flex-col h-full justify-between">
      <span className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider">{widget.title || metricDef.label}</span>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-bold text-[#0F1223]">{formattedValue}</span>
        
        {goalMode && goalPercent !== null && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${goalPercent >= 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            %{goalPercent.toFixed(1)} Hedef
          </span>
        )}
      </div>
      
      {goalMode && widget.config?.goal && (
        <div className="w-full bg-[#EDEDF0] h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className={`h-full ${goalPercent >= 100 ? 'bg-emerald-500' : 'bg-[#514BEE]'}`}
            style={{ width: `${Math.min(goalPercent, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
