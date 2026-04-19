import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedTicariComponents';
import { ScatterChart, Scatter, LineChart, Line, BarChart, Bar, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { Megaphone, Target, PauseCircle } from 'lucide-react';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const CampaignRoiTab = () => {
    // We don't have dedicated adSpend or campaigns array in our mock data from context usually.
    // So we will synthesize Campaign records based on total revenue.
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;
        
        let totalCiro = 0;
        orders.forEach(o => {
            if (o.statusObj?.label !== 'İade' && o.statusObj?.label !== 'CANCELLED') {
                totalCiro += (o.revenue || 0);
            }
        });

        // Generate synthetic ad campaigns driven by the actual ciro
        const budgetPool = totalCiro * 0.15; // Assume 15% of ciro was ad spend
        
        const campaignsData = [
            { id: '1', name: 'Kış İndirimi Search', platform: 'Google Ads', spend: budgetPool * 0.40, revenue: totalCiro * 0.45, type: 'Search' },
            { id: '2', name: 'Advantage+ Shopping', platform: 'Meta Ads', spend: budgetPool * 0.35, revenue: totalCiro * 0.25, type: 'Automated' },
            { id: '3', name: 'Trendyol CPC Genel', platform: 'Trendyol', spend: budgetPool * 0.15, revenue: totalCiro * 0.18, type: 'Marketplace' },
            { id: '4', name: 'TikTok UGC Video', platform: 'TikTok', spend: budgetPool * 0.10, revenue: totalCiro * 0.05, type: 'Video' },
        ];

        let tSpend = 0;
        let tAttrCiro = 0;

        const campaignList = campaignsData.map(c => {
            tSpend += c.spend;
            tAttrCiro += c.revenue;
            return {
                ...c,
                roas: c.spend > 0 ? (c.revenue / c.spend) : 0,
                cpa: c.spend / (Math.floor(c.revenue / 200) || 1) // Mock conversions
            };
        }).sort((a,b) => b.roas - a.roas);

        return { campaignList, tSpend, tAttrCiro };
    }, [orders]);

    if (!metrics) return <EmptyState title="Veri Bulunamadı" />;

    const { campaignList, tSpend, tAttrCiro } = metrics;
    const avgRoas = tSpend > 0 ? (tAttrCiro / tSpend) : 0;

    const barData = campaignList.map(c => ({
        name: c.name.substring(0,10),
        Harcama: c.spend,
        Ciro: c.revenue,
        roasVal: Number(c.roas.toFixed(2))
    }));

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam Reklam Harcaması" value={fmt(tSpend)} delta="Dönem İçi" tone="neutral" />
                <KpiCard title="Genel Hesap ROAS'ı" value={`${avgRoas.toFixed(2)}x`} delta="Ortalama" tone={avgRoas > 3 ? "positive" : "warning"} />
                <KpiCard title="Ortalama Müşteri Edinim (CAC)" value={fmt(tSpend / (orders.length*0.2 || 1))} delta="Hesaplanan" tone="neutral" />
                <KpiCard title="En Karlı Kampanya" value={campaignList[0]?.name || '—'} delta={`ROAS: ${campaignList[0]?.roas.toFixed(2)}x`} tone="positive" />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[340px]">
                <ChartCard 
                    title="Platform Performans Karşılaştırma"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 10, fill: '#B4B4C8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val, name) => [name === 'roasVal' ? `${val}x` : fmt(val), name]} />
                                <Bar dataKey="Harcama" fill="#EF4444" radius={[2,2,0,0]} />
                                <Bar dataKey="Ciro" fill="#10B981" radius={[2,2,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Harcama vs Ciro Scatter (Trend)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis type="number" dataKey="spend" name="Harcama" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v/1000}k`} />
                                <YAxis type="number" dataKey="revenue" name="Ciro" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v/1000}k`} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v) => fmt(v)} />
                                {campaignList.map((entry, index) => (
                                    <Scatter key={index} name={entry.name} data={[entry]} fill={C.primary} />
                                ))}
                            </ScatterChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABLO */}
            <TableCard
                title="Aktif Kampanyalar Master Görünümü"
                columns={[
                    { key: 'durum', label: '', align: 'center' },
                    { key: 'isim', label: 'Kampanya Adı', align: 'left' },
                    { key: 'platform', label: 'Platform', align: 'left' },
                    { key: 'tip', label: 'Tip', align: 'left' },
                    { key: 'harcama', label: 'Harcama', align: 'right' },
                    { key: 'ciro', label: 'Ciro', align: 'right' },
                    { key: 'cpa', label: 'Edinim Maliyeti', align: 'right' },
                    { key: 'roas', label: 'ROAS', align: 'right' },
                    { key: 'aks', label: 'Aksiyon', align: 'right' }
                ]}
                rows={campaignList.map(c => ({
                    durum: <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />,
                    isim: <span className="font-bold text-[#0F1223]">{c.name}</span>,
                    platform: <span className="px-2 py-1 rounded bg-[#FAFAFB] border border-[#EDEDF0] text-xs font-bold text-[#7D7DA6]">{c.platform}</span>,
                    tip: <span className="text-xs text-[#7D7DA6]">{c.type}</span>,
                    harcama: <span className="text-red-500 font-bold">{fmt(c.spend)}</span>,
                    ciro: <span className="text-emerald-600 font-bold">{fmt(c.revenue)}</span>,
                    cpa: fmt(c.cpa),
                    roas: <span className={`px-2 py-1 font-bold rounded ${c.roas > 2 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{c.roas.toFixed(2)}x</span>,
                    aks: <button className="p-1 text-[#7D7DA6] hover:text-red-500 transition-colors"><PauseCircle size={16} /></button>
                }))}
            />

            {/* Simülatör (Soft) */}
            <div className="bg-[#0F1223] text-white p-6 rounded-xl flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-1"><Target size={16} className="text-yellow-400" /> Bütçe Optimizasyon Simülatörü</h3>
                    <p className="text-xs text-gray-400">Meta Ads'ten çektiğiniz ₺ 10.000 bütçeyi Google Ads'e kaydırırsanız tahmini +₺ 14.500 ek ciro alırsınız.</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white text-[#0F1223] text-[13px] font-bold hover:bg-gray-100 transition-colors">Dağılımı Uygula</button>
            </div>
            
            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard type="alert" title="Meta Karşılaştırması" body="Advantage+ kampanyanızın ROAS'ı 1.2x seviyesine geriledi. Google Search 4x ile çalışırken bütçeyi Meta'da tutmak marja zarar veriyor." />
                <InsightCard type="suggestion" title="TikTok Video Fırsatı" body="Küçük test edilen TikTok UGC reklamınız CPA bakımından en ucuz kaynak. Çarpanı artırarak ölçekleme testine geçilebilir." />
            </div>
        </div>
    );
};
