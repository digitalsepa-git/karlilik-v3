import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, StatusDot } from './SharedOperationComponents';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const ShippingLogisticsTab = () => {
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        let totalShipmentCost = 0;
        let totalRevenue = 0;
        let totalOrders = 0;
        
        const channelData = {};
        const statusData = {};
        const tableDataMap = {};

        orders.forEach(o => {
            if (o.statusObj?.label === 'İptal' || o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED') return;
            
            totalOrders++;
            totalShipmentCost += (o.shipping || 0);
            totalRevenue += (o.revenue || 0);
            
            // Channel aggregation
            if (!channelData[o.channel]) {
                channelData[o.channel] = { count: 0, cost: 0, revenue: 0, color: o.channelColor || '#514BEE' };
            }
            channelData[o.channel].count++;
            channelData[o.channel].cost += (o.shipping || 0);
            channelData[o.channel].revenue += (o.revenue || 0);

            // Funnel / Status aggregation
            const st = o.statusObj?.label || 'Bilinmiyor';
            if (!statusData[st]) statusData[st] = 0;
            statusData[st]++;

            // Table grouping by channel & category
            const key = `${o.channel}_${o.category}`;
            if (!tableDataMap[key]) {
                tableDataMap[key] = { channel: o.channel, category: o.category, count: 0, cost: 0, rev: 0, color: o.channelColor || '#000' };
            }
            tableDataMap[key].count++;
            tableDataMap[key].cost += (o.shipping || 0);
            tableDataMap[key].rev += (o.revenue || 0);
        });

        if (totalOrders === 0) return { insufficient: true };

        const avgShipping = totalOrders > 0 ? totalShipmentCost / totalOrders : 0;
        const shippingRatio = totalRevenue > 0 ? (totalShipmentCost / totalRevenue) * 100 : 0;

        // Pie Chart: Kanal Bazlı Maliyet
        const pieData = Object.keys(channelData).map(k => ({
            name: k,
            value: channelData[k].cost,
            count: channelData[k].count,
            color: channelData[k].color
        })).sort((a,b) => b.value - a.value);

        // Bar Chart (Funnel)
        const predefinedOrder = { 'İşleniyor': 1, 'Paketlendi': 2, 'Kargoya Verildi': 3, 'Dağıtımda': 4, 'Teslim Edildi': 5, 'Tamamlandı': 6 };
        
        const funnelProps = Object.keys(statusData).map(k => ({
            aşama: k,
            adet: statusData[k],
            orderVal: predefinedOrder[k] || 99
        })).sort((a,b) => a.orderVal - b.orderVal);

        const funnelColors = ['#E0DDFF', '#C4B5FD', '#A78BFA', '#8B5CF6', '#6D28D9', '#4C1D95'];
        funnelProps.forEach((f, i) => { f.renk = funnelColors[Math.min(i, funnelColors.length - 1)]; });

        const tableData = Object.values(tableDataMap).map(t => ({
            ...t,
            avgCost: t.count > 0 ? t.cost / t.count : 0,
            ratio: t.rev > 0 ? (t.cost / t.rev) * 100 : 0
        })).sort((a,b) => b.cost - a.cost);

        return { totalOrders, totalShipmentCost, avgShipping, shippingRatio, pieData, funnelProps, tableData };
    }, [orders]);

    if (!metrics) return <EmptyState title="Lojistik Verisi Yok" message="Kargo maliyetleri hesaplanamadı." />;
    if (metrics.insufficient) return <EmptyState title="Yetersiz Veri" message="Bu dönemde kargo maliyeti yansıtılabilecek geçerli sipariş bulunamadı." />;

    const { totalOrders, totalShipmentCost, avgShipping, shippingRatio, pieData, funnelProps, tableData } = metrics;

    const CustomTooltipPie = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-[#EDEDF0] shadow-lg rounded-xl text-xs">
                    <p className="font-bold mb-1" style={{color: data.color}}>{data.name}</p>
                    <p>Sipariş: <span className="font-bold">{data.count}</span></p>
                    <p>Toplam Kargo Gideri: <span className="font-bold text-[#EF4444]">{fmt(data.value)}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start text-sm text-blue-800">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Hibrit Kargo Maliyeti Hesaplaması</h4>
                    <p className="leading-relaxed opacity-90">
                        Kargo firmaları ve pazaryerleri faturalarını genellikle 15-30 günlük gecikmelerle yansıtır. Finansal analizlerinizin anlık doğrulukta kalması için sistemimiz; faturalanmış geçmiş siparişlerinizde <b>gerçekleşen kesin kesinti tutarını</b> kullanırken, faturası henüz düşmemiş güncel siparişlerinizde ürünün desi/hacim bilgisine dayalı <b>tahakkuk değerini (öngörülen maliyet)</b> baz almaktadır.
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam İşlenen Gönderi" value={totalOrders} delta="Aktif & Tamamlanan" tone="neutral" />
                <KpiCard title="Toplam Kargo Maliyeti" value={fmt(totalShipmentCost)} delta="Brüt Kargo Gideri" tone="negative" />
                <KpiCard title="Sipariş Başı Ortalama Kargo" value={fmt(avgShipping)} delta="Ağırlıklı Ortalama" tone="neutral" />
                <KpiCard title="Lojistik Ciro Yükü" value={pct(shippingRatio)} delta="Kargo Gideri / Brüt Ciro" tone={shippingRatio > 15 ? "negative" : "positive"} />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <ChartCard 
                    title="Kanal Bazlı Lojistik Maliyetleri"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltipPie />} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-[#0F1223]">{fmt(totalShipmentCost)}</text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-[#7D7DA6]">Toplam Gider</text>
                            </PieChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Sipariş Durum Hunisi (Canlı Statüler)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelProps} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="aşama" type="category" tick={{ fontSize: 11, fill: '#0F1223', fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val) => [`${val} sipariş`, 'Adet']} cursor={{fill: '#FAFAFB'}} />
                                <Bar dataKey="adet" radius={[0, 4, 4, 0]} barSize={24}>
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
                title="Kanal & Kategori Bazlı Kargo Maliyeti Dağılımı"
                pageSize={10}
                columns={[
                    { key: 'kanal', label: 'Kanal', align: 'left' },
                    { key: 'kategori', label: 'Kategori', align: 'left' },
                    { key: 'hacim', label: 'Sipariş Hacmi', align: 'right' },
                    { key: 'toplam', label: 'Toplam Kargo Maliyeti', align: 'right' },
                    { key: 'ortalama', label: 'Sipariş Başı (Ort)', align: 'right' },
                    { key: 'oran', label: 'Ciroya Oranı (Yük)', align: 'right' }
                ]}
                rows={tableData.map(r => ({
                    kanal: (
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                            <span className="font-bold text-[#0F1223]">{r.channel}</span>
                        </div>
                    ),
                    kategori: <span className="font-semibold text-[#0F1223] text-xs">{r.category}</span>,
                    hacim: <span className="font-medium text-[#0F1223]">{r.count}</span>,
                    toplam: <span className="font-bold text-[#EF4444]">{fmt(r.cost)}</span>,
                    ortalama: <span className="font-semibold text-[#0F1223]">{fmt(r.avgCost)}</span>,
                    oran: <span className={`px-2 py-1 text-xs font-bold rounded ${r.ratio > 15 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{pct(r.ratio)}</span>
                }))}
            />

        </div>
    );
};
