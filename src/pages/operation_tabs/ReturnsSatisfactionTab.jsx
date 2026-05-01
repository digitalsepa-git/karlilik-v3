import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, C } from './SharedOperationComponents';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

const CHANNEL_HEX_COLORS = {
    'Trendyol': '#F97316',
    'Hepsiburada': '#F59E0B',
    'Amazon': '#CA8A04',
    'ikas': '#4F46E5',
    'Web': '#4F46E5'
};

export const ReturnsSatisfactionTab = () => {
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        let totalOrders = 0;
        let returnsCount = 0;
        let lostRevenue = 0;

        const channelData = {};
        const skuDataMap = {};

        orders.forEach(o => {
            totalOrders++;
            
            // Normalize status strings
            const st = o.statusObj?.label?.toUpperCase() || '';
            const isReturnOrCancel = st.includes('İADE') || st.includes('İPTAL') || st.includes('CANCEL') || st.includes('RETURN');

            if (isReturnOrCancel) {
                returnsCount++;
                lostRevenue += (o.revenue || 0);

                // Aggregate by channel
                if (!channelData[o.channel]) {
                    channelData[o.channel] = { count: 0, lostRevenue: 0, color: CHANNEL_HEX_COLORS[o.channel] || '#514BEE' };
                }
                channelData[o.channel].count++;
                channelData[o.channel].lostRevenue += (o.revenue || 0);

                // Aggregate by SKU (assuming primary SKU)
                const sku = o.sku || 'Bilinmiyor';
                if (!skuDataMap[sku]) {
                    skuDataMap[sku] = { 
                        sku: sku, 
                        name: o.productName, 
                        image: o.productImage, 
                        category: o.category,
                        returnCount: 0, 
                        lostRevenue: 0 
                    };
                }
                skuDataMap[sku].returnCount++;
                skuDataMap[sku].lostRevenue += (o.revenue || 0);
            }
        });

        const returnRate = totalOrders > 0 ? (returnsCount / totalOrders) * 100 : 0;
        const avgReturnAmount = returnsCount > 0 ? lostRevenue / returnsCount : 0;

        // Pie Data (Channel Distribution)
        const pieData = Object.keys(channelData).map(k => ({
            name: k,
            value: channelData[k].count, // Use count for pie portions
            lostRevenue: channelData[k].lostRevenue,
            color: channelData[k].color
        })).sort((a,b) => b.value - a.value);

        // Table Data (Top Returned SKUs)
        const tableData = Object.values(skuDataMap)
            .sort((a, b) => b.returnCount - a.returnCount) // Sort by return count descending
            .slice(0, 50); // Top 50 returned items

        return { totalOrders, returnsCount, lostRevenue, returnRate, avgReturnAmount, pieData, tableData };
    }, [orders]);

    if (!metrics) return <EmptyState title="Veri Yok" message="İptal veya iade analizi yapılabilecek sipariş bulunamadı." />;

    const { totalOrders, returnsCount, lostRevenue, returnRate, avgReturnAmount, pieData, tableData } = metrics;

    if (returnsCount === 0) {
        return (
            <div className="p-8 h-[60vh] flex flex-col items-center justify-center animate-in fade-in max-w-[1440px] mx-auto w-full">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F1223] mb-2">Harika Haber!</h3>
                <p className="text-[#7D7DA6] text-center max-w-md">Seçili dönemde hiçbir siparişiniz iptal veya iade edilmemiş. Müşteri memnuniyetiniz ve ürün kaliteniz zirvede.</p>
            </div>
        );
    }

    const CustomTooltipPie = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-[#EDEDF0] shadow-lg rounded-xl text-xs">
                    <p className="font-bold mb-1" style={{color: data.color}}>{data.name}</p>
                    <p>İptal/İade Sayısı: <span className="font-bold">{data.value} Adet</span></p>
                    <p>Kaybedilen Ciro: <span className="font-bold text-[#EF4444]">{fmt(data.lostRevenue)}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam İptal/İade Oranı" value={pct(returnRate)} delta={`${returnsCount} / ${totalOrders} Sipariş`} tone={returnRate > 5 ? "negative" : "positive"} />
                <KpiCard title="Toplam İptal/İade Adedi" value={returnsCount} delta="İptal edilen net sipariş" tone="warning" />
                <KpiCard title="Kaybedilen Ciro (Brüt)" value={fmt(lostRevenue)} delta="İadelerden dolayı oluşan ciro kaybı" tone="negative" />
                <KpiCard title="Ortalama İade Tutarı" value={fmt(avgReturnAmount)} delta="İade başına kaybedilen" tone="neutral" />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[400px]">
                <ChartCard 
                    title="Kanal Bazlı İptal/İade Dağılımı"
                    className="lg:col-span-1"
                    chart={
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltipPie />} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-[#EF4444]">{returnsCount}</text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-[#7D7DA6]">İptal/İade</text>
                            </PieChart>
                        </ResponsiveContainer>
                    }
                />
                
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                    <TableCard
                        title="En Çok İptal/İade Edilen Ürünler (SKU)"
                        pageSize={5}
                        columns={[
                            { key: 'urun', label: 'Ürün', align: 'left' },
                            { key: 'sku', label: 'SKU / Model', align: 'left' },
                            { key: 'kategori', label: 'Kategori', align: 'left' },
                            { key: 'adet', label: 'İade Adedi', align: 'right' },
                            { key: 'ciro', label: 'Kayıp Ciro', align: 'right' }
                        ]}
                        rows={tableData.map((r, i) => ({
                            urun: (
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-[#7D7DA6] font-bold w-4">{i + 1}.</span>
                                    <img src={r.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                                    <span className="font-medium text-[#0F1223] truncate max-w-[200px]" title={r.name}>{r.name}</span>
                                </div>
                            ),
                            sku: <span className="font-mono text-xs text-[#514BEE] bg-[#514BEE]/5 px-2 py-1 rounded">{r.sku}</span>,
                            kategori: <span className="text-sm text-[#7D7DA6]">{r.category}</span>,
                            adet: <span className="font-bold text-[#EF4444]">{r.returnCount}</span>,
                            ciro: <span className="font-medium text-[#0F1223]">{fmt(r.lostRevenue)}</span>
                        }))}
                    />
                </div>
            </div>

        </div>
    );
};
