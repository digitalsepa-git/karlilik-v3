import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedFinComponents';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Edit2, Calendar, FileText, Send } from 'lucide-react';
import { expensesData, variableRulesData, calculateDailyExpense } from '../../data/expensesData';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const TaxTab = () => {
    const { ordersData, globalDateRange } = useData();
    const { orders } = ordersData;

    // Filter Logic
    const { dateStart, dateEnd, diffDays } = useMemo(() => {
        const s = new Date(globalDateRange.startDate + 'T00:00:00Z');
        const e = new Date(globalDateRange.endDate + 'T23:59:59.999Z');
        const d = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
        return { dateStart: s, dateEnd: e, diffDays: d };
    }, [globalDateRange]);

    const prevDateStart = new Date(dateStart.getTime() - (diffDays * 24 * 60 * 60 * 1000));
    const prevDateEnd = new Date(dateStart.getTime() - 1);

    // KDV Hesaplama Motoru (Engine)
    const metrics = useMemo(() => {
        let curRev = 0;
        let prevRev = 0;
        let curVarExp = 0;
        let prevVarExp = 0;

        // 6-Aylık Trend Bucket'ları Oluşturma
        const trendMonths = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            trendMonths.push({
                label: d.toLocaleString('tr-TR', { month: 'short' }),
                monthStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                rev: 0,
                varExp: 0,
                hes: 0,
                ind: 0
            });
        }

        // --- 1. SİPARİŞ ve CİRO (Hesaplanan KDV için) ---
        if (orders) {
            orders.forEach(o => {
                const d = new Date(o.dateRaw || o.createdAt);
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED';
                const revenue = o.revenue || 0;
                
                // Cari Dönem
                if (d >= dateStart && d <= dateEnd && !isReturn) {
                    curRev += revenue;
                }
                // Önceki Dönem
                else if (d >= prevDateStart && d <= prevDateEnd && !isReturn) {
                    prevRev += revenue;
                }

                // Trend (Geçmiş Tüm 6 Ayı Tarama)
                const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const tBucket = trendMonths.find(m => m.monthStr === mStr);
                if (tBucket) {
                    if (!isReturn) tBucket.rev += revenue;
                }

                // --- 2. DEĞİŞKEN GİDERLER (İndirilecek KDV için) ---
                const channel = o.sourceName || 'Site';
                const itemsCount = o.lineItems ? o.lineItems.reduce((acc, item) => acc + (item.quantity || 1), 0) : 1;
                
                let orderVarExp = 0;
                variableRulesData.forEach(rule => {
                    if (rule.appliesTo !== 'all') {
                        const applies = Array.isArray(rule.appliesTo) ? rule.appliesTo.some(a => channel.includes(a)) : channel.includes(rule.appliesTo);
                        if (!applies) return;
                    }
                    if (rule.unit === 'return' && !isReturn) return;
                    if (rule.unit !== 'return' && isReturn) return;

                    let expenseAmt = 0;
                    if (rule.type === 'percentage') {
                        expenseAmt = revenue * (rule.val1 / 100);
                    } else if (rule.type === 'amount') {
                        expenseAmt = rule.unit === 'sale' ? (rule.val1 * itemsCount) : rule.val1;
                    } else if (rule.type === 'hybrid') {
                        expenseAmt = (revenue * (rule.val1 / 100)) + rule.val2;
                    }
                    orderVarExp += expenseAmt;
                });

                if (d >= dateStart && d <= dateEnd) curVarExp += orderVarExp;
                else if (d >= prevDateStart && d <= prevDateEnd) prevVarExp += orderVarExp;
                if (tBucket) tBucket.varExp += orderVarExp;
            });
        }

        // --- KDV Matematiksel Hesaplamaları ---
        // Yardımcı Fonksiyon: "İç Yüzde" KDV Bulma
        const calcKdv = (amount, rate = 20) => {
            const factor = 1 + (rate / 100);
            return amount - (amount / factor);
        };

        // Hesaplanan KDV (%85'i KDV 20, %10'u KDV 10, %5'i KDV 1 varsayımıyla harmanlama)
        const calcSalesVatDetailed = (rev) => {
            const r20 = calcKdv(rev * 0.85, 20);
            const r10 = calcKdv(rev * 0.10, 10);
            const r01 = calcKdv(rev * 0.05, 1);
            return { total: r20 + r10 + r01, r20, r10, r01 };
        };

        // İndirilecek KDV (Giderlerden)
        const getFixedVatRateForDays = (days) => {
            let fixedVat = 0;
            expensesData.forEach(ex => {
                // Varsayım: Sadece Opex ve Capex faturalıdır (KDV 20).
                // Maaş, Vergi, Finans(Faiz) kdv içermez.
                if (ex.valueType === 'amount' && ['opex', 'capex'].includes(ex.category) && ex.name !== 'Personel Maaşları') {
                    const amt = calculateDailyExpense(ex) * days;
                    fixedVat += calcKdv(amt, 20);
                }
            });
            return fixedVat;
        };

        // Current & Previous Values
        const curSalesDetails = calcSalesVatDetailed(curRev);
        const curSalesVat = curSalesDetails.total;
        const curInputVat = getFixedVatRateForDays(diffDays) + calcKdv(curVarExp, 20); // Tüm değişken giderler (Kargo, Ajans) KDV20 farz edilir.

        const prevSalesVat = calcSalesVatDetailed(prevRev).total;
        const prevInputVat = getFixedVatRateForDays(diffDays) + calcKdv(prevVarExp, 20);

        // Deltas
        const salesDelta = prevSalesVat > 0 ? ((curSalesVat - prevSalesVat) / prevSalesVat) * 100 : 0;
        const inputDelta = prevInputVat > 0 ? ((curInputVat - prevInputVat) / prevInputVat) * 100 : 0;

        // Populate Trend Data
        const monthlyFixedVat = getFixedVatRateForDays(30);
        trendMonths.forEach(t => {
            t.hes = calcSalesVatDetailed(t.rev).total;
            t.ind = monthlyFixedVat + calcKdv(t.varExp, 20);
        });

        // Payables
        const curPayable = curSalesVat - curInputVat;
        const prevPayable = prevSalesVat - prevInputVat;
        const payableDelta = prevPayable > 0 && curPayable > 0 ? ((curPayable - prevPayable) / prevPayable) * 100 : 0;

        return {
            curRev,
            salesVat: curSalesVat,
            inputVat: curInputVat,
            salesDelta,
            inputDelta,
            payableDelta,
            curSalesDetails,
            trendData: trendMonths
        };
    }, [orders, diffDays, dateStart, dateEnd, prevDateStart, prevDateEnd]);

    const hasAnyData = orders?.length > 0;

    if (!hasAnyData) return <EmptyState title="Vergi Verisi Yok" message="Henüz KDV / Vergi tabanınızı oluşturacak işlem bulunamadı." />;

    const payableVat = Math.max(0, metrics.salesVat - metrics.inputVat);
    const deferredVat = Math.max(0, metrics.inputVat - metrics.salesVat);

    // Dynamic Chart Data
    const pieData = [
        { name: '%20 KDV Kalemi', value: metrics.curSalesDetails.r20, color: '#514BEE' },
        { name: '%10 KDV Kalemi', value: metrics.curSalesDetails.r10, color: '#3B82F6' }, // Mavi ton
        { name: '%1 KDV Kalemi', value: metrics.curSalesDetails.r01, color: '#10B981' }   // Yeşil ton
    ].filter(p => p.value > 0);

    const formatDeltaStr = (val) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign} %${Math.abs(val).toFixed(1)}`;
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Hesaplanan KDV (Bu Dönem)" 
                    value={fmt(metrics.salesVat)} 
                    delta={formatDeltaStr(metrics.salesDelta)} 
                    tone={metrics.salesDelta > 0 ? "positive" : "negative"} 
                    tooltip="Müşterilerinize yaptığınız satışlardan devlete ödemek üzere tahsil ettiğiniz KDV tutarıdır."
                />
                <KpiCard 
                    title="İndirilecek KDV (Bu Dönem)" 
                    value={fmt(metrics.inputVat)} 
                    delta={formatDeltaStr(metrics.inputDelta)} 
                    tone="neutral" 
                    tooltip="İşletmeniz için yaptığınız faturalı harcamalar (Örn: Lojistik, Reklam, Ürün Alımı) sırasında ödediğiniz ve devlete vereceğiniz vergiden 'indireceğiniz' (krediniz olan) KDV tutarıdır."
                />
                <KpiCard 
                    title="Ödenecek KDV" 
                    value={payableVat > 0 ? fmt(payableVat) : '—'} 
                    delta={payableVat > 0 ? formatDeltaStr(metrics.payableDelta) : null}
                    tone={payableVat > 0 ? (metrics.payableDelta > 0 ? 'negative' : 'positive') : 'neutral'} 
                    tooltip="Hesaplanan KDV'nin İndirilecek KDV'den büyük olması durumunda, aradaki farkın vergi dairesine nakit olarak ödenmesi gereken net tutarıdır."
                />
                <KpiCard 
                    title="Devreden KDV" 
                    value={deferredVat > 0 ? fmt(deferredVat) : '—'} 
                    tone={deferredVat > 0 ? 'positive' : 'neutral'} 
                    tooltip="Giderleriniz (İndirilecek KDV) satışlarınızdan daha fazla olduğunda, zarar ettiğiniz KDV alacağının devlete ödenmeyip bir sonraki aya 'kredi (rezerv)' olarak aktarıldığı tutardır."
                />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2">
                    <ChartCard 
                        title="KDV Trendi (Son 6 Ay)"
                        chart={
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics.trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(v) => `${Math.abs(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#B4B4C8' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        formatter={(value) => fmt(value)}
                                        contentStyle={{ backgroundColor: '#0F1223', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}
                                        labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Line type="monotone" dataKey="hes" name="Hesaplanan (Satış)" stroke={C.primary} strokeWidth={3} dot={{ stroke: C.primary, strokeWidth: 2, r: 4, fill: '#fff' }} />
                                    <Line type="monotone" dataKey="ind" name="İndirilecek (Gider)" stroke={C.success} strokeWidth={3} dot={{ stroke: C.success, strokeWidth: 2, r: 4, fill: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        }
                    />
                </div>
                <ChartCard 
                    title="Satış KDV Kırılımı"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={78} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => fmt(value)}
                                    contentStyle={{ backgroundColor: '#0F1223', borderColor: '#1F2937', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle" 
                                    wrapperStyle={{ fontSize: '11px', fontWeight: '500', color: '#7D7DA6', marginTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABLOLAR */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <TableCard
                    title="KDV Beyanname Önizlemesi (Taslak)"
                    action={
                        <div className="flex gap-2">
                            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#EDEDF0] text-[#0F1223] hover:bg-[#FAFAFB] flex items-center gap-1.5 transition-colors"><FileText size={12}/> PDF</button>
                            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#514BEE] text-white hover:bg-[#4338CA] flex items-center gap-1.5 transition-colors shadow-sm"><Send size={12}/> Dışa Aktar</button>
                        </div>
                    }
                    columns={[
                        { key: 'no', label: 'Satır', align: 'left', className: 'text-[#7D7DA6] font-medium w-12' },
                        { key: 'desc', label: 'Vergi Kalemi Açıklaması', align: 'left', className: 'font-medium text-[#0F1223]' },
                        { key: 'amt', label: 'Hesaplanan Tutar', align: 'right', className: 'font-bold tracking-tight' },
                    ]}
                    rows={[
                        { no: '1.', desc: 'Teslim ve Hizmetlerin Karşılığını Teşkil Eden Bedel (KDV Hariç Ciro)', amt: fmt(metrics.curRev - metrics.salesVat) },
                        { no: '2.', desc: 'Hesaplanan KDV (Toplam Vergi Çıkışı)', amt: <span className="text-[#514BEE]">{fmt(metrics.salesVat)}</span> },
                        { no: '3.', desc: 'İndirilecek KDV (Fatura/Giderlerden Düşülen)', amt: <span className="text-[#10B981]">{fmt(metrics.inputVat)}</span> },
                        { no: '4.', desc: 'İhracat ve İstisna Kapsamındaki İşlemler', amt: fmt(0) },
                        { no: '5.', desc: 'Ödenecek KDV (Net devlete ödenecek miktar)', amt: <span className={payableVat > 0 ? "text-red-600 font-black text-base" : "text-slate-400 font-medium"}>{payableVat > 0 ? fmt(payableVat) : 'Vergi Çıkmadı'}</span> },
                        { no: '6.', desc: 'Sonraki Döneme Devreden KDV (Kalan Kredi)', amt: <span className={deferredVat > 0 ? "text-emerald-500 font-bold" : "text-slate-400"}>{deferredVat > 0 ? fmt(deferredVat) : '—'}</span> },
                    ]}
                />
                
                {/* VERGİ TAKVİMİ SIDEBAR */}
                <div className="bg-white rounded-xl border border-[#EDEDF0] p-6 flex flex-col h-full shadow-sm">
                    <h3 className="text-[14px] font-bold text-[#0F1223] mb-4 flex items-center gap-2 pb-3 border-b border-[#EDEDF0]"><Calendar size={18} className="text-[#514BEE]"/> Resmi Mükellef Takvimi</h3>
                    <div className="flex-1 space-y-4 pt-1">
                        <div className="p-4 bg-gradient-to-br from-[#FEF2F2] to-white border border-[#FECACA] rounded-xl relative overflow-hidden transition-all hover:shadow-md">
                            <div className="absolute top-0 right-0 p-3 opacity-5 text-red-600"><Calendar size={48}/></div>
                            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> 26 {new Date().toLocaleString('tr-TR', {month: 'long'})}
                            </p>
                            <p className="text-[14px] font-extrabold text-[#0F1223]">Muhtasar Beyanname</p>
                            <p className="text-[12px] text-[#7D7DA6] mt-1.5 line-clamp-2">Kira ve SGK stopaj kesintilerinin maliyeye bildirim dönemi.</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-[#F0F9FF] to-white border border-[#BAE6FD] rounded-xl relative overflow-hidden transition-all hover:shadow-md">
                            <div className="absolute top-0 right-0 p-3 opacity-5 text-blue-600"><Calendar size={48}/></div>
                            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                28 {new Date().toLocaleString('tr-TR', {month: 'long'})}
                            </p>
                            <p className="text-[14px] font-extrabold text-[#0F1223]">KDV-1 Beyannamesi</p>
                            <div className="mt-2 bg-white/60 p-2 rounded-lg border border-[#E0E7FF]">
                                <p className="text-[10px] text-[#7D7DA6] font-bold mb-0.5">SİSTEM TAHMİNİ TUTAR</p>
                                <p className={`text-[15px] font-black ${payableVat > 0 ? 'text-[#0F1223]' : 'text-emerald-600'}`}>{payableVat > 0 ? fmt(payableVat) : 'Ödeme Yok (Devir)'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payableVat > metrics.inputVat * 1.5 && (
                    <InsightCard 
                        type="alert" 
                        title="Ödenecek KDV Yüksek Alarmı" 
                        body={`Satış KDV'niz gider (indirim) tahakkukundan çok daha yüksek. Bu ay nakit akışınızdan fazladan vergi olarak ${fmt(payableVat)} çıkacak. Satın alma ve reklam faturalarınızın portala tam işlendiğine emin olun.`} 
                    />
                )}
                {deferredVat > 0 && deferredVat > metrics.curRev * 0.1 && (
                    <InsightCard 
                        type="info" 
                        title="Yüksek Devreden KDV Rezervi" 
                        body={`Cironuzun %10'undan daha yüksek bir İndirilecek KDV (${fmt(deferredVat)}) sonraki aya devretti. Geçmiş alımlarınızın vergi avantajını aylarca vergi ödemeden kullanabilirsiniz.`} 
                    />
                )}
                {payableVat <= metrics.inputVat * 1.5 && deferredVat <= metrics.curRev * 0.1 && (
                    <InsightCard type="suggestion" title="Muhtasar ve Beyanname Rutini" body="Tüm beyanname ve vergi tahakkuklarınız stabil ilerliyor, kritik bir KDV açığı veya fazlası tespit edilmedi." />
                )}
                <InsightCard type="info" title="Mükellef Bildirimi" body={`Bu dönemin (KDV-1) beyan yükümlülüklerine ortalama ${(new Date(new Date().getFullYear(), new Date().getMonth(), 28).getTime() - new Date().getTime()) / (1000 * 3600 * 24) > 0 ? Math.floor((new Date(new Date().getFullYear(), new Date().getMonth(), 28).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 30} gün kaldı.`} />
            </div>

        </div>
    );
};
