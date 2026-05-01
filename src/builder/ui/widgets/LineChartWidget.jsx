import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { METRIC_REGISTRY } from '../../data/metricRegistry';

export function LineChartWidget({ widget, data }) {
  if (!data || data.length === 0) return null;
  
  const metricId = widget.query.metrics[0];
  const metricDef = METRIC_REGISTRY[metricId];
  const dimension = widget.query.dimensions?.[0] || 'date';
  
  const color = widget.config?.color || '#514BEE';
  const isSparkline = widget.type === 'Sparkline';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider">
          {widget.title || metricDef?.label || "Grafik"}
        </span>
      </div>
      
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            {!isSparkline && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEDF0" />}
            
            {!isSparkline && (
              <XAxis 
                dataKey={dimension} 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#B4B4C8'}} 
                minTickGap={20}
              />
            )}
            
            {!isSparkline && (
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#B4B4C8'}} 
                tickFormatter={(v) => metricDef?.format === 'currency' ? `₺${v/1000}K` : v}
              />
            )}
            
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #EDEDF0', fontSize: '12px' }}
              formatter={(val) => {
                if (metricDef?.format === 'currency') return [`₺${new Intl.NumberFormat('tr-TR').format(val)}`, metricDef.label];
                if (metricDef?.format === 'percent') return [`%${(val * 100).toFixed(1)}`, metricDef.label];
                return [new Intl.NumberFormat('tr-TR').format(val), metricDef?.label];
              }}
              labelFormatter={(label) => `${dimension}: ${label}`}
            />
            
            <Line 
              type="monotone" 
              dataKey={metricId} 
              stroke={color} 
              strokeWidth={isSparkline ? 2 : 2} 
              dot={!isSparkline ? { r: 3, fill: color, strokeWidth: 0 } : false} 
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
