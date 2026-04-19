import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, C } from './SharedFinComponents';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Edit2, Calendar, FileText, Send } from 'lucide-react';
import { expensesData, calculateDailyExpense } from '../../data/expensesData';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const TaxTab = () => {
    const { ordersData, globalDateRange } = useData();
    const { orders } = ordersData;

    // Filter Logic
    const { start: dateStart, end: dateEnd } = useMemo(() => {
        return { 
            start: new Date(globalDateRange.startDate + 'T00:00:00Z'), 
            end: new Date(globalDateRange.endDate + 'T23:59:59.999Z') 
        };
    }, [globalDateRange]);

    // Calculating Sales VAT (Hesaplanan KDV) and Expenses VAT (İndirilecek KDV)
    const { salesVat, expVat } = useMemo(() => {
        let v_sales = 0;
        if (orders) {
            orders.forEach(o => {
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED';
                if (!isReturn && o.revenue) {
                    // Roughly 20% VAT on sales revenue
                    v_sales += o.revenue - (o.revenue / 1.20);
                }
            });
        }

        // Dummy logic for expenses vat
        let v_exp = 0;
        const diffDays = Math.max(1, Math.ceil((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)));
        expensesData.filter(e => e.valueType === 'amount').forEach(e => {
            const amt = calculateDailyExpense(e) * diffDays;
            v_exp += amt - (amt / 1.20); 
        });

        // Add some flat KDV for goods purchased
        v_exp += (v_sales * 0.4); 

        return { salesVat: v_sales, expVat: v_exp };
    }, [orders, dateStart, dateEnd]);

    const hasAnyData = orders?.length > 0;

    if (!hasAnyData) return <EmptyState title="Vergi Verisi Yok" message="Henüz KDV / Vergi tabanınızı oluşturacak işlem bulunamadı." />;

    const payableVat = Math.max(0, salesVat - expVat);
    const deferredVat = Math.max(0, expVat - salesVat);

    // MOCK DATA for Charts
    const lineData = [
        { name: 'Kas', hes: 45000, ind: 38000 },
        { name: 'Ara', hes: 55000, ind: 52000 },
        { name: 'Oca', hes: 48000, ind: 35000 },
        { name: 'Şub', hes: 42000, ind: 45000 },
        { name: 'Mar', hes: 60000, ind: 40000 },
        { name: 'Nis', hes: salesVat, ind: expVat },
    ];

    const pieData = [
        { name: '%20 KDV', value: salesVat * 0.85, color: '#514BEE' },
        { name: '%10 KDV', value: salesVat * 0.12, color: '#FBBF24' },
        { name: '%1 KDV', value: salesVat * 0.03, color: '#F87171' }
    ];

    const barData = [
        { name: 'KDV Ödenen', val: 75000 },
        { name: 'Muhtasar', val: 24000 },
        { name: 'Geçici Vergi', val: 56000 },
        { name: 'Stopaj', val: 12000 }
    ];

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard title="Hesaplanan KDV (Bu Dönem)" value={fmt(salesVat)} delta="+ %12" tone="neutral" />
                <KpiCard title="İndirilecek KDV (Bu Dönem)" value={fmt(expVat)} delta="- %5" tone="neutral" />
                <KpiCard title="Ödenecek KDV" value={payableVat > 0 ? fmt(payableVat) : '—'} tone={payableVat > 0 ? 'negative' : 'neutral'} />
                <KpiCard title="Devreden KDV" value={deferredVat > 0 ? fmt(deferredVat) : '—'} tone={deferredVat > 0 ? 'positive' : 'neutral'} />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[260px]">
                <div className="col-span-2">
                    <ChartCard 
                        title="KDV Trendi (Son 6 Ay)"
                        chart={
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7D7DA6' }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(v) => `${v/1000}K`} tick={{ fontSize: 10, fill: '#B4B4C8' }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(value) => fmt(value)} />
                                    <Line type="monotone" dataKey="hes" name="Hesaplanan" stroke={C.primary} strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="ind" name="İndirilecek" stroke={C.success} strokeWidth={3} dot={false} />
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
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value) => fmt(value)} />
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
                            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#EDEDF0] hover:bg-[#FAFAFB] flex items-center gap-1.5"><FileText size={12}/> PDF</button>
                            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#514BEE] text-white hover:bg-[#4338CA] flex items-center gap-1.5"><Send size={12}/> Gönder</button>
                        </div>
                    }
                    columns={[
                        { key: 'no', label: 'Satır', align: 'left' },
                        { key: 'desc', label: 'Açıklama', align: 'left', className: 'font-medium text-[#0F1223]' },
                        { key: 'amt', label: 'Tutar', align: 'right', className: 'font-bold' },
                    ]}
                    rows={[
                        { no: '1.', desc: 'Teslim ve Hizmetlerin Karşılığını Teşkil Eden Bedel', amt: fmt(salesVat * 5) },
                        { no: '2.', desc: 'Hesaplanan KDV', amt: <span className="text-[#514BEE]">{fmt(salesVat)}</span> },
                        { no: '3.', desc: 'İndirilecek KDV', amt: <span className="text-[#10B981]">{fmt(expVat)}</span> },
                        { no: '4.', desc: 'İhracat ve İstisna (KDV SIFIR)', amt: fmt(0) },
                        { no: '5.', desc: 'Ödenecek KDV', amt: <span className={payableVat > 0 ? "text-red-500 font-extrabold text-base" : ""}>{fmt(payableVat)}</span> },
                        { no: '6.', desc: 'Sonraki Döneme Devreden KDV', amt: <span className={deferredVat > 0 ? "text-emerald-500" : ""}>{fmt(deferredVat)}</span> },
                    ]}
                />
                
                {/* VERGİ TAKVİMİ SIDEBAR */}
                <div className="bg-white rounded-xl border border-[#EDEDF0] p-6 flex flex-col h-full">
                    <h3 className="text-[14px] font-bold text-[#0F1223] mb-4 flex items-center gap-2"><Calendar size={16} className="text-[#514BEE]"/> Vergi Takvimi</h3>
                    <div className="flex-1 space-y-4">
                        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10"><Calendar size={32}/></div>
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">26 Nisan</p>
                            <p className="text-[13px] font-bold text-[#0F1223]">Muhtasar Beyanname</p>
                            <p className="text-[11px] text-[#7D7DA6] mt-1 line-clamp-1">Kira ve SGK stopaj kesintileri</p>
                            <button className="text-[10px] font-bold text-red-600 mt-2 hover:underline">Hatırlatıcı Ekle</button>
                        </div>
                        <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10"><Calendar size={32}/></div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">28 Nisan</p>
                            <p className="text-[13px] font-bold text-[#0F1223]">KDV-1 Beyannamesi</p>
                            <p className="text-[11px] text-[#7D7DA6] mt-1 line-clamp-1">Tahmini: {payableVat > 0 ? fmt(payableVat) : 'Devir'}</p>
                            <button className="text-[10px] font-bold text-blue-600 mt-2 hover:underline">Hatırlatıcı Ekle</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard type="alert" title="Ödenecek KDV Yüksek Çıkacak" body="Bu ay indirilecek KDV'niz hesaplanan KDV'nin oldukça altında. Satın alma faturalarını zamanında işlemeye özen gösterin." />
                <InsightCard type="info" title="Muhtasar Uyarısı" body="Bu dönemin muhtasar ve SGK bildirimi yükümlülüklerine 8 gün kaldı." />
            </div>

        </div>
    );
};
