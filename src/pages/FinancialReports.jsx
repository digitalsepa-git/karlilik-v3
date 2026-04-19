import React, { useState } from 'react';
import {
  Home, Coins, ShoppingCart, Users, Truck, Compass, Wand2,
  AlertTriangle, TrendingDown, TrendingUp, FileText, PieChart, Shield,
  Sparkles, Star, ChevronRight, Download, Calendar, Mail, File,
  CheckCircle, PauseCircle, Edit2, Trash2, ChevronDown, ChevronUp, X, Send,
  Box, Activity, Target, MessageSquare, Package
} from 'lucide-react';
import { PnlTab } from './financial_tabs/PnlTab';
import { CashflowTab } from './financial_tabs/CashflowTab';
import { ExpensesTab } from './financial_tabs/ExpensesTab';
import { TaxTab } from './financial_tabs/TaxTab';

import { ChannelPerformanceTab } from './ticari_tabs/ChannelPerformanceTab';
import { ProductDeepDiveTab } from './ticari_tabs/ProductDeepDiveTab';
import { SalesTrendsTab } from './ticari_tabs/SalesTrendsTab';
import { CampaignRoiTab } from './ticari_tabs/CampaignRoiTab';

import { RfmTab } from './customer_tabs/RfmTab';
import { CohortTab } from './customer_tabs/CohortTab';
import { AttributionTab } from './customer_tabs/AttributionTab';
import { BasketTab } from './customer_tabs/BasketTab';

import { StockSpeedTab } from './operation_tabs/StockSpeedTab';
import { ShippingLogisticsTab } from './operation_tabs/ShippingLogisticsTab';
import { ReturnsSatisfactionTab } from './operation_tabs/ReturnsSatisfactionTab';

import { CompetitorDepthTab } from './strategic_tabs/CompetitorDepthTab';
import { MarketTrendTab } from './strategic_tabs/MarketTrendTab';
import { OpportunityMapTab } from './strategic_tabs/OpportunityMapTab';
import { WhatIfSimulationTab } from './strategic_tabs/WhatIfSimulationTab';

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
  { id: 'strategic', label: 'Stratejik', icon: Compass },
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
    { id: 'rfm', label: 'Segmentasyon & RFM' },
    { id: 'cohort', label: 'LTV & Cohort' },
    { id: 'attribution', label: 'Attribution' },
    { id: 'basket', label: 'Sepet Analizi' },
  ],
  operation: [
    { id: 'stock', label: 'Stok & Ciro Hızı' },
    { id: 'shipping', label: 'Kargo & Lojistik' },
    { id: 'returns', label: 'İade & Memnuniyet' },
  ],
  strategic: [
    { id: 'competition', label: 'Rekabet Derinlik' },
    { id: 'market', label: 'Pazar Trendi' },
    { id: 'opportunity', label: 'Fırsat Haritası' },
    { id: 'whatif', label: 'What-If Simülasyon' },
  ],
};

const aiSuggestions = [
  { id: 1, target: { top: 'operation', sub: 'stock' }, title: 'Dead stock riski artmış', desc: '3 SKU\'da 90+ gün hareket yok. Kampanya düşünebilirsiniz.', icon: AlertTriangle },
  { id: 2, target: { top: 'customer', sub: 'rfm' }, title: 'At-risk segment genişledi', desc: 'Son 30 günde %18 artış. Win-back kampanyası fırsatı.', icon: Users },
  { id: 3, target: { top: 'financial', sub: 'cashflow' }, title: 'Nakit akışı alarm', desc: '45 gün sonra pozisyon kritik seviyeye yaklaşıyor.', icon: TrendingDown },
];

const reportGallery = {
  financial: [
    { id: 'pnl', title: 'P&L Detaylı', desc: 'Brüt→net kâr waterfall\'ı ve satır bazlı hesap kalemleri', icon: FileText },
    { id: 'cashflow', title: 'Nakit Akış & Projeksiyon', desc: 'Alacak/borç takvimi ve 90 gün projeksiyonu', icon: TrendingUp },
    { id: 'expenses', title: 'Gider Analizi', desc: 'Sabit + değişken gider dağılımı ve anomali', icon: PieChart },
    { id: 'tax', title: 'KDV & Vergi', desc: 'Beyan hazırlık tablosu ve eksik fatura uyarısı', icon: Shield },
  ],
  commercial: [
    { id: 'channel', title: 'Kanal Performans', desc: 'Kanallar arası karlılık ve iade komisyon karşılaştırması', icon: Activity },
    { id: 'product', title: 'Ürün Deep-Dive', desc: 'Ürün bazlı P&L ve metrik analizleri', icon: Box },
  ],
  customer: [
    { id: 'rfm', title: 'Segmentasyon & RFM', desc: 'Müşteri davranış segmentleri', icon: Target },
  ],
  operation: [
    { id: 'stock', title: 'Stok & Ciro Hızı', desc: 'Envanter devir hızı ve dead stock riskleri', icon: Package },
  ],
  strategic: [
    { id: 'market', title: 'Pazar Trendi', desc: 'Kategori büyümesi ve pazar payı analizi', icon: Compass }
  ]
};

// --- SHARED COMPONENTS ---
const ReportShell = ({ children }) => (
  <div className="min-h-[calc(100vh-64px)] bg-[#FAFAFB] flex flex-col font-sans">
    <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

const TopTabBar = ({ activeTopTab, onChange }) => (
  <div className="flex items-center gap-1 border-b border-[#EDEDF0] px-8 bg-white hide-scrollbar overflow-x-auto shadow-[0_2px_10px_rgba(0,0,0,0.02)] sticky top-0 z-30">
    {TOP_TABS.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTopTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3.5 text-sm whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
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

const HomeView = ({ navigateSubTab }) => {
  const [openCategories, setOpenCategories] = useState({
    financial: true,
    commercial: true,
    customer: false,
    operation: false,
    strategic: false
  });

  const toggleCategory = (catId) => {
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getLabel = (id) => Object.values(TOP_TABS).find(t => t.id === id)?.label || id;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300">
      
      {/* BLOK A & B Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BLOK A: AI Önerileri */}
        <div className="bg-white rounded-xl border border-[#EDEDF0] p-6">
          <h3 className="text-base font-semibold text-[#0F1223] mb-5 flex items-center gap-2">
            <Sparkles size={18} className="text-[#514BEE]" /> ✨ AI Size Özel Önerdi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiSuggestions.map((sug) => {
              const Icon = sug.icon;
              return (
                <div key={sug.id} className="bg-gradient-to-br from-[#ECE9FF]/50 to-white border border-[#514BEE]/20 hover:border-[#514BEE]/40 rounded-xl p-4 flex flex-col hover:-translate-y-0.5 transition-all cursor-pointer group shadow-[0_2px_10px_rgba(81,75,238,0.03)]">
                  <div className="w-8 h-8 rounded-lg bg-[#514BEE]/10 text-[#514BEE] flex items-center justify-center mb-3">
                    <Icon size={16} />
                  </div>
                  <h4 className="text-[13px] font-bold text-[#0F1223] mb-1.5 leading-tight group-hover:text-[#514BEE]">{sug.title}</h4>
                  <p className="text-xs text-[#7D7DA6] mb-3 leading-relaxed flex-1">{sug.desc}</p>
                  <button onClick={() => navigateSubTab(sug.target.top, sug.target.sub)} className="text-[11px] font-bold text-[#514BEE] self-start flex items-center gap-1 group-hover:underline">
                    Raporu Aç <ChevronRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* BLOK B: Favoriler */}
        <div className="bg-white rounded-xl border border-[#EDEDF0] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold text-[#0F1223] flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-500" /> ⭐ Favorileriniz
            </h3>
            <button className="text-xs font-semibold text-[#514BEE] hover:underline">Tümü &rarr;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
            <div onClick={() => navigateSubTab('financial', 'pnl')} className="p-4 rounded-xl border border-[#EDEDF0] cursor-pointer hover:-translate-y-0.5 hover:shadow-sm hover:border-amber-200 hover:bg-amber-50/30 transition-all flex flex-col group">
               <h4 className="text-[13px] font-bold text-[#0F1223] mb-1 group-hover:text-amber-700">P&L Detaylı</h4>
               <p className="text-[11px] text-[#7D7DA6] flex-1">Finansal Raporu</p>
               <p className="text-[10px] text-[#B4B4C8] mt-2 flex items-center gap-1"><Calendar size={10}/> Dün açıldı</p>
            </div>
            <div onClick={() => navigateSubTab('commercial', 'channel')} className="p-4 rounded-xl border border-[#EDEDF0] cursor-pointer hover:-translate-y-0.5 hover:shadow-sm hover:border-amber-200 hover:bg-amber-50/30 transition-all flex flex-col group">
               <h4 className="text-[13px] font-bold text-[#0F1223] mb-1 group-hover:text-amber-700">Kanal Performans</h4>
               <p className="text-[11px] text-[#7D7DA6] flex-1">Ticari Özeti</p>
               <p className="text-[10px] text-[#B4B4C8] mt-2 flex items-center gap-1"><Calendar size={10}/> Bu hafta</p>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-[#EDEDF0] cursor-pointer hover:bg-[#FAFAFB] transition-all flex flex-col items-center justify-center text-center text-[#7D7DA6]">
               <Star size={20} className="mb-2 opacity-30" />
               <p className="text-[11px] font-medium">Favori eklemek için raporlardaki yıldıza tıklayın</p>
            </div>
          </div>
        </div>
      </div>

      {/* BLOK C: Rapor Galerisi */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#0F1223] mb-2 tracking-tight">Rapor Galerisi</h2>
        {Object.entries(reportGallery).map(([catId, reports]) => (
           <div key={catId} className="bg-white rounded-xl border border-[#EDEDF0] overflow-hidden shadow-sm">
             <button 
                onClick={() => toggleCategory(catId)}
                className="w-full flex justify-between items-center px-6 py-4 bg-[#FAFAFB] hover:bg-slate-50 transition-colors border-b border-[#EDEDF0]"
             >
                <div className="text-sm font-semibold text-[#0F1223] uppercase tracking-wide flex items-center gap-2">
                   {openCategories[catId] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                   {getLabel(catId)} <span className="text-[#7D7DA6] font-normal lowercase tracking-normal">({reports.length} rapor)</span>
                </div>
             </button>
             {openCategories[catId] && (
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white animate-in zoom-in-95 duration-200">
                 {reports.map(rep => {
                   const RepIcon = rep.icon;
                   return (
                     <div key={rep.id} className="bg-white border text-left border-[#EDEDF0] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-md hover:border-[#514BEE]/30 transition-all group flex flex-col relative">
                       <Star size={16} className="absolute top-4 right-4 text-[#EDEDF0] group-hover:text-[#7D7DA6] opacity-0 group-hover:opacity-100 transition-opacity hover:fill-amber-400 hover:text-amber-400 cursor-pointer" />
                       <div className="w-10 h-10 rounded-lg bg-[#ECE9FF] text-[#514BEE] flex items-center justify-center mb-4">
                          <RepIcon size={20} />
                       </div>
                       <h4 className="text-[14px] font-semibold text-[#0F1223] mb-1.5 leading-tight">{rep.title}</h4>
                       <p className="text-[11px] text-[#7D7DA6] leading-relaxed line-clamp-2 flex-1">{rep.desc}</p>
                       <button onClick={() => navigateSubTab(catId, rep.id)} className="mt-4 text-[12px] font-bold text-[#514BEE] flex items-center gap-1 group-hover:underline">
                         Raporu Aç <ChevronRight size={14} />
                       </button>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
        ))}
      </div>

      {/* BLOK D & E Container */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        
        {/* BLOK D: Zamanlanmış Raporlar Tablosu */}
        <div className="bg-white rounded-xl border border-[#EDEDF0] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EDEDF0] flex justify-between items-center bg-[#FAFAFB]">
             <h3 className="text-base font-semibold text-[#0F1223] flex items-center gap-2">
                <Calendar size={18} className="text-[#7D7DA6]"/> Zamanlanmış Raporlar
             </h3>
             <button className="text-xs font-semibold text-[#514BEE] bg-[#ECE9FF] px-3 py-1.5 rounded-lg hover:bg-[#E0DDFF] transition-colors">Yönergeler</button>
          </div>
          <div className="p-0 overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-white border-b border-[#EDEDF0]">
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase text-[#7D7DA6] tracking-wider">Rapor Adı</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase text-[#7D7DA6] tracking-wider">Periyot</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase text-[#7D7DA6] tracking-wider">Sonraki Liste</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase text-[#7D7DA6] tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase text-[#7D7DA6] tracking-wider text-right">İşlem</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F8]">
                   <tr className="hover:bg-[#FAFAFB] transition-colors group">
                      <td className="px-6 py-4 text-sm font-semibold text-[#0F1223] flex items-center gap-2">
                         <FileText size={14} className="text-[#7D7DA6]"/> P&L Detaylı
                      </td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded bg-[#E0E7FF] text-[#4F46E5] text-[11px] font-bold">Haftalık</span></td>
                      <td className="px-6 py-4 text-[13px] text-[#0F1223]">Pzt 09:00 <span className="text-[#7D7DA6] ml-2 text-[11px]">+3 alıcı</span></td>
                      <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium"><CheckCircle size={14}/> Aktif</span></td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 text-[#7D7DA6] opacity-50 group-hover:opacity-100 transition-opacity">
                         <button className="hover:text-[#0F1223]"><Edit2 size={16}/></button>
                         <button className="hover:text-rose-500"><Trash2 size={16}/></button>
                      </td>
                   </tr>
                   <tr className="hover:bg-[#FAFAFB] transition-colors group">
                      <td className="px-6 py-4 text-sm font-semibold text-[#0F1223] flex items-center gap-2">
                         <Activity size={14} className="text-[#7D7DA6]"/> Kanal Performans
                      </td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold">Aylık</span></td>
                      <td className="px-6 py-4 text-[13px] text-[#0F1223]">Ayın 1'i 10:00 <span className="text-[#7D7DA6] ml-2 text-[11px]">+1 alıcı</span></td>
                      <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-[12px] text-[#7D7DA6] font-medium"><PauseCircle size={14}/> Duraklatıldı</span></td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 text-[#7D7DA6] opacity-50 group-hover:opacity-100 transition-opacity">
                         <button className="hover:text-[#0F1223]"><Edit2 size={16}/></button>
                         <button className="hover:text-rose-500"><Trash2 size={16}/></button>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
        </div>

        {/* BLOK E: Timeline */}
        <div className="bg-white rounded-xl border border-[#EDEDF0] p-6 flex flex-col">
          <h3 className="text-base font-semibold text-[#0F1223] mb-5">Timeline (Son Etkileşimler)</h3>
          <div className="space-y-0 flex-1">
             {[
               { t: 'Dün 15:42', desc: 'Murat, P&L Waterfall raporuna açıklama notu ekledi.', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
               { t: 'Dün 14:10', desc: 'AI Asistan, yüksek Stok devir hızı konusunda uyarı üretti.', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
               { t: 'Pzt 09:05', desc: 'Haftalık Kanal Performans özeti PDF olarak e-posta gönderildi (3 alıcı).', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' },
               { t: '3 Gün Önce', desc: 'RFM modeli için yeni hesaplama yapıldı ve segmentler güncellendi.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
             ].map((evt, idx) => {
                const EIcon = evt.icon;
                return (
                  <div key={idx} className="flex gap-4 group cursor-pointer pb-4 relative">
                     {idx !== 3 && <div className="absolute top-8 left-[15px] w-0.5 h-[calc(100%-8px)] bg-[#F4F4F8] group-hover:bg-[#E0E7FF] transition-colors" />}
                     <div className={`w-8 h-8 rounded-full ${evt.bg} ${evt.color} flex items-center justify-center relative z-10 shadow-sm border border-white mt-1 shrink-0`}>
                        <EIcon size={14}/>
                     </div>
                     <div className="pt-2 flex-1">
                        <p className="text-[13px] text-[#0F1223] leading-relaxed group-hover:text-[#514BEE] transition-colors">{evt.desc}</p>
                        <p className="text-[11px] text-[#B4B4C8] font-medium mt-1">{evt.t}</p>
                     </div>
                  </div>
                )
             })}
          </div>
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
    if (activeTopTab === 'home') return <HomeView navigateSubTab={navigateSubTab} />;
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
        if (activeSubTab === 'rfm') return <RfmTab />;
        if (activeSubTab === 'cohort') return <CohortTab />;
        if (activeSubTab === 'attribution') return <AttributionTab />;
        if (activeSubTab === 'basket') return <BasketTab />;
    }

    if (activeTopTab === 'operation') {
        if (activeSubTab === 'stock') return <StockSpeedTab />;
        if (activeSubTab === 'shipping') return <ShippingLogisticsTab />;
        if (activeSubTab === 'returns') return <ReturnsSatisfactionTab />;
    }

    if (activeTopTab === 'strategic') {
        if (activeSubTab === 'competition') return <CompetitorDepthTab />;
        if (activeSubTab === 'trend') return <MarketTrendTab />;
        if (activeSubTab === 'opportunity') return <OpportunityMapTab />;
        if (activeSubTab === 'whatif') return <WhatIfSimulationTab />;
    }

    return <PlaceholderView topTabId={activeTopTab} subTabId={activeSubTab} />;
  };

  return (
    <ReportShell>
      <TopTabBar activeTopTab={activeTopTab} onChange={handleTopTabChange} />
      
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
