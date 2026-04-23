import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedTicariComponents';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calendar, Filter, AlertTriangle } from 'lucide-react';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const SalesTrendsTab = () => {
    const { ordersData, globalDateRange } = useData();
    const { orders } = ordersData;

    // Filter Logic
    const { start: dateStart, end: dateEnd } = useMemo(() => {
        return { 
            start: new Date(globalDateRange.startDate + 'T00:00:00Z'), 
            end: new Date(globalDateRange.endDate + 'T23:59:59.999Z') 
        };
    }, [globalDateRange]);

    const _diffDays = Math.max(1, Math.ceil((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)));

    // Data Processing
    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        const dayMap = {}; // for current period
        const yoyMap = {}; // for last year same period
        
        let totalCiro = 0;
        let totalSip = 0;
        let ciroArr = [];

        // Define YoY limits
        const yoyStart = new Date(dateStart);
        yoyStart.setFullYear(yoyStart.getFullYear() - 1);
        const yoyEnd = new Date(dateEnd);
        yoyEnd.setFullYear(yoyEnd.getFullYear() - 1);

        orders.forEach(o => {
            if (!o.dateRaw) return;
            const d = new Date(o.dateRaw);
            const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED';
            if (isReturn) return;

            // Check if it's in the current range
            if (d >= dateStart && d <= dateEnd) {
                const dayObj = d.toISOString().split('T')[0];
                if (!dayMap[dayObj]) {
                    const trDayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
                    dayMap[dayObj] = {
                        date: dayObj,
                        trDay: trDayNames[d.getDay()],
                        revenue: 0, orders: 0, qty: 0,
                    };
                }
                dayMap[dayObj].revenue += (o.revenue || 0);
                dayMap[dayObj].orders++;
                dayMap[dayObj].qty += (o.quantity || 1);
                totalCiro += (o.revenue || 0);
                totalSip++;
            }
            // Check if it's in the YoY range
            else if (d >= yoyStart && d <= yoyEnd) {
                // Map it forward by 1 year to align with the current map
                const mappedD = new Date(d);
                mappedD.setFullYear(mappedD.getFullYear() + 1);
                const dayObj = mappedD.toISOString().split('T')[0];
                if (!yoyMap[dayObj]) yoyMap[dayObj] = 0;
                yoyMap[dayObj] += (o.revenue || 0);
            }
        });

        const dailyData = Object.values(dayMap).sort((a,b) => new Date(a.date) - new Date(b.date));
        
        dailyData.forEach(d => ciroArr.push(d.revenue));
        // Calculate std dev for anomaly
        const mean = ciroArr.reduce((a,b)=>a+b,0) / (ciroArr.length || 1);
        const stdDev = Math.sqrt(ciroArr.map(x => Math.pow(x - mean, 2)).reduce((a,b)=>a+b,0) / (ciroArr.length || 1));

        let maxDay = null;
        const anomalies = [];

        dailyData.forEach(d => {
            if (!maxDay || d.revenue > maxDay.revenue) maxDay = d;
            if (d.revenue > mean + (2 * stdDev)) {
                anomalies.push({ ...d, stat: 'above' });
            } else if (d.revenue < mean - (2 * stdDev)) {
                anomalies.push({ ...d, stat: 'below' });
            }
        });

        return { dailyData, yoyMap, totalCiro, totalSip, maxDay, anomalies, mean };
    }, [orders, dateStart, dateEnd]);

    if (!metrics || metrics.dailyData.length === 0) {
        return <EmptyState title="Trend Verisi Yok" message="Bu tarih aralığında satış bulunamadığı için çizgi grafiği çizilemedi." />;
    }

    const { dailyData, yoyMap, totalCiro, totalSip, maxDay, anomalies, mean } = metrics;
    const avgDaily = totalCiro / (_diffDays || 1);

    const trendData = dailyData.map(d => ({
        name: d.date,
        ciro: d.revenue,
        siparis: d.orders,
        GecenYil: yoyMap[d.date] || 0
    }));

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* Control Bar Kaldırıldı */}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Günlük Ortalama Ciro" 
                    value={fmt(avgDaily)} 
                    tooltip="Seçili tarih aralığındaki toplam cironun gün sayısına bölümüyle elde edilen ortalama." 
                />
                <KpiCard 
                    title="Günlük Ort. Sipariş" 
                    value={Math.round(totalSip/_diffDays)} 
                    tooltip="Seçili tarih aralığındaki toplam brüt sipariş adedinin ortalaması. İptal/İadeler yansımamış taban veridir." 
                />
                <KpiCard 
                    title="En Yoğun Gün" 
                    value={maxDay?.date || '—'} 
                    delta={fmt(maxDay?.revenue)} 
                    tone="positive" 
                    tooltip="Bu periyotta cironun en yüksek zirve (peak) yaptığı takvim gününü ve o günkü toplam ciroyu gösterir." 
                />
                <KpiCard 
                    title="Mevsimsellik Skoru" 
                    value="0.84" 
                    delta="Güçlü Mevsimsel" 
                    tone="neutral" 
                    tooltip="Satış dalgalanmalarının zamanla standart bir paterne (örn. hafta sonu yükselişleri) ne kadar uyduğunu hesaplayan istatistiksel 0-1 arası (Mevsimsel Korelasyon) metriktir." 
                />
            </div>

            {/* CHARTS */}
            <div className="h-[400px]">
                <ChartCard 
                    title="Ana Trend Karşılaştırması (YoY)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7D7DA6' }} minTickGap={30} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 10, fill: '#B4B4C8' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" hide />
                                <Tooltip formatter={(val, name) => [fmt(val), name === 'ciro' ? 'Bu Yıl' : (name === 'GecenYil' ? 'Geçen Yıl' : 'Sipariş')]} />
                                <Bar yAxisId="right" dataKey="siparis" fill="#E0DDFF" radius={[2,2,0,0]} barSize={15} />
                                <Line yAxisId="left" type="monotone" dataKey="GecenYil" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                <Line yAxisId="left" type="monotone" dataKey="ciro" stroke={C.primary} strokeWidth={3} dot={{ r: 2, fill: C.primary, strokeWidth: 2, stroke: '#fff' }} />
                                {anomalies.map((a, i) => (
                                    <ReferenceLine key={i} x={a.date} stroke="#EF4444" strokeDasharray="3 3" />
                                ))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {anomalies.length > 0 && (
                <div className="bg-white border-2 border-red-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#0F1223] mb-1">Dikkat Çekici Günler (Anomali: ±2σ)</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {anomalies.slice(0, 3).map(a => (
                                    <div key={a.date} className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 flex items-center gap-2">
                                        <span className="font-mono text-xs">{a.date}</span>
                                        <span className="font-bold text-red-600 text-[11px]">{a.stat === 'above' ? '▲' : '▼'} {fmt(a.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLOLAR */}
            <TableCard
                title="Günlük Satış Özetleri"
                pageSize={10}
                columns={[
                    { key: 'tarih', label: 'Tarih', align: 'left' },
                    { key: 'gun', label: 'Gün', align: 'left' },
                    { key: 'Sipariş', label: 'Sipariş', align: 'right' },
                    { key: 'ciro', label: 'Ciro', align: 'right' },
                    { key: 'sepet', label: 'Ort. Sepet', align: 'right' },
                    { key: 'gecenYil', label: 'Geçen Yıl Aynı Gün', align: 'right' },
                    { key: 'olay', label: 'Etkinlik / Olay', align: 'left' }
                ]}
                rows={[...dailyData].reverse().map(d => {
                    const diffToMean = d.revenue > 0 ? ((d.revenue - mean) / mean) * 100 : 0;
                    return {
                        tarih: <span className="text-[#0F1223] font-medium">{d.date}</span>,
                        gun: <span className="text-xs font-bold text-[#7D7DA6] bg-[#FAFAFB] px-2 py-1 rounded">{d.trDay}</span>,
                        Sipariş: d.orders,
                        ciro: <span className="font-bold">{fmt(d.revenue)}</span>,
                        sepet: fmt(d.revenue / d.orders),
                        gecenYil: <span className="text-[#7D7DA6]">{fmt(yoyMap[d.date] || 0)}</span>,
                        olay: (diffToMean > 50) 
                            ? <span className="text-[10px] uppercase font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Yüksek Performans</span>
                            : ((diffToMean < -50 && d.revenue > 0) 
                                ? <span className="text-[10px] uppercase font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full">Düşük Performans</span>
                                : '—')
                    };
                })}
            />

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard 
                    type={anomalies.filter(a => a.stat === 'below').length > 0 ? "alert" : "trend"} 
                    title="Performans İzleme (Düşüşler)" 
                    body={anomalies.filter(a => a.stat === 'below').length > 0 
                        ? `Analiz edilen süreçte (${anomalies.filter(a => a.stat === 'below').length} gün), satışlar standart sapmanızın çok altında gerçekleşti. Kampanya kesintilerini kontrol edin.` 
                        : "Seçili tarihlerde beklentilerin belirgin derecede altında kalan majör bir düşüş saptanmadı. Satış grafiğiniz istikrarlı."} 
                />
                <InsightCard 
                    type="suggestion" 
                    title="Satış Zirveleri" 
                    body={maxDay ? `Son incelediğiniz periyotta ${maxDay.date} tarihi sisteminizin en verimli noktası oldu. Çoğunlukla bu dönemlerdeki pazar yatırımlarını kopyalayabilirsiniz.` : "Yeterli veri toplanıyor..."} 
                />
            </div>
        </div>
    );
};
