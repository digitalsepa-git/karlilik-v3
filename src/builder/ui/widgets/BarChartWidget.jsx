import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { METRIC_REGISTRY } from '../../data/metricRegistry';

export function BarChartWidget({ widget, data }) {
  if (!data || data.length === 0) return null;
  
  const metricId = widget.query.metrics[0];
  const metricDef = METRIC_REGISTRY[metricId];
  const dimension = widget.query.dimensions?.[0] || 'category';
  
  const colors = ['#514BEE', '#7D5FFF', '#A58BFF', '#C7B6FF', '#E4DDFF'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider">
          {widget.title || metricDef?.label || "Grafik"}
        </span>
      </div>
      
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEDF0" />
            <XAxis 
              dataKey={dimension} 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#B4B4C8'}} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 10, fill: '#B4B4C8'}} 
              tickFormatter={(v) => metricDef?.format === 'currency' ? `₺${v/1000}K` : v}
            />
            <Tooltip 
              cursor={{fill: '#F3F1FF'}}
              contentStyle={{ borderRadius: '8px', border: '1px solid #EDEDF0', fontSize: '12px' }}
              formatter={(val) => {
                if (metricDef?.format === 'currency') return [`₺${new Intl.NumberFormat('tr-TR').format(val)}`, metricDef.label];
                if (metricDef?.format === 'percent') return [`%${(val * 100).toFixed(1)}`, metricDef.label];
                return [new Intl.NumberFormat('tr-TR').format(val), metricDef?.label];
              }}
            />
            <Bar dataKey={metricId} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
