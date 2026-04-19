import React from 'react';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from '../financial_tabs/SharedFinComponents';
import { cn } from '../../lib/utils';
import { Globe, ShoppingBag, Instagram, Package } from 'lucide-react';

export { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C };

export const CHANNEL_COLORS = {
  trendyol:      '#F97316',  // turuncu
  hepsiburada:   '#F59E0B',  // amber
  amazon:        '#EAB308',  // sarı
  n11:           '#8B5CF6',  // mor
  web:           '#6366F1',  // indigo (kendi sitesi)
  instagram:     '#EC4899',  // pembe
  pazaryeriDiger:'#7D7DA6',  // muted
};

export const MOCK_CHANNELS = [
  { id: '1', key: 'trendyol', name: 'Trendyol', active: true, index: 0 },
  { id: '2', key: 'web', name: 'Kendi Sitemiz (Ikas)', active: true, index: 1 },
  { id: '3', key: 'hepsiburada', name: 'Hepsiburada', active: true, index: 2 },
  { id: '4', key: 'amazon', name: 'Amazon TR', active: true, index: 3 },
  { id: '5', key: 'instagram', name: 'Instagram', active: false, index: 4 }
];

export function ChannelBadge({ channelId, size = 'sm', channelObj = null }) {
  const ch = channelObj || MOCK_CHANNELS.find(c => c.key === channelId || c.id === channelId);
  if (!ch) return <span className="text-gray-400 font-mono text-xs">—</span>;

  const color = CHANNEL_COLORS[ch.key] || '#7D7DA6';
  
  let Icon = ShoppingBag;
  if (ch.key === 'web') Icon = Globe;
  if (ch.key === 'instagram') Icon = Instagram;
  if (ch.key === 'amazon') Icon = Package;

  return (
    <span 
      className={cn("inline-flex items-center gap-1.5 font-bold rounded-lg border", size === 'sm' ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-[13px]")}
      style={{ backgroundColor: color + '15', color: color, borderColor: color + '30' }}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      {ch.name}
    </span>
  );
}
