import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { METRIC_REGISTRY } from '../../data/metricRegistry';

export function PieChartWidget({ widget, data }) {
  if (!data || data.length === 0) return null;
  
  const metricId = widget.query.metrics[0];
  const metricDef = METRIC_REGISTRY[metricId];
  const dimension = widget.query.dimensions?.[0] || 'category';
  
  const colors = ['#514BEE', '#7D5FFF', '#A58BFF', '#C7B6FF', '#E4DDFF', '#F5E58B'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider">
          {widget.title || metricDef?.label || "Grafik"}
        </span>
      </div>
      
      <div className="flex-1 min-h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={widget.type === 'PieChart' ? 0 : 40}
              outerRadius={80}
              paddingAngle={2}
              dataKey={metricId}
              nameKey={dimension}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #EDEDF0', fontSize: '12px' }}
              formatter={(val) => {
                if (metricDef?.format === 'currency') return [`₺${new Intl.NumberFormat('tr-TR').format(val)}`, metricDef.label];
                if (metricDef?.format === 'percent') return [`%${(val * 100).toFixed(1)}`, metricDef.label];
                return [new Intl.NumberFormat('tr-TR').format(val), metricDef?.label];
              }}
            />
            {widget.config?.showLegend && (
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
