import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedTicariComponents';
import { ScatterChart, Scatter, LineChart, Line, BarChart, Bar, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { Megaphone, Target, PauseCircle } from 'lucide-react';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const CampaignRoiTab = () => {
    const { globalDateRange } = useData();
    const ga = useGoogleAnalytics(globalDateRange.startDate, globalDateRange.endDate);

    const metrics = useMemo(() => {
        if (!ga.data) return null;
        
        const cg = ga.data.channels;
        
        // Assemble into a format suitable for the chart/table
        const campaignList = [
            { 
               id: '1', 
               name: 'Google Ads (Search & PMax)', 
               platform: 'Google Ads', 
               spend: cg.googleAds.cost, 
               revenue: cg.googleAds.revenue, 
               type: 'Search/Shopping',
               cpa: cg.googleAds.cost / (Math.floor(cg.googleAds.clicks * 0.05) || 1), // Using 5% cr proxy for CPA
               roas: cg.googleAds.roas 
            },
            { 
               id: '2', 
               name: 'Meta Ads (Advantage+)', 
               platform: 'Meta Ads', 
               spend: cg.metaAds.cost, 
               revenue: cg.metaAds.revenue, 
               type: 'Automated/Social',
               cpa: cg.metaAds.cost / (Math.floor(cg.metaAds.clicks * 0.03) || 1),
               roas: cg.metaAds.roas
            },
            { 
               id: '3', 
               name: 'Diğer (Organik / TikTok vs.)', 
               platform: 'Mix', 
               spend: cg.other.cost, 
               revenue: cg.other.revenue, 
               type: 'Mix',
               cpa: cg.other.cost / (Math.floor(cg.other.clicks * 0.02) || 1),
               roas: cg.other.roas
            }
        ].filter(c => c.spend > 0).sort((a,b) => b.roas - a.roas);

        return { 
            campaignList, 
            tSpend: ga.data.totalAdCost, 
            tAttrCiro: ga.data.totalRevenue,
            overallRoas: ga.data.overallRoas,
            cpa: ga.data.cpa 
        };
    }, [ga.data]);

    if (ga.loading) return (
      <div className="p-8 flex flex-col items-center justify-center animate-pulse min-h-[400px]">
          <Megaphone className="text-[#B4B4C8] mb-4" size={32} />
          <div className="text-[#0F1223] font-bold text-sm">Gerçek Reklam Verileri Bekleniyor</div>
          <div className="text-[#7D7DA6] text-[11px] mt-1">Google Analytics ve Ads API entegrasyonundan güncel harcamalar getiriliyor...</div>
      </div>
    );
    
    if (!metrics || metrics.campaignList.length === 0) return <EmptyState title="Reklam Verisi Bulunamadı" message="Bu tarih aralığında Google/Meta harcama logu saptanmadı." />;

    const { campaignList, tSpend, overallRoas, cpa } = metrics;

    const barData = campaignList.map(c => ({
        name: c.name.split(' ')[0], // Extract "Google" or "Meta" or "Diğer"
        Harcama: c.spend,
        Ciro: c.revenue,
        roasVal: Number(c.roas.toFixed(2))
    }));

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Toplam Reklam Harcaması" 
                    value={fmt(tSpend)} 
                    delta="Dönem İçi" 
                    tone="neutral" 
                    tooltip="Seçili tarih aralığında API'ye bağlı tüm kanallarınızda ölçülen toplam (brüt) pazarlama harcaması." 
                />
                <KpiCard 
                    title="Genel Hesap ROAS'ı" 
                    value={`${overallRoas.toFixed(2)}x`} 
                    delta="Ortalama" 
                    tone={overallRoas > 3 ? "positive" : "warning"} 
                    tooltip="Bağlı platformlardan (Google, Meta vb.) izlenen reklam gelirlerinin toplam harcamaya bölünmesiyle oluşan ağırlıklı ROAS (Return On Ad Spend) katsayısı." 
                />
                <KpiCard 
                    title="Ortalama Müşteri Edinim (CAC)" 
                    value={fmt(cpa)} 
                    delta="Gerçekleşen" 
                    tone="neutral" 
                    tooltip="Platformlardan çekilen ortalama tıklama/dönüşüm proxy hesaplamalarına göre; sipariş veya etkinlik başına düşen müşteri edinim maliyeti (CAC / CPA)." 
                />
                <KpiCard 
                    title="En Karlı Kanal" 
                    value={campaignList[0]?.platform || '—'} 
                    delta={`ROAS: ${campaignList[0]?.roas.toFixed(2)}x`} 
                    tone="positive" 
                    tooltip="Aktif reklamlara sahip kanallarınız arasında harcamaya oranla en verimli geliri (En yüksek ROAS oranını) tutturmayı başarmış pazarlama kanalı." 
                />
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

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard 
                   type={overallRoas < 3 ? "alert" : "trend"} 
                   title="Kanal Dağılım Gözlemi" 
                   body={`Seçilen periyotta ${campaignList[0]?.name} kanalı ${campaignList[0]?.roas.toFixed(2)}x ROAS ile en verimli kanalınız. ${campaignList[campaignList.length-1]?.name}'da ise bütçe harcanmasına rağmen verimlilik düşüktür.`} 
                />
                <InsightCard 
                   type="suggestion" 
                   title="Harcama Ölçekleme Fırsatı" 
                   body={`Genel CPA oranınız (${fmt(cpa)}) hedeflerin içerisindeyse, bütçe optimizasyon simülatörünü çalıştırıp "Google Ads" PMax kampanyalarına bütçe aktarmayı test edebilirsiniz.`} 
                />
            </div>
        </div>
    );
};
