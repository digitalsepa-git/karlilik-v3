import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, AlertStrip, AksiyonMerkezi, StatusDot } from './SharedOperationComponents';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';

const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const ShippingLogisticsTab = () => {
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        let totalLeadTime = 0, delayedCount = 0, shippedCount = 0;
        const carriersData = {
            'Yurtiçi Kargo': { count: 0, sCount: 0, lTime: 0, delay: 0 },
            'Aras Kargo': { count: 0, sCount: 0, lTime: 0, delay: 0 },
            'Trendyol Express': { count: 0, sCount: 0, lTime: 0, delay: 0 },
            'Hepsijet': { count: 0, sCount: 0, lTime: 0, delay: 0 }
        };

        const generateMockShipment = (o) => {
            const keys = Object.keys(carriersData);
            let carrier = keys[o.id.charCodeAt(o.id.length-1) % keys.length] || 'Yurtiçi Kargo';
            if (o.channel === 'Trendyol') carrier = 'Trendyol Express';
            
            // Randomize lead time between 18 and 180 hours
            const deliveryHours = Math.floor(Math.random() * 150) + 18;
            const slaLimit = 72;
            const delayed = deliveryHours > slaLimit;

            return { carrier, deliveryHours, slaLimit, delayed };
        };

        orders.forEach(o => {
            if (o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED') return;
            // ONLY completed or delivered orders
            if (o.statusObj?.label === 'Teslim Edildi' || o.statusObj?.label === 'Tamamlandı') {
                const s = generateMockShipment(o);
                totalLeadTime += s.deliveryHours;
                shippedCount++;
                if (s.delayed) delayedCount++;

                carriersData[s.carrier].count++;
                carriersData[s.carrier].sCount++;
                carriersData[s.carrier].lTime += s.deliveryHours;
                if (s.delayed) carriersData[s.carrier].delay++;
            }
        });

        if (shippedCount === 0) return { insufficient: true };

        const avgLeadTime = totalLeadTime / shippedCount;
        const slaSuccess = ((shippedCount - delayedCount) / shippedCount) * 100;

        const radarData = Object.keys(carriersData).map(k => {
            const item = carriersData[k];
            if (item.count === 0) return null;
            return {
                subject: k,
                HizNormal: 100 - (item.lTime / item.sCount) / 2, // normalized
                SlaUyumu: ((item.sCount - item.delay) / item.sCount) * 100,
                MaliyetNormal: Math.random() * 40 + 50,
                MusteriMemnuniyeti: Math.random() * 30 + 70,
                __rawAvgLead: item.lTime / item.sCount,
                __rawCount: item.count,
                __rawSla: ((item.sCount - item.delay) / item.sCount) * 100
            };
        }).filter(Boolean);

        // Dummy pipeline
        const funnelProps = [
            { aşama: 'Sipariş Alındı', oran: 100, renk: '#E0DDFF' },
            { aşama: 'Hazırlığa Alındı', oran: 99, renk: '#C4B5FD' },
            { aşama: 'Kargoya Verildi', oran: 96, renk: '#A78BFA' },
            { aşama: 'Dağıtımda', oran: 92, renk: '#8B5CF6' },
            { aşama: 'Teslim Edildi', oran: 88, renk: '#6D28D9' }
        ];

        const actions = [];
        const badCarrier = radarData.find(r => r.__rawSla < 85);
        if (badCarrier) {
            actions.push({ priority: 'acil', title: `${badCarrier.subject} SLA İhlali`, desc: `Teslimatların %${(100 - badCarrier.__rawSla).toFixed(1)}'si belirlenen SLA süresi (72sa) dışında gerçekleşti. Alternatif rotalama şart.`, cta: 'Rotalama Kuralları' });
        }
        actions.push({ priority: 'öneri', title: 'Hafta Sonu Yığılması', desc: 'Cumartesi oluşturulan siparişlerin Handling süresi +%45 daha uzun. Pazar yarım gün operasyon maliyet analizi önerilir.', cta: 'Simüle Et' });

        return { shippedCount, avgLeadTime, slaSuccess, radarData, funnelProps, actions };
    }, [orders]);

    if (!metrics) return <EmptyState title="Lojistik Verisi Yok" message="Kargo sağlayıcı API'lerinden veri alınamadı." />;
    if (metrics.insufficient) return <EmptyState title="Yetersiz Veri" message="Teslim edilmiş statüsüne ulaşan sipariş bulunamadı." />;

    const { shippedCount, avgLeadTime, slaSuccess, radarData, funnelProps, actions } = metrics;
    const sortedRadar = [...radarData].sort((a,b) => a.__rawAvgLead - b.__rawAvgLead);

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam Ulaşan Seçili Gönderi" value={shippedCount} delta="Son 30 gün" tone="neutral" />
                <KpiCard title="Ortalama Teslim Süresi" value={`${(avgLeadTime/24).toFixed(1)} gün`} delta="Uçtan uça" tone="positive" />
                <KpiCard title="SLA Zamanında Teslim" value={pct(slaSuccess)} delta="Hedef: %90" tone={slaSuccess > 90 ? "positive" : "negative"} />
                <KpiCard title="Kargo Başı Maliyet (Ort.)" value="₺ 44.5" delta="Gecen Aydan sabit" tone="neutral" />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <ChartCard 
                    title="Kargo Firma Performans Karşılaştırma"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={120} data={radarData}>
                                <PolarGrid stroke="#EDEDF0" />
                                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#7D7DA6', fontWeight: 600}} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Tooltip />
                                <Radar name="Hız Puanı" dataKey="HizNormal" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                                <Radar name="SLA Başarısı" dataKey="SlaUyumu" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Sipariş → Teslim Funnel"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelProps} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                <XAxis type="number" hide domain={[0, 100]} />
                                <YAxis dataKey="aşama" type="category" tick={{ fontSize: 11, fill: '#0F1223', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val) => `%${val} başarı`} cursor={{fill: '#FAFAFB'}} />
                                <Bar dataKey="oran" radius={[0, 4, 4, 0]} barSize={24}>
                                    {funnelProps.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.renk} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABLOLAR */}
            <TableCard
                title="Kargo Firmaları Karnesi (Master Tablo)"
                columns={[
                    { key: 'firma', label: 'Kargo Firması', align: 'left' },
                    { key: 'hacim', label: 'Hacim', align: 'right' },
                    { key: 'teslim', label: 'Ort. Teslim', align: 'right' },
                    { key: 'sla', label: 'SLA Uyumu', align: 'right' },
                    { key: 'islem', label: '', align: 'right' }
                ]}
                rows={sortedRadar.map(r => ({
                    firma: <span className="font-bold text-[#0F1223]">{r.subject}</span>,
                    hacim: r.__rawCount,
                    teslim: <span className={r.__rawAvgLead > 72 ? 'text-red-500 font-bold' : ''}>{(r.__rawAvgLead/24).toFixed(1)} gün</span>,
                    sla: <span className={`px-2 py-1 text-xs font-bold rounded ${r.__rawSla > 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{r.__rawSla.toFixed(1)}%</span>,
                    islem: <button className="text-xs font-bold text-[#514BEE] hover:text-[#4338CA]">Kuralları Aç</button>
                }))}
            />

            <AksiyonMerkezi actions={actions} />

        </div>
    );
};
