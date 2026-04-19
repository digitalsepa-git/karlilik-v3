import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard, CashRunwayDial, C } from './SharedFinComponents';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, Calendar, CreditCard, Send, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const CashflowTab = () => {
    const { ordersData } = useData();
    const { transactions, loading } = ordersData;

    const hasAnyData = transactions && transactions.length > 0;

    const { 
        cuzdanBakiye, 
        buAyNet, 
        gelecek30GunToplam, 
        areaData, 
        gelecek30GunTableList,
        barData,
        pieData
    } = useMemo(() => {
        if (!hasAnyData) return { cuzdanBakiye: 0, buAyNet: 0, gelecek30GunToplam: 0, areaData: [], gelecek30GunTableList: [], barData: [], pieData: [] };

        const now = new Date();
        const future30Date = new Date(now);
        future30Date.setDate(future30Date.getDate() + 30);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let cuzdan = 0;
        let ayNet = 0;
        let g30Top = 0;

        let timeline = {};
        let groupedTable = {};
        let kesintiCategories = {};

        transactions.forEach(t => {
            const isFuture = t.date >= now;
            const isNext30 = t.date >= now && t.date <= future30Date;
            const isThisMonth = t.date >= startOfMonth && t.date <= future30Date;

            // Trend & Totals
            if (t.type === 'Tahsilat') {
                if (isFuture) cuzdan += t.amt; // all future unpaid
                if (isNext30) g30Top += t.amt;
                if (isThisMonth) ayNet += t.amt;
            } else {
                if (isThisMonth) ayNet += t.amt; // amt is already negative from API for Kesinti
                
                // Pie data aggregation with Channel prefix
                const descLower = t.desc.toLowerCase();
                let cat = 'Diğer';
                if (descLower.includes('cargo') || descLower.includes('kargo')) cat = 'Kargo';
                else if (descLower.includes('commission') || descLower.includes('komisyon')) cat = 'Komisyon';
                else if (descLower.includes('hizmet')) cat = 'Hizmet Bedeli';
                
                const channelName = t.channel && t.channel.includes('ikas') ? 'İkas' : (t.channel || 'Bilinmeyen');
                const key = `${channelName} - ${cat}`;
                
                if (!kesintiCategories[key]) kesintiCategories[key] = 0;
                kesintiCategories[key] += Math.abs(t.amt);
            }

            // Timeline plotting (Aggregating daily net cash changes)
            if (isNext30) {
                const yyyy = t.date.getFullYear();
                const mm = String(t.date.getMonth() + 1).padStart(2, '0');
                const dd = String(t.date.getDate()).padStart(2, '0');
                const dayKey = `${yyyy}-${mm}-${dd}`;
                
                if (!timeline[dayKey]) timeline[dayKey] = 0;
                timeline[dayKey] += t.amt;

                const groupKey = `${dayKey}_${t.channel}`;
                if (!groupedTable[groupKey]) {
                    // Set time to noon to avoid timezone shift on sort
                    const d = new Date(t.date.getFullYear(), t.date.getMonth(), t.date.getDate(), 12, 0, 0); 
                    groupedTable[groupKey] = {
                        id: groupKey,
                        date: d,
                        dateStr: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                        channel: t.channel,
                        amt: 0
                    };
                }
                groupedTable[groupKey].amt += t.amt;
            }
        });

        let tableList = Object.values(groupedTable)
            .filter(g => g.amt !== 0) // Hide zero-net days
            .map(g => ({
                id: g.id,
                date: g.date,
                dateStr: g.dateStr,
                type: <span className={cn("px-2 py-0.5 rounded text-xs font-bold", g.amt > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {g.amt > 0 ? 'Toplu Hakediş' : 'Toplu Kesinti'}
                </span>,
                amt: <span className={cn("font-bold", g.amt > 0 ? "text-emerald-600" : "text-red-500")}>{Math.abs(g.amt) > 0 && g.amt < 0 ? '-' : ''}{fmt(Math.abs(g.amt))}</span>,
                channel: g.channel
            }));

        // Shape Area Timeline - mathematically accurate up to the LAST actual payout day
        const mappedArea = [];
        let cumulative = 0;
        
        // Find the last day to plot instead of blindly drawing 30 days
        const timelineDates = Object.keys(timeline);
        let maxDays = 0;
        if (timelineDates.length > 0) {
            const maxDateStr = timelineDates.sort().pop();
            const maxDateD = new Date(maxDateStr);
            maxDays = Math.ceil((maxDateD.getTime() - now) / (1000 * 60 * 60 * 24));
        }

        // Only iterate up to maxDays (or 30 if somehow went over)
        const limitDays = Math.min(Math.max(maxDays, 0), 30);

        for (let i = 0; i <= limitDays; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dayKey = `${y}-${m}-${dd}`;
            
            if (timeline[dayKey]) {
                cumulative += timeline[dayKey];
            }
            mappedArea.push({
                day: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                bakiye: cumulative
            });
        }

        // Map Pie with dynamic pallete for channels
        const palette = ['#60A5FA', '#F87171', '#C084FC', '#FBBF24', '#34D399', '#A78BFA', '#F472B6', '#14B8A6'];
        const mappedPie = Object.keys(kesintiCategories)
            .sort((a,b) => kesintiCategories[b] - kesintiCategories[a])
            .map((k, idx) => ({
                name: k, 
                value: kesintiCategories[k], 
                color: palette[idx % palette.length]
            }));

        tableList.sort((a,b) => a.date - b.date);

        return { 
            cuzdanBakiye: cuzdan, 
            buAyNet: ayNet, 
            gelecek30GunToplam: g30Top, 
            areaData: mappedArea,
            gelecek30GunTableList: tableList,
            pieData: mappedPie.length > 0 ? mappedPie : [{name: 'Kesinti Yok', value: 1, color: '#e5e7eb'}],
            barData: [] 
        };
    }, [transactions, hasAnyData]);

    if (loading) {
        return <div className="p-8 text-center text-[#7D7DA6]">Finansal Hakedişler Bekleniyor...</div>;
    }

    if (!hasAnyData) {
        return (
            <div className="p-8">
                <EmptyState title="Nakit Akışı Verisi Yok" message="İlgili dönemde hesabınıza geçecek (veya geçmiş) herhangi bir e-ticaret hakedişi/satışı bulunamadı." />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard 
                    title="Pazaryeri Cüzdan Bakiyesi" 
                    value={fmt(cuzdanBakiye)} 
                    delta="Tamamı size aktarılacak"
                    tone="positive"
                    tooltip="Trendyol ve kendi web siteniz (İkas) üzerinden satışı tamamlanmış, parası tahsil edilmiş ancak vade / çalışma günleri sebebiyle banka hesabınıza henüz geçmemiş olan İÇERİDEKİ SATIŞ GELİRİNİZİN (Kesintiler hariç Net) toplam tutarıdır. Kısacası: 'Pazaryerinde vadesini bekleyen taze nakitinizdir.'"
                />
                <KpiCard 
                    title="Bu Ay Nakit Akışı (Net)" 
                    value={fmt(buAyNet)} 
                    delta={buAyNet > 0 ? '+ Akış Şiddeti' : '- Negatif Makas'}
                    tone={buAyNet > 0 ? 'positive' : 'negative'}
                    tooltip="İçinde bulunduğumuz takvim ayı boyunca (ay başından sonuna kadar) banka hesabınıza fiilen geçmiş ve geçmesi kesinleşmiş olan TÜM e-ticaret hakedişlerinizin (Komisyon, Kargo ve Hizmet bedelleri düşüldükten sonraki NET) toplamıdır. Aylık gerçek nakit yaratma gücünüzü gösterir."
                />
                <KpiCard 
                    title="30 Gün Projeksiyon (Tahsilat)" 
                    value={fmt(gelecek30GunToplam)} 
                    delta="Öngörülen Nakit Girişi"
                    tone="neutral"
                    tooltip="Bugünden itibaren önümüzdeki 30 tam gün boyunca banka hesabınıza yatması planlanan (Vadesi bu 30 günlük pencereye düşen) kesinleşmiş nakit girişlerinin toplamıdır. Kısa vadeli harcama ve ödeme bütçenizi bu rakama göre planlayabilirsiniz."
                />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard 
                    title="Önümüzdeki 30 Gün Nakit Birikimi"
                    subtitle="Bekleyen hakedişlerin tarihlerine göre kümülatif hesaba geçiş grafiği"
                    tooltip="Bu grafik, eğer bugünden itibaren HİÇBİR YENİ SATIŞ YAPMASANIZ DAHİ, sadece içeride bekleyen (vadesi dolmamış) mevcut alacaklarınızın banka hesabınıza hangi tarihlerde, hangi hızla düşeceğini (Kümülatif S-Curve) gösterir. Yükselişin sıçradığı günler 'Pazaryeri Ödeme Günleri', düz kaldığı günler 'Ödemesiz Günleri' ifade eder."
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={C.primary} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={C.primary} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" hide />
                                <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#B4B4C8' }} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(value) => fmt(value)} labelFormatter={(label) => label} />
                                <Area type="monotone" dataKey="bakiye" stroke={C.primary} fillOpacity={1} fill="url(#colorBal)" isAnimationActive={true} />
                            </AreaChart>
                        </ResponsiveContainer>
                    }
                />
                <div className="grid grid-cols-1 gap-6 h-[260px]">
                    <ChartCard 
                        title="Satış Kanalı Kesinti Dağılımı (Mutabakat)"
                        tooltip="Kestiğiniz faturalar (Brüt Ciro) üzerinden e-ticaret altyapılarının ve satış kanallarınızın sizden kestiği komisyon, kargo, iade ve hizmet bedellerinin dağılımını gösterir. Hangi kalemde ne kadar kanama/gider olduğunu tespit edip karlılığınızı optimize etmeniz için kritik bir mutabakat haritasıdır."
                        chart={
                            <div className="flex w-full h-full items-center">
                                <div className="w-[45%] h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip formatter={(value) => fmt(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-[55%] flex flex-col justify-center h-full pl-6 pr-2 py-2">
                                    <div className="flex-1 overflow-y-auto pr-2">
                                        {pieData.map((entry, i) => (
                                            <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: entry.color}}></div>
                                                    <span className="text-[13px] text-slate-600 font-medium">{entry.name}</span>
                                                </div>
                                                <span className="text-[13px] font-bold text-slate-800">{fmt(entry.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between border-t-2 border-slate-100 pt-3 mt-1 pr-2">
                                        <span className="text-[13px] text-slate-800 font-bold">Toplam Kesinti</span>
                                        <span className="text-[14px] font-black text-rose-500">{fmt(pieData.reduce((sum, item) => sum + item.value, 0))}</span>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* TABLOLAR */}
            <div className="grid grid-cols-1 gap-6">
                <TableCard
                    title="Önümüzdeki 30 Gün Nakit Takvimi (Sıralı)"
                    pageSize={10}
                    columns={[
                        { key: 'dateStr', label: 'Tarih', align: 'left' },
                        { key: 'channel', label: 'Kanal', align: 'left' },
                        { key: 'type', label: 'İşlem', align: 'left' },
                        { key: 'amt', label: 'Net Tutar', align: 'right' },
                    ]}
                    rows={gelecek30GunTableList}
                />
            </div>

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard type="info" title="Canlı Nakit Hakediş" body="Bu sayfadaki veriler finansal ciro değil, kesintiler düşüldükten sonra bankanıza geçecek SOĞUK NAKİT projeksiyonudur." />
                <InsightCard type="trend" title="Otomatik Vade Tespit" body="Trendyol gibi platformlardaki +21 veya +28 gün vadeleriniz baz alınarak cüzdan grafiği gün gün kümülatif hesaplanmaktadır." />
            </div>
        </div>
    );
};
