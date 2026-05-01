import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, ChannelBadge, CHANNEL_COLORS } from './SharedTicariComponents';
import { AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { ChevronRight } from 'lucide-react';
// variableRulesData and static rules removed, using real order line-item data instead

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const ChannelPerformanceTab = () => {
    const { ordersData, globalDateRange, analyticsData } = useData();
    const { orders } = ordersData;
    const { data: gaData } = analyticsData || {};

    // Filter Logic & Prev Period calculation for Growth
    const { dateStart, dateEnd, prevDateStart, prevDateEnd } = useMemo(() => {
        const s = new Date(globalDateRange.startDate + 'T00:00:00Z');
        const e = new Date(globalDateRange.endDate + 'T23:59:59.999Z');
        const diffDays = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
        const ps = new Date(s.getTime() - (diffDays * 24 * 60 * 60 * 1000));
        const pe = new Date(s.getTime() - 1);
        return { dateStart: s, dateEnd: e, prevDateStart: ps, prevDateEnd: pe };
    }, [globalDateRange]);

    // Data Processing Engine
    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        const webAdSpend = gaData?.totalAdCost || 0; // Get real total ad spend from GA

        const chMap = {};
        let totalCiro = 0;

        // Initialize helper func for adding channels map cleanly
        const getCh = (key, rawName) => {
            if (!chMap[key]) {
                chMap[key] = {
                    key: key,
                    name: rawName || 'Bilinmeyen',
                    curRevenue: 0, prevRevenue: 0, 
                    cogs: 0, orders: 0, returns: 0, 
                    marketingCost: 0, totalExpenses: 0, commCost: 0,
                    days: {}
                };
            }
            return chMap[key];
        };

        orders.forEach(o => {
            if (!o.dateRaw) return;
            const d = new Date(o.dateRaw);
            const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED';
            const rawCh = (o.sourceName || o.channel || 'web');
            let chKey = rawCh.toLowerCase().replace(/\s+/g, '');
            if (chKey.includes('site') || chKey.includes('ikas')) chKey = 'web';

            const channelObj = getCh(chKey, rawCh);
            const orderRevenue = o.revenue || 0;
            const orderOriginalCogs = o.cogs || 0;

            if (d >= prevDateStart && d <= prevDateEnd && !isReturn) {
                channelObj.prevRevenue += orderRevenue;
                return; // Early return for just growth logic
            }

            if (d < dateStart || d > dateEnd) return;

            // Day Mapping for Area Chart
            const dayObj = d.toISOString().split('T')[0];
            if (!channelObj.days[dayObj]) channelObj.days[dayObj] = 0;

            if (isReturn) {
                channelObj.returns++;
                // İadelerde bile oluşan faturalandırılmış kargo gideri, ilgili kanalın karlılığından eksi olarak düşülmelidir
                const returnShipping = o.shipping || 0;
                channelObj.totalExpenses += returnShipping;
            } else {
                channelObj.curRevenue += orderRevenue;
                channelObj.orders++;
                channelObj.days[dayObj] += orderRevenue;
                totalCiro += orderRevenue;
                
                // Gerçek Sipariş Verilerinden ("Order Line-Item" ve API seviyesindeki hesaplamalardan) Giderlerin Alınması
                // Kargo, komisyon, cogs (ürün maliyeti) gibi değerler artık statik rule engine yerine doğrudan CANLI sipariş objesinden (o.commission vs) akıyor.
                const realCommission = o.commission || 0;
                const realShipping = o.shipping || 0;
                const realTax = o.tax || 0;
                
                // Toplam sipariş bazı direkt maliyet = Ürün maliyeti + Komisyon + Kargo + KDV
                const directExpenses = orderOriginalCogs + realShipping + realTax;

                channelObj.commCost += realCommission;
                channelObj.totalExpenses += (realCommission + directExpenses);
            }
        });

        // Add real GA Ad Spend entirely to the 'web' channel's expenses
        if (chMap['web']) {
            chMap['web'].marketingCost = webAdSpend;
            chMap['web'].totalExpenses += webAdSpend;
        }

        const channelStats = Object.values(chMap)
            .filter(ch => ch.curRevenue > 0 || ch.prevRevenue > 0)
            .map(ch => {
                const netKar = ch.curRevenue - ch.totalExpenses;
                const marj = ch.curRevenue > 0 ? (netKar / ch.curRevenue) * 100 : 0;
                const iadeOrani = (ch.orders + ch.returns) > 0 ? (ch.returns / (ch.orders + ch.returns)) * 100 : 0;
                const ortSepet = ch.orders > 0 ? ch.curRevenue / ch.orders : 0;
                
                const growth = ch.prevRevenue > 0 ? ((ch.curRevenue - ch.prevRevenue) / ch.prevRevenue) * 100 : 100;
                const roas = ch.marketingCost > 0 ? ch.curRevenue / ch.marketingCost : 0; // If undefined cost, roas is technically infinite but mapped to 0 here 

                return {
                    ...ch,
                    revenue: ch.curRevenue, // Alias for UI
                    netKar,
                    marj,
                    iadeOrani,
                    ortSepet,
                    share: totalCiro > 0 ? (ch.curRevenue / totalCiro) * 100 : 0,
                    growth,
                    roas
                };
            }).sort((a, b) => b.revenue - a.revenue);

        // For Area Chart
        const datesMap = {};
        Object.values(chMap).forEach(ch => {
            Object.keys(ch.days).forEach(date => {
                if (!datesMap[date]) datesMap[date] = {};
                datesMap[date][ch.key] = ch.days[date];
            });
        });
        const areaData = Object.keys(datesMap).sort().map(date => {
            return { date, ...datesMap[date] };
        });

        return { channelStats, totalCiro, areaData };
    }, [orders, dateStart, dateEnd, prevDateStart, prevDateEnd, gaData]);

    if (!metrics || metrics.channelStats.length === 0) {
        return <EmptyState title="Kanal Verisi Yok" message="Bu tarih aralığında sipariş kanallarından satış verisi akmamış." />;
    }

    const { channelStats, totalCiro, areaData } = metrics;
    
    const bestMarj = [...channelStats].sort((a,b) => b.marj - a.marj)[0];
    const bestGrowth = [...channelStats].sort((a,b) => b.growth - a.growth)[0];
    const topConcentration = channelStats[0]?.share || 0;

    // Use specific colors dynamically mapped or fallback safely 
    const mapColor = (key, idx) => CHANNEL_COLORS[key] || ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#6366F1'][idx % 6];

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="En Karlı Kanal" 
                    value={bestMarj?.name || '—'} 
                    delta={`${pct(bestMarj?.marj)} marj ile lider`}
                    tone="positive"
                />
                <KpiCard 
                    title="Aktif Satış Kanalı" 
                    value={channelStats.filter(c => c.revenue > 0).length} 
                />
                <KpiCard 
                    title="En Hızlı Büyüyen Kanal" 
                    value={bestGrowth?.name || '—'} 
                    delta={bestGrowth?.growth > 0 ? `+${pct(bestGrowth?.growth)} önceki döneme göre` : pct(bestGrowth?.growth)}
                    tone={bestGrowth?.growth > 0 ? 'positive' : 'negative'}
                />
                <KpiCard 
                    title="Kanal Konsantrasyonu" 
                    value={pct(topConcentration)} 
                    delta={`En büyük kanalın (%100 içinden) payı`}
                    tone={topConcentration > 70 ? 'negative' : (topConcentration > 40 ? 'warning' : 'positive')}
                />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard 
                    title="Kanal Dinamikleri Haritası (Sipariş vs Marj)"
                    tooltip="Yukarı ve sağa konumlanan yuvarlaklar en değerli kanallarınızı temsil eder. Yuvarlak büyüklükleri kanalların ürettiği toplam ciro hacmini betimler."
                    chart={
                        <div className="h-[340px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false}/>
                                    <XAxis type="number" dataKey="orders" name="Sipariş Hacmi" unit=" adet" tick={{ fontSize: 10, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                    <YAxis type="number" dataKey="marj" name="Marj" unit="%" tick={{ fontSize: 10, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                    <ZAxis type="number" dataKey="revenue" range={[100, 1500]} name="Ciro" />
                                    <Tooltip 
                                        cursor={{ strokeDasharray: '3 3' }} 
                                        formatter={(value, name) => [name === 'Ciro' ? fmt(value) : (name === 'Marj' ? pct(value) : value), name]}
                                        contentStyle={{ backgroundColor: '#0F1223', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}
                                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    {channelStats.map((entry, index) => (
                                        <Scatter key={index} name={entry.name} data={[entry]} fill={mapColor(entry.key, index)} fillOpacity={0.85} />
                                    ))}
                                    <ReferenceLine x={channelStats.reduce((a,b)=>a+b.orders,0)/Math.max(1,channelStats.length)} stroke="#7D7DA6" strokeDasharray="5 5" opacity={0.3} />
                                    <ReferenceLine y={channelStats.reduce((a,b)=>a+b.marj,0)/Math.max(1,channelStats.length)} stroke="#7D7DA6" strokeDasharray="5 5" opacity={0.3} />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    }
                />
                <ChartCard 
                    title="Ciro Trendi (Kanallar Arası Kümülatif Büyüme)"
                    tooltip="Geçmişten günümüze Ciro hacminizin hangi kanallar üzerinden yükseldiğini veya baskın hale geldiğini zaman serisi ile inceler."
                    chart={
                        <div className="h-[340px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false}/>
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7D7DA6' }} minTickGap={30} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(v) => `${Math.floor(v/1000)}K`} tick={{ fontSize: 10, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        formatter={(val) => fmt(val)} 
                                        labelFormatter={(val) => `Tarih: ${val}`} 
                                        contentStyle={{ backgroundColor: '#0F1223', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}
                                        labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '6px' }}
                                    />
                                    {channelStats.map((ch, idx) => (
                                        <Area key={ch.key} type="monotone" dataKey={ch.key} stackId="1" fill={mapColor(ch.key, idx)} stroke={mapColor(ch.key, idx)} name={ch.name} fillOpacity={0.6} activeDot={{r:5, strokeWidth:0}}/>
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    }
                />
            </div>

            {/* TABLO */}
            <TableCard
                title="Güncel Kanalların Finansal Kırılım (Master) Tablosu"
                columns={[
                    { key: 'kanal', label: 'Satış Kanalı', align: 'left' },
                    { key: 'siparis', label: 'T. Sipariş', align: 'right' },
                    { key: 'ciro', label: 'Net Ciro', align: 'right' },
                    { key: 'pazarlama', label: 'Pazarlama (CPA/Reklam)', align: 'right' },
                    { key: 'komisyon', label: 'Platform Kesintisi', align: 'right' },
                    { key: 'sepet', label: 'Ort. Sepet', align: 'right' },
                    { key: 'kar', label: 'Net Kar (Ciro - Giderler)', align: 'right' },
                    { key: 'marj', label: 'K. Marjı', align: 'right' },
                    { key: 'roas', label: 'Gerçek ROAS', align: 'right' }
                ]}
                rows={channelStats.map(ch => ({
                    kanal: <div className="flex items-center font-bold text-slate-800"><ChannelBadge channelId={ch.key} channelObj={ch} /></div>,
                    siparis: <span className="font-semibold">{ch.orders}</span>,
                    ciro: <span className="font-bold text-[#0F1223]">{fmt(ch.revenue)}</span>,
                    pazarlama: <span className="text-rose-500">{fmt(ch.marketingCost)}</span>,
                    komisyon: <span className="text-amber-600">{fmt(ch.commCost)}</span>,
                    sepet: fmt(ch.ortSepet),
                    kar: <span className="text-[#514BEE] font-extrabold">{fmt(ch.netKar)}</span>,
                    marj: <span className={`px-2 py-0.5 rounded font-bold ${ch.marj > 15 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{pct(ch.marj)}</span>,
                    roas: <span className={`font-black ${ch.roas > 3 ? 'text-emerald-600' : 'text-slate-500'}`}>{ch.roas > 0 ? `${ch.roas.toFixed(2)}x` : '-'}</span>
                }))}
            />

            {/* SKORKARTLAR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {channelStats.slice(0, 4).map(ch => {
                    return (
                        <div key={ch.key} className="bg-white border border-[#EDEDF0] p-5 rounded-xl flex items-center justify-between shadow-sm hover:border-slate-300 transition-colors">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="font-extrabold text-[#0F1223] capitalize tracking-tight flex items-center gap-1.5 opacity-90"><ChannelBadge channelId={ch.key} channelObj={ch} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                                    <div className="text-[12px] text-[#7D7DA6] font-medium flex justify-between">Net Ciro: <span className="text-[#0F1223] font-bold">{fmt(ch.revenue)}</span></div>
                                    <div className="text-[12px] text-[#7D7DA6] font-medium flex justify-between">Net Marj: <span className={ch.marj > 10 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{pct(ch.marj)}</span></div>
                                    <div className="text-[12px] text-[#7D7DA6] font-medium flex justify-between">Ay Büyümesi: <span className={ch.growth > 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>{ch.growth > 0 ? `+${pct(ch.growth)}` : pct(ch.growth)}</span></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topConcentration > 60 && (
                    <InsightCard type="alert" title="Tek Kanal Riski Uyarısı" body={`Satışlarınızın ${pct(topConcentration)}'lük devasa bir kısmı sadece en büyük kanalınızdan (${channelStats[0]?.name}) geliyor. Herhangi bir komisyon artışı veya algoritma değişikliği riskine karşı diğer kanalları desteklemeniz önerilir.`}/>
                )}
                {channelStats.length >= 2 && channelStats[0].marj - channelStats[1].marj > 5 && (
                    <InsightCard type="suggestion" title="Optimizasyon Fırsatı" body={`${channelStats[0].name} kanalınızdaki kâr marjınız ${channelStats[1].name} kanalından anlamlı oranda (%${(channelStats[0].marj - channelStats[1].marj).toFixed(1)}) daha yüksek. Bütün trafik reklam bütçesini bu daha kârlı kanala tahsis etmeniz toplam net kârınızı belirgin seviyede artıracaktır.`}/>
                )}
                <InsightCard type="trend" title="Genişleyen Kanal Analizi" body={bestGrowth ? `Bu dönem performans göstergelerinde en agresif büyüyen kanal %${bestGrowth.growth.toFixed(1)} ivme yakalayan ${bestGrowth.name} oldu.` : 'Kanallarda yeterli büyüme trendi tespit edilemedi.' } />
            </div>
        </div>
    );
};
