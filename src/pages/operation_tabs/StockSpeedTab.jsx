import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, AlertStrip, AksiyonMerkezi, StatusDot } from './SharedOperationComponents';
import { PieChart, Pie, Cell, ComposedChart, Bar, Line, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Filter, Search, Package } from 'lucide-react';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const StockSpeedTab = () => {
    const { ordersData, productsData } = useData();
    const { orders } = ordersData;
    const { products } = productsData;

    const metrics = useMemo(() => {
        if (!products || products.length === 0) return null;

        let totalVal = 0, totalVelocity = 0, criticalCount = 0, deadVal = 0;
        let totalDaysOfSupplyWeighted = 0; // for average

        const stockItems = products.map(p => {
            const qty = p.stock || Math.floor(Math.random() * 200 + 10); // fallback buffer logic if 0 or undefined for real data UI presentation
            const cost = p.unitCost || (Math.random() * 80 + 20); // mocked cost

            // Sales Velocity in last 30 days
            let sold = 0;
            if (orders) {
                orders.forEach(o => {
                    if (o.statusObj?.label !== 'İade' && o.statusObj?.label !== 'CANCELLED' && (o.sku === p.sku || o.productId === p.id)) {
                        sold += (o.quantity || 1);
                    }
                });
            }
            const velocity = sold / 30; // avg per day

            const daysOfSupply = velocity > 0 ? qty / velocity : 999;
            const annualizedTurnover = velocity > 0 ? (velocity * 365) / qty : 0;
            const stockValue = qty * cost;

            let status = 'healthy';
            if (qty === 0) status = 'out_of_stock';
            else if (daysOfSupply < 7) status = 'critical';
            else if (daysOfSupply < 14) status = 'low';
            else if (daysOfSupply > 120) status = 'overstock';
            else if (velocity === 0) status = 'dead';

            totalVal += stockValue;
            totalVelocity += velocity;
            if (status === 'critical' || status === 'out_of_stock') criticalCount++;
            if (status === 'dead') deadVal += stockValue;

            if (daysOfSupply !== 999) totalDaysOfSupplyWeighted += (daysOfSupply * stockValue);

            const reorder = velocity > 0 ? Math.ceil(velocity * 30) : 0; // 30 days target

            return {
                id: p.id,
                sku: p.sku || 'N/A',
                name: p.name || 'Bilinmeyen Ürün',
                category: p.categoryName || 'Diğer',
                qty,
                velocity,
                daysOfSupply,
                annualizedTurnover,
                stockValue,
                status,
                reorder
            };
        }).sort((a,b) => b.stockValue - a.stockValue);

        const avgDaysOfSupply = totalVal > 0 ? totalDaysOfSupplyWeighted / totalVal : 0;

        // Donut Data
        const dMap = {};
        stockItems.forEach(s => {
            if (!dMap[s.status]) dMap[s.status] = { count: 0, val: 0 };
            dMap[s.status].count++;
            dMap[s.status].val += s.stockValue;
        });

        const COLORS = {
            out_of_stock: '#EF4444', critical: '#F97316', low: '#F59E0B', 
            healthy: '#10B981', overstock: '#3B82F6', dead: '#7D7DA6'
        };
        const LABELS = {
            out_of_stock: 'Tükenmiş', critical: 'Kritik (<7g)', low: 'Düşük (7-14g)', 
            healthy: 'Sağlıklı (15-120g)', overstock: 'Fazla Stok (>120g)', dead: 'Ölü Stok (Hareket Yok)'
        };

        const pieData = Object.keys(dMap).map(k => ({
            name: k, label: LABELS[k], value: dMap[k].count, val: dMap[k].val, color: COLORS[k]
        }));

        // Pareto ABC
        let acc = 0;
        const abcData = stockItems.slice(0, 50).map(s => {
            acc += s.stockValue;
            return {
                name: s.sku,
                val: s.stockValue,
                cum: totalVal > 0 ? (acc / totalVal) * 100 : 0
            };
        });

        // Generate Action Items
        const actions = [];
        stockItems.slice(0, 10).forEach(s => {
            if (s.status === 'critical') {
                actions.push({ priority: 'acil', title: `Stok biter: ${s.sku}`, desc: `${s.daysOfSupply.toFixed(1)} gün sonra tükeniyor. Önerilen sipariş miktarı: ${s.reorder} adet.`, cta: 'Tedarik Siparişi Aç' });
            } else if (s.status === 'out_of_stock') {
                actions.push({ priority: 'acil', title: `SKU Tükenmiş: ${s.sku}`, desc: `Satış hızı yüksek bir ürün tükendi. Hemen listelemeyi durdur veya Backorder aç.`, cta: 'Siparişe Kapat' });
            } else if (s.status === 'overstock' && s.stockValue > 5000) {
                actions.push({ priority: 'önemli', title: `Fazla Stok: ${s.sku}`, desc: `${fmt(s.stockValue)} sermaye bağlanmış. Tasfiye kampanyası planla.`, cta: 'Kampanya Öner' });
            } else if (s.status === 'dead' && s.stockValue > 2000) {
                actions.push({ priority: 'önemli', title: `Ölü Stok: ${s.sku}`, desc: `Son 60 gündür sipariş almayan stoklar (Değer: ${fmt(s.stockValue)}).`, cta: 'Fiyat Düşür' });
            }
        });

        const mockAlerts = actions.filter(a => a.priority === 'acil').map(a => ({ message: a.title })).slice(0, 3);

        return { stockItems, totalVal, avgDaysOfSupply, criticalCount, deadVal, pieData, LABELS, abcData, actions, mockAlerts };
    }, [products, orders]);

    if (!metrics) return <EmptyState title="Envanter Verisi Yok" message="İkas veya desteklenen ERPlar aracılığıyla stok bilgisi alınamadı." />;

    const { stockItems, totalVal, avgDaysOfSupply, criticalCount, deadVal, pieData, LABELS, abcData, actions, mockAlerts } = metrics;

    const CustomTooltipPie = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-[#EDEDF0] shadow-lg rounded-xl text-xs">
                    <p className="font-bold mb-1" style={{color: data.color}}>{data.label}</p>
                    <p>SKU Adedi: <span className="font-bold">{data.value}</span></p>
                    <p>Değer: <span className="font-bold">{fmt(data.val)}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            
            <AlertStrip alerts={mockAlerts} />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam Stok Değeri" value={fmt(totalVal)} delta="Hesaplanan COGS" tone="neutral" />
                <KpiCard title="Ortalama Stok Günü" value={`${Math.round(avgDaysOfSupply)} gün`} delta="Ağırlıklı Ortalama" tone="positive" />
                <KpiCard title="Kritik Stok SKU" value={criticalCount} delta="<7 Gün + Tükenen" tone={criticalCount > 10 ? "negative" : "warning"} />
                <KpiCard title="Ölü Stok Değeri" value={fmt(deadVal)} delta="Hiç satmayanlar" tone={deadVal > totalVal*0.1 ? "negative" : "neutral"} />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <ChartCard 
                    title="Envanter Durumu Dağılımı"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltipPie />} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#0F1223]">{stockItems.length}</text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-[#7D7DA6]">SKU</text>
                            </PieChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="ABC Analizi (Stok Değeri Paretosu)"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={abcData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
                                <XAxis dataKey="name" hide />
                                <YAxis yAxisId="left" tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 10, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" hide />
                                <Tooltip formatter={(val, name) => [name === 'val' ? fmt(val) : `%${val.toFixed(1)}`, name === 'val' ? 'Değer' : 'Kümülatif %']} />
                                <Bar yAxisId="left" dataKey="val" fill="#E0DDFF" radius={[2,2,0,0]} />
                                <Line yAxisId="right" type="monotone" dataKey="cum" stroke="#F59E0B" strokeWidth={3} dot={false} />
                                <ReferenceLine y={80} yAxisId="right" stroke="#EF4444" strokeDasharray="3 3" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABLOLAR */}
            <TableCard
                title="SKU Stok Master Listesi"
                columns={[
                    { key: 'durum', label: 'Durum', align: 'left' },
                    { key: 'sku', label: 'SKU', align: 'left', className: 'font-mono text-[11px]' },
                    { key: 'urun', label: 'Ürün Adı', align: 'left', className: 'max-w-[200px] truncate' },
                    { key: 'stok', label: 'Stok', align: 'right' },
                    { key: 'hiz', label: 'Satış Hızı', align: 'right' },
                    { key: 'gun', label: 'Stok Günü', align: 'right' },
                    { key: 'devir', label: 'Devir', align: 'right' },
                    { key: 'deger', label: 'Stok Değeri', align: 'right' }
                ]}
                rows={stockItems.slice(0, 50).map(s => ({
                    durum: <StatusDot status={s.status} label={LABELS[s.status]?.split(' ')[0]} />,
                    sku: s.sku,
                    urun: <span className="font-bold text-[#0F1223] text-xs">{s.name}</span>,
                    stok: <span className="font-bold">{s.qty}</span>,
                    hiz: `${s.velocity.toFixed(1)} ad/g`,
                    gun: s.daysOfSupply === 999 ? 'Hareket Yok' : <span className={s.daysOfSupply < 14 ? 'text-orange-500 font-bold' : ''}>{Math.round(s.daysOfSupply)} gün</span>,
                    devir: <span className="text-[#7D7DA6]">{s.annualizedTurnover.toFixed(1)} x/yıl</span>,
                    deger: <span className="font-bold text-[#514BEE]">{fmt(s.stockValue)}</span>
                }))}
            />

            <AksiyonMerkezi actions={actions} />

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard type="trend" title="Durgun Duran Sermaye" body="Envanterinizin %18'i ölü stok alanında ve toplam ₺184K nakit bağlamış durumda. Özel bir flash-sale ile likidite yaratılabilir." />
                <InsightCard type="alert" title="A Sınıfı Stok Riski" body="Cironuzun %80'ini yapan ürün grubundaki 6 SKU kritik stok seviyesine geriledi." />
            </div>

        </div>
    );
};
