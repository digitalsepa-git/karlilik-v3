import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C, InsufficientDataEmptyState } from './SharedCustomerComponents';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
const pct = (val, d = 1) => `%${(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export const CohortTab = () => {
    const { ordersData } = useData();
    const { orders } = ordersData;

    const metrics = useMemo(() => {
        if (!orders || orders.length === 0) return null;

        const customerMap = {};
        let totalRevenue = 0;
        let totalOrders = 0;

        orders.forEach(o => {
            if (o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED') return;
            const cId = o.customerId || o.customerObj?.name;
            if (!cId || cId === 'Anonim Müşteri') return;

            const d = new Date(o.dateRaw || o.date);
            if (!customerMap[cId]) {
                customerMap[cId] = { id: cId, firstOrderDate: d, orders: [] };
            }
            if (d < customerMap[cId].firstOrderDate) customerMap[cId].firstOrderDate = d;
            customerMap[cId].orders.push(o);
            totalRevenue += (o.revenue || 0);
            totalOrders++;
        });

        const cohortMap = {};
        const monthsTotalCounts = Array(13).fill(0);
        let eligibleCohortsForMonth = Array(13).fill(0);

        Object.values(customerMap).forEach(c => {
            const firstDate = c.firstOrderDate;
            const cohortKey = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!cohortMap[cohortKey]) {
                cohortMap[cohortKey] = { key: cohortKey, count: 0, M0_ciro: 0, totalOrders: 0, totalQty: 0 };
                for (let i = 1; i <= 12; i++) cohortMap[cohortKey][`M${i}_c`] = 0;
            }
            cohortMap[cohortKey].count++;

            const monthsDiff = (d) => {
                return (d.getFullYear() - firstDate.getFullYear()) * 12 + (d.getMonth() - firstDate.getMonth());
            };

            const activeMonths = new Set();
            c.orders.forEach(o => {
                const diff = monthsDiff(new Date(o.dateRaw || o.date));
                if (diff === 0) cohortMap[cohortKey].M0_ciro += (o.revenue || 0);
                activeMonths.add(diff);
                cohortMap[cohortKey].totalOrders++;
                cohortMap[cohortKey].totalQty += (o.quantity || 1);
            });

            for (let i = 1; i <= 12; i++) {
                if (activeMonths.has(i)) {
                    cohortMap[cohortKey][`M${i}_c`]++;
                }
            }
        });

        const cohortList = Object.values(cohortMap).sort((a,b) => b.key.localeCompare(a.key));
        if (cohortList.length < 1) return { insufficient: true, num: cohortList.length };

        // Calculate True Average Retention Curve
        // Eligible cohorts for month i logic: Assume we're just plotting raw averages of all cohorts
        const curveData = [];
        for (let i = 0; i <= 12; i++) {
            let totalRetained = 0;
            let totalPossible = 0;
            cohortList.forEach(c => {
                totalPossible += c.count;
                if (i === 0) {
                    totalRetained += c.count;
                } else {
                    totalRetained += c[`M${i}_c`];
                }
            });
            const retentionPct = totalPossible > 0 ? (totalRetained / totalPossible) * 100 : 0;
            if (i <= 6 || retentionPct > 0 || i === 12) { // Show up to 6 months even if 0, then only if it has data
                curveData.push({ month: `M${i}`, retention: Number(retentionPct.toFixed(2)) });
            }
        }

        // KPIs
        const totalUniqueCustomers = Object.keys(customerMap).length;
        const avgLTV = totalUniqueCustomers > 0 ? totalRevenue / totalUniqueCustomers : 0;
        const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        let repeatCustomers = 0;
        Object.values(customerMap).forEach(c => {
            if (c.orders.length > 1) repeatCustomers++;
        });
        const repeatRate = totalUniqueCustomers > 0 ? (repeatCustomers / totalUniqueCustomers) * 100 : 0;
        
        // M3 specific metrics
        const m3Obj = curveData.find(c => c.month === 'M3');
        const m3Retention = m3Obj ? m3Obj.retention : 0;
        
        const m6Obj = curveData.find(c => c.month === 'M6');
        const m6Retention = m6Obj ? m6Obj.retention : 0;

        return { 
            cohortList, 
            curveData, 
            kpis: { avgLTV, repeatRate, aov, m3Retention, m6Retention } 
        };
    }, [orders]);

    if (!metrics) return <EmptyState title="Veri Bulunamadı" />;
    if (metrics.insufficient) return <InsufficientDataEmptyState featureName="LTV Cohort Analizi" required="3 Aylık" available={`${metrics.num} Aylık`} />;

    const { cohortList, curveData, kpis } = metrics;
    const { avgLTV, repeatRate, aov, m3Retention, m6Retention } = kpis;

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Ortalama LTV" value={fmt(avgLTV)} delta="Gerçekleşen Değer" tone="positive" />
                <KpiCard title="Tekrar Alma Oranı (Repeat)" value={pct(repeatRate)} delta="Genel Ortalama" tone={repeatRate > 20 ? "positive" : "warning"} />
                <KpiCard title="Ortalama Sipariş Değeri (AOV)" value={fmt(aov)} delta="Platformlar Geneli" tone="neutral" />
                <KpiCard title="Retention @ M3" value={pct(m3Retention)} delta={m3Retention > 10 ? "Sağlıklı" : "Kritik Seviye"} tone={m3Retention > 10 ? "positive" : "warning"} />
            </div>

            {/* TABLO */}
            <TableCard
                title="Edinim Ayına Göre Kohort Özeti (Gerçek API Verileri)"
                columns={[
                    { key: 'k', label: 'Kohort', align: 'left' },
                    { key: 'size', label: 'Boyut', align: 'left' },
                    { key: 'orders', label: 'Sipariş Sayısı', align: 'center' },
                    { key: 'qty', label: 'Satılan Ürün', align: 'center' },
                    { key: 'm0', label: 'İlk Ay Ciro', align: 'right' }
                ]}
                rows={cohortList.map(c => ({
                    k: <span className="font-bold bg-[#FAFAFB] px-2 py-1 rounded text-[#0F1223] border">{c.key}</span>,
                    size: `${c.count} Müşteri`,
                    orders: <span className="text-[#0F1223] font-medium">{c.totalOrders}</span>,
                    qty: <span className="text-[#0F1223] font-medium">{c.totalQty}</span>,
                    m0: <span className="font-bold text-emerald-600">{fmt(c.M0_ciro)}</span>
                }))}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard 
                    type={m3Retention > 15 ? "positive" : "alert"} 
                    title={m3Retention > 15 ? "Sağlam Bir M3 Çeyreği" : "M3'te Agresif Kırılma"} 
                    body={m3Retention > 0 ? `Sipariş verilerine göre M3 (3. Ay) itibarıyla kohortların ortalama elde tutulma oranı ${pct(m3Retention)}. Bu süreçte email/SMS otomasyonlarıyla ivmeyi destekleyin.` : "İlk aylardaki veri havuzunda tekrar sipariş oranları çok kısıtlı. Müşteri veri setinizin büyümesi beklenebilir."} 
                />
                <InsightCard 
                    type={repeatRate > 25 ? "suggestion" : "trend"} 
                    title={repeatRate > 25 ? "Sadakat Potansiyeli Yüksek" : "Tekil Alım Oranı Çok Yüksek"} 
                    body={`Geçmiş verilerinize göre müşterilerinizin ${pct(repeatRate)}'si tekrar alışveriş yapıyor. Kampanya mimarisini bu datayı büyütecek LTV modeline göre kurmalısınız.`} 
                />
            </div>

        </div>
    );
};
