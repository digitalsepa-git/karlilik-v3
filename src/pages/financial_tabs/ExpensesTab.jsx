import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { EmptyState, KpiCard, ChartCard, TableCard, InsightCard } from './SharedFinComponents';
import { Treemap, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronRight, AlertCircle, ShoppingCart } from 'lucide-react';
import { expensesData, variableRulesData, calculateDailyExpense } from '../../data/expensesData';

const fmt = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

export const ExpensesTab = () => {
    const { ordersData, globalDateRange } = useData();
    const { orders } = ordersData;

    // Filter Logic
    const { start: dateStart, end: dateEnd } = useMemo(() => {
        return { 
            start: new Date(globalDateRange.startDate + 'T00:00:00Z'), 
            end: new Date(globalDateRange.endDate + 'T23:59:59.999Z') 
        };
    }, [globalDateRange]);

    const diffDays = Math.max(1, Math.ceil((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Previous period logic (e.g. if 30 days selected, prev is the 30 days before that)
    const prevDateStart = new Date(dateStart.getTime() - (diffDays * 24 * 60 * 60 * 1000));
    const prevDateEnd = new Date(dateStart.getTime() - 1);

    // Calculate dynamic expenses based on real orders + expensesData rules
    const metrics = useMemo(() => {
        // --- BASE CURENT PERIOD ---
        let currentOrders = [];
        let currentNetCiro = 0;
        
        // --- BASE PREV PERIOD ---
        let prevOrders = [];
        let prevNetCiro = 0;

        if (orders) {
            orders.forEach(o => {
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED';
                const d = new Date(o.dateRaw || o.createdAt);
                
                if (d >= dateStart && d <= dateEnd) {
                    currentOrders.push(o);
                    if (!isReturn) currentNetCiro += (o.revenue || 0);
                } else if (d >= prevDateStart && d <= prevDateEnd) {
                    prevOrders.push(o);
                    if (!isReturn) prevNetCiro += (o.revenue || 0);
                }
            });
        }

        // --- CALCULATION ENGINE ---
        const calcPeriod = (periodOrders, days) => {
            let catMap = {}; // { catKey: { name, count, value } }
            let totalFixed = 0;
            let totalVariable = 0;

            // 1. FIXED EXPENSES (Pro-rated per days)
            expensesData.forEach(ex => {
                if (ex.valueType === 'amount') {
                    const amt = calculateDailyExpense(ex) * days;
                    if (!catMap[ex.category]) catMap[ex.category] = { name: ex.category, count: 0, value: 0 };
                    
                    catMap[ex.category].value += amt;
                    catMap[ex.category].count += 1; // 1 fixed rule count
                    totalFixed += amt;
                }
            });

            // 2. VARIABLE EXPENSES based on Orders
            periodOrders.forEach(o => {
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'CANCELLED';
                const channel = o.sourceName || 'Site';
                const itemsCount = o.lineItems ? o.lineItems.reduce((acc, item) => acc + (item.quantity || 1), 0) : 1;
                
                variableRulesData.forEach(rule => {
                    // Check appliesTo
                    if (rule.appliesTo !== 'all') {
                        const applies = Array.isArray(rule.appliesTo) ? rule.appliesTo.some(a => channel.includes(a)) : channel.includes(rule.appliesTo);
                        if (!applies) return;
                    }
                    
                    // Check unit applicability
                    if (rule.unit === 'return' && !isReturn) return;
                    if (rule.unit !== 'return' && isReturn) return; // Don't charge commission on returns generally (simplified)

                    let expenseAmt = 0;
                    if (rule.type === 'percentage') {
                        expenseAmt = (o.revenue || 0) * (rule.val1 / 100);
                    } else if (rule.type === 'amount') {
                        expenseAmt = rule.unit === 'sale' ? (rule.val1 * itemsCount) : rule.val1;
                    } else if (rule.type === 'hybrid') {
                        expenseAmt = ((o.revenue || 0) * (rule.val1 / 100)) + rule.val2;
                    }

                    if (expenseAmt > 0) {
                         if (!catMap[rule.category]) catMap[rule.category] = { name: rule.category, count: 0, value: 0 };
                         catMap[rule.category].value += expenseAmt;
                         catMap[rule.category].count += 1;
                         totalVariable += expenseAmt;
                    }
                });
            });

            const totalExpenses = totalFixed + totalVariable;
            const fixedPct = totalExpenses > 0 ? (totalFixed / totalExpenses) * 100 : 0;
            const variablePct = totalExpenses > 0 ? (totalVariable / totalExpenses) * 100 : 0;

            return { catMap, totalFixed, totalVariable, totalExpenses, fixedPct };
        };

        const currentMetrics = calcPeriod(currentOrders, diffDays);
        const prevMetrics = calcPeriod(prevOrders, diffDays);

        // Calculate deltas
        const growth = prevMetrics.totalExpenses > 0 
            ? ((currentMetrics.totalExpenses - prevMetrics.totalExpenses) / prevMetrics.totalExpenses) * 100 
            : 0;

        // OPEX logic (Fixed expenses usually map to Opex/Capex/Finance, Variable to Pazarlama/Lojistik vb)
        const currentOpex = ['opex', 'capex', 'finance'].reduce((acc, c) => acc + (currentMetrics.catMap[c]?.value || 0), 0);
        const prevOpex = ['opex', 'capex', 'finance'].reduce((acc, c) => acc + (prevMetrics.catMap[c]?.value || 0), 0);
        
        const currentOpexToCiro = currentNetCiro > 0 ? (currentOpex / currentNetCiro) * 100 : 0;
        const prevOpexToCiro = prevNetCiro > 0 ? (prevOpex / prevNetCiro) * 100 : 0;
        const opexToCiroDelta = currentOpexToCiro - prevOpexToCiro;

        // Marketing logic for insights
        const currentMarketing = currentMetrics.catMap['marketing']?.value || 0;
        const prevMarketing = prevMetrics.catMap['marketing']?.value || 0;
        const marketingGrowth = prevMarketing > 0 ? ((currentMarketing - prevMarketing) / prevMarketing) * 100 : 0;
        const marketingRatio = currentNetCiro > 0 ? (currentMarketing / currentNetCiro) * 100 : 0;

        // Build combined table rows
        const tableMap = {};
        Object.keys(currentMetrics.catMap).forEach(k => {
            tableMap[k] = { 
                key: k, 
                count: currentMetrics.catMap[k].count, 
                cur: currentMetrics.catMap[k].value, 
                prev: prevMetrics.catMap[k]?.value || 0 
            };
        });
        Object.keys(prevMetrics.catMap).forEach(k => {
             if (!tableMap[k]) {
                 tableMap[k] = { key: k, count: 0, cur: 0, prev: prevMetrics.catMap[k].value };
             }
        });

        const tableRows = Object.values(tableMap).sort((a,b) => b.cur - a.cur);

        return { 
            current: currentMetrics, 
            prev: prevMetrics, 
            growth,
            currentNetCiro,
            currentOpexToCiro,
            opexToCiroDelta,
            marketingGrowth,
            marketingRatio,
            tableRows
        };
    }, [orders, diffDays, dateStart, dateEnd, prevDateStart, prevDateEnd]);

    const hasAnyData = expensesData.length > 0;

    if (!hasAnyData) return <EmptyState title="Gider Analizi Verisi Yok" message="Gider raporları için henüz hiç masraf kaydı eklenmemiş." />;

    // --- RENDER HELPERS ---
    const formatDeltaStr = (val, isPercentagePoint = false) => {
        const sign = val >= 0 ? '+' : '';
        const unit = isPercentagePoint ? 'pp' : '%';
        return `${sign} ${Math.abs(val).toFixed(1)} ${unit}`;
    };

    // Mapping category keys to display text and colors
    const categoryDict = {
        'opex': { label: 'Operasyon (OPEX)', color: '#60A5FA' },
        'capex': { label: 'Yatırım (CAPEX)', color: '#10B981' },
        'finance': { label: 'Finans', color: '#F59E0B' },
        'tax': { label: 'Vergi', color: '#EF4444' },
        'marketing': { label: 'Pazarlama', color: '#8B5CF6' },
        'logistics': { label: 'Lojistik', color: '#3B82F6' },
        'payment': { label: 'Ödeme ve Komisyon', color: '#6366F1' },
    };

    // Charts Data
    const treemapData = Object.values(metrics.current.catMap).map(c => {
        const percentage = metrics.current.totalExpenses > 0 ? (c.value / metrics.current.totalExpenses) * 100 : 0;
        return {
            name: categoryDict[c.name]?.label || c.name.toUpperCase(),
            size: c.value,
            percentage,
            fill: categoryDict[c.name]?.color || '#8B5CF6'
        };
    }).filter(c => c.size > 0);

    const CustomTreemapContent = (props) => {
        const { x, y, width, height, name, size, percentage, fill } = props;
        
        // Çok ince veya daracık kutular (çizgi gibi)
        if (width < 25 || height < 18) {
            return <rect x={x} y={y} width={width} height={height} style={{ fill: fill, stroke: '#fff', strokeWidth: 2, fillOpacity: 0.95 }} />;
        }

        const isSmall = height < 40 || width < 50;

        return (
          <g>
            <rect x={x} y={y} width={width} height={height} style={{ fill: fill, stroke: '#fff', strokeWidth: 2, fillOpacity: 0.95 }} />
            <foreignObject x={x} y={y} width={width} height={height} style={{ pointerEvents: 'none' }}>
                <div className={`w-full h-full flex flex-col justify-start overflow-hidden text-white ${height < 30 ? 'p-1' : 'p-2'}`} xmlns="http://www.w3.org/1999/xhtml">
                    <span 
                        className={`font-bold ${isSmall ? 'text-[10px]' : 'text-[13px]'} leading-tight truncate w-full block`} 
                        title={name}
                    >
                        {name}
                    </span>
                    {height >= 40 && (
                        <span className="text-[11px] font-medium opacity-90 truncate w-full block mt-0.5">
                            {fmt(size)}
                        </span>
                    )}
                    {height >= 60 && percentage > 0 && (
                        <span className="text-xs font-extra-bold opacity-100 truncate w-full block mt-0.5">
                            %{percentage.toFixed(1)}
                        </span>
                    )}
                </div>
            </foreignObject>
          </g>
        );
    };

    const CustomTreemapTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#0F1223] border border-slate-700/50 p-4 rounded-xl shadow-2xl text-white min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                         <div className="w-3 h-3 rounded-full" style={{backgroundColor: data.fill}}></div>
                         <span className="text-sm font-bold">{data.name}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-xs text-slate-400 font-medium">Toplam Tutar</span>
                            <span className="text-sm text-white font-bold">{fmt(data.size)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-xs text-slate-400 font-medium">Toplam Pay</span>
                            <span className="text-sm text-emerald-400 font-bold">%{data.percentage?.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const comparisonBarData = metrics.tableRows.map(r => ({
        name: categoryDict[r.key]?.label || r.key,
        onceki_donem: Math.floor(r.prev),
        bu_donem: Math.floor(r.cur)
    }));

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 max-w-[1440px] mx-auto w-full">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                    title="Toplam Gider (Bu Dönem)" 
                    value={fmt(metrics.current.totalExpenses)} 
                    delta={formatDeltaStr(metrics.growth)} 
                    tone={metrics.growth > 0 ? "negative" : "positive"} 
                    tooltip="Seçili tarih aralığında gerçekleşen Sabit (Kira, Personel vb.) ve Değişken (Pazarlama, Komisyon vb.) tüm işletme giderlerinizin kümülatif toplamıdır."
                />
                <KpiCard 
                    title="Sabit / Değişken Oranı" 
                    value={`%${metrics.current.fixedPct.toFixed(1)} / %${(100 - metrics.current.fixedPct).toFixed(1)}`} 
                    tooltip="Giderlerinizin ne kadarının kemikleşmiş Sabit Gider, ne kadarının siparişe duyarlı Değişken Gider olduğunu gösterir."
                />
                <KpiCard 
                    title="Gider Değişimi" 
                    value={formatDeltaStr(metrics.growth)} 
                    delta="" 
                    tone={metrics.growth > 0 ? "negative" : "positive"} 
                    tooltip="Önceki aynı uzunluktaki döneme kıyasla toplam giderinizin büyüme veya küçülme oranı."
                />
                <KpiCard 
                    title="Opex / Net Ciro" 
                    value={`%${metrics.currentOpexToCiro.toFixed(1)}`} 
                    delta={formatDeltaStr(metrics.opexToCiroDelta, true)} 
                    tone={metrics.opexToCiroDelta > 0 ? "warning" : "positive"} 
                    tooltip="Operasyonel (Sabırlı) Giderlerinizin kazandığınız Net Ciroya oranıdır. Düşük olması kârlılık için olumludur."
                />
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 gap-6 h-[320px]">
                <ChartCard 
                    title="Ağırlıklı Gider Dağılımı"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap data={treemapData} dataKey="size" ratio={4 / 3} stroke="#fff" content={<CustomTreemapContent />}>
                                <Tooltip content={<CustomTreemapTooltip />} cursor={{fill: 'transparent', fillOpacity: 0.1}}/>
                            </Treemap>
                        </ResponsiveContainer>
                    }
                />
            </div>

            {/* TABLOLAR */}
            <TableCard
                title="Kategori Bazlı Gider Hareketleri"
                columns={[
                    { key: 'cat', label: 'Kategori', align: 'left' },
                    { key: 'count', label: 'Veri Kaydeden İşlem', align: 'left' },
                    { key: 'cur', label: 'Bu Dönem', align: 'right' },
                    { key: 'prev', label: 'Önceki Dönem', align: 'right' },
                    { key: 'delta', label: 'Değişim (%)', align: 'right' }
                ]}
                rows={metrics.tableRows.map((r, i) => {
                    const dict = categoryDict[r.key];
                    const change = r.prev > 0 ? ((r.cur - r.prev) / r.prev) * 100 : (r.cur > 0 ? 100 : 0);
                    const changeColor = change > 5 ? 'text-red-500' : (change < -5 ? 'text-emerald-500' : 'text-slate-500');
                    const changeSign = change > 0 ? '+' : '';

                    return {
                        cat: <span className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: dict?.color || '#ccc'}}/> {dict?.label || r.key}</span>,
                        count: <span className="text-slate-500 font-medium">{r.count} <span className="text-[10px] text-slate-300">kayıt/sipariş</span></span>,
                        cur: <span className="font-semibold text-slate-900">{fmt(r.cur)}</span>,
                        prev: <span className="text-slate-500">{fmt(r.prev)}</span>,
                        delta: <span className={`font-bold ${changeColor}`}>{changeSign}{change.toFixed(1)}%</span>
                    };
                })}
            />

            {/* INSIGHTS */}
            {metrics.marketingGrowth > 20 && (
                <div className="bg-white border-2 border-red-100 rounded-xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(239,68,68,0.05)]">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                <AlertCircle size={20} className="fill-red-100" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0F1223] mb-1">Dikkat: Agresif Pazarlama Maliyeti</h3>
                                <p className="text-xs text-[#7D7DA6] max-w-lg leading-relaxed">
                                    Pazarlama giderleriniz önceki döneme göre <strong className="text-red-500 font-semibold">%{(metrics.marketingGrowth).toFixed(0)}</strong> oranında arttı. Ciroya oranı ise %{metrics.marketingRatio.toFixed(1)} seviyesine ulaştı. Satış getirisinin (ROAS) aynı oranda artıp artmadığını kontrol edin.
                                </p>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors px-4 py-2 rounded-lg flex items-center gap-1">
                            Aksiyon Planı <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {(metrics.opexToCiroDelta > 3 && metrics.currentOpexToCiro > 30) && (
                <div className="bg-white border-2 border-amber-100 rounded-xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(251,191,36,0.05)] mt-4">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <AlertCircle size={20} className="fill-amber-100" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0F1223] mb-1">Uyarı: Opex Zayıflaması</h3>
                                <p className="text-xs text-[#7D7DA6] max-w-lg leading-relaxed">
                                    Operasyonel giderlerinizin ciroya oranı artış eğiliminde (+{metrics.opexToCiroDelta.toFixed(1)} pp). Sabit maliyetleriniz satış ivmenize göre yüksek kalıyor olabilir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <InsightCard type="trend" title="Lojistik Erozyonu" body={`Dönem boyunca izlenen maliyetlerin %${(metrics.current.totalExpenses > 0 ? (metrics.current.catMap['logistics']?.value || 0) / metrics.current.totalExpenses * 100 : 0).toFixed(1)}'si doğrudan kargo ve paketleme komisyonlarına gitti.`} />
                <InsightCard type="suggestion" title="Abonelik / SaaS Optimizasyonu" body="Sabit (Opex) kalemlerde listelenen 8 adet bulut aboneliği kârlılığı kemiriyor, alternatif freemium pazar araştırması tavsiye edilir." />
            </div>

        </div>
    );
};
