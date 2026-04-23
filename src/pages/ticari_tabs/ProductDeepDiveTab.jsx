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
    const [sortConfig, setSortConfig] = useState({ key: 'revenue', direction: 'desc' });

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

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
                    // Use actual total fulfillment cost (cogs+shipping+comm+tax) from order data
                    pMap[o.sku].cogsTotal += (o.cost || o.cogs || 0);
                    totalCiro += (o.revenue || 0);
                    totalKarlik += ((o.revenue || 0) - (o.cost || o.cogs || 0));
                }
            }
        });

        // Compute advanced KPIs per product
        const pList = Object.values(pMap).map(p => {
            const netKar = p.revenue - p.cogsTotal;
            const marj = p.revenue > 0 ? (netKar / p.revenue) * 100 : 0;
            const returnRate = (p.soldQty + p.returns) > 0 ? (p.returns / (p.soldQty + p.returns)) * 100 : 0;
            // Prevent true zeros from triggering the pseudo-random fallback
            const stok = p.stock !== undefined ? p.stock : 0; 
            const devir = p.soldQty > 0 ? (stok / (p.soldQty/30)) : Infinity;
            
            return {
                ...p, netKar, marj, returnRate, stok, devir
            };
        }).sort((a,b) => b.revenue - a.revenue);

        // Pareto cumulative logic
        let accCiro = 0;
        const paretoDataFull = pList.map((p, i) => {
            accCiro += p.revenue;
            const percentageOfTotal = totalCiro > 0 ? (p.revenue / totalCiro) * 100 : 0;
            const cumilative = totalCiro > 0 ? (accCiro / totalCiro) * 100 : 0;
            return {
                name: (p.name || '').split('|')[0].substring(0, 18) + ((p.name?.split('|')[0]?.length > 18) ? '...' : ''),
                ciro: p.revenue,
                yuzde: percentageOfTotal,
                kumulatifPct: cumilative,
                isTop80: cumilative <= 80
            };
        });
        
        // Sadece cironun %80'ini yapan klasman + onlara en yakın 3-4 ürünü gösterelim ki grafik net ve anlaşılır olsun.
        const top80Index = paretoDataFull.findIndex(p => p.kumulatifPct > 80);
        const cutoffLimit = top80Index !== -1 ? Math.min(top80Index + 4, paretoDataFull.length) : Math.min(15, paretoDataFull.length);
        const paretoData = paretoDataFull.slice(0, Math.max(7, cutoffLimit)); // En az 7 bar göster

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

    const sortedProducts = useMemo(() => {
        let sortable = [...filteredProducts];
        if (sortConfig.key) {
            sortable.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                if (aVal === bVal) return 0;
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                
                return sortConfig.direction === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
            });
        }
        return sortable;
    }, [filteredProducts, sortConfig]);

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


            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Toplam SKU (Aktif)" 
                    value={pList.length} 
                    delta="Stokta" 
                    tone="neutral" 
                    tooltip="Sistemde kayıtlı ve envanterinizde güncel olarak takip edilen toplam ürün çeşidi sayısını (varyantlarıyla birlikte) gösterir."
                />
                <KpiCard 
                    title="Yıldız Ürün" 
                    value={<div className="text-lg leading-tight truncate max-w-[160px]" title={starProduct?.name}>{starProduct?.name?.split('|')[0]?.trim() || '—'}</div>}
                    delta={`${fmt(starProduct?.revenue)} ciro`} 
                    tone="positive" 
                    tooltip="Seçili tarih aralığında size en çok ciro getiren, kataloğunuzun lider ve en popüler ürünü."
                />
                <KpiCard 
                    title="Zombie SKU (0 Satış)" 
                    value={zombieCount} 
                    delta="Son 30 Gün" 
                    tone={zombieCount > 0 ? "negative" : "positive"} 
                    tooltip="Son 30 gün içinde katalogda yer almasına ve stokta olmasına rağmen hiç satılmamış olan, envanter yükü (atıl) yaratan ürün sayınız."
                />
                <KpiCard 
                    title="Portföy Kar Marjı" 
                    value={pct(avgMarj)} 
                    delta="Ağırlıklı Ortalama" 
                    tone={avgMarj > 20 ? "positive" : "warning"} 
                    tooltip="Satılan tüm ürünlerinizin Ciro, Kargo, Platform Komisyonu, Ürün Maliyeti (COGS) ve KDV Vergi Kesintisi düşüldükten sonra cebinize giren ağırlıklı net kârlılık ortalaması."
                />
            </div>



            {/* MASTER TABLO */}
            <TableCard
                title="Ürün Deep-Dive Master Tablosu"
                pageSize={10}
                onSort={handleSort}
                sortConfig={sortConfig}
                action={
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7D7DA6]" size={14} />
                            <input 
                                type="text" 
                                placeholder="Tabloda ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 border border-[#EDEDF0] rounded-md text-[12px] bg-white focus:outline-none focus:ring-1 focus:ring-[#514BEE] transition-all w-48"
                            />
                        </div>
                        <span className="text-[13px] font-semibold text-[#7D7DA6]">Toplam: {sortedProducts.length} Sonuç</span>
                    </div>
                }
                columns={[
                    { key: 'sku', label: 'SKU', align: 'left', className: 'font-mono text-xs w-[100px]' },
                    { key: 'name', label: 'Ürün Adı', align: 'left', className: 'min-w-[350px] max-w-[450px]' },
                    { key: 'stok', label: 'Stok', align: 'right' },
                    { key: 'soldQty', label: 'Sipariş (30g)', align: 'right' },
                    { key: 'revenue', label: 'Ciro (30g)', align: 'right' },
                    { key: 'marj', label: 'Marj %', align: 'right' },
                    { key: 'devir', label: 'Stok Devir', align: 'right' },
                    { key: 'returnRate', label: 'İade %', align: 'right' }
                ]}
                rows={sortedProducts.map((p, i) => ({
                    sku: <span className="text-[10px] text-[#7D7DA6] font-medium tracking-wide">{p.sku || `SKU-${i}`}</span>,
                    name: (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md shrink-0 bg-white border border-[#EDEDF0] overflow-hidden flex items-center justify-center">
                                <img src={p.img || '/assets/products/fallback_0.jpg'} alt={p.name} className="max-w-full max-h-full object-contain p-0.5" />
                            </div>
                            <span className="text-[12px] font-semibold text-[#0F1223] leading-snug line-clamp-2">{p.name}</span>
                        </div>
                    ),
                    stok: <span className={p.stok < 10 ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>{p.stok}</span>,
                    soldQty: p.soldQty,
                    revenue: <span className="font-bold">{fmt(p.revenue)}</span>,
                    marj: <span className="px-2 py-0.5 rounded bg-[#F3F1FF] text-[#514BEE] font-bold">{pct(p.marj)}</span>,
                    devir: p.devir === Infinity ? '—' : `${Math.round(p.devir)} gün`,
                    returnRate: <span className={p.returnRate > 10 ? "text-red-500" : ""}>{pct(p.returnRate)}</span>
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
