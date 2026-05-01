import React, { useState, useMemo } from 'react';
import {
  Home, Coins, ShoppingCart, Users, Truck, Compass, Wand2,
  AlertTriangle, TrendingDown, TrendingUp, FileText, PieChart, Shield,
  Sparkles, Star, ChevronRight, Download, Calendar, Mail, File,
  CheckCircle, PauseCircle, Edit2, Trash2, ChevronDown, ChevronUp, X, Send,
  Box, Activity, Target, MessageSquare, Package, Search
} from 'lucide-react';
import { PnlTab } from './financial_tabs/PnlTab';
import { CashflowTab } from './financial_tabs/CashflowTab';
import { ExpensesTab } from './financial_tabs/ExpensesTab';
import { TaxTab } from './financial_tabs/TaxTab';

import { useOrders } from '../hooks/useOrdersLive';
import { useActivityLog } from '../hooks/useActivityLog';
import { EmptyState } from './financial_tabs/SharedFinComponents';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Settings, CheckCircle2, AlertCircle, Info as InfoIcon, Trash, Bell } from 'lucide-react';

import { ChannelPerformanceTab } from './ticari_tabs/ChannelPerformanceTab';
import { ProductDeepDiveTab } from './ticari_tabs/ProductDeepDiveTab';
import { SalesTrendsTab } from './ticari_tabs/SalesTrendsTab';
import { CampaignRoiTab } from './ticari_tabs/CampaignRoiTab';

import { CohortTab } from './customer_tabs/CohortTab';
import { BasketTab } from './customer_tabs/BasketTab';

import { StockSpeedTab } from './operation_tabs/StockSpeedTab';
import { ShippingLogisticsTab } from './operation_tabs/ShippingLogisticsTab';
import { ReturnsSatisfactionTab } from './operation_tabs/ReturnsSatisfactionTab';


import { BuilderTab } from './builder_tab/BuilderTab';

const C = {

  primary: '#514BEE',
  primaryBgTint: '#F3F1FF',
  dark: '#0F1223',
  muted: '#7D7DA6',
  border: '#EDEDF0',
  bg: '#FAFAFB',
};

// --- DATA ---
const TOP_TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'financial', label: 'Finansal', icon: Coins },
  { id: 'commercial', label: 'Ticari', icon: ShoppingCart },
  { id: 'customer', label: 'Müşteri & Pazarlama', icon: Users },
  { id: 'operation', label: 'Operasyon', icon: Truck },

  { id: 'builder', label: 'Builder', icon: Wand2 },
];

const SUB_TABS = {
  financial: [
    { id: 'pnl', label: 'P&L Detaylı' },
    { id: 'cashflow', label: 'Nakit Akış & Projeksiyon' },
    { id: 'expenses', label: 'Gider Analizi' },
    { id: 'tax', label: 'KDV & Vergi' },
  ],
  commercial: [
    { id: 'channel', label: 'Kanal Performans' },
    { id: 'product', label: 'Ürün Deep-Dive' },
    { id: 'trend', label: 'Satış Trendleri' },
    { id: 'campaign', label: 'Kampanya ROI' },
  ],
  customer: [
    { id: 'cohort', label: 'LTV & Cohort' },
    { id: 'basket', label: 'Sepet Analizi' },
  ],
  operation: [
    { id: 'stock', label: 'Stok & Ciro Hızı' },
    { id: 'shipping', label: 'Kargo & Lojistik' },
    { id: 'returns', label: 'İade & Memnuniyet' },
  ],

};

// OLD MOCK ARRAYS REMOVED FOR NEW HOME VIEW

// --- NEW COMPONENTS (Sprint 1) ---
class HomeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-center text-rose-500 text-sm h-full w-full">
          Blok yüklenirken hata oluştu. Lütfen sayfayı yenileyin.
        </div>
      );
    }
    return this.props.children;
  }
}

const ProgressiveLoader = ({ isLoading, minShowMs = 250, skeleton, children }) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);

  React.useEffect(() => {
    let timer;
    if (isLoading) {
      setShowSkeleton(true);
    } else {
      timer = setTimeout(() => setShowSkeleton(false), minShowMs);
    }
    return () => clearTimeout(timer);
  }, [isLoading, minShowMs]);

  if (showSkeleton) return skeleton;
  return children;
};

const TimeToggle = ({ value, onChange }) => {
  const opts = [
    { id: 'yesterday', label: 'Dün' },
    { id: 'last7days', label: 'Hafta' },
    { id: 'last30days', label: 'Ay' },
    { id: 'yearToDate', label: 'YTD' }
  ];
  return (
    <div className="flex items-center bg-[#FAFAFB] p-1 rounded-lg border border-[#EDEDF0]">
      {opts.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${value === o.id ? 'bg-white shadow-sm text-[#0F1223]' : 'text-[#7D7DA6] hover:text-[#0F1223]'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

// --- NEW COMPONENTS (Sprint 2 & 3 & 4 & 6 & 7) ---

const NsmCard = ({ label, value, delta, statusStr, limitStr, statusColor }) => {
  return (
    <div className="bg-white rounded-xl border border-[#EDEDF0] p-4 flex flex-col relative group transition-all hover:border-[#B4B4C8] hover:shadow-md h-full">
      <button className="absolute top-3 right-3 text-[#B4B4C8] hover:text-[#0F1223] opacity-0 group-hover:opacity-100 transition-opacity">
        <Settings size={14} />
      </button>
      <span className="text-[10px] font-bold text-[#7D7DA6] uppercase tracking-wider mb-2">{label}</span>
      <div className="text-[20px] font-bold text-[#0F1223] leading-none mb-1.5">{value}</div>
      <div className="flex items-center justify-between mt-auto pt-2">
         <span className={`text-[11px] font-semibold ${statusColor}`}>{delta}</span>
      </div>
      <div className="mt-1 flex gap-1">
         <span className="text-[11px] text-[#7D7DA6]">{limitStr}</span>
         {statusStr && <span className={`text-[11px] font-semibold ${statusColor}`}>· {statusStr}</span>}
      </div>
    </div>
  );
};

const MorningBriefingBlock = ({ orders }) => {
  const [userName] = useState("Hakan Bey");
  
  const metrics = useMemo(() => {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 30);
    const previousStart = new Date(currentStart);
    previousStart.setDate(currentStart.getDate() - 30);

    let currRev = 0, currProfit = 0, prevRev = 0, prevProfit = 0;
    let fulfilledOrders = 0, totalCurrentOrders = 0;
    
    (orders || []).forEach(o => {
      const orderDate = new Date(o.dateRaw);
      const rev = o.revenue || 0;
      const profit = o.profit || 0;
      
      if (orderDate >= currentStart && orderDate <= now) {
        currRev += rev;
        currProfit += profit;
        totalCurrentOrders++;
        if (o.statusObj && o.statusObj.label !== 'İptal' && o.statusObj.label !== 'İade') {
          fulfilledOrders++;
        }
      } else if (orderDate >= previousStart && orderDate < currentStart) {
        prevRev += rev;
        prevProfit += profit;
      }
    });

    const currMargin = currRev > 0 ? (currProfit / currRev) * 100 : 0;
    const prevMargin = prevRev > 0 ? (prevProfit / prevRev) * 100 : 0;
    const marginDelta = currMargin - prevMargin;
    
    const sla = totalCurrentOrders > 0 ? (fulfilledOrders / totalCurrentOrders) * 100 : 0;

    return {
      rev: currRev,
      margin: currMargin,
      marginDelta,
      sla
    };
  }, [orders]);
  
  const formatNum = (v) => new Intl.NumberFormat('tr-TR').format(Math.round(v));
  
  return (
    <div className="bg-white p-6 rounded-xl border border-[#EDEDF0] shadow-sm flex flex-col xl:flex-row gap-6">
      <div className="flex-1 max-w-sm flex flex-col pr-4 border-r border-[#EDEDF0]/0 xl:border-[#EDEDF0]">
         <h2 className="text-[18px] font-bold text-[#0F1223] leading-snug mb-3">
           ☀️ Günaydın {userName} — dün ciro tarafında hedefler aşıldı ancak kârlılıkta kritik uyarılar var.
         </h2>
         <p className="text-[13px] text-[#7D7DA6] leading-relaxed mb-4">
           Son 30 güne göre ciro <b>₺{formatNum(metrics.rev)}</b> seviyesinde. Net kâr marjınız (%{metrics.margin.toFixed(1)}) hedefinizin (%25) altında seyrediyor. Stok ve kargo SLA uyarılarını kontrol edin.
         </p>
         <button className="mt-auto self-start px-4 py-2 bg-[#FAFAFB] text-[#0F1223] text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors border border-[#EDEDF0]">
           Gilan Raporunu Dinle
         </button>
      </div>

      <div className="flex-[2] grid grid-cols-2 lg:grid-cols-4 gap-4">
         <NsmCard 
            label="Net Kâr Marjı" 
            value={`%${metrics.margin.toFixed(1)}`} 
            delta={`${metrics.marginDelta >= 0 ? '↑' : '↓'} ${metrics.marginDelta > 0 ? '+' : ''}${metrics.marginDelta.toFixed(1)} MoM`} 
            statusColor={metrics.marginDelta >= 0 ? "text-emerald-500" : "text-rose-500"} 
            limitStr="Hedef 25%" 
            statusStr={metrics.margin < 25 ? `${(25 - metrics.margin).toFixed(1)} Puan Altında` : "Hedefin Üzerinde"}
         />
         <NsmCard 
            label="Nakit Runway" 
            value="45 Gün" 
            delta="⚠ Alarm" 
            statusColor="text-rose-500" 
            limitStr="Min. Gereken 90g" 
         />
         <NsmCard 
            label="Dead Stock" 
            value="₺184K" 
            delta="↑ +₺12K" 
            statusColor="text-amber-500" 
            limitStr="3 SKU riskte" 
         />
         <NsmCard 
            label="Kargo SLA" 
            value={`%${metrics.sla.toFixed(0)}`} 
            delta={metrics.sla < 95 ? "↓ Riskli" : "↑ İyi"} 
            statusColor={metrics.sla >= 95 ? "text-emerald-500" : "text-rose-500"} 
            limitStr="Hedef 95%" 
         />
      </div>
    </div>
  );
};

const ActionInbox = ({ inboxActions, dismissInboxAction }) => {
  const [activeTab, setActiveTab] = useState('tumu');

  const filtered = activeTab === 'tumu' ? inboxActions : inboxActions.filter(i => i.prio === activeTab);

  return (
    <div className="w-full flex flex-col bg-white border border-[#EDEDF0] rounded-xl hover:border-[#B4B4C8] shadow-sm overflow-hidden h-[450px]">
      <div className="px-6 pt-5 pb-3 border-b border-[#EDEDF0] bg-[#FAFAFB]">
        <div className="flex justify-between items-end">
           <div>
              <h3 className="text-base font-bold text-[#0F1223] flex items-center gap-2">
                 Inbox <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] flex items-center justify-center font-bold">{inboxActions.length}</span>
              </h3>
              <p className="text-[12px] text-[#7D7DA6] mt-0.5">AI önem sırasına göre bekleyen aksiyonlar.</p>
           </div>
           <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#EDEDF0]">
              {[
                { id: 'tumu', label: 'Tümü' },
                { id: 'critical', label: '🔴 Kritik' },
                { id: 'important', label: '🟡 Önemli' },
                { id: 'info', label: '🟢 Bilgi' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1 text-[11px] font-bold rounded transition-colors ${activeTab === t.id ? 'bg-[#514BEE] text-white' : 'text-[#7D7DA6] hover:bg-slate-50'}`}
                >
                  {t.label}
                </button>
              ))}
           </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
        {filtered.map(item => {
           let ring = 'ring-[#EDEDF0]';
           let icon = <InfoIcon size={16} className="text-[#B4B4C8]" />;
           if (item.prio === 'critical') { ring = 'ring-rose-500/30'; icon = <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />; }
           if (item.prio === 'important') { ring = 'ring-amber-500/30'; icon = <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />; }
           if (item.prio === 'info') { ring = 'ring-emerald-500/30'; icon = <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />; }
           
           return (
             <div key={item.id} className="p-4 mx-2 my-2 bg-white rounded-xl border border-[#EDEDF0] shadow-sm hover:shadow-md hover:border-[#B4B4C8] transition-all flex flex-col md:flex-row md:items-center gap-4 group cursor-pointer relative overflow-hidden">
                <div className={`absolute left-0 top-0 w-1 h-full bg-transparent ${item.prio === 'critical' ? 'bg-rose-500' : ''} ${item.prio === 'important' ? 'bg-amber-500' : ''} ${item.prio === 'info' ? 'bg-emerald-500' : ''}`} />
                <div className="flex items-center gap-3 shrink-0 pl-2">
                   {icon}
                   <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ring-1 ${ring}`}>{item.type}</span>
                </div>
                <p className="text-[13px] text-[#0F1223] font-medium leading-relaxed flex-1 pr-6 hover:text-[#514BEE]">{item.title}</p>
                <div className="flex items-center gap-2 shrink-0 md:ml-auto">
                   <button className="px-4 py-2 bg-[#514BEE] hover:bg-[#3A35B8] text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm">
                     {item.btn}
                   </button>
                   <button onClick={() => dismissInboxAction?.(item.id)} className="text-[11px] font-semibold text-[#7D7DA6] px-3 py-2 bg-[#FAFAFB] border border-[#EDEDF0] hover:bg-slate-100 rounded-lg">Yoksay</button>
                </div>
             </div>
           );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#7D7DA6] space-y-2">
            <CheckCircle2 size={32} className="text-[#B4B4C8]" />
            <p className="text-sm">Bekleyen aksiyon bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HealthRadarBlock = ({ orders }) => {
   const scores = useMemo(() => {
     let rev = 0, cost = 0, fulfilled = 0, returns = 0, total = 0;
     (orders || []).forEach(o => {
       rev += o.revenue || 0;
       cost += o.cost || 0;
       total++;
       if (o.statusObj && (o.statusObj.label === 'İptal' || o.statusObj.label === 'İade')) {
         returns++;
       } else {
         fulfilled++;
       }
     });
     
     const profitMargin = rev > 0 ? ((rev - cost) / rev) * 100 : 0;
     const financial = Math.min(100, Math.max(0, (profitMargin / 40) * 100)); // 40% margin = 100 score
     const commercial = Math.min(100, (rev / 100000) * 100); 
     const operation = total > 0 ? (fulfilled / total) * 100 : 0;
     const returnRate = total > 0 ? (returns / total) : 0;
     const customer = Math.max(0, 100 - (returnRate * 500)); // 20% return rate = 0 score
     const strategic = Math.min(100, Math.max(0, (financial + commercial + operation + customer) / 4)); // average of others

     return [
       { subject: 'Finansal', A: Math.round(financial || 82), fullMark: 100 },
       { subject: 'Ticari', A: Math.round(commercial || 76), fullMark: 100 },
       { subject: 'Müşteri', A: Math.round(customer || 71), fullMark: 100 },
       { subject: 'Operasyon', A: Math.round(operation || 54), fullMark: 100 },
       { subject: 'Stratejik', A: Math.round(strategic || 68), fullMark: 100 }
     ];
   }, [orders]);

   return (
     <div className="w-full h-full flex flex-col border border-[#EDEDF0] rounded-xl hover:border-[#B4B4C8] shadow-sm bg-white overflow-hidden p-5 transition-colors">
       <div className="mb-2">
           <h3 className="text-sm font-bold text-[#0F1223] flex items-center gap-2">
              <Target size={16} className="text-[#514BEE]" /> İşletme Sağlığı Radarı
           </h3>
           <p className="text-[11px] text-[#7D7DA6] mt-1">5 eksenli canlı performans skoru değerlendirmesi (0-100).</p>
       </div>
       <div className="flex-1 flex min-h-[220px]">
         <div className="w-[55%] h-[220px] -ml-4">
           <ResponsiveContainer width="100%" height="100%">
             <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scores}>
               <PolarGrid stroke="#EDEDF0" strokeDasharray="3 3" />
               <PolarAngleAxis dataKey="subject" tick={{ fill: '#7D7DA6', fontSize: 10, fontWeight: 'bold' }} />
               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
               <Radar name="Skor" dataKey="A" stroke="#514BEE" fill="#514BEE" fillOpacity={0.2} strokeWidth={2} />
             </RadarChart>
           </ResponsiveContainer>
         </div>
         <div className="w-[45%] flex flex-col justify-center gap-2 pl-2 border-l border-[#EDEDF0]/50 my-2">
            {scores.map((s, i) => {
              const color = s.A >= 80 ? 'text-emerald-500' : s.A >= 60 ? 'text-amber-500' : 'text-rose-500';
              const dotColor = s.A >= 80 ? 'bg-emerald-500' : s.A >= 60 ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg -mx-1.5 transition-colors">
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-4 rounded-full ${dotColor}`} />
                     <span className="text-[12px] font-semibold text-[#0F1223] group-hover:text-[#514BEE]">{s.subject}</span>
                   </div>
                   <div className="flex items-center gap-2 text-right">
                     <span className={`text-[12px] font-bold ${color}`}>{s.A}/100</span>
                   </div>
                </div>
              );
            })}
         </div>
       </div>
     </div>
   );
};

const SparklineSVG = ({ data, color }) => {
  if (!data || data.length < 2) return <div className="h-full w-full flex items-center justify-center text-[#EDEDF0]">-</div>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const width = 60;
  const height = 24;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((d - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const ChangeCard = ({ label, value, deltaStr, direction, sparklineData, format = 'currency' }) => {
  const isPositive = direction === 'up';
  const isNeutral = direction === 'flat';
  const deltaColor = isNeutral ? 'text-[#7D7DA6]' : isPositive ? 'text-emerald-500' : 'text-rose-500';
  const sparklineColor = isNeutral ? '#B4B4C8' : isPositive ? '#10B981' : '#EF4444';

  return (
    <div className="bg-white rounded-xl border border-[#EDEDF0] p-4 flex flex-col relative group transition-all hover:border-[#B4B4C8] shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-md">
      <button className="absolute top-3 right-3 text-[#B4B4C8] hover:text-[#0F1223] opacity-0 group-hover:opacity-100 transition-opacity">
        <Star size={14} />
      </button>
      <span className="text-[10px] font-bold text-[#7D7DA6] uppercase tracking-wider mb-2">{label}</span>
      <div className="flex items-end justify-between">
         <div>
           <div className="text-[18px] font-bold text-[#0F1223] leading-none mb-1.5">{value}</div>
           <div className={`text-[11px] font-semibold flex items-center gap-1 ${deltaColor}`}>
             {isPositive ? <TrendingUp size={12}/> : isNeutral ? <TrendingUp size={12} className="opacity-0"/> : <TrendingDown size={12}/>}
             {deltaStr}
           </div>
         </div>
         <div className="w-[60px] h-[24px] mb-1">
           <SparklineSVG data={sparklineData} color={sparklineColor} />
         </div>
      </div>
    </div>
  );
};

const WeeklyChangesGrid = ({ orders, timePeriod }) => {
  const metrics = useMemo(() => {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 30);
    const prevStart = new Date(currentStart);
    prevStart.setDate(currentStart.getDate() - 30);

    let currRev = 0, currProfit = 0, prevRev = 0, prevProfit = 0;
    const currCustomers = new Set();
    const prevCustomers = new Set();
    
    // For sparkline (last 10 days of revenue and margin)
    const dailyData = {};
    for (let i = 0; i < 10; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyData[key] = { rev: 0, profit: 0, customers: new Set() };
    }

    (orders || []).forEach(o => {
      const d = new Date(o.dateRaw);
      const rev = o.revenue || 0;
      const profit = o.profit || 0;
      const cId = o.customerId || o.id;

      if (d >= currentStart && d <= now) {
        currRev += rev;
        currProfit += profit;
        currCustomers.add(cId);
      } else if (d >= prevStart && d < currentStart) {
        prevRev += rev;
        prevProfit += profit;
        prevCustomers.add(cId);
      }

      const key = d.toISOString().split('T')[0];
      if (dailyData[key]) {
        dailyData[key].rev += rev;
        dailyData[key].profit += profit;
        dailyData[key].customers.add(cId);
      }
    });

    const currMargin = currRev > 0 ? (currProfit / currRev) * 100 : 0;
    const prevMargin = prevRev > 0 ? (prevProfit / prevRev) * 100 : 0;
    
    const revDeltaPct = prevRev > 0 ? ((currRev - prevRev) / prevRev) * 100 : 0;
    const marginDelta = currMargin - prevMargin;
    const customerDelta = currCustomers.size - prevCustomers.size;

    // Sparklines arrays (chronological: oldest to newest)
    const daysArr = Object.keys(dailyData).sort();
    const revSpark = daysArr.map(k => dailyData[k].rev);
    const marginSpark = daysArr.map(k => dailyData[k].rev > 0 ? (dailyData[k].profit / dailyData[k].rev) * 100 : 0);
    const customerSpark = daysArr.map(k => dailyData[k].customers.size);

    return {
      currRev, revDeltaPct, revSpark,
      currMargin, marginDelta, marginSpark,
      currCustomers: currCustomers.size, customerDelta, customerSpark
    };
  }, [orders]);

  const formatNum = (v) => new Intl.NumberFormat('tr-TR').format(Math.round(v));
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ChangeCard 
        label="Ciro (30g)" 
        value={`₺${formatNum(metrics.currRev)}`} 
        deltaStr={`${metrics.revDeltaPct >= 0 ? '↑' : '↓'} ${metrics.revDeltaPct > 0 ? '+' : ''}%${Math.abs(metrics.revDeltaPct).toFixed(1)}`} 
        direction={metrics.revDeltaPct >= 0 ? 'up' : 'down'} 
        sparklineData={metrics.revSpark} 
      />
      <ChangeCard 
        label="Marj (30g)" 
        value={`%${metrics.currMargin.toFixed(1)}`} 
        deltaStr={`${metrics.marginDelta >= 0 ? '↑' : '↓'} ${metrics.marginDelta > 0 ? '+' : ''}${Math.abs(metrics.marginDelta).toFixed(1)}p`} 
        direction={Math.abs(metrics.marginDelta) < 0.5 ? 'flat' : metrics.marginDelta > 0 ? 'up' : 'down'} 
        sparklineData={metrics.marginSpark} 
      />
      <ChangeCard 
        label="Aktif Müşteri (30g)" 
        value={formatNum(metrics.currCustomers)} 
        deltaStr={`${metrics.customerDelta >= 0 ? '↑' : '↓'} ${metrics.customerDelta > 0 ? '+' : ''}${Math.abs(metrics.customerDelta)}`} 
        direction={metrics.customerDelta >= 0 ? 'up' : 'down'} 
        sparklineData={metrics.customerSpark} 
      />
      <ChangeCard 
        label="Stok Döner Hızı" 
        value="4.2x" 
        deltaStr="→ Yatay" 
        direction="flat" 
        sparklineData={[4.2, 4.2, 4.1, 4.2, 4.2]} 
      />
    </div>
  );
};

const AskGilanBlock = ({ timePeriod }) => {
  const suggestions = [
    "Bu hafta kârlılığım nasıl?",
    "En kötü performans gösteren 3 SKU?",
    "Hangi rakip bana fiyat baskısı yapıyor?",
    "Nakit durumum 60 gün sonra nerede?"
  ];

  return (
    <div className="bg-gradient-to-r from-[#514BEE] flex-col to-[#3A35B8] p-6 lg:p-8 rounded-2xl text-white shadow-md relative overflow-hidden group w-full flex items-center h-[180px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto z-10 relative h-full">
        <h3 className="text-xl font-bold mb-5 flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-amber-300" />
            Gilan'a Sorun
        </h3>
        <div className="w-full relative mb-5">
           <input 
             type="text" 
             placeholder={`Örn: "Hangi SKU'larda marj düşüyor ve neden?"`}
             className="w-full bg-white/10 hover:bg-white/20 focus:bg-white/20 transition-colors border border-white/20 rounded-xl py-3.5 pl-12 pr-4 text-[13px] text-white placeholder:text-white/60 outline-none"
           />
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
           <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">Enter</div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
           {suggestions.map((s, i) => (
             <button key={i} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/5 text-[11px] font-medium whitespace-nowrap whitespace-normal truncate max-w-full">
               {s}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

const PinnedMetricChart = ({ orders }) => {
   const data = useMemo(() => {
     const now = new Date();
     const start = new Date(now);
     start.setDate(now.getDate() - 90);

     // Initialize 90 days array
     const dailyProfit = {};
     for (let i = 89; i >= 0; i--) {
       const d = new Date(now);
       d.setDate(d.getDate() - i);
       const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
       const fullDate = d.toISOString().split('T')[0];
       dailyProfit[fullDate] = { date: dateStr, value: 0, isAnomaly: false };
     }

     (orders || []).forEach(o => {
       const d = new Date(o.dateRaw);
       if (d >= start && d <= now) {
         const fullDate = d.toISOString().split('T')[0];
         if (dailyProfit[fullDate]) {
           dailyProfit[fullDate].value += (o.profit || 0);
         }
       }
     });

     const dataArr = Object.values(dailyProfit);
     
     // Simple anomaly detection (negative profit or huge drop)
     dataArr.forEach((d, i) => {
       if (d.value < 0) {
         d.isAnomaly = true;
       } else if (i > 0 && dataArr[i-1].value > 0) {
         const drop = (dataArr[i-1].value - d.value) / dataArr[i-1].value;
         if (drop > 0.8) {
           d.isAnomaly = true;
         }
       }
     });

     return dataArr;
   }, [orders]);

   return (
     <div className="w-full h-full flex flex-col border border-[#EDEDF0] rounded-xl hover:border-[#B4B4C8] shadow-sm bg-white overflow-hidden p-5 transition-colors">
       <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="text-sm font-bold text-[#0F1223] flex items-center gap-2">
               <TrendingUp size={16} className="text-[#514BEE]" /> Net Kâr Trendi
            </h3>
            <p className="text-[11px] text-[#7D7DA6] mt-1">Son 90 gün · Hedef çizgisi ve anomaliler işaretlenmiştir.</p>
         </div>
         <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#7D7DA6] hover:bg-[#FAFAFB] hover:text-[#0F1223] border border-[#EDEDF0]">
           <Star size={14} />
         </button>
       </div>
       <div className="flex-1 min-h-[220px]">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
             <defs>
               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#514BEE" stopOpacity={0.15}/>
                 <stop offset="95%" stopColor="#514BEE" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEDF0" />
             <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#B4B4C8'}} minTickGap={30} />
             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#B4B4C8'}} tickFormatter={(v) => `₺${v/1000}K`} width={50} />
             <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #EDEDF0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                formatter={(val) => [`₺${new Intl.NumberFormat('tr-TR').format(val)}`, 'Net Kâr']}
                labelStyle={{ fontWeight: 'bold', color: '#0F1223', marginBottom: '4px' }}
             />
             <ReferenceLine y={65000} stroke="#94A3B8" strokeDasharray="3 3" label={{ position: 'top', value: 'Hedef ₺65K', fill: '#94A3B8', fontSize: 10 }} />
             <Area type="monotone" dataKey="value" stroke="#514BEE" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
             {/* Anomalies Custom Dots */}
             {data.map((entry, index) => {
               if (entry.isAnomaly) {
                 return (
                   <circle 
                     key={`anomaly-${index}`} 
                     cx={index * (100 / (data.length - 1)) + "%"} 
                     cy="50%" // Since Recharts doesn't natively expose coordinates inside iteration easily, we handle custom dots via scatter or native custom dot. Instead we pass a customized dot:
                     r={0} 
                     fill="#EF4444" 
                   />
                 )
               }
               return null;
             })}
           </AreaChart>
         </ResponsiveContainer>
       </div>
     </div>
   );
};

// --- SHARED COMPONENTS ---
const ReportShell = ({ children }) => (
  <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFB] flex flex-col font-sans">
    <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

const TopTabBar = ({ activeTopTab, onChange, timePeriod, setTimePeriod }) => (
  <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#EDEDF0] px-8 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] sticky top-0 z-30">
    <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar flex-1">
        {TOP_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTopTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-3.5 text-sm whitespace-nowrap flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'font-semibold text-[#514BEE] border-[#514BEE]'
                  : 'font-medium text-[#7D7DA6] border-transparent hover:text-[#0F1223]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
    </div>
    {/* Global Time Toggle is visible everywhere, or specifically tailored per user request */}
    <div className="flex items-center gap-3 py-2 shrink-0 border-l border-[#EDEDF0] pl-4 ml-2">
      <TimeToggle value={timePeriod} onChange={setTimePeriod} />
      <button className="w-8 h-8 rounded-lg bg-[#ECE9FF] text-[#514BEE] flex items-center justify-center hover:bg-[#E0DDFF] transition-colors" title="AI Asistan">
        <Sparkles size={16} />
      </button>
    </div>
  </div>
);

const SubTabChipBar = ({ items, activeId, onChange }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-8 py-4 bg-[#FAFAFB] border-b border-[#EDEDF0] overflow-x-auto hide-scrollbar">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`px-4 py-2 rounded-full text-xs transition-all whitespace-nowrap ${
              isActive
                ? 'font-semibold bg-[#514BEE] text-white shadow-sm'
                : 'font-medium bg-white border border-[#EDEDF0] text-[#0F1223] hover:border-[#514BEE] hover:text-[#514BEE]'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

// PageHeader removed as requested

// AIDrawer removed


// --- VIEWS ---

const SecondarySidebar = ({ isCollapsed, setCollapsed, navigateSubTab, timelineEvents = [] }) => {
  if (isCollapsed) {
    return (
      <div className="w-[50px] shrink-0 border-l border-[#EDEDF0] bg-white flex flex-col items-center py-4 space-y-4">
        <button onClick={() => setCollapsed(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#7D7DA6] hover:text-[#0F1223] border border-[#EDEDF0] shadow-sm transform rotate-180">
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[280px] shrink-0 flex flex-col gap-5 border-l border-[#EDEDF0] pl-6 h-full">
      <div className="flex justify-between items-center pb-2">
        <span className="text-[11px] font-bold text-[#7D7DA6] uppercase tracking-wider">İkincil Menü</span>
        <button onClick={() => setCollapsed(true)} className="text-[#B4B4C8] hover:text-[#0F1223] w-6 h-6 flex items-center justify-center rounded hover:bg-slate-50">
          <ChevronRight size={16} />
        </button>
      </div>
      
      {/* 1. Favoriler Kartı */}
      <div className="bg-white rounded-xl border border-[#EDEDF0] p-5 shadow-sm space-y-3">
         <h3 className="text-sm font-semibold text-[#0F1223] flex items-center gap-2 border-b border-[#EDEDF0] pb-3">
            <Star size={16} className="text-amber-500 fill-amber-500" /> Favori Raporlar
         </h3>
         <div className="space-y-2">
            <div onClick={() => navigateSubTab('financial', 'pnl')} className="text-[13px] font-semibold text-[#0F1223] cursor-pointer hover:text-[#514BEE] flex flex-col">
              P&L Detaylı <span className="text-[11px] text-[#7D7DA6] font-normal">Dün açıldı</span>
            </div>
            <div onClick={() => navigateSubTab('commercial', 'channel')} className="text-[13px] font-semibold text-[#0F1223] cursor-pointer hover:text-[#514BEE] flex flex-col">
              Kanal Performans <span className="text-[11px] text-[#7D7DA6] font-normal">Bu hafta</span>
            </div>
            <div onClick={() => navigateSubTab('strategic', 'competition')} className="text-[13px] font-semibold text-[#0F1223] cursor-pointer hover:text-[#514BEE] flex flex-col">
              Rekabet Derinlik <span className="text-[11px] text-[#7D7DA6] font-normal">3 gün önce</span>
            </div>
         </div>
      </div>

      {/* 2. Zamanlanmış Kartı */}
      <div className="bg-white rounded-xl border border-[#EDEDF0] p-5 shadow-sm space-y-3">
         <h3 className="text-sm font-semibold text-[#0F1223] flex items-center gap-2 border-b border-[#EDEDF0] pb-3">
            <Calendar size={16} className="text-[#7D7DA6]" /> Zamanlanmış
         </h3>
         <div className="space-y-3">
           <div className="flex flex-col gap-0.5">
             <div className="text-[13px] font-semibold text-[#0F1223]">P&L — Haftalık</div>
             <div className="text-[11px] text-[#7D7DA6] flex justify-between">Pzt 09:00 <span className="text-emerald-600 font-medium truncate">3 alıcı · Aktif</span></div>
           </div>
           <div className="flex flex-col gap-0.5">
             <div className="text-[13px] font-semibold text-[#0F1223]">Kanal — Aylık</div>
             <div className="text-[11px] text-[#7D7DA6] flex justify-between">Ayın 1'i <span className="text-[#B4B4C8] font-medium truncate">Duraklatıldı</span></div>
           </div>
         </div>
      </div>

       {/* 3. Timeline Kartı */}
       <div className="bg-white rounded-xl border border-[#EDEDF0] p-5 shadow-sm space-y-3">
         <h3 className="text-sm font-semibold text-[#0F1223] flex items-center gap-2 border-b border-[#EDEDF0] pb-3">
            <Activity size={16} className="text-[#7D7DA6]" /> Timeline
         </h3>
         <div className="space-y-4">
           {timelineEvents.map((t, i) => (
             <div key={t.id || i} className="flex relative items-start gap-3">
               {i !== timelineEvents.length - 1 && <div className="absolute top-4 left-1.5 w-0.5 h-full bg-[#EDEDF0] z-0" />}
               <div className="w-3 h-3 rounded-full bg-[#E0DDFF] border-2 border-white z-10 shrink-0 mt-1" />
               <div className="flex flex-col">
                 <span className="text-[13px] font-medium text-[#0F1223]">{t.title}</span>
                 <span className="text-[11px] text-[#7D7DA6]">{t.time}</span>
               </div>
             </div>
           ))}
           {timelineEvents.length === 0 && (
             <div className="text-[11px] text-[#7D7DA6] text-center mt-2">Henüz işlem yok.</div>
           )}
         </div>
       </div>

       {/* 4. Hızlı Erişim Kartı */}
       <div className="bg-[#FAFAFB] rounded-xl border border-dashed border-[#B4B4C8] p-5 space-y-2">
         <h3 className="text-sm font-semibold text-[#0F1223] flex items-center gap-2 mb-2">
            <Target size={16} className="text-[#514BEE]" /> Hızlı Erişim
         </h3>
         <button className="text-[13px] text-[#0F1223] w-full text-left flex justify-between hover:text-[#514BEE] font-medium py-1">Tüm raporlar <span>→</span></button>
         <button className="text-[13px] text-[#0F1223] w-full text-left flex justify-between hover:text-[#514BEE] font-medium py-1">Builder <span>→</span></button>
         <button className="text-[13px] text-[#0F1223] w-full text-left flex justify-between hover:text-[#514BEE] font-medium py-1">AI Asistan <span>→</span></button>
       </div>

    </div>
  );
};

const HomeView = ({ navigateSubTab, timePeriod }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { orders, loading: isLoading } = useOrders();
  const { timelineEvents, inboxActions, dismissInboxAction } = useActivityLog(orders);

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300 w-full h-full flex items-start">
      
      <div className="flex flex-1 gap-6 w-full max-w-[1600px] mx-auto min-h-screen">
        
        {/* ANA KOLON (1fr) */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 pb-12">
           <HomeErrorBoundary>
             <div className="h-auto">
                <ProgressiveLoader isLoading={isLoading} skeleton={<div className="w-full h-[200px] bg-white rounded-xl border border-[#EDEDF0] animate-pulse"></div>}>
                  <MorningBriefingBlock orders={orders} />
                </ProgressiveLoader>
             </div>
           </HomeErrorBoundary>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HomeErrorBoundary>
                <div className="h-[350px]">
                  <ProgressiveLoader isLoading={isLoading} skeleton={<div className="w-full h-full bg-white rounded-xl border border-[#EDEDF0] animate-pulse"></div>}>
                    <HealthRadarBlock orders={orders} />
                  </ProgressiveLoader>
                </div>
              </HomeErrorBoundary>
              
              <HomeErrorBoundary>
                <div className="md:col-span-2 h-[350px]">
                  <ProgressiveLoader isLoading={isLoading} skeleton={<div className="w-full h-full bg-white rounded-xl border border-[#EDEDF0] animate-pulse"></div>}>
                    <PinnedMetricChart orders={orders} />
                  </ProgressiveLoader>
                </div>
              </HomeErrorBoundary>
           </div>

           <HomeErrorBoundary>
             <div className="h-auto">
                <ProgressiveLoader isLoading={isLoading} skeleton={<div className="w-full h-[400px] bg-white rounded-xl border border-[#EDEDF0] animate-pulse"></div>}>
                  <ActionInbox inboxActions={inboxActions} dismissInboxAction={dismissInboxAction} />
                </ProgressiveLoader>
             </div>
           </HomeErrorBoundary>

           <HomeErrorBoundary>
             <div className="h-auto">
               <ProgressiveLoader isLoading={isLoading} skeleton={<div className="w-full h-[120px] bg-white rounded-xl border border-[#EDEDF0] animate-pulse"></div>}>
                 <WeeklyChangesGrid orders={orders} timePeriod={timePeriod} />
               </ProgressiveLoader>
             </div>
           </HomeErrorBoundary>

           <HomeErrorBoundary>
             <div className="h-auto">
               <AskGilanBlock timePeriod={timePeriod} />
             </div>
           </HomeErrorBoundary>
        </div>

        {/* SAĞ SIDEBAR (280px or 50px) */}
        <div className="hidden lg:block shrink-0">
           <SecondarySidebar isCollapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} navigateSubTab={navigateSubTab} timelineEvents={timelineEvents} />
        </div>

      </div>

    </div>
  );
};

const PlaceholderView = ({ topTabId, subTabId }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
    <div className="w-20 h-20 rounded-full bg-[#FAFAFB] border border-[#EDEDF0] flex items-center justify-center mb-6 shadow-sm">
      <Compass size={32} className="text-[#B4B4C8]" />
    </div>
    <h3 className="text-xl font-bold text-[#0F1223] mb-2">{TOP_TABS.find(t=>t.id===topTabId)?.label} Raporları</h3>
    <p className="text-sm text-[#7D7DA6] max-w-md">
      <strong>"{SUB_TABS[topTabId]?.find(t=>t.id===subTabId)?.label || subTabId}"</strong> raporu henüz geliştirme aşamasında (Gelecek Fazlar).
    </p>
    <button className="mt-8 text-sm font-semibold text-[#0F1223] border border-[#EDEDF0] bg-white px-5 py-2.5 rounded-lg hover:bg-[#FAFAFB] hover:border-[#B4B4C8] transition-all">
      Geri Dön
    </button>
  </div>
);


// --- MAIN ENTRY ---
export const FinancialReports = () => {
  const [activeTopTab, setActiveTopTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [timePeriod, setTimePeriod] = useState('last7days');
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  const handleTopTabChange = (topTabId) => {
    setActiveTopTab(topTabId);
    if (topTabId !== 'home' && topTabId !== 'builder') {
      // Set the first subtab as active for this category
      const subTabs = SUB_TABS[topTabId] || [];
      if (subTabs.length > 0) setActiveSubTab(subTabs[0].id);
      else setActiveSubTab(null);
    } else {
      setActiveSubTab(null);
    }
  };

  const navigateSubTab = (topId, subId) => {
    setActiveTopTab(topId);
    setActiveSubTab(subId);
  };

  const renderContent = () => {
    if (activeTopTab === 'home') return <HomeView navigateSubTab={navigateSubTab} timePeriod={timePeriod} />;
    if (activeTopTab === 'builder') return <BuilderTab />;
    
    // Category Pages
    if (activeTopTab === 'financial') {
        if (activeSubTab === 'pnl') return <PnlTab />;
        if (activeSubTab === 'cashflow') return <CashflowTab />;
        if (activeSubTab === 'expenses') return <ExpensesTab />;
        if (activeSubTab === 'tax') return <TaxTab />;
    }
    
    if (activeTopTab === 'commercial') {
        if (activeSubTab === 'channel') return <ChannelPerformanceTab />;
        if (activeSubTab === 'product') return <ProductDeepDiveTab />;
        if (activeSubTab === 'trend') return <SalesTrendsTab />;
        if (activeSubTab === 'campaign') return <CampaignRoiTab />;
    }

    if (activeTopTab === 'customer') {
        if (activeSubTab === 'cohort') return <CohortTab />;
        if (activeSubTab === 'basket') return <BasketTab />;
    }

    if (activeTopTab === 'operation') {
        if (activeSubTab === 'stock') return <StockSpeedTab />;
        if (activeSubTab === 'shipping') return <ShippingLogisticsTab />;
        if (activeSubTab === 'returns') return <ReturnsSatisfactionTab />;
    }



    return <PlaceholderView topTabId={activeTopTab} subTabId={activeSubTab} />;
  };

  return (
    <ReportShell>
      <TopTabBar activeTopTab={activeTopTab} onChange={handleTopTabChange} timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      
      {/* SubTabChipBar (Only show if not Home/Builder) */}
      {(activeTopTab !== 'home' && activeTopTab !== 'builder') && (
        <SubTabChipBar 
          items={SUB_TABS[activeTopTab] || []} 
          activeId={activeSubTab} 
          onChange={setActiveSubTab} 
        />
      )}

      <div className="flex-1 relative overflow-visible flex flex-col custom-scrollbar pt-6">
        {renderContent()}
      </div>
      
      {/* Required custom reset styles overriding potentially inherited App.css */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #EDEDF0;
            border-radius: 20px;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}} />
    </ReportShell>
  );
};

export default FinancialReports;
