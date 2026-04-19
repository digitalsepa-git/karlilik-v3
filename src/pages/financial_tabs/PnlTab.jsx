import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedFinComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Line } from 'recharts';
import { Activity, Shield, TrendingDown, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { expensesData, calculateDailyExpense } from '../../data/expensesData';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const PnlTab = () => {
    const { ordersData, productsData, globalDateRange } = useData();
    const { orders } = ordersData;
    const { products } = productsData;

    // Filter logic
    const { start: dateStart, end: dateEnd } = useMemo(() => {
        return { 
            start: new Date(globalDateRange.startDate + 'T00:00:00Z'), 
            end: new Date(globalDateRange.endDate + 'T23:59:59.999Z') 
        };
    }, [globalDateRange]);

    const durationMs = dateEnd.getTime() - dateStart.getTime();
    const prevEnd = new Date(dateStart.getTime() - 1);
    const prevStart = new Date(dateStart.getTime() - durationMs);
    const _diffDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

    const inRange = (dRaw, s, e) => {
        if (!dRaw) return false;
        const d = new Date(dRaw);
        return d >= s && d <= e;
    };

    const { data: gaData } = useData().analyticsData || {};

    // Calculate P&L metrics exactly mirroring Dashboard logic
    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        const calcSet = (s, e, gaTarget) => {
            const inPeriod = orders.filter(o => inRange(o.dateRaw || o.date, s, e));
            let grossCiro = 0; let netCiro = 0; let cogs = 0; let commission = 0; let shipping = 0; 
            let returns = 0; let refundAmt = 0; let totalKdv = 0;
            
            inPeriod.forEach(o => {
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'İptal' || o.statusObj?.label === 'CANCELLED' || o.statusObj?.label === 'REFUNDED';
                if (isReturn) {
                    returns++;
                    refundAmt += Math.abs(o.revenue || 0);
                    shipping += o.shipping || 0; // Kargo zararı şirkete yazdırılır
                } else {
                    netCiro += o.revenue || 0;
                    grossCiro += o.grossRevenue || o.revenue || 0;
                    cogs += o.cogs || 0;
                    commission += o.commission || 0;
                    shipping += o.shipping || 0;
                    totalKdv += o.tax || 0;
                }
            });

            const pDays = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));

            // 1. SABİT GİDERLER (OpEx) VE FİNANSMAN/Aylık Vergiler
            let opEx = 0; let finEx = 0; let statTaxEx = 0;
            expensesData.filter(ex => ex.valueType === 'amount').forEach(ex => {
                const daily = calculateDailyExpense(ex);
                if (ex.category === 'finance') finEx += daily;
                else if (ex.category === 'tax') statTaxEx += daily; // Kurumlar/Stopaj static tax
                else opEx += daily; // Kira, yazılım, ofis vb.
            });
            opEx *= pDays;
            finEx *= pDays;
            statTaxEx *= pDays;

            // 2. REKLAM GİDERİ (Ad Spend)
            // Eğer önceki dönemse (gaTarget = null/mock) tahmini oransal yazıyoruz, cari dönemse gerçek gaData alıyoruz.
            let adSpend = gaTarget ? (gaTarget.totalAdCost || 0) : ((netCiro * 0.04) || 0); // fallback %4 adspend

            // 3. KÂRLILIK HUNİSİ (DASHBOARD ILE BIREBIR AYNI)
            const brütKar = netCiro - cogs;
            // FAVÖK (EBITDA) = Brüt Kar - (Komisyon + Kargo + Reklam + OpEx)
            const faaliyetKarı = brütKar - commission - shipping - adSpend - opEx;
            // NET KAR = FAVÖK - (Sipariş Net KDV'si + Sabit Vergi Çıktıları + Finansman/Faiz)
            const netKar = faaliyetKarı - totalKdv - statTaxEx - finEx;

            return { 
                grossCiro, netCiro, cogs, commission, shipping, refundAmt, returns, 
                opEx, adSpend, finEx, taxEx: totalKdv + statTaxEx, 
                brütKar, faaliyetKarı, netKar, count: inPeriod.length 
            };
        };

        const current = calcSet(dateStart, dateEnd, gaData);
        const prev = calcSet(prevStart, prevEnd, null);

        return { current, prev };
    }, [orders, dateStart, dateEnd, prevStart, prevEnd, gaData]);

    const hasAnyData = useMemo(() => orders?.length > 0, [orders]);

    if (!hasAnyData) {
        return <EmptyState title="P&L Analizi Verisi Yok" message="İlk satış veya sipariş geldiğinde bu rapor detaylı satır bazlı kâr zarar dökecektir." />;
    }

    if (!metrics) return null; 

    const { current, prev } = metrics;

    // Delta Calculators
    const calcPct = (c, p) => p !== 0 ? (((c - p) / Math.abs(p)) * 100) : 100;
    const formatDelta = (val) => val > 0 ? `+${pct(val)}` : pct(val);
    
    // Brüt Kar Marjı: Ürün doğrudan brüt karı (Mevcut Dashboard Tooltip'ine uygun: "Ciro - COGS")
    const curMargin = current.netCiro ? (current.brütKar / current.netCiro) * 100 : 0;
    const prevMargin = prev.netCiro ? (prev.brütKar / prev.netCiro) * 100 : 0;

    // --- Chart Data ---

    // 2. Trend (Dynamic Last 6 Months)
    const trendData = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        
        // Prepare daily overhead burdens
        let dailyOpEx = 0; let dailyFinEx = 0; let dailyTaxEx = 0;
        expensesData.filter(ex => ex.valueType === 'amount').forEach(ex => {
            const daily = calculateDailyExpense(ex);
            if (ex.category === 'finance') dailyFinEx += daily;
            else if (ex.category === 'tax') dailyTaxEx += daily;
            else dailyOpEx += daily;
        });

        const months = [];
        const endDate = new Date(dateEnd);
        for (let i = 5; i >= 0; i--) {
            const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
            const name = d.toLocaleDateString('tr-TR', { month: 'short' });
            const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            months.push({ 
                year: d.getFullYear(), month: d.getMonth(), name, daysInMonth, 
                ciro: 0, cogs: 0, commission: 0, shipping: 0, taxKdv: 0 
            });
        }

        orders.forEach(o => {
            const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'İptal' || o.statusObj?.label === 'CANCELLED' || o.statusObj?.label === 'REFUNDED';
            const od = new Date(o.dateRaw || o.date);
            const bucket = months.find(m => m.year === od.getFullYear() && m.month === od.getMonth());
            
            if (bucket) {
                if (isReturn) {
                    bucket.shipping += (o.shipping || 0); // Kargo zararı kalır
                } else {
                    bucket.ciro += (o.revenue || 0);
                    bucket.cogs += (o.cogs || 0);
                    bucket.commission += (o.commission || 0);
                    bucket.shipping += (o.shipping || 0);
                    bucket.taxKdv += (o.tax || 0);
                }
            }
        });

        return months.map(m => {
            const opEx = dailyOpEx * m.daysInMonth;
            const finEx = dailyFinEx * m.daysInMonth;
            const statTaxEx = dailyTaxEx * m.daysInMonth;
            const adSpend = m.ciro * 0.04; // Mock/Fallback %4 historic adspend

            const brütKar = m.ciro - m.cogs;
            // FAVÖK
            const faaliyetKarı = brütKar - m.commission - m.shipping - adSpend - opEx;
            // NET KAR
            const netKar = faaliyetKarı - m.taxKdv - statTaxEx - finEx;

            // Strict Net Kâr Marjı Calculation
            const margin = m.ciro > 0 ? (netKar / m.ciro) * 100 : 0;
            return {
                name: m.name,
                ciro: m.ciro,
                margin: Number(margin.toFixed(1))
            };
        });
    }, [orders, dateEnd]);

    // 3. Channels PnL (API-Only Detailed View)
    const channelRawMap = {};
    orders.filter(o => inRange(o.dateRaw || o.date, dateStart, dateEnd)).forEach(o => {
        if (o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED' || o.statusObj?.label === 'İptal' || o.statusObj?.label === 'REFUNDED') return;
        const cn = o.channel || 'Diğer';
        if (!channelRawMap[cn]) {
            channelRawMap[cn] = { revenue: 0, cogs: 0, commission: 0, shipping: 0, tax: 0 };
        }
        channelRawMap[cn].revenue += o.revenue || 0;
        channelRawMap[cn].cogs += o.cogs || 0;
        channelRawMap[cn].commission += o.commission || 0;
        channelRawMap[cn].shipping += o.shipping || 0;
        // Siparişlerin KDV harcamaları hesaplanarak tax alanına eklenebilir. Şu an tax'i pas geçiyoruz cogs/commission/shipping yeterli.
    });

    const channelPnLData = Object.keys(channelRawMap).map(k => {
        const d = channelRawMap[k];
        const costs = d.cogs + d.commission + d.shipping; // API'den gelen core maliyetler
        const brütKar = d.revenue - costs; // Kanal Brüt Katkısı
        return {
            name: k,
            revenue: d.revenue,
            cogs: d.cogs,
            commission: d.commission,
            shipping: d.shipping,
            brütKar: brütKar,
            margin: d.revenue > 0 ? (brütKar / d.revenue) * 100 : 0
        };
    }).sort((a,b) => b.revenue - a.revenue);

    const totalPzKomisyon = channelPnLData.reduce((acc, ch) => acc + ch.commission, 0);
    const totalKargoMaliyet = channelPnLData.reduce((acc, ch) => acc + ch.shipping, 0);

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Net Ciro" 
                    value={fmt(current.netCiro)} 
                    delta={formatDelta(calcPct(current.netCiro, prev.netCiro))}
                    tone={calcPct(current.netCiro, prev.netCiro) > 0 ? 'positive' : 'negative'}
                    previousValueStr={`Geçen Dönem: ${fmt(prev.netCiro)}`}
                />
                <KpiCard 
                    title="Brüt Kar Marjı" 
                    value={pct(curMargin)} 
                    delta={curMargin - prevMargin > 0 ? `+${pct(curMargin - prevMargin)} pp` : `${pct(curMargin - prevMargin)} pp`}
                    tone={curMargin > 30 ? 'positive' : (curMargin > 15 ? 'warning' : 'negative')}
                    previousValueStr={`Geçen Dönem: ${pct(prevMargin)}`}
                />
                <KpiCard 
                    title="Faaliyet Karı" 
                    value={fmt(current.faaliyetKarı)} 
                    delta={formatDelta(calcPct(current.faaliyetKarı, prev.faaliyetKarı))}
                    tone={current.faaliyetKarı > 0 ? 'positive' : 'negative'}
                    previousValueStr={`Geçen Dönem: ${fmt(prev.faaliyetKarı)}`}
                />
                <KpiCard 
                    title="Net Kar" 
                    value={fmt(current.netKar)} 
                    delta={formatDelta(calcPct(current.netKar, prev.netKar))}
                    tone={current.netKar > 0 ? 'positive' : 'negative'}
                    previousValueStr={`Geçen Dönem: ${fmt(prev.netKar)}`}
                />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 h-[400px]">
                <ChartCard 
                    title="Aylık Trend (Gelir vs Marj)"
                    tooltip="Bu grafik, API'deki gerçek siparişlerinizin Net Ciro hacmini (Açık Mor Barlar) ve gerçekleşen Brüt Kâr Marjını (Yeşil Çizgi) gösterir. Not: İlk 3 ayın düz çizgi (0) görünmesi, sisteme entegre edilen API'nin varsayılan olarak yalnızca son 90 günlük veriyi indirmesinden kaynaklanır."
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 10, fill: '#B4B4C8' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `%${v}`} tick={{ fontSize: 10, fill: C.success }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    formatter={(value, name) => [name === 'ciro' ? fmt(value) : pct(value), name === 'ciro' ? 'Net Ciro' : 'Kar Marjı']}
                                    labelStyle={{ color: '#0F1223', fontWeight: 'bold' }}
                                />
                                <Bar yAxisId="left" dataKey="ciro" fill="#ECE9FF" radius={[4,4,0,0]} barSize={30} />
                                <Line yAxisId="right" type="monotone" dataKey="margin" stroke={C.success} strokeWidth={3} dot={{ r: 4, fill: C.success, strokeWidth: 2, stroke: '#fff' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Kanal P&L Katkısı (Ünite Ekonomisi)"
                    tooltip="Kanalların şirket sabit giderlerinden bağımsız olarak; ürün SMM, Kargo ve Pazaryeri Komisyonu düşüldükten sonra şirkete (Banka hesabına) bıraktıkları Brüt Katkı Payı'nı (Kâr Tutarını) gösterir."
                    chart={
                        channelPnLData.length === 0 ? <EmptyState title="Veri Bulunamadı" /> :
                        <div className="flex flex-col gap-5 overflow-y-auto pr-2 pb-2 h-full">
                            {channelPnLData.map((ch, idx) => (
                                <div key={idx} className="flex flex-col group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-2">
                                            {ch.name.toLowerCase().includes('trendyol') ? <div className="w-6 h-6 rounded bg-[#F27A1A] flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent group-hover:ring-[#F27A1A]/30 transition-all">T</div> : <div className="w-6 h-6 rounded bg-[#0F1223] flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent group-hover:ring-[#0F1223]/30 transition-all">i</div>}
                                            <span className="font-bold text-[#0F1223] text-[13px]">{ch.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={ch.margin > 0 ? "text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded mr-2" : "text-[10px] font-bold text-[#EF4444] bg-[#FEF2F2] px-1.5 py-0.5 rounded mr-2"}>% {ch.margin.toFixed(1)} Marj</span>
                                            <span className="text-[13px] font-bold text-[#0F1223]">{fmt(ch.revenue)} Ciro</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-[6px] rounded-full overflow-hidden flex bg-[#F4F4F8] mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity" title="Yeşil: Katkı Payı, Gri: SMM, Turuncu: Komisyon, Kırmızı: Kargo">
                                        <div style={{ width: `${Math.max(0, (ch.brütKar / (ch.revenue || 1)) * 100)}%` }} className="bg-[#10B981] h-full" />
                                        <div style={{ width: `${(ch.cogs / (ch.revenue || 1)) * 100}%` }} className="bg-[#B4B4C8] h-full border-l border-white/50" />
                                        <div style={{ width: `${(ch.commission / (ch.revenue || 1)) * 100}%` }} className="bg-[#F59E0B] h-full border-l border-white/50" />
                                        <div style={{ width: `${(ch.shipping / (ch.revenue || 1)) * 100}%` }} className="bg-[#EF4444] h-full border-l border-white/50" />
                                    </div>
                                    <div className="flex justify-between text-[9px] uppercase font-bold text-[#7D7DA6]">
                                        <span className={ch.brütKar > 0 ? "text-[#10B981]" : "text-[#EF4444]"}>Katkı {fmt(ch.brütKar)}</span>
                                        <div className="flex gap-2.5">
                                            <span title="Ürün SMM (COGS)">SMM {fmt(ch.cogs)}</span>
                                            <span className="text-[#F59E0B]" title="Pazaryeri Komisyonu (KDV dâhil değil)">Kom. {fmt(ch.commission)}</span>
                                            <span className="text-[#EF4444]" title="Kargo">Kargo {fmt(ch.shipping)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-auto pt-2">
                                <InsightCard 
                                    type="alert" 
                                    title="Toplam Görünmez Giderler" 
                                    body={<span>Bu dönem kanalların toplamından <b>{fmt(totalPzKomisyon)}</b> Pazaryeri Komisyonu ve <b>{fmt(totalKargoMaliyet)}</b> Kargo Maliyeti şirketten çıktı.</span>} 
                                />
                            </div>
                        </div>
                    }
                />
            </div>

            {/* TABLOLAR */}
            <TableCard
                title="P&L Satır Bazlı Detaylı Tablo"
                columns={[
                    { key: 'kalem', label: 'Kalem', align: 'left', className: 'font-semibold' },
                    { key: 'cur', label: 'Bu Dönem', align: 'right' },
                    { key: 'prev', label: 'Önceki Dönem', align: 'right' },
                    { key: 'delta', label: 'Değişim (₺)', align: 'right' },
                    { key: 'deltaPct', label: 'Değişim (%)', align: 'right' },
                    { key: 'ratio', label: '% of Ciro', align: 'right' },
                ]}
                rows={[
                    { kalem: 'BRÜT SATIŞ', cur: fmt(current.grossCiro || current.netCiro), prev: fmt(prev.grossCiro || prev.netCiro), delta: fmt((current.grossCiro || current.netCiro) - (prev.grossCiro || prev.netCiro)), deltaPct: <span className="px-2 py-1 bg-[#F0F9FF] text-[#0EA5E9] font-bold rounded">{formatDelta(calcPct(current.grossCiro || current.netCiro, prev.grossCiro || prev.netCiro))}</span>, ratio: pct(((current.grossCiro || current.netCiro)/(current.netCiro || 1))*100) },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) İade ve İndirimler', cur: fmt((current.grossCiro || current.netCiro) - current.netCiro), prev: fmt((prev.grossCiro || prev.netCiro) - prev.netCiro), delta: fmt(((current.grossCiro || current.netCiro) - current.netCiro) - ((prev.grossCiro || prev.netCiro) - prev.netCiro)), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct((current.grossCiro || current.netCiro) - current.netCiro, (prev.grossCiro || prev.netCiro) - prev.netCiro))}</span>, ratio: pct((((current.grossCiro || current.netCiro) - current.netCiro) / (current.netCiro || 1))*100) },
                    { rowClassName: 'bg-slate-50 border-y border-slate-200', kalem: <span className="font-bold underline underline-offset-2">NET CİRO</span>, cur: <span className="font-bold">{fmt(current.netCiro)}</span>, prev: <span className="font-bold">{fmt(prev.netCiro)}</span>, delta: <span className="font-bold">{fmt(current.netCiro - prev.netCiro)}</span>, deltaPct: <span className={current.netCiro > prev.netCiro ? "px-2 py-1 bg-emerald-50 text-emerald-600 font-bold rounded" : "px-2 py-1 bg-red-50 text-red-600 font-bold rounded"}>{formatDelta(calcPct(current.netCiro, prev.netCiro))}</span>, ratio: <span className="font-bold">{pct(100)}</span> },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) Ürün Alış/Üretim (COGS)', cur: fmt(current.cogs), prev: fmt(prev.cogs), delta: fmt(current.cogs - prev.cogs), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct(current.cogs, prev.cogs))}</span>, ratio: pct((current.cogs / (current.netCiro || 1))*100) },
                    { rowClassName: 'bg-indigo-50/50 border-y border-indigo-100', kalem: <span className="font-bold text-[#514BEE]">BRÜT KÂR</span>, cur: <span className="font-bold text-[#514BEE]">{fmt(current.brütKar)}</span>, prev: <span className="font-bold text-[#514BEE]">{fmt(prev.brütKar)}</span>, delta: <span className="font-bold text-[#514BEE]">{fmt(current.brütKar - prev.brütKar)}</span>, deltaPct: <span className="px-2 py-1 bg-[#ECE9FF] text-[#514BEE] font-bold rounded">{formatDelta(calcPct(current.brütKar, prev.brütKar))}</span>, ratio: <span className="font-bold text-[#514BEE]">{pct((current.brütKar / (current.netCiro || 1))*100)}</span> },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) Pazaryeri Komisyonu', cur: fmt(current.commission), prev: fmt(prev.commission), delta: fmt(current.commission - prev.commission), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct(current.commission, prev.commission))}</span>, ratio: pct((current.commission / (current.netCiro || 1))*100) },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) Kargo (İadeler Dahil)', cur: fmt(current.shipping), prev: fmt(prev.shipping), delta: fmt(current.shipping - prev.shipping), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct(current.shipping, prev.shipping))}</span>, ratio: pct((current.shipping / (current.netCiro || 1))*100) },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) Dijital Pazarlama / Reklam', cur: fmt(current.adSpend), prev: fmt(prev.adSpend), delta: fmt(current.adSpend - prev.adSpend), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct(current.adSpend, prev.adSpend))}</span>, ratio: pct((current.adSpend / (current.netCiro || 1))*100) },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) Şirket Sabit / Genel (OpEx)', cur: fmt(current.opEx), prev: fmt(prev.opEx), delta: fmt(current.opEx - prev.opEx), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct(current.opEx, prev.opEx))}</span>, ratio: pct((current.opEx / (current.netCiro || 1))*100) },
                    { rowClassName: 'bg-amber-50/50 border-y border-amber-100', kalem: <span className="font-bold text-[#0F1223]">FAALİYET KÂRI (EBITDA)</span>, cur: <span className="font-bold">{fmt(current.faaliyetKarı)}</span>, prev: <span className="font-bold">{fmt(prev.faaliyetKarı)}</span>, delta: <span className="font-bold">{fmt(current.faaliyetKarı - prev.faaliyetKarı)}</span>, deltaPct: <span className="text-[#0F1223] font-bold">{formatDelta(calcPct(current.faaliyetKarı, prev.faaliyetKarı))}</span>, ratio: <span className="font-bold">{pct((current.faaliyetKarı / (current.netCiro || 1))*100)}</span> },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) Ödenecek Çıkan KDV (Net)', cur: fmt(current.taxEx), prev: fmt(prev.taxEx), delta: fmt(current.taxEx - prev.taxEx), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct(current.taxEx, prev.taxEx))}</span>, ratio: pct((current.taxEx / (current.netCiro || 1))*100) },
                    { kalem: '\u00A0\u00A0\u00A0\u00A0(-) Finansman / Faiz', cur: fmt(current.finEx), prev: fmt(prev.finEx), delta: fmt(current.finEx - prev.finEx), deltaPct: <span className="text-[#7D7DA6] font-medium">{formatDelta(calcPct(current.finEx, prev.finEx))}</span>, ratio: pct((current.finEx / (current.netCiro || 1))*100) },
                    { rowClassName: 'bg-emerald-50/50 border-y border-emerald-100', kalem: <span className="font-extrabold text-xl text-[#10B981]">NET KÂR</span>, cur: <span className="font-extrabold text-xl text-[#10B981]">{fmt(current.netKar)}</span>, prev: <span className="font-extrabold text-xl text-[#10B981]">{fmt(prev.netKar)}</span>, delta: <span className="font-extrabold text-xl text-[#10B981]">{fmt(current.netKar - prev.netKar)}</span>, deltaPct: <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-extrabold rounded-lg">{formatDelta(calcPct(current.netKar, prev.netKar))}</span>, ratio: <span className="font-extrabold text-xl text-[#10B981]">{pct((current.netKar / (current.netCiro || 1))*100)}</span> }
                ]}
            />

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard type="alert" title="Aykırı Değer" body="Bu dönem iade ürün hacminizde %18 yukarı yönlü kırılma var. 'Trendyol' kanalı iadeleri forse ediyor." action={{label: 'Kanal Raporunu Gör →', onClick: () => {}}} />
                <InsightCard type="trend" title="Kar Marjı İyileşiyor" body="Operasyon giderlerinin ciroya oranı %12'den %8'e düştü, ölçek ekonomisi Brüt Kar'a yansımaya başladı." />
                <InsightCard type="suggestion" title="Tasarruf Önerisi" body="Toplam nakliyeniz (kargo) brüt satışların %14'üne erişti. Anlaşmanızı yukarı hacim baremiyle güncelleyin." />
            </div>

        </div>
    );
};
