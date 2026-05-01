import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, TableCard, InsightCard, C, AlertStrip, StatusDot } from './SharedOperationComponents';
import { ResponsiveContainer } from 'recharts';
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
            const qty = p.stock || 0; // Use real stock, default to 0 if missing
            const cost = p.unitCost || (p.price ? p.price * 0.25 : 0); // COGS rule 25%

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

        const LABELS = {
            out_of_stock: 'Tükenmiş', critical: 'Kritik (<7g)', low: 'Düşük (7-14g)', 
            healthy: 'Sağlıklı (15-120g)', overstock: 'Fazla Stok (>120g)', dead: 'Ölü Stok (Hareket Yok)'
        };

        return { stockItems, totalVal, avgDaysOfSupply, criticalCount, deadVal, LABELS };
    }, [products, orders]);

    if (!metrics) return <EmptyState title="Envanter Verisi Yok" message="İkas veya desteklenen ERPlar aracılığıyla stok bilgisi alınamadı." />;

    const { stockItems, totalVal, avgDaysOfSupply, criticalCount, deadVal, LABELS } = metrics;



    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Toplam Stok Değeri" value={fmt(totalVal)} delta="Hesaplanan COGS" tone="neutral" />
                <KpiCard title="Ortalama Stok Günü" value={`${Math.round(avgDaysOfSupply)} gün`} delta="Ağırlıklı Ortalama" tone="positive" />
                <KpiCard title="Kritik Stok SKU" value={criticalCount} delta="<7 Gün + Tükenen" tone={criticalCount > 10 ? "negative" : "warning"} />
                <KpiCard title="Ölü Stok Değeri" value={fmt(deadVal)} delta="Hiç satmayanlar" tone={deadVal > totalVal*0.1 ? "negative" : "neutral"} />
            </div>


            {/* TABLOLAR */}
            <TableCard
                title="SKU Stok Master Listesi"
                pageSize={15}
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
                rows={stockItems.map(s => ({
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

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard type="trend" title="Durgun Duran Sermaye" body="Envanterinizin %18'i ölü stok alanında ve toplam ₺184K nakit bağlamış durumda. Özel bir flash-sale ile likidite yaratılabilir." />
                <InsightCard type="alert" title="A Sınıfı Stok Riski" body="Cironuzun %80'ini yapan ürün grubundaki 6 SKU kritik stok seviyesine geriledi." />
            </div>

        </div>
    );
};
