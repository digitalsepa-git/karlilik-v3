import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { expensesData, calculateDailyExpense } from '../data/expensesData';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    ReferenceLine,
    AreaChart,
    Area,
    Legend
} from 'recharts';
import {
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Percent,
    FileText,
    FileSpreadsheet,
    File,
    Table,
    Download,
    ChevronDown,
    Package,
    Wallet,
    Activity,
    Info
} from 'lucide-react';
import { InventoryInsights } from '../components/dashboard/InventoryInsights';
import { MarketingPerformance } from '../components/dashboard/MarketingPerformance';
import { SalesChannelCards } from '../components/dashboard/SalesChannelCards';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { cn } from '../lib/utils';

const StatCard = ({ title, value, change, icon: Icon, trend, tooltip }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm relative hover:shadow-md transition-shadow hover:border-indigo-200 flex flex-col justify-between h-full group/card">
        <div>
            <div className="flex items-center justify-between pb-1.5">
                <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-slate-500">{title}</p>
                    {tooltip && (
                        <div className="group/tooltip flex items-center relative">
                            <Info className="h-3.5 w-3.5 text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
                            {/* Tooltip Popup positioned WIDE and UPWARDS */}
                            <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none w-80 p-3.5 bg-slate-800 text-white text-[11.5px] rounded-xl shadow-xl z-[999] text-left font-normal leading-relaxed">
                                {tooltip}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[6px] border-transparent border-t-slate-800"></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={cn("p-1.5 rounded-lg", trend === 'up' ? "text-emerald-600 bg-emerald-50" : trend === 'down' ? "text-rose-600 bg-rose-50" : "text-slate-500 bg-slate-50")}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            </div>
        </div>
        <div className="mt-3">
            <span className={cn("flex items-center text-[11px] font-bold", trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-rose-600" : "text-slate-500")}>
                {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />}
                {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                <span>{change}</span>
            </span>
        </div>
    </div>
);

// Custom Tooltip Component for Sales & Profit Chart
// Custom Tooltip Component for Break-even Chart
// Custom Tooltip Component for Break-even Chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Find if this is the breakeven point
        const isBe = payload[0]?.payload?.isBreakEven;
        const fullPayload = payload[0]?.payload;
        
        return (
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-50 text-left min-w-[260px]">
                {isBe && (
                    <div className="mb-3 inline-flex flex-col">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded uppercase tracking-wider">
                            🚀 Başabaş Noktası
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1 font-medium">Brüt kar, şirket giderlerini aştı!</span>
                    </div>
                )}
                <p className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                    {new Date(label).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                <div className="space-y-4">
                    {/* Günlük Değerler (Grafikte Çizilenler) */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">O Günün Akışı</p>
                        <div className="space-y-1.5">
                            <div className="text-[13px] flex items-center justify-between gap-6">
                                <span style={{ color: '#6366f1', fontWeight: 600 }}>Günlük Net Ciro:</span>
                                <span className="font-bold text-gray-800">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fullPayload.dailyCiro)}
                                </span>
                            </div>
                            <div className="text-[13px] flex items-center justify-between gap-6">
                                <span style={{ color: '#10b981', fontWeight: 600 }}>Günlük Brüt Kar:</span>
                                <span className="font-bold text-gray-800">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fullPayload.dailyBrutKar)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Kümülatif Değerler (Bilgi Amacıyla) */}
                    <div className="pt-3 border-t border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ay Başına Göre Birikimli Dağılım</p>
                        <div className="space-y-1.5">
                            <div className="text-[13px] flex items-center justify-between gap-6">
                                <span className="text-gray-500 font-medium">Toplam Net Ciro:</span>
                                <span className="font-bold text-gray-700">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fullPayload.netCiro)}
                                </span>
                            </div>
                            <div className="text-[13px] flex items-center justify-between gap-6">
                                <span className="text-gray-500 font-medium">Toplam Brüt Kar:</span>
                                <span className="font-bold text-gray-700">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fullPayload.brutKar)}
                                </span>
                            </div>
                            <div className="text-[13px] flex items-center justify-between gap-6 mt-2 pt-2 border-t border-gray-100">
                                <span style={{ color: fullPayload.netDurum < 0 ? '#e11d48' : '#10b981', fontWeight: 700 }}>
                                    Genel Kâr/Zarar:
                                </span>
                                <span className={cn("font-bold text-[15px] tracking-tight", fullPayload.netDurum < 0 ? "text-rose-600" : "text-emerald-600")}>
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(fullPayload.netDurum)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const Dashboard = ({ t, competition, onNavigate, filters = {} }) => {
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef(null);

    // Fetch live orders & products from global Context
    const { ordersData, productsData, analyticsData, setGlobalDateRange } = useData();
    const { orders, loading } = ordersData;
    const { products, loading: productsLoading } = productsData;
    const { data: gaData } = analyticsData || {};

    // Also fetch DB Competitors to see active competitive threats
    const [competitors, setCompetitors] = useState([]);
    useEffect(() => {
        fetch('/api/competitors')
            .then(res => {
                if (!res.ok) throw new Error("Fallback needed");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setCompetitors(data);
            })
            .catch(err => {
                console.warn("Falling back to static Competitors DB on Vercel", err);
                // Dynamically import fallback to avoid top-level path resolution issues if not used
                import('../server/competitors.json').then(module => {
                    const fallback = module.default;
                    if (Array.isArray(fallback)) setCompetitors(fallback);
                }).catch(() => { });
            });
    }, []);

    // Derive active filter values
    const activeCategory = filters.category || 'all';
    const activeChannel = filters.channel || 'all';
    const activeDateRange = filters.dateRange || 'last30';

    const getDateRangeBounds = (rangeFilter) => {
        const now = new Date();
        
        // Form strict TRT (UTC+3) midnight
        const trtNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const startOfTRTDay = new Date(Date.UTC(trtNow.getUTCFullYear(), trtNow.getUTCMonth(), trtNow.getUTCDate(), -3, 0, 0));
        const endOfTRTDay = new Date(startOfTRTDay.getTime() + (24 * 60 * 60 * 1000) - 1);

        switch (rangeFilter) {
            case 'thisMonth':
                return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfTRTDay };
            case 'lastQuarter': {
                const m = now.getMonth();
                let startMonth, year = now.getFullYear();
                if (m === 11 || m === 0 || m === 1) { startMonth = 11; if (m !== 11) year -= 1; }
                else if (m >= 2 && m <= 4) startMonth = 2;
                else if (m >= 5 && m <= 7) startMonth = 5;
                else startMonth = 8;
                return { start: new Date(year, startMonth, 1), end: endOfTRTDay };
            }
            case 'thisYear':
                return { start: new Date(now.getFullYear(), 0, 1), end: endOfTRTDay };
            default:
                if (rangeFilter && rangeFilter.startsWith('custom:')) {
                    const parts = rangeFilter.split(':');
                    return { start: new Date(parts[1] + 'T00:00:00Z'), end: new Date(parts[2] + 'T23:59:59.999Z') };
                }
                return { start: new Date(startOfTRTDay.getTime() - 29 * 24 * 60 * 60 * 1000), end: endOfTRTDay };
        }
    };

    const { start: dateStart, end: dateEnd } = useMemo(() => getDateRangeBounds(activeDateRange), [activeDateRange]);

    useEffect(() => {
        setGlobalDateRange({
            startDate: dateStart.toISOString().split('T')[0],
            endDate: dateEnd.toISOString().split('T')[0]
        });
    }, [dateStart, dateEnd, setGlobalDateRange]);

    // Filtered real orders
    const filteredOrders = useMemo(() => {
        return orders.filter(tx => {
            if (tx.dateRaw < dateStart || tx.dateRaw > dateEnd) return false;

            const activeChLower = activeChannel?.toLowerCase() || 'all';
            const txChLower = tx.channel?.toLowerCase() || '';

            const chMatch = activeChLower === 'all' ||
                txChLower === activeChLower ||
                (activeChLower === 'web' && txChLower.includes('ikas'));

            const catMatch = activeCategory === 'all' || tx.category === activeCategory;
            return chMatch && catMatch;
        });
    }, [orders, activeChannel, activeCategory, activeDateRange]);

    // Calculate difference in days to prorate expenses
    const diffDays = useMemo(() => {
        return Math.max(1, Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24)));
    }, [dateStart, dateEnd]);

    // -- PREVIOUS PERIOD BOUNDS --
    const { prevStart, prevEnd } = useMemo(() => {
        const pEnd = new Date(dateStart);
        pEnd.setDate(pEnd.getDate() - 1);
        pEnd.setHours(23, 59, 59, 999);
        const pStart = new Date(pEnd);
        pStart.setDate(pStart.getDate() - diffDays + 1);
        pStart.setHours(0, 0, 0, 0);
        return { prevStart: pStart, prevEnd: pEnd };
    }, [dateStart, diffDays]);

    const prevStartDateStr = prevStart ? prevStart.toISOString().split('T')[0] : null;
    const prevEndDateStr = prevEnd ? prevEnd.toISOString().split('T')[0] : null;

    // Fetch historical ad spend
    const { data: prevGaData } = useGoogleAnalytics(prevStartDateStr, prevEndDateStr);

    // 1. DYNAMIC GLOBAL REVENUES (UNFILTERED BY CHANNEL/CATEGORY) FOR RATIOS
    const globalRevs = useMemo(() => {
        let iRev = 0, tRev = 0, pIRev = 0, pTRev = 0;
        orders.forEach(tx => {
            const isReturn = tx.statusObj?.label === 'İade' || tx.statusObj?.label === 'İptal' || tx.statusObj?.label === 'CANCELLED' || tx.statusObj?.label === 'REFUNDED';
            if (isReturn) return;
            
            const rawRev = tx.revenue || 0;
            const isWeb = (tx.channel || '').toLowerCase().includes('web') || (tx.channel || '').toLowerCase().includes('ikas');
            
            if (tx.dateRaw >= dateStart && tx.dateRaw <= dateEnd) {
                tRev += rawRev;
                if (isWeb) iRev += rawRev;
            } else if (tx.dateRaw >= prevStart && tx.dateRaw <= prevEnd) {
                pTRev += rawRev;
                if (isWeb) pIRev += rawRev;
            }
        });
        return { 
            currIkas: Math.max(1, iRev), currTotal: Math.max(1, tRev),
            prevIkas: Math.max(1, pIRev), prevTotal: Math.max(1, pTRev)
        };
    }, [orders, dateStart, dateEnd, prevStart, prevEnd]);

    // 2. ISOLATE OVERHEAD COSTS
    const { proratedSharedFixed, proratedIkasOnlyFixed, proratedTaxAndFinance } = useMemo(() => {
        let sumShared = 0, sumIkasOnly = 0, sumFinance = 0;
        // Frekans dinamigine gore gunluk periyotlara bolunur
        expensesData.filter(e => e.valueType === 'amount').forEach(e => {
            const daily = calculateDailyExpense(e);
            if (e.category === 'tax' || e.category === 'finance') {
                sumFinance += daily;
            } else {
                const isIkasInfra = e.id === 'aws-cloud' || e.id === 'ikas-platform' || (e.name || '').toLowerCase().includes('aws') || (e.name || '').toLowerCase().includes('altyapı');
                if (isIkasInfra) sumIkasOnly += daily;
                else sumShared += daily;
            }
        });
        return {
            proratedSharedFixed: sumShared * diffDays,
            proratedIkasOnlyFixed: sumIkasOnly * diffDays,
            proratedTaxAndFinance: sumFinance * diffDays
        };
    }, [expensesData, diffDays]);

    // 3. GENERATE CURRENT MATRICES
    const currentRatios = useMemo(() => {
        return {
            sharedFixedRatio: proratedSharedFixed / globalRevs.currTotal,
            ikasFixedRatio: proratedIkasOnlyFixed / globalRevs.currIkas,
            adRatio: (gaData?.totalAdCost || 0) / globalRevs.currIkas,
            financeRatio: proratedTaxAndFinance / globalRevs.currTotal
        };
    }, [proratedSharedFixed, proratedIkasOnlyFixed, proratedTaxAndFinance, globalRevs, gaData]);

    const prevRatios = useMemo(() => {
        return {
            // NOTE: Using current expenses as proxy for previous fixed cost mass, mapped over previous revenue base
            sharedFixedRatio: proratedSharedFixed / globalRevs.prevTotal,
            ikasFixedRatio: proratedIkasOnlyFixed / globalRevs.prevIkas,
            adRatio: (prevGaData?.totalAdCost || 0) / globalRevs.prevIkas,
            financeRatio: proratedTaxAndFinance / globalRevs.prevTotal
        };
    }, [proratedSharedFixed, proratedIkasOnlyFixed, proratedTaxAndFinance, globalRevs, prevGaData]);

    // KPI totals from filtered real orders
    const totals = useMemo(() => {
        const aggr = filteredOrders.reduce((acc, order) => {
            const isReturn = order.statusObj?.label === 'İade' || order.statusObj?.label === 'İptal' || order.statusObj?.label === 'CANCELLED' || order.statusObj?.label === 'REFUNDED';
            const rawRev = order.revenue || 0;
            
            acc.grossRevenue += order.grossRevenue || rawRev;
            
            if (isReturn) {
                acc.returns = (acc.returns || 0) + rawRev;
                // Sadece kargo gideri (shipping) sirkete eksi yazar. Urun depoya doner (cogs=0), komisyon iptal olur.
                acc.shipping += order.shipping || 0;
            } else {
                acc.revenue += rawRev;
                acc.discount += order.discount || 0;
                acc.cogs += order.cogs || 0;
                acc.shipping += order.shipping || 0;
                acc.commission += order.commission || 0;
                acc.tax += order.tax || 0;
                
                const isWeb = (order.channel || '').toLowerCase().includes('web') || (order.channel || '').toLowerCase().includes('ikas');
                
                // KALİBRASYON: İzole Edilmiş Proportional Giderler. 
                // Bu sayede filtre Trendyol ise reklam sıfır kalır, Ikas ise ciro kadar asimetrik etkilenir.
                acc.adSpend += isWeb ? (rawRev * currentRatios.adRatio) : 0;
                acc.fixedCost += (rawRev * currentRatios.sharedFixedRatio) + (isWeb ? (rawRev * currentRatios.ikasFixedRatio) : 0);
                acc.taxAndAmort += (rawRev * currentRatios.financeRatio);
            }
            acc.quantity += order.quantity || 1;
            return acc;
        }, { revenue: 0, grossRevenue: 0, returns: 0, discount: 0, cogs: 0, shipping: 0, commission: 0, tax: 0, quantity: 0, adSpend: 0, fixedCost: 0, taxAndAmort: 0 });

        return aggr;
    }, [filteredOrders, currentRatios]);

    // Derived KPIs
    const totalCosts = totals.cogs + totals.adSpend + totals.shipping + totals.commission + totals.tax + totals.fixedCost + totals.taxAndAmort;
    const netProfit = totals.revenue - totalCosts;
    const grossProfit = totals.revenue - totals.cogs;
    
    // FAVÖK (EBITDA), Net Kar'a Vergi (KDV dahil), Amortisman ve Faizin geri eklenmesiyle bulunur.
    const ebitda = netProfit + totals.taxAndAmort + totals.tax;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

    const fmt = (v) => {
        if (Math.abs(v) >= 1000000) return `₺${(v / 1000000).toFixed(1)}M`;
        if (Math.abs(v) >= 1000) return `₺${Math.round(v / 1000)}K`;
        return `₺${Math.round(v)}`;
    };

    const grossMarginPct = totals.revenue > 0 ? ((totals.revenue - totals.cogs) / totals.revenue) * 100 : 0;
    const ebitdaMarginPct = totals.revenue > 0 ? (ebitda / totals.revenue) * 100 : 0;
    const netMarginPct = totals.revenue > 0 ? (netProfit / totals.revenue) * 100 : 0;

    // -- PREVIOUS PERIOD FILTERING --

    const prevFilteredOrders = useMemo(() => {
        return orders.filter(tx => {
            if (tx.dateRaw < prevStart || tx.dateRaw > prevEnd) return false;
            const activeChLower = activeChannel?.toLowerCase() || 'all';
            const txChLower = tx.channel?.toLowerCase() || '';
            const chMatch = activeChLower === 'all' || txChLower === activeChLower || (activeChLower === 'web' && txChLower.includes('ikas'));
            const catMatch = activeCategory === 'all' || tx.category === activeCategory;
            return chMatch && catMatch;
        });
    }, [orders, activeChannel, activeCategory, prevStart, prevEnd]);

    const prevTotals = useMemo(() => {
        const aggr = prevFilteredOrders.reduce((acc, order) => {
            const isReturn = order.statusObj?.label === 'İade' || order.statusObj?.label === 'İptal' || order.statusObj?.label === 'CANCELLED' || order.statusObj?.label === 'REFUNDED';
            const rawRev = order.revenue || 0;
            
            acc.grossRevenue += order.grossRevenue || rawRev;
            
            if (isReturn) {
                acc.returns = (acc.returns || 0) + rawRev;
                acc.shipping += order.shipping || 0;
            } else {
                acc.revenue += rawRev;
                acc.discount += order.discount || 0;
                acc.cogs += order.cogs || 0;
                acc.shipping += order.shipping || 0;
                acc.commission += order.commission || 0;
                acc.tax += order.tax || 0;
                
                const isWeb = (order.channel || '').toLowerCase().includes('web') || (order.channel || '').toLowerCase().includes('ikas');
                
                acc.adSpend += isWeb ? (rawRev * prevRatios.adRatio) : 0;
                acc.fixedCost += (rawRev * prevRatios.sharedFixedRatio) + (isWeb ? (rawRev * prevRatios.ikasFixedRatio) : 0);
                acc.taxAndAmort += (rawRev * prevRatios.financeRatio);
            }
            acc.quantity += order.quantity || 1;
            return acc;
        }, { revenue: 0, grossRevenue: 0, returns: 0, discount: 0, cogs: 0, shipping: 0, commission: 0, tax: 0, quantity: 0, adSpend: 0, fixedCost: 0, taxAndAmort: 0 });

        return aggr;
    }, [prevFilteredOrders, prevRatios]);

    const prevTotalCosts = prevTotals.cogs + prevTotals.adSpend + prevTotals.shipping + prevTotals.commission + prevTotals.tax + prevTotals.fixedCost + prevTotals.taxAndAmort;
    const prevNetProfit = prevTotals.revenue - prevTotalCosts;
    const prevGrossProfit = prevTotals.revenue - prevTotals.cogs;
    const prevEbitda = prevNetProfit + prevTotals.taxAndAmort + prevTotals.tax;
    const prevRoi = prevTotalCosts > 0 ? (prevNetProfit / prevTotalCosts) * 100 : 0;

    const getTrend = (current, prev, isPoints = false, isQuantity = false) => {
        if (!prev) return { text: "Yeni Veri", trend: "neutral" };
        const diff = current - prev;
        const pct = isPoints ? diff : (diff / Math.abs(prev)) * 100;
        const sign = diff > 0 ? "+" : "";
        const trend = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
        const unit = isPoints ? " Puan" : "%";

        // Display exactly the previous absolute value so the user sees 100% of the data representation
        const prevValueText = isPoints ? `${prev.toFixed(1)}%` : isQuantity ? Math.round(prev) : fmt(prev);
        return {
            text: `${sign}${isPoints ? pct.toFixed(1) : Math.abs(pct).toFixed(1)}${unit} (vs ${prevValueText})`,
            trend
        };
    };

    useEffect(() => {
        console.group('📉 DÖNEM KARŞILAŞTIRMALI VERİ İFŞASI (100% İSPAT)');
        console.log('=== ŞU ANKİ DÖNEM ===');
        console.log(`Tarih: ${dateStart.toISOString().split('T')[0]} / ${dateEnd.toISOString().split('T')[0]}`);
        console.log(`Ciro: ₺${totals.revenue.toFixed(2)}`);
        console.log(`COGS (Maliyet): ₺${totals.cogs.toFixed(2)}`);
        console.log(`Reklam (Google API): ₺${totals.adSpend.toFixed(2)}`);
        console.log(`Komisyon + Kargo: ₺${(totals.commission + totals.shipping).toFixed(2)}`);
        console.log(`Sabit Gider + Vergi: ₺${(totals.fixedCost + totals.taxAndAmort).toFixed(2)}`);
        console.log(` NET KÂR: ₺${netProfit.toFixed(2)}`);

        console.log('=== ÖNCEKİ DÖNEM ===');
        console.log(`Tarih: ${prevStartDateStr} / ${prevEndDateStr}`);
        console.log(`Ciro: ₺${prevTotals.revenue.toFixed(2)}`);
        console.log(`COGS (Maliyet): ₺${prevTotals.cogs.toFixed(2)}`);
        console.log(`Reklam (Google API): ₺${prevTotals.adSpend.toFixed(2)}`);
        console.log(`Komisyon + Kargo: ₺${(prevTotals.commission + prevTotals.shipping).toFixed(2)}`);
        console.log(`Sabit Gider + Vergi: ₺${(prevTotals.fixedCost + prevTotals.taxAndAmort).toFixed(2)}`);
        console.log(` NET KÂR: ₺${prevNetProfit.toFixed(2)}`);
        console.groupEnd();
    }, [dateStart, dateEnd, prevStartDateStr, prevEndDateStr, totals, prevTotals, netProfit, prevNetProfit]);

    const grossRevTrend = getTrend(totals.grossRevenue, prevTotals.grossRevenue);
    const discountTrend = getTrend(totals.discount, prevTotals.discount);
    const revTrend = getTrend(totals.revenue, prevTotals.revenue);
    const qtyTrend = getTrend(totals.quantity, prevTotals.quantity, false, true);
    const grossProfitTrend = getTrend(grossProfit, prevGrossProfit);
    const profitTrend = getTrend(netProfit, prevNetProfit);
    const ebitdaTrend = getTrend(ebitda, prevEbitda);
    const roiTrend = getTrend(roi, prevRoi, true);

    // ABC (Activity-Based Costing) Overhead Distribution Rates
    const abcRates = useMemo(() => {
        // MUST use the true DATE-RANGE base to calculate the burden denominators!
        // Otherwise, filtering to 1 channel dumps 100% of the rent onto that 1 channel's limited orders.
        const baseOrders = orders.filter(tx => tx.dateRaw >= dateStart && tx.dateRaw <= dateEnd);

        const totalRev = baseOrders.reduce((sum, o) => sum + (o.revenue || 0), 0) || 1;

        const channelRev = {};
        const categoryRev = {};
        baseOrders.forEach(o => {
            const chLower = (o.channel || '').toLowerCase();
            const catLower = (o.category || '').toLowerCase();
            channelRev[chLower] = (channelRev[chLower] || 0) + (o.revenue || 0);
            categoryRev[catLower] = (categoryRev[catLower] || 0) + (o.revenue || 0);
        });

        const totalAdSpend = gaData?.totalAdCost || 0;
        const totalWebRev = baseOrders.filter(o => {
            const ch = (o.channel || '').toLowerCase();
            return ch.includes('web') || ch.includes('ikas');
        }).reduce((sum, o) => sum + (o.revenue || 0), 0) || 1;
        const webAdSpendRate = totalAdSpend / totalWebRev;

        const globalFixedPool = expensesData
            .filter(e => !e.allocationScope || e.allocationScope.type === 'global')
            .reduce((sum, e) => sum + calculateDailyExpense(e), 0) * diffDays;
        const globalFixedRate = globalFixedPool / totalRev;

        const channelBurdenRates = {};
        const categoryBurdenRates = {};

        expensesData.filter(e => e.allocationScope && e.allocationScope.type !== 'global').forEach(e => {
            const totalCostForPeriod = calculateDailyExpense(e) * diffDays;
            if (e.allocationScope.type === 'channel') {
                const targetCh = (e.allocationScope.target || '').toLowerCase();
                const pool = channelRev[targetCh] || 1;
                channelBurdenRates[targetCh] = (channelBurdenRates[targetCh] || 0) + (totalCostForPeriod / pool);
            } else if (e.allocationScope.type === 'category') {
                const targetCat = (e.allocationScope.target || '').toLowerCase();
                const pool = categoryRev[targetCat] || 1;
                categoryBurdenRates[targetCat] = (categoryBurdenRates[targetCat] || 0) + (totalCostForPeriod / pool);
            }
        });

        return { webAdSpendRate, globalFixedRate, channelBurdenRates, categoryBurdenRates };
    }, [orders, dateStart, dateEnd, diffDays, gaData, expensesData]);

    const abcDecoratedOrders = useMemo(() => {
        const { webAdSpendRate, globalFixedRate, channelBurdenRates, categoryBurdenRates } = abcRates;
        const fmC = (v) => `₺${Math.abs(Math.round(v)).toLocaleString('tr-TR')}`;

        return filteredOrders.map(order => {
            const chLower = (order.channel || '').toLowerCase();
            const catLower = (order.category || '').toLowerCase();
            const isReturn = order.statusObj?.label === 'İade' || order.statusObj?.label === 'İptal' || order.statusObj?.label === 'CANCELLED' || order.statusObj?.label === 'REFUNDED';

            // Direct costs neutralized for returns, except shipping
            const commissionCost = isReturn ? 0 : (order.commission || 0);
            const shippingCost = order.shipping || 0; // retained as loss
            const cogs = isReturn ? 0 : (order.cogs || 0);
            const tax = isReturn ? 0 : (order.tax || 0);
            const directCost = cogs + shippingCost + commissionCost + tax;

            // Retained revenue is 0 for returns
            const orderRevenue = isReturn ? 0 : (order.revenue || 0);
            const isWeb = chLower.includes('web') || chLower.includes('ikas');
            const adSpendBurden = isWeb ? (orderRevenue * webAdSpendRate) : 0;
            const globalFixedBurden = orderRevenue * globalFixedRate;
            const customChannelBurden = orderRevenue * (channelBurdenRates[chLower] || 0);
            const customCategoryBurden = orderRevenue * (categoryBurdenRates[catLower] || 0);
            const indirectOverhead = adSpendBurden + globalFixedBurden + customChannelBurden + customCategoryBurden;

            const totalBurdenAndCosts = directCost + indirectOverhead;
            const netProfit = orderRevenue - totalBurdenAndCosts;

            const tooltipEl = (
                <div className="flex flex-col gap-1.5 w-full min-w-[210px] text-left">
                    <div className="flex justify-between text-slate-200 font-bold border-b border-slate-600 pb-1.5 mb-1.5">
                        <span>Brüt Maliyet ({fmC(directCost)})</span>
                    </div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Ürün / Alış (COGS)</span><span className="font-medium text-slate-100">{fmC(cogs)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Kargo</span><span className="font-medium text-slate-100">{fmC(shippingCost)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Pazaryeri Kom.</span><span className="font-medium text-slate-100">{fmC(commissionCost)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">KDV Ödemesi (Net)</span><span className="font-medium text-rose-300">{fmC(tax)}</span></div>

                    <div className="flex justify-between text-amber-300 font-bold border-b border-slate-600 pb-1.5 mt-2.5 mb-1.5 pt-1">
                        <span>ABC Tali Gider Payı</span>
                        <span>{fmC(indirectOverhead)}</span>
                    </div>
                    <div className="flex justify-between items-center"><span className="text-slate-400">Genel Gider + Maaş</span><span className="font-medium text-amber-50">{fmC(globalFixedBurden)}</span></div>
                    {isWeb && <div className="flex justify-between items-center"><span className="text-slate-400">Reklam (GA - Web)</span><span className="font-medium text-amber-50">{fmC(adSpendBurden)}</span></div>}
                    {customChannelBurden > 0 && <div className="flex justify-between items-center"><span className="text-slate-400">Kanal Özel Gideri</span><span className="font-medium text-amber-50">{fmC(customChannelBurden)}</span></div>}
                    {customCategoryBurden > 0 && <div className="flex justify-between items-center"><span className="text-slate-400">Kategori Kampanyası</span><span className="font-medium text-amber-50">{fmC(customCategoryBurden)}</span></div>}
                </div>
            );

            return {
                ...order,
                cost: Math.round(totalBurdenAndCosts), // override cost to include EVERYTHING
                directCost: Math.round(directCost),
                indirectCost: Math.round(indirectOverhead),
                grossProfit: orderRevenue - directCost,
                profit: netProfit, // override profit mathematically
                costBreakdown: tooltipEl // Rich React node instead of string
            };
        });
    }, [filteredOrders, abcRates]);

    // Chart data — Cumulative Break-even Analysis
    const chartData = useMemo(() => {
        if (!filteredOrders.length) return [];

        const dayMap = {};

        let curr = new Date(dateStart);
        while (curr <= dateEnd) {
            const dateStr = curr.toISOString().split('T')[0];
            dayMap[dateStr] = { date: dateStr, sales: 0, brutKar: 0, contribution: 0 };
            curr.setDate(curr.getDate() + 1);
        }

        // Trace Orders and calculate daily metrics
        filteredOrders.forEach(order => {
            const dateStr = order.dateRaw.toISOString().split('T')[0];
            if (dayMap[dateStr]) {
                const isReturn = order.statusObj?.label === 'İade' || order.statusObj?.label === 'İptal' || order.statusObj?.label === 'CANCELLED' || order.statusObj?.label === 'REFUNDED';
                
                const revenue = isReturn ? 0 : (order.revenue || 0);
                const cogs = isReturn ? 0 : (order.cogs || 0);
                const shipping = order.shipping || 0; // always kept
                const commission = isReturn ? 0 : (order.commission || 0);
                const tax = isReturn ? 0 : (order.tax || 0);

                dayMap[dateStr].sales += revenue;
                dayMap[dateStr].brutKar += (revenue - cogs);
                // Faaliyet İçi Katkı Payı (Net Durumu azaltacak / Kara dönüştürecek tutar)
                // Note: Even if return (revenue=0, cogs=0), shipping is kept, so contribution becomes -shipping (a daily loss).
                dayMap[dateStr].contribution += (revenue - cogs - shipping - commission - tax);
            }
        });

        const sortedDays = Object.values(dayMap).sort((a,b) => new Date(a.date) - new Date(b.date));
        
        // Kümülatif başlangıç noktamız (Dönemin toplam genel/sabit gider deliğinin filtrelenmiş oransal hacmi)
        const totalFixedHole = (totals.fixedCost || 0) + (totals.taxAndAmort || 0) + (totals.adSpend || 0);

        let cumulativeSales = 0;
        let cumulativeBrutKar = 0;
        let cumulativeNetDurum = -totalFixedHole;
        let breakEvenFound = false;

        return sortedDays.map(day => {
            cumulativeSales += day.sales;
            cumulativeBrutKar += day.brutKar;
            
            const prevNetDurum = cumulativeNetDurum;
            cumulativeNetDurum += day.contribution;
            
            let isBreakEven = false;
            // Mark break-even exact crossing date
            if (prevNetDurum < 0 && cumulativeNetDurum >= 0 && !breakEvenFound) {
                isBreakEven = true;
                breakEvenFound = true;
            }

            return {
                date: day.date,
                dailyCiro: day.sales,
                dailyBrutKar: day.brutKar,
                netCiro: cumulativeSales,
                brutKar: cumulativeBrutKar,
                netDurum: cumulativeNetDurum,
                isBreakEven
            };
        });
    }, [filteredOrders, totals, dateStart, dateEnd]);

    // Find dynamic break-even date for ReferenceLine
    const breakEvenDate = useMemo(() => {
        const beDay = chartData.find(d => d.isBreakEven);
        return beDay ? beDay.date : null;
    }, [chartData]);

    // Filtered ALERTS (Rekabet Ozeti) - uses real products and competitors
    const filteredAlerts = useMemo(() => {
        if (!products || products.length === 0 || !competitors || competitors.length === 0) return [];

        return products
            .filter(p => {
                const categoryMatch = activeCategory === 'all' || p.categoryIds?.includes(activeCategory);
                return activeCategory === 'all' ? true : categoryMatch;
            })
            .map(p => {
                const myPrice = p.price || 0;
                const productCompetitors = competitors.filter(c => c.productId === p.id);
                if (productCompetitors.length === 0) return null;

                const cheapestComp = productCompetitors.reduce((min, cur) => cur.price < min.price ? cur : min);

                if (myPrice > cheapestComp.price) {
                    return {
                        id: p.id,
                        product: p.name,
                        myPrice: myPrice,
                        competitorPrice: cheapestComp.price,
                        competitor: cheapestComp.source || 'Rakip',
                        badge: 'Buybox Riski',
                        badgeColor: 'text-rose-600',
                        badgeBg: 'bg-rose-50'
                    };
                }
                return null;
            })
            .filter(Boolean)
            .slice(0, 5);
    }, [products, competitors, activeCategory]);

    const hasActiveFilter = activeCategory !== 'all' || activeChannel !== 'all' || activeDateRange !== 'last30';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fix #6: Real CSV export from orders data
    const handleExport = (type) => {
        if (type === 'csv') {
            const channelMap = {};
            orders.forEach(o => {
                const ch = o.channel || 'Web';
                if (!channelMap[ch]) channelMap[ch] = { revenue: 0, units: 0, commission: 0, cogs: 0 };
                channelMap[ch].revenue += (o.revenue || 0);
                channelMap[ch].units += 1;
                channelMap[ch].commission += (o.revenue || 0) * 0.15; // default 15% sim
                channelMap[ch].cogs += (o.cost || 0);
            });
            const headers = ['Kanal', 'Toplam Ciro (₺)', 'Birim Satış', 'Toplam Komisyon (₺)', 'Tahmini Net Gelir (₺)'];
            const rows = Object.entries(channelMap).map(([name, s]) => [
                `"${name}"`,
                Math.round(s.revenue),
                s.units,
                Math.round(s.commission),
                Math.round(s.revenue - s.commission - s.cogs)
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kanal_ozet_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            alert(`"${type.toUpperCase()}" formatı yakında aktif olacak. Şimdilik CSV kullanabilirsiniz.`);
        }
        setIsExportOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>

                {/* Export Dropdown */}
                <div className="relative" ref={exportRef}>
                    <button
                        onClick={() => setIsExportOpen(!isExportOpen)}
                        className={cn(
                            "px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2",
                            isExportOpen && "bg-indigo-700 ring-2 ring-indigo-200 ring-offset-1"
                        )}
                    >
                        <Download className="h-4 w-4" />
                        {t.download}
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isExportOpen ? "rotate-180" : "")} />
                    </button>

                    {/* Dropdown Menu */}
                    {isExportOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="py-1">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group"
                                >
                                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">CSV İndir</span>
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group border-t border-slate-50"
                                >
                                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                                        <FileSpreadsheet className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">Excel Olarak İndir (.xlsx)</span>
                                </button>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group border-t border-slate-50"
                                >
                                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                                        <File className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">PDF Raporu</span>
                                </button>
                                <button
                                    onClick={() => handleExport('sheets')}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group border-t border-slate-50"
                                >
                                    <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                        <Table className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">E-Tablolara Aktar</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Active filter badges */}
            {hasActiveFilter && (
                <div className="flex items-center gap-2 flex-wrap">
                    {activeDateRange !== 'last30' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                            📅 {{ thisMonth: 'Bu Ay', lastQuarter: 'Son Çeyrek', thisYear: 'Bu Yıl' }[activeDateRange] || 'Özel Aralık'}
                        </span>
                    )}
                    {activeCategory !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            📌 {activeCategory}
                        </span>
                    )}
                    {activeChannel !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                            🛍 {activeChannel}
                        </span>
                    )}
                    <span className="text-xs text-slate-400">({filteredOrders.length} işlem alındı)</span>
                </div>
            )}

            {/* KPI Cards — computed from filtered products & historical period comparison */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3">
                <StatCard
                    title="Brüt Ciro"
                    value={fmt(totals.grossRevenue)}
                    change={grossRevTrend.text}
                    icon={DollarSign}
                    trend={grossRevTrend.trend}
                    tooltip={<><b>Brüt Ciro:</b><br />Toplam satışların indirimsiz ham ürün değeridir. Müşteriye uygulanan iade, kupon ve diğer sepet indirimlerinden önceki potansiyel ciroyu ifade eder.</>}
                />
                <StatCard
                    title="İndirimler"
                    value={`-${fmt(totals.discount)}`}
                    change={discountTrend.text}
                    icon={Percent}
                    trend={discountTrend.trend === "up" ? "down" : discountTrend.trend === "down" ? "up" : "neutral"}
                    tooltip={<><b>İndirimler (Kupon/Havale):</b><br />Trendyol satıcı/platform indirimleri, İkas havale sepet indirimleri ve sadakat kuponlarının toplam iptal tutarıdır.</>}
                />
                <StatCard
                    title="Net Ciro"
                    value={fmt(totals.revenue)}
                    change={revTrend.text}
                    icon={DollarSign}
                    trend={revTrend.trend}
                    tooltip={<><b>Net Ciro:</b><br />Geriye dönük uygulanan kampanya, havale indirimleri vb. kesintilerin düşülmüş halidir. Müşterinin işletmeye ödediği nihai geçerli rakamı yansıtır.</>}
                />
                <StatCard
                    title="Satış Adedi"
                    value={totals.quantity.toLocaleString('tr-TR')}
                    change={qtyTrend.text}
                    icon={Package}
                    trend={qtyTrend.trend}
                    tooltip={<><b>Satış Adedi:</b><br />İlgili dönemde satışı tamamlanan fiziki (orijinal) ürün adetlerinin toplam sayısını gösterir.</>}
                />
                <StatCard
                    title="Brüt Kar"
                    value={fmt(grossProfit)}
                    change={grossProfitTrend.text}
                    icon={Wallet}
                    trend={grossProfitTrend.trend}
                    tooltip={<><b>Brüt Kar (Ürün Marjı):</b><br />Toplam cirodan <b>ürünlerin doğrudan alış maliyetinin (COGS)</b> çıkarılmasıyla bulunur. Henüz operasyon, reklam ve komisyon giderleri düşülmemiş ham gelirdir.</>}
                />
                <StatCard
                    title="Net Kar"
                    value={fmt(netProfit)}
                    change={profitTrend.text}
                    icon={TrendingUp}
                    trend={profitTrend.trend}
                    tooltip={<><b>Net Kar:</b><br />Toplam cirodan; Ürün Alış Maliyeti, Komisyon, Çıkan KDV Farkı, Kargo, Reklam ve Genel Sabit Giderler (Maaş/Kira vb.) tamamen çıkarılarak hesabınıza kalan son tutardır.</>}
                />
                <StatCard
                    title="FAVÖK"
                    value={fmt(ebitda)}
                    change={ebitdaTrend.text}
                    icon={Activity}
                    trend={ebitdaTrend.trend}
                    tooltip={<><b>FAVÖK (EBITDA):</b><br />Net Kâra, Ödenen KDV ve Finansal Faizlerin muhasebesel olarak geri eklenmesiyle bulunan Ana Faaliyet kârlılığıdır. Nakit yaratma kapasitesinin gerçek göstergesidir.</>}
                />
                <StatCard
                    title="Yatırım Getirisi (ROI)"
                    value={`${roi.toFixed(1)}%`}
                    change={roiTrend.text}
                    icon={Percent}
                    trend={roiTrend.trend}
                    tooltip={<><b>ROI:</b><br />Koyduğunuz sermayenin dönüş oranıdır. Toplam masraf (Ürün, Reklam ve Operasyon) olarak yatırdığınız her 100 TL'ye karşılık Net Kar olarak kaç TL kazandığınızı gösterir.</>}
                />
            </div>

            {/* Sales & Profit Chart — filtered data */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-slate-900">{t.salesVsProfit}</h3>
                    <div className="flex flex-wrap items-center gap-5 text-[12px] font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div> Brüt Kar (Günlük)</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></div> Genel Kar / Zarar</div>
                        <div className="flex items-center gap-1.5"><div className="w-4 border-t-2 border-dashed border-[#14b8a6]"></div> Kümülatif Brüt Kar</div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></div> Net Ciro (Günlük)</div>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <defs>
                                <linearGradient id="colorNetCiro" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorBrutKar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => new Date(str).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                minTickGap={20}
                            />
                            <YAxis
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₺${value > 1000 || value < -1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            
                            {/* Zero Axis Reference Line */}
                            <ReferenceLine y={0} stroke="#94a3b8" strokeOpacity={0.5} strokeWidth={2} />
                            
                            {/* Break-Even Vertical Line */}
                            {breakEvenDate && (
                                <ReferenceLine 
                                    x={breakEvenDate} 
                                    stroke="#ec4899" 
                                    strokeDasharray="4 4" 
                                    label={{ position: 'top', value: 'Başabaş', fill: '#be185d', fontSize: 12, fontWeight: 700 }} 
                                />
                            )}
                            
                            {/* Cumulative Gross Profit Line */}
                            <Line
                                type="monotone"
                                dataKey="brutKar"
                                name="Kümülatif Brüt Kar"
                                stroke="#14b8a6"
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff', fill: '#14b8a6' }}
                            />

                            {/* Areas for Revenue and Gross Profit (Now showing DAILY values) */}
                            <Area
                                type="monotone"
                                dataKey="dailyCiro"
                                name="Net Ciro (Günlük)"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorNetCiro)"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="dailyBrutKar"
                                name="Brüt Kar (Günlük)"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorBrutKar)"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                            />

                            {/* Net Status Line (Starts negative, goes up) */}
                            <Line 
                                type="monotone" 
                                dataKey="netDurum" 
                                name="Genel Kar / Zarar" 
                                stroke="#f43f5e" 
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 3, stroke: '#ffffff', fill: '#f43f5e' }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Col: Marketing */}
                <div className="space-y-6">
                    <MarketingPerformance
                        startDate={dateStart.toISOString().split('T')[0]}
                        endDate={dateEnd.toISOString().split('T')[0]}
                    />

                </div>

                {/* Right Col: Inventory & Sales Channels */}
                <div className="space-y-6">
                    <InventoryInsights t={t} products={products} orders={orders} />

                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Rekabet Özeti */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-gray-900 font-bold text-sm">Rekabet Özeti</h3>
                        {/* D7 Fix: Navigate to competition tab instead of dead href */}
                        <button onClick={() => onNavigate && onNavigate('competition')} className="text-indigo-600 text-xs font-medium hover:text-indigo-800 hover:underline">Tümünü Gör</button>
                    </div>

                    <div className="p-4 space-y-4 overflow-y-auto max-h-[400px]">
                        {filteredAlerts.length === 0 ? (
                            <div className="text-center py-6 text-slate-400">
                                <p className="text-sm font-medium">Bu filtre için rekabet alarmı yok</p>
                                <p className="text-xs mt-1">Fiyat avantajı var olan ürün bulunamadı</p>
                            </div>
                        ) : filteredAlerts.map((alert) => (
                            <div key={alert.id} className="flex flex-col gap-2 p-3 bg-white hover:bg-rose-50/50 rounded-lg border border-gray-100 transition-colors">
                                <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{alert.product}</p>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Sizin Fiyatınız</span>
                                        <span className="text-sm font-bold text-gray-400 line-through decoration-rose-300">₺{alert.myPrice.toLocaleString('tr-TR')}</span>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-0.5" title={alert.competitor}>
                                            Rakip Fiyatı ({alert.competitor.replace('www.', '').split('.')[0]})
                                        </span>
                                        <div className={`flex items-center gap-1 text-[15px] font-black ${alert.badgeColor}`}>
                                            ₺{alert.competitorPrice.toLocaleString('tr-TR')}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-1 text-xs font-bold px-3 py-1.5 rounded-md w-full text-center ${alert.badgeBg} ${alert.badgeColor} border border-rose-100/50 flex flex-col`}>
                                    <span>⚠️ Fiyat Avantajı Rakipte!</span>
                                    <span className="text-[10px] opacity-80 mt-0.5">
                                        {alert.competitor.replace('www.', '').split('.')[0]} platformunda bu ürünü sizden ₺{(alert.myPrice - alert.competitorPrice).toLocaleString('tr-TR')} daha ucuza satıyorlar.
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Satış Kanalları */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-gray-900 font-bold text-sm">Satış Kanalları ve Performans</h3>
                        {/* D8 Fix: Replaced dummy ⋯ button with a real navigation link */}
                        <button onClick={() => onNavigate && onNavigate('reports')} className="text-indigo-600 text-xs font-medium hover:text-indigo-800 hover:underline">Rapor →</button>
                    </div>

                    {/* Compute channel revenue and unit counts explicitly from filtered orders */}
                    {(() => {
                        const CHANNEL_STYLES = {
                            'Trendyol': { bg: 'bg-orange-50', border: 'border-orange-100', label: 'text-orange-600', labelBorder: 'border-orange-200' },
                            'Hepsiburada': { bg: 'bg-amber-50/60', border: 'border-amber-100', label: 'text-amber-600', labelBorder: 'border-amber-200' },
                            'Amazon': { bg: 'bg-yellow-50', border: 'border-yellow-100', label: 'text-yellow-700', labelBorder: 'border-yellow-200' },
                            'Web Sitesi (ikas)': { bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'text-indigo-600', labelBorder: 'border-indigo-200' },
                            'Web': { bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'text-indigo-600', labelBorder: 'border-indigo-200' }
                        };
                        const channelMap = {};
                        filteredOrders.forEach(o => {
                            if (!channelMap[o.channel]) channelMap[o.channel] = { revenue: 0, grossRevenue: 0, discount: 0, profit: 0, count: 0 };
                            channelMap[o.channel].revenue += o.revenue || 0;
                            channelMap[o.channel].grossRevenue += o.grossRevenue || o.revenue || 0;
                            channelMap[o.channel].discount += o.discount || 0;
                            channelMap[o.channel].profit += o.profit || 0;
                            channelMap[o.channel].count += 1;
                        });
                        const sorted = Object.entries(channelMap)
                            .sort((a, b) => b[1].revenue - a[1].revenue)
                            .slice(0, 4);
                        const fmtK = (v) => v >= 1000 ? `₺${(v / 1000).toFixed(1)}K` : `₺${Math.round(v)}`;
                        const totalChannelsRevenue = Object.values(channelMap).reduce((sum, ch) => sum + ch.revenue, 0);

                        if (!sorted.length) {
                            return (
                                <div className="p-6 text-center text-slate-400 italic text-sm">Satış kanalı verisi bulunamadı.</div>
                            );
                        }

                        return (
                            <div className="p-6 grid grid-cols-2 gap-4">
                                {sorted.map(([name, s], idx) => {
                                    const style = CHANNEL_STYLES[name] || { bg: 'bg-gray-50', border: 'border-gray-100', label: 'text-gray-600', labelBorder: 'border-gray-200' };
                                    // Represent share of total pie, not max channel
                                    const sharePct = totalChannelsRevenue > 0 ? Math.round((s.revenue / totalChannelsRevenue) * 100) : 0;
                                    const isTop = idx === 0;
                                    return (
                                        <div key={name} className={`${style.bg} rounded-xl p-4 border ${style.border} flex flex-col justify-between`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`text-xs font-bold ${style.label} bg-white border ${style.labelBorder} px-2 py-0.5 rounded shadow-sm`}>{name}</span>
                                                <span className={`text-[10px] font-bold flex items-center gap-1 ${isTop ? 'text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200'}`}>
                                                    {isTop ? (
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                                    ) : null}
                                                    {isTop ? 'En Yüksek' : `%${sharePct} Ciro Payı`}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {/* Header Net Ciro */}
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Net Ciro</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-2xl font-bold text-gray-900">{fmtK(s.revenue)}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">/ {s.count.toLocaleString('tr-TR')} İşlem</p>
                                                    </div>
                                                </div>

                                                {/* Detailed Breakdown Grid */}
                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/50">
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 mb-0.5">Brüt Satış</p>
                                                        <p className="text-xs font-semibold text-slate-700">{fmtK(s.grossRevenue)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 mb-0.5">İndirimler</p>
                                                        <p className="text-xs font-semibold text-rose-600">-{fmtK(s.discount)}</p>
                                                    </div>
                                                    <div className="col-span-2 pt-1">
                                                        <p className="text-[9px] text-slate-500 mb-0.5">Kanal Kârı (Net)</p>
                                                        <p className={`text-sm font-bold ${s.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {s.profit > 0 ? '+' : ''}{fmtK(s.profit)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Recent Transactions Table */}
            <TransactionTable orders={abcDecoratedOrders} loading={loading} filters={filters} />
        </div>
    );
};

