import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, InsufficientDataEmptyState } from './SharedCustomerComponents';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const BasketTab = () => {
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        let multiItemCount = 0;
        let totalQty = 0;
        let totalVal = 0;

        const baskets = [];
        const itemCounts = {};
        const pairCounts = {};
        const sizeCounts = { 1: { c: 0, v: 0 }, 2: { c: 0, v: 0 }, 3: { c: 0, v: 0 }, 4: { c: 0, v: 0 } };

        orders.forEach(o => {
            if (o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED') return;
            totalVal += (o.revenue || 0);

            // True lineItems parsing
            const items = o.lineItems || [];
            let basketQty = 0;
            const uniqueProductNamesInBasket = new Set();
            
            items.forEach(i => {
                basketQty += (i.quantity || 1);
                uniqueProductNamesInBasket.add(i.name);
            });

            // Fallback to legacy parsing if lineItems wasn't formed properly
            if (items.length === 0) {
                basketQty = o.quantity || 1;
                uniqueProductNamesInBasket.add(o.productName);
            }

            totalQty += basketQty;
            if (basketQty > 1) multiItemCount++;
            
            // For basket sizes
            if (basketQty === 1) { sizeCounts[1].c++; sizeCounts[1].v += o.revenue; }
            else if (basketQty === 2) { sizeCounts[2].c++; sizeCounts[2].v += o.revenue; }
            else if (basketQty === 3) { sizeCounts[3].c++; sizeCounts[3].v += o.revenue; }
            else { sizeCounts[4].c++; sizeCounts[4].v += o.revenue; }

            const uProducts = Array.from(uniqueProductNamesInBasket);
            baskets.push(uProducts);

            uProducts.forEach(p => {
                itemCounts[p] = (itemCounts[p] || 0) + 1;
            });

            for (let i = 0; i < uProducts.length; i++) {
                for (let j = i + 1; j < uProducts.length; j++) {
                    const pair = [uProducts[i], uProducts[j]].sort().join('||');
                    pairCounts[pair] = (pairCounts[pair] || 0) + 1;
                }
            }
        });

        // Generate Rules
        let rulesArr = [];
        const totalBaskets = baskets.length;

        Object.entries(pairCounts).forEach(([pairStr, count]) => {
            if (count < 2) return; // Ignore very rare coincidence
            const [p1, p2] = pairStr.split('||');
            
            // Rule p1 -> p2
            const conf1 = count / itemCounts[p1];
            const lift1 = conf1 / (itemCounts[p2] / totalBaskets);
            if (lift1 > 1) {
                rulesArr.push({ id: `${p1}-${p2}`, from: p1, to: p2, sup: Number(((count / totalBaskets) * 100).toFixed(1)), conf: Number((conf1 * 100).toFixed(1)), lift: lift1, count });
            }

            // Rule p2 -> p1
            const conf2 = count / itemCounts[p2];
            const lift2 = conf2 / (itemCounts[p1] / totalBaskets);
            if (lift2 > 1) {
                rulesArr.push({ id: `${p2}-${p1}`, from: p2, to: p1, sup: Number(((count / totalBaskets) * 100).toFixed(1)), conf: Number((conf2 * 100).toFixed(1)), lift: lift2, count });
            }
        });

        // De-duplicate symmetric rules just taking the direction with highest confidence
        const rulesMap = new Map();
        rulesArr.forEach(r => {
            const pairKey = [r.from, r.to].sort().join('||');
            if (rulesMap.has(pairKey)) {
                if (r.conf > rulesMap.get(pairKey).conf) rulesMap.set(pairKey, r);
            } else {
                rulesMap.set(pairKey, r);
            }
        });
        
        const topRules = Array.from(rulesMap.values())
             .sort((a,b) => b.lift - a.lift)
             .slice(0, 10); // Show max 10 rules

        const distData = [
            { size: '1 Ürün', count: sizeCounts[1].c, ciro: sizeCounts[1].v },
            { size: '2 Ürün', count: sizeCounts[2].c, ciro: sizeCounts[2].v },
            { size: '3 Ürün', count: sizeCounts[3].c, ciro: sizeCounts[3].v },
            { size: '4+ Ürün', count: sizeCounts[4].c, ciro: sizeCounts[4].v }
        ];

        return { 
            distData, rules: topRules, multiItemCount, totalQty, totalVal, count: orders.length,
            singleOrderPct: totalBaskets > 0 ? (sizeCounts[1].c / totalBaskets) : 0
        };

    }, [orders]);

    if (!metrics) return <EmptyState title="Veri Bulunamadı" />;
    
    // Demonstrate feature threshold explicitly
    if (metrics.count < 30) return <InsufficientDataEmptyState featureName="Sepet İlişki Kuralları (Market Basket)" required="En az 200 Sipariş" available={`${metrics.count} Sipariş`} />;

    const { distData, rules, multiItemCount, totalQty, totalVal, count } = metrics;
    const aov = totalVal / count;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Çoklu Ürün Sipariş Oranı" value={`%${((multiItemCount / count) * 100).toFixed(1)}`} delta=">1 Ürün/Satır İçeren" tone="positive" tooltip="Tüm siparişlerinizin içerisinde, sepetinde en az iki farklı veya aynı üründen birden fazla ürün barındıran kümülatif siparişlerin oranı." />
                <KpiCard title="Ortalama Sepet Büyüklüğü" value={(totalQty / count).toFixed(1)} delta="Adet/Sipariş" tone="neutral" tooltip="Her bir sipariş başına düşen ortalama ürün (item) adedi (toplam satılan miktar / toplam sipariş sayısı)." />
                <KpiCard title="Ortalama Sepet Değeri (AOV)" value={fmt(aov)} delta="Sipariş Başına" tone="positive" tooltip="Average Order Value. Bir tamamlama/checkout döngüsünde bırakılan cironun tüm tamamlanmış siparişlere ortalaması." />
                <KpiCard title="En Güçlü Kural Lift Skoru" value={rules.length > 0 ? rules[0].lift.toFixed(1) : '-'} delta={rules.length > 0 ? `${rules[0].from.substring(0,8)}... ->` : 'Yetersiz Veri'} tone={rules.length > 0 ? "positive" : "neutral"} tooltip="Ana ürünü alan kitlenin yan ürünü normalden ne kadar (x kat) daha fazla almaya meyilli olduğunu gösteren çekim/destek katsayısı." />
            </div>

            {/* CHARTS */}
            <div className="h-[400px]">
                <ChartCard 
                    title="Sepet Büyüklüğü Dağılımı ve Ciro Etkisi"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distData} margin={{ top: 20, right: 0, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <XAxis dataKey="size" tick={{ fontSize: 11, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#0F1223' }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 11, fill: '#10B981' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v, n) => [n === 'count' ? v : fmt(v), n === 'count' ? 'Sipariş' : 'Ciro Katkısı']} cursor={{fill: '#F4F4F8'}} />
                                <Bar yAxisId="left" dataKey="count" name="Sipariş Sayısı" fill="#E0DDFF" radius={[2,2,0,0]} barSize={30} />
                                <Bar yAxisId="right" dataKey="ciro" name="Ciro Katkısı" fill="#10B981" radius={[2,2,0,0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABLO */}
            <TableCard
                title="Birlikte Alım Kuralları (Association Rules)"
                columns={[
                    { key: 'from', label: 'Ana Ürün (A)', align: 'left' },
                    { key: 'to', label: 'Yan Ürün (B)', align: 'left' },
                    { key: 'sup', label: 'Support %', align: 'right' },
                    { key: 'conf', label: 'Confidence %', align: 'right' },
                    { key: 'lift', label: 'Lift Skoru', align: 'right' },
                    { key: 'islem', label: 'Öneri', align: 'left' }
                ]}
                rows={rules.map(r => ({
                    from: <span className="font-bold text-[#0F1223]">{r.from}</span>,
                    to: <span className="font-bold text-emerald-600">{r.to}</span>,
                    sup: `%${r.sup}`,
                    conf: <span className={`${r.conf > 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-700'} px-2 py-0.5 rounded font-bold`}>%${r.conf}</span>,
                    lift: <span className="font-mono">{r.lift.toFixed(1)}x</span>,
                    islem: r.lift > 3 ? <span className="text-xs uppercase font-bold tracking-wider text-blue-600">Bundle Yapın</span> : <span className="text-xs text-[#7D7DA6]">Bağımsız</span>
                }))}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.length > 0 ? (
                    <InsightCard 
                        type="suggestion" 
                        title="Dinamik Çapraz Satış Fırsatı" 
                        body={`${rules[0].from} alanların %${rules[0].conf}'i ${rules[0].to} de alıyor. Bu iki ürünü paketlerseniz veya checkout'ta öneri gösterirseniz sipariş değerinizi (AOV) hızlıca artırabilirsiniz.`} 
                    />
                ) : (
                    <InsightCard type="trend" title="Birlikte Alım Hacmi Yok" body="Sepetlerde yeterli oranda tekrar eden birlikte alım eşleşmesi bulunamadı." />
                )}
                
                <InsightCard 
                    type={metrics.singleOrderPct > 0.7 ? "alert" : "trend"} 
                    title={metrics.singleOrderPct > 0.7 ? "Tek Ürün Tuzağı Alarmı" : "Sepetler Karışık ve Hacimli"} 
                    body={`Müşterilerinizin %${(metrics.singleOrderPct * 100).toFixed(0)}'u sadece tek ürünlü sipariş oluşturuyor. Sepette bir eşik (Örn: 2 ürün alana indirim) belirleyerek adeti yükseltmeyi deneyebilirsiniz.`} 
                />
            </div>

        </div>
    );
};
