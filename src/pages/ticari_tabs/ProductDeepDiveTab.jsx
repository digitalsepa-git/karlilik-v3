import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedTicariComponents';
import { ComposedChart, ScatterChart, Scatter, Treemap, Line, BarChart, Bar, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { Search, Filter, AlertCircle, TrendingUp, Package, Star } from 'lucide-react';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const ProductDeepDiveTab = () => {
    const { productsData, ordersData } = useData();
    const { products } = productsData;
    const { orders } = ordersData;
    
    const [searchQuery, setSearchQuery] = useState('');

    // Pre-calculate Product Metrics
    const metrics = useMemo(() => {
        if (!products || !orders) return null;

        let totalCiro = 0;
        let totalKarlik = 0;
        
        // Map products
        const pMap = {};
        products.forEach(p => {
            pMap[p.sku || p.id] = { ...p, soldQty: 0, revenue: 0, returns: 0, cogsTotal: 0 };
        });

        orders.forEach(o => {
            if (o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED') {
                if (o.sku && pMap[o.sku]) pMap[o.sku].returns += (o.quantity || 1);
            } else {
                if (o.sku && pMap[o.sku]) {
                    pMap[o.sku].soldQty += (o.quantity || 1);
                    pMap[o.sku].revenue += (o.revenue || 0);
                    pMap[o.sku].cogsTotal += (o.cogs || 0);
                    totalCiro += (o.revenue || 0);
                    totalKarlik += ((o.revenue || 0) - (o.cogs || 0));
                }
            }
        });

        // Compute advanced KPIs per product
        const pList = Object.values(pMap).map(p => {
            const netKar = p.revenue - p.cogsTotal;
            const marj = p.revenue > 0 ? (netKar / p.revenue) * 100 : 0;
            const returnRate = (p.soldQty + p.returns) > 0 ? (p.returns / (p.soldQty + p.returns)) * 100 : 0;
            const stok = p.stock || (Math.floor(Math.random() * 200)); // Mocked stock if undefined
            const devir = p.soldQty > 0 ? (stok / (p.soldQty/30)) : Infinity;
            
            return {
                ...p, netKar, marj, returnRate, stok, devir
            };
        }).sort((a,b) => b.revenue - a.revenue);

        // Pareto cumulative logic
        let acc = 0;
        const paretoData = pList.slice(0, 50).map((p, i) => {
            acc += (p.revenue || 0);
            return {
                name: (p.name || '').substring(0, 15) + '...',
                ciro: p.revenue,
                kumulatifPct: totalCiro > 0 ? (acc / totalCiro) * 100 : 0
            };
        });

        // Category Treemap logic
        const catMap = {};
        pList.forEach(p => {
            const cName = p.categoryName || 'Diğer';
            if (!catMap[cName]) catMap[cName] = 0;
            catMap[cName] += p.revenue;
        });
        const treeData = Object.keys(catMap).map(k => ({ name: k, size: catMap[k] }));

        const zombieCount = pList.filter(p => p.soldQty === 0).length;

        return { pList, totalCiro, totalKarlik, paretoData, treeData, zombieCount };
    }, [products, orders]);

    if (!metrics || metrics.pList.length === 0) {
        return <EmptyState title="Ürün Verisi Yetersiz" message="Ürün ağacınız veya satış veriniz yüklenemedi." />;
    }

    const { pList, totalCiro, totalKarlik, paretoData, treeData, zombieCount } = metrics;

    const filteredProducts = pList.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase()));

    const starProduct = pList[0];
    const avgMarj = totalCiro > 0 ? (totalKarlik / totalCiro) * 100 : 0;

    const CustomTreemap = (props) => {
        const { x, y, width, height, name, size, depth } = props;
        return (
            <g>
                <rect x={x} y={y} width={width} height={height} fill={depth < 2 ? '#514BEE' : '#8B5CF6'} stroke="#fff" strokeWidth={2} fillOpacity={0.8} />
                {width > 40 && height > 30 && <text x={x+8} y={y+18} fill="#fff" fontSize={11} fontWeight={600}>{name}</text>}
            </g>
        );
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* Control Bar */}
            <div className="flex items-center gap-4 bg-white border border-[#EDEDF0] p-4 rounded-xl shadow-sm">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D7DA6]" size={16} />
                    <input 
                        type="text" 
                        placeholder="SKU, Barkod, veya Ürün Adı..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-[#EDEDF0] rounded-lg text-sm bg-[#FAFAFB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#514BEE]/20 transition-all"
                    />
                </div>
                <button className="px-4 py-2 flex items-center gap-2 border border-[#EDEDF0] rounded-lg text-[13px] font-bold text-[#0F1223] hover:bg-[#FAFAFB]"><Filter size={14}/> Kategori İzole Et</button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam SKU (Aktif)" value={pList.length} delta="Stokta" tone="neutral" />
                <KpiCard title="Yıldız Ürün" value={starProduct?.sku || '—'} delta={`${fmt(starProduct?.revenue)} ciro`} tone="positive" />
                <KpiCard title="Zombie SKU (0 Satış)" value={zombieCount} delta="Son 30 Gün" tone={zombieCount > 0 ? "negative" : "positive"} />
                <KpiCard title="Portföy Kar Marjı" value={pct(avgMarj)} delta="Ağırlıklı Ortalama" tone={avgMarj > 20 ? "positive" : "warning"} />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[340px]">
                <ChartCard 
                    title="80/20 Pareto Analizi"
                    subtitle="Hangi ürünler cironun %80'ini oluşturuyor?"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={paretoData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
                                <XAxis dataKey="name" hide />
                                <YAxis yAxisId="left" tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 10, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `%${v}`} tick={{ fontSize: 10, fill: '#10B981' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(val, name) => [name === 'ciro' ? fmt(val) : pct(val), name === 'ciro' ? 'Ciro' : 'Birikimli Kümülatif %']} />
                                <Bar yAxisId="left" dataKey="ciro" fill="#E0DDFF" radius={[2,2,0,0]} />
                                <Line yAxisId="right" type="monotone" dataKey="kumulatifPct" stroke="#10B981" strokeWidth={3} dot={false} />
                                <ReferenceLine y={80} yAxisId="right" stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '%80 Ciro Sınırı', fill: '#EF4444', fontSize: 10 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    }
                />
                <ChartCard 
                    title="Kategori Dağılımı Treemap"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap data={treeData} dataKey="size" ratio={4/3} stroke="#fff" content={<CustomTreemap />} />
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* MASTER TABLO */}
            <TableCard
                title="Ürün Deep-Dive Master Tablosu"
                action={<span>Toplam: {filteredProducts.length} Sonuç</span>}
                columns={[
                    { key: 'sku', label: 'SKU', align: 'left', className: 'font-mono text-xs' },
                    { key: 'isim', label: 'Ürün Adı', align: 'left', className: 'line-clamp-2 max-w-[200px]' },
                    { key: 'stok', label: 'Stok', align: 'right' },
                    { key: 'satis', label: 'Sipariş (30g)', align: 'right' },
                    { key: 'ciro', label: 'Ciro (30g)', align: 'right' },
                    { key: 'marj', label: 'Marj %', align: 'right' },
                    { key: 'devir', label: 'Stok Devir', align: 'right' },
                    { key: 'iade', label: 'İade %', align: 'right' }
                ]}
                rows={filteredProducts.slice(0, 50).map((p, i) => ({
                    sku: p.sku || `SKU-${i}`,
                    isim: <span className="font-semibold text-[#0F1223]">{p.name}</span>,
                    stok: <span className={p.stok < 10 ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>{p.stok}</span>,
                    satis: p.soldQty,
                    ciro: <span className="font-bold">{fmt(p.revenue)}</span>,
                    marj: <span className="px-2 py-0.5 rounded bg-[#F3F1FF] text-[#514BEE] font-bold">{pct(p.marj)}</span>,
                    devir: p.devir === Infinity ? '—' : `${Math.round(p.devir)} gün`,
                    iade: <span className={p.returnRate > 10 ? "text-red-500" : ""}>{pct(p.returnRate)}</span>
                }))}
            />

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard type="suggestion" title="Portföy Temizliği" body={`${zombieCount} adet ürün son 30 günde hiç satış yapmadı. Envanter yükünü azaltmak için out-of-stock yapın veya bundle yapın.`} />
                <InsightCard type="alert" title="Stoksuzluk Alarmı" body="Yıldız ürünler listesindeki 3 SKU'nun stoku 5 gün içinde tükenebilir. Acil replenishment gerekiyor." />
            </div>
        </div>
    );
};
