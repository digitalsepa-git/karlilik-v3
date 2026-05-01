import React, { useState, useEffect } from 'react';
import { executeQuery } from '../data/dataCatalog';
import { useBuilderStore } from '../store/builderStore';
import { KPICard } from './widgets/KPICard';
import { LineChartWidget } from './widgets/LineChartWidget';
import { BarChartWidget } from './widgets/BarChartWidget';
import { PieChartWidget } from './widgets/PieChartWidget';
import { DataTableWidget } from './widgets/DataTableWidget';

function useWidgetData(widget, globalFilters) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!widget.query) {
      setIsLoading(false);
      return;
    }

    const finalQuery = { ...widget.query, filters: { ...widget.query.filters, ...globalFilters } };
    setIsLoading(true);
    
    // Skeleton 200ms minimum for UX feel
    const minLoadTime = 200;
    const start = Date.now();
    
    executeQuery(finalQuery)
      .then(result => {
        const elapsed = Date.now() - start;
        const wait = Math.max(0, minLoadTime - elapsed);
        setTimeout(() => {
          setData(result.data);
          setIsLoading(false);
        }, wait);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [JSON.stringify(widget.query), JSON.stringify(globalFilters)]);
  
  return { data, isLoading, error };
}

export function WidgetRenderer({ widget }) {
  const filters = useBuilderStore(s => s.filters);
  const { data, isLoading, error } = useWidgetData(widget, filters);
  
  // Static widgets that don't need data
  if (widget.type === 'Heading') {
    return <h2 className="text-xl font-bold text-[#0F1223] h-full flex items-center">{widget.title}</h2>;
  }
  if (widget.type === 'ImageBlock') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#FAFAFB] text-[#B4B4C8]">
        <span className="text-xs">Görsel Alanı</span>
      </div>
    );
  }

  if (isLoading) return <WidgetSkeleton type={widget.type} />;
  if (error) return <WidgetError error={error} />;
  if (!data || data.length === 0) return <InsufficientDataEmptyState />;
  
  switch (widget.type) {
    case "KPICard": return <KPICard widget={widget} data={data} />;
    case "LineChart": 
    case "Sparkline":
      return <LineChartWidget widget={widget} data={data} />;
    case "BarChart": return <BarChartWidget widget={widget} data={data} />;
    case "PieChart": return <PieChartWidget widget={widget} data={data} />;
    case "DataTable": 
    case "PivotTable":
      return <DataTableWidget widget={widget} data={data} />;
    case "GoalGauge":
      return <KPICard widget={widget} data={data} goalMode={true} />;
    default:
      return <div className="text-xs text-rose-500">Bilinmeyen widget tipi: {widget.type}</div>;
  }
}

function WidgetSkeleton({ type }) {
  return (
    <div className="w-full h-full flex flex-col gap-3 animate-pulse">
      <div className="h-4 bg-[#EDEDF0] rounded w-1/3"></div>
      <div className="flex-1 bg-[#FAFAFB] rounded-lg"></div>
    </div>
  );
}

function WidgetError({ error }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs text-rose-500 bg-rose-50 rounded-lg p-4 text-center">
      Hata: {error.message || "Veri yüklenemedi"}
    </div>
  );
}

function InsufficientDataEmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs text-[#7D7DA6] bg-[#FAFAFB] rounded-lg p-4 text-center">
      Bu filtreler için veri bulunamadı.
    </div>
  );
}
