import React from 'react';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from '../financial_tabs/SharedFinComponents';
import { ChannelBadge, CHANNEL_COLORS } from '../ticari_tabs/SharedTicariComponents';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, ChannelBadge, CHANNEL_COLORS, cn };

export const SEGMENT_COLORS = {
  champion:        '#10B981',  // yeşil
  loyal:           '#514BEE',  // mor 
  potentialLoyal:  '#6366F1',  // indigo
  newCustomer:     '#06B6D4',  // cyan
  promising:       '#3B82F6',  // mavi
  needAttention:   '#F59E0B',  // amber
  aboutToSleep:    '#F97316',  // turuncu
  atRisk:          '#EF4444',  // kırmızı
  cantLoseThem:    '#EC4899',  // pembe
  hibernating:     '#7D7DA6',  // muted
  lost:            '#475569',  // koyu gri
};

export const SEGMENT_LABELS = {
  champion: 'Champion',
  loyal: 'Loyal',
  potentialLoyal: 'Potential Loyalist',
  newCustomer: 'New Customer',
  promising: 'Promising',
  needAttention: 'Need Attention',
  aboutToSleep: 'About To Sleep',
  atRisk: 'At Risk',
  cantLoseThem: 'Cant Lose Them',
  hibernating: 'Hibernating',
  lost: 'Lost',
};

export const InsufficientDataEmptyState = ({ featureName, required, available }) => {
  return (
    <div className="w-full flex-1 min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#EDEDF0]">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-bold text-[#0F1223] mb-2">Yeterli Veri Yok</h3>
      <p className="text-[#7D7DA6] max-w-md mx-auto text-sm leading-relaxed mb-6">
        <strong className="text-[#0F1223]">{featureName}</strong> analizi için en az <strong>{required}</strong> veri gerekli. Mevcut veriniz: {available}. Veri girişi ilerledikçe bu rapor otomatik aktifleşecektir.
      </p>
    </div>
  );
};
