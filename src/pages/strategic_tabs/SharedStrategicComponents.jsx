import React from 'react';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from '../financial_tabs/SharedFinComponents';
import { ChannelBadge, CHANNEL_COLORS } from '../ticari_tabs/SharedTicariComponents';
import { AlertStrip, AksiyonMerkezi, StatusDot, IntegrationMissingEmptyState } from '../operation_tabs/SharedOperationComponents';
import { cn } from '../../lib/utils';
import { AlertTriangle, AlertCircle, Info, Download, ChevronRight } from 'lucide-react';

export { EmptyState, InsufficientDataEmptyState, IntegrationMissingEmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, ChannelBadge, CHANNEL_COLORS, AlertStrip, AksiyonMerkezi, StatusDot, cn };

const InsufficientDataEmptyState = ({ featureName, required, available }) => (
    <div className="w-full flex-1 min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#EDEDF0]">
        <div className="w-16 h-16 rounded-lg bg-[#FAFAFB] border border-[#EDEDF0] shadow-sm flex items-center justify-center mb-4 text-[#7D7DA6]">
            <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-[#0F1223] mb-2">{featureName} İçin Yetersiz Veri</h3>
        <p className="text-[#7D7DA6] max-w-md mx-auto text-sm leading-relaxed mb-6">
            Analizin çalışabilmesi için yeterli veri derinliğine ulaşılamadı. Hesaplama için <strong>{required}</strong> gereklidir. (Mevcut: {available})
        </p>
    </div>
);

export const StrategicHeader = ({ title, subtitle, breadcrumbs, actions }) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider mb-2 flex items-center gap-1">
            {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                    <span>{b}</span>
                    {i < breadcrumbs.length - 1 && <ChevronRight size={12} className="text-[#B4B4C8]" />}
                </React.Fragment>
            ))}
        </div>
        <h1 className="text-2xl font-bold text-[#0F1223] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#7D7DA6] mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="h-9 px-3 rounded-lg border border-[#EDEDF0] bg-white text-[#0F1223] text-sm font-bold shadow-sm hover:bg-[#FAFAFB] transition-colors flex items-center gap-2">
            <Download size={16} /> Dışa Aktar
        </button>
      </div>
    </div>
  );
};

export const DataQualityStrip = ({ quality, issues = [] }) => {
  if (quality >= 70) return null;
  const colorClass = quality >= 50 ? 'amber' : 'red';
  const bgClass = quality >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const textClass = quality >= 50 ? 'text-amber-900' : 'text-red-900';
  const iconClass = quality >= 50 ? 'text-amber-500' : 'text-red-500';
  const listClass = quality >= 50 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className={cn(`rounded-lg border p-3 mb-6 flex items-start gap-3`, bgClass)}>
      <AlertTriangle size={20} className={iconClass} />
      <div>
        <div className={cn(`text-sm font-bold`, textClass)}>
          Dikkat: Analiz Veri Kalitesi (%{quality})
        </div>
        {issues.length > 0 && (
          <ul className={cn(`text-xs mt-1.5 space-y-1 font-medium`, listClass)}>
            {issues.map((issue, i) => (
              <li key={i} className="flex items-center gap-1.5">
                  <span className={cn("w-1 h-1 rounded-full", iconClass)} /> {issue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const AssumptionChip = ({ label, value, unit, editable, onChange }) => {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-[#F5F3FF] text-[#514BEE] px-2.5 py-1.5 rounded-md font-bold border border-[#E0DDFF]">
      <Info size={12} className="opacity-70" />
      {label}: {value}{unit || ''}
      {editable && (
        <button onClick={onChange} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
            ✎
        </button>
      )}
    </span>
  );
};

export const AssumptionBar = ({ children }) => (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white border border-[#EDEDF0] rounded-xl shadow-sm">
        <span className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider mr-2">Aktif Model Varsayımları</span>
        {children}
    </div>
);

export const ForecastDisclaimer = ({ model, confidence, dataPoints, period }) => {
  return (
    <div className="text-xs text-[#7D7DA6] font-medium flex gap-2 mt-3 bg-[#FAFAFB] p-2.5 rounded-lg border border-[#EDEDF0]">
      <AlertCircle size={14} className="text-[#B4B4C8] shrink-0 translate-y-px" />
      <span className="leading-relaxed">
        <strong>ÖNEMLİ:</strong> Bu bir projeksiyondur. <strong>Model:</strong> {model}. <strong>Güven Aralığı:</strong> %{confidence}. 
        <strong> Dayanak:</strong> {dataPoints} veri noktası (son {period} gün). Gelecekteki gerçek sonuçlar farklılık gösterebilir.
      </span>
    </div>
  );
};

export const TREND_COLORS = {
  up: '#10B981',
  down: '#EF4444',
  flat: '#7D7DA6',
  emerging: '#F59E0B',
  declining: '#9CA3AF',
};

export const COMPETITOR_COLORS = {
  self: '#514BEE',
  leader: '#EF4444',
  challenger: '#F59E0B',
  follower: '#6366F1',
  nicher: '#8B5CF6',
};

export const OPPORTUNITY_COLORS = {
  hot: '#EF4444',
  warm: '#F59E0B',
  mild: '#F5E58B',
  cool: '#10B981',
  cold: '#7D7DA6',
};

export const SCENARIO_COLORS = {
  current: '#7D7DA6',
  optimistic: '#10B981',
  realistic: '#514BEE',
  pessimistic: '#F97316',
  worst: '#EF4444',
};
