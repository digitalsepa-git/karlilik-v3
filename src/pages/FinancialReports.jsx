import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, ReferenceLine, ReferenceDot, BarChart, Bar, Cell, Label, Legend
} from 'recharts';
import {
    TrendingDown, AlertOctagon, PackageX, Truck, FileSpreadsheet, AlertTriangle, Percent, Activity,
    Target, TrendingUp, Calendar, AlertCircle, Info, Loader2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTabAnalytics } from '../hooks/useTabAnalytics';
import { expensesData, calculateDailyExpense } from '../data/expensesData';

export const FinancialReports = () => {
    // State for Annual Goal
    const [annualGoal, setAnnualGoal] = useState(2000000); // 2M TL default
    const [growthRate, setGrowthRate] = useState(12); // Growth Rate Simulation %
    const [chartPeriod, setChartPeriod] = useState('buAy'); // 'buAy', 'gecenAy', 'buYil'
    const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales', 'products', 'competition', 'inventory'
    const { ordersData, analyticsData, productsData, globalDateRange } = useData();
    const { orders, loading: ordersLoading } = ordersData;
    const { data: gaData, loading: gaLoading } = analyticsData;

    const isLoading = ordersLoading || gaLoading;
    const tabAnalytics = useTabAnalytics(orders, productsData?.products, globalDateRange);

    // --- DYNAMIC DATA COMPUTATION ---
    const dynamicData = useMemo(() => {
        if (!orders || !gaData) return null;

        const activeStartDate = new Date(globalDateRange.startDate);
        const activeEndDate = new Date(globalDateRange.endDate);
        activeEndDate.setHours(23, 59, 59, 999);

        const validOrders = orders.filter(o => {
            if (o.statusObj?.label === 'İptal' || o.statusObj?.label === 'İade') return false;
            const orderDate = new Date(o.dateRaw);
            return orderDate >= activeStartDate && orderDate <= activeEndDate;
        });

        const diffTime = Math.abs(activeEndDate - activeStartDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        const totalRevenue = validOrders.reduce((sum, order) => sum + (order.revenue || 0), 0);
        const totalCost = validOrders.reduce((sum, order) => sum + (order.cost || 0), 0);
        const totalGrossProfit = totalRevenue - totalCost;

        const dailyFixedCost = expensesData.filter(e => e.valueType === 'amount').reduce((sum, e) => sum + calculateDailyExpense(e), 0);
        const proratedFixedCost = dailyFixedCost * diffDays;

        const totalAdSpend = gaData.totalAdCost || 0;
        const totalNetProfit = totalGrossProfit - totalAdSpend - proratedFixedCost;
        const netMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

        const categoryMap = {};

        // Seed the array with real store categories to prevent "Veri Yok" display even if there are no sales
        const allCategories = ['Kozmetik Ürünler', 'Cihazlar', 'Setler', 'Aksesuar', 'Hello Kitty', 'Diğer'];
        allCategories.forEach(cat => {
            categoryMap[cat] = { name: cat, revenue: 0, profit: 0 };
        });

        validOrders.forEach(order => {
            const cat = order.category || 'Diğer';
            if (!categoryMap[cat]) categoryMap[cat] = { name: cat, revenue: 0, profit: 0 };
            categoryMap[cat].revenue += (order.revenue || 0);
            categoryMap[cat].profit += (order.profit || 0);
        });

        const categoryPerformance = Object.values(categoryMap).map(cat => {
            const margin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
            let status = 'neutral';
            if (margin > 30) status = 'excellent';
            else if (margin > 15) status = 'good';
            else if (margin > 0) status = 'poor';
            else status = 'poor';
            return { name: cat.name, revenue: cat.revenue, margin: Math.round(margin), status };
        }).sort((a, b) => b.revenue - a.revenue);

        const maxCategoryRevenue = Math.max(...categoryPerformance.map(c => c.revenue), 1);

        const returnedOrders = orders.filter(o => {
            if (o.statusObj?.label !== 'İade') return false;
            const d = new Date(o.dateRaw);
            return d >= activeStartDate && d <= activeEndDate;
        });
        const cancelledOrders = orders.filter(o => {
            if (o.statusObj?.label !== 'İptal') return false;
            const d = new Date(o.dateRaw);
            return d >= activeStartDate && d <= activeEndDate;
        });

        // Real logic without mock numbers: Only count the exact shipping cost explicitly mapped to the order or 0.
        const returnShippingCost = returnedOrders.reduce((sum, o) => sum + (o.shipping || 0), 0) + cancelledOrders.reduce((sum, o) => sum + (o.shipping || 0), 0);
        const packagingWaste = 0; // Removed arbitrary 20 TL packaging waste mockup
        const valueLoss = returnedOrders.reduce((sum, o) => sum + ((o.revenue || 0) * 0.1), 0); // Assuming 10% value loss on returned item's real price
        const totalLoss = returnShippingCost + packagingWaste + valueLoss;

        // Cumulative Chart
        let cumulativeProfit = -proratedFixedCost;
        const chartArray = [];

        for (let i = diffDays - 1; i >= 0; i--) {
            const targetDate = new Date(activeEndDate);
            targetDate.setDate(activeEndDate.getDate() - i);
            targetDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(targetDate);
            nextDate.setDate(targetDate.getDate() + 1);

            const dayOrders = validOrders.filter(o => o.dateRaw >= targetDate && o.dateRaw < nextDate);
            const dayProfit = dayOrders.reduce((sum, o) => sum + (o.profit || 0), 0);
            const dayAdSpend = totalAdSpend / diffDays; // Spread ad spend across days

            cumulativeProfit += (dayProfit - dayAdSpend);

            chartArray.push({
                label: targetDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                profit: Math.round(cumulativeProfit),
                id: i
            });
        }

        const currentYTDProfit = totalNetProfit;

        return {
            executiveData: {
                revenue: { value: totalRevenue, trend: 0, label: 'Toplam Ciro' }, // API trend to be implemented later 
                netProfit: { value: totalNetProfit, trend: 0, label: 'Net Kâr' },
                netMargin: { value: netMargin.toFixed(1), trend: 0, label: 'Net Kâr Marjı (%)' }
            },
            categoryPerformance,
            maxCategoryRevenue,
            lostMoneyData: {
                totalLoss: Math.round(totalLoss),
                returnCount: returnedOrders.length,
                cancelCount: cancelledOrders.length,
                breakdown: [
                    { label: 'İade Kargo', value: Math.round(returnShippingCost) },
                    { label: 'İşçilik & Paketleme', value: Math.round(packagingWaste) },
                    { label: 'Ürün Değer Kaybı', value: Math.round(valueLoss) }
                ]
            },
            chartData: chartArray,
            currentYTDProfit
        };
    }, [orders, gaData, chartPeriod, globalDateRange]);

    if (isLoading || !dynamicData) {
        return (
            <div className="flex items-center justify-center h-[60vh] animate-fade-in">
                <div className="flex flex-col items-center gap-4 text-indigo-600">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="font-semibold text-sm">Canlı Finansal Veriler Hesaplanıyor...</p>
                </div>
            </div>
        );
    }

    const { executiveData, categoryPerformance, maxCategoryRevenue, lostMoneyData, chartData, currentYTDProfit } = dynamicData;

    const breakEvenIndex = chartData.findIndex(d => d.profit > 0);
    const breakEvenLabel = breakEvenIndex !== -1 ? chartData[breakEvenIndex].label : null;

    const maxProfit = Math.max(...chartData.map(d => d.profit), 0);
    const minProfit = Math.min(...chartData.map(d => d.profit), -1); // Prevent zero division bug on red spectrum math

    const getBarColor = (value, min, max) => {
        if (value >= 0) {
            const intensity = Math.min(Math.max(value / max, 0.2), 1);
            if (intensity < 0.3) return '#86efac';
            if (intensity < 0.6) return '#4ade80';
            if (intensity < 0.9) return '#22c55e';
            return '#15803d';
        } else {
            const ratio = Math.abs(value) / Math.abs(min);
            if (ratio > 0.8) return '#b91c1c';
            if (ratio > 0.5) return '#ef4444';
            if (ratio > 0.2) return '#f87171';
            return '#fca5a5';
        }
    };

    const percentProgress = annualGoal > 0 ? (currentYTDProfit / annualGoal) * 100 : 0;

    // Simulation logic
    const diffTime = Math.abs(new Date(globalDateRange.endDate) - new Date(globalDateRange.startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Normalize profit to a monthly rate for accurate long-term forecasting
    const normalizedMonthlyProfit = currentYTDProfit !== 0 ? (currentYTDProfit / diffDays) * 30 : 0;
    const baseMonthlyProfit = normalizedMonthlyProfit > 0 ? normalizedMonthlyProfit : 50000; // Use current or fallback

    const simulatedMonthlyProfit = baseMonthlyProfit * (1 + growthRate / 100);
    const remainingGoal = Math.max(0, annualGoal - currentYTDProfit);
    const monthsToGoal = simulatedMonthlyProfit > 0 ? remainingGoal / simulatedMonthlyProfit : 0;

    const today = new Date();
    const estimatedDateObj = new Date(today.getTime());
    estimatedDateObj.setDate(estimatedDateObj.getDate() + Math.round(monthsToGoal * 30));
    const estimatedDateFormatted = estimatedDateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="space-y-8 animate-fade-in pb-10">

            {/* Header & Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sticky top-0 z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 pb-0 sm:pb-4 border-b sm:border-0 border-gray-100">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-2xl font-bold text-gray-900">Rapor Merkezi</h1>
                        <p className="text-sm text-gray-500">C-Level operasyonel verimlilik ve stratejik hedef takibi.</p>
                    </div>
                </div>

                {/* Modern Segmented Control / Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 pb-2">
                    {[
                        { id: 'sales', label: 'Satış Raporları', icon: <TrendingUp size={16} /> },
                        { id: 'products', label: 'Ürün Kârlılık', icon: <PackageX size={16} /> },
                        { id: 'competition', label: 'Rekabet Analizi', icon: <Target size={16} /> },
                        { id: 'inventory', label: 'Stok Verimliliği', icon: <Truck size={16} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveReportTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeReportTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT: SALES (Detailed Analytics) */}
            {activeReportTab === 'sales' && (
                <div className="space-y-8 animate-fade-in">

                    {/* Basket Analysis & Operations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* AOV & Basket Distribution */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                                    <FileSpreadsheet className="text-indigo-500" size={20} />
                                    Sepet Analitiği (AOV)
                                </h3>
                                <p className="text-sm text-gray-500">Siparişlerin ortalama sepet büyüklüğü ve harcama dilimleri.</p>
                            </div>

                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="text-4xl font-black text-indigo-600">₺{(tabAnalytics.salesTab?.aov || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
                                <div className="text-sm font-medium text-gray-500">Ortalama<br />Sepet Tutarı</div>
                            </div>

                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={tabAnalytics.salesTab?.basketBrackets || []} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} width={70} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                                            {tabAnalytics.salesTab?.basketBrackets?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 3 ? '#10b981' : index === 2 ? '#6366f1' : '#cbd5e1'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Operational Leaks (Returns/Canceled) */}
                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1 text-rose-900">
                                    <AlertTriangle className="text-rose-500" size={20} />
                                    Operasyonel Sızıntı (İade Modeli)
                                </h3>
                                <p className="text-sm text-rose-700">Satılan siparişlerin iadeye dönme karakteristiği.</p>
                            </div>

                            <div className="flex flex-col gap-8 flex-1 justify-center">
                                <div className="bg-white p-4 rounded-xl border border-rose-100 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">İade/İptal Hacmi</p>
                                        <div className="text-2xl font-black text-rose-600">₺{(tabAnalytics.salesTab?.operationalLeaks?.returnedValue || 0).toLocaleString('tr-TR')}</div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-rose-100 flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Fire Oranı</p>
                                        <div className="text-2xl font-black text-rose-600">%{tabAnalytics.salesTab?.operationalLeaks?.returnRate || 0}</div>
                                    </div>
                                    <div className="text-xs text-rose-500 text-right w-32 leading-tight font-medium">Toplam brüt siparişlere oranla iptal/iade fire oranı.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Margin Tiers & Heatmap */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Margin Brackets */}
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                            <div className="mb-6 relative z-10">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-1">
                                    <Percent className="text-emerald-400" size={20} />
                                    Kâr Marjı Segmentasyonu
                                </h3>
                                <p className="text-sm text-slate-400">Üretilen cironun marj kalitesi (israf hacmi vs yüksek kâr).</p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {tabAnalytics.salesTab?.marginBrackets?.map((bracket, i) => {
                                    const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500'];
                                    const sum = tabAnalytics.salesTab.marginBrackets.reduce((sum, b) => sum + b.value, 0);
                                    const pct = sum > 0 ? (bracket.value / sum) * 100 : 0;

                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between items-end mb-1 text-sm">
                                                <span className="font-semibold text-slate-300">{bracket.label}</span>
                                                <span className="font-black text-white">%{pct.toFixed(1)}</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                                <div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${pct}%` }}></div>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1 text-right">({bracket.value} Sipariş, ₺{Math.round(bracket.revenue).toLocaleString()})</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Velocity Heatmap */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[360px]">
                            <div className="mb-4 flex-shrink-0">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                                    <Activity className="text-indigo-500" size={20} />
                                    Satış Yoğunluğu (Isı Haritası)
                                </h3>
                                <p className="text-sm text-gray-500">Müşterilerin alışveriş yaptığı saat blokları (Gün vs Saat).</p>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={tabAnalytics.salesTab?.heatmapData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                        <Bar dataKey="00:00 - 06:00" stackId="a" fill="#1e293b" />
                                        <Bar dataKey="06:00 - 12:00" stackId="a" fill="#38bdf8" />
                                        <Bar dataKey="12:00 - 18:00" stackId="a" fill="#6366f1" />
                                        <Bar dataKey="18:00 - 24:00" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB CONTENT: PRODUCTS */}
            {activeReportTab === 'products' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-2xl font-bold mb-2">BCG Portföy Dağılımı</h2>
                            <p className="text-slate-400 mb-6">Şirketinize en çok nakit getiren Şampiyonlar ile, sürekli satıp kâr ettirmeyen Hamaliyeler (Nakit Tutanlar) arasındaki dağılım.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                    <div className="absolute right-0 bottom-0 text-6xl text-emerald-500/10 -mb-2 -mr-2"><TrendingUp /></div>
                                    <h4 className="text-emerald-400 font-bold mb-1">Şampiyonlar</h4>
                                    <p className="text-xs text-slate-400 mb-3">Yüksek Hacim, Yüksek Marj</p>
                                    <div className="text-3xl font-black text-white">{tabAnalytics.productsTab?.bcg?.champions?.count || 0} <span className="text-sm font-normal text-slate-500">ürün</span></div>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                    <div className="absolute right-0 bottom-0 text-6xl text-indigo-500/10 -mb-2 -mr-2"><Target /></div>
                                    <h4 className="text-indigo-400 font-bold mb-1">Uyuyanlar</h4>
                                    <p className="text-xs text-slate-400 mb-3">Düşük Hacim, Yüksek Marj</p>
                                    <div className="text-3xl font-black text-white">{tabAnalytics.productsTab?.bcg?.sleepers?.count || 0} <span className="text-sm font-normal text-slate-500">ürün</span></div>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
                                    <div className="absolute right-0 bottom-0 text-6xl text-rose-500/10 -mb-2 -mr-2"><AlertOctagon /></div>
                                    <h4 className="text-rose-400 font-bold mb-1">Maliyet Yükleri</h4>
                                    <p className="text-xs text-slate-400 mb-3">Sıfır veya Eksi Marj</p>
                                    <div className="text-3xl font-black text-white">{tabAnalytics.productsTab?.bcg?.dogs?.count || 0} <span className="text-sm font-normal text-slate-500">ürün</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col h-full">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" size={20} />
                                En Çok Net Kâr Getiren (Top 5)
                            </h3>
                            <div className="space-y-3 flex-1 flex flex-col justify-center">
                                {tabAnalytics.productsTab?.top5?.length ? tabAnalytics.productsTab.top5.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-lg border border-emerald-50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-emerald-700 w-4">{i + 1}.</span>
                                            <span className="text-sm font-medium text-gray-700 truncate w-40 sm:w-64" title={p.name}>{p.name}</span>
                                        </div>
                                        <div className="text-sm font-black text-emerald-600">₺{p.profit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                )) : <div className="text-sm text-gray-500 text-center">Yeterli veri yok</div>}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex flex-col h-full">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingDown className="text-rose-500" size={20} />
                                En Çok Kâr Kaybettiren (Bottom 5)
                            </h3>
                            <div className="space-y-3 flex-1 flex flex-col justify-center">
                                {tabAnalytics.productsTab?.bottom5?.length ? tabAnalytics.productsTab.bottom5.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center bg-rose-50/50 p-3 rounded-lg border border-rose-50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-rose-700 w-4">{i + 1}.</span>
                                            <span className="text-sm font-medium text-gray-700 truncate w-40 sm:w-64" title={p.name}>{p.name}</span>
                                        </div>
                                        <div className="text-sm font-black text-rose-600">₺{p.profit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                )) : <div className="text-sm text-gray-500 text-center">Yeterli veri yok</div>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900">Kategori Kârlılık Haritası</h3>
                                <p className="text-xs text-gray-500">Kategorilerin ciro büyüklüğü ve kâr marjı performansı.</p>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium">Yüksek Kâr</span>
                                <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">Ortalama</span>
                                <span className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-medium">Riskli / Zarar</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {categoryPerformance.map((cat, idx) => (
                                <div key={idx}
                                    className={`
                                        relative p-4 rounded-xl border flex flex-col justify-between h-32 transition-all hover:shadow-md
                                        ${cat.status === 'excellent' ? 'bg-emerald-50 border-emerald-100' :
                                            cat.status === 'good' ? 'bg-white border-emerald-100' :
                                                cat.status === 'poor' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-xs font-bold uppercase tracking-wide ${cat.status === 'poor' ? 'text-rose-800' : 'text-gray-600'}`}>{cat.name}</span>
                                        {cat.status === 'poor' && <AlertCircle size={14} className="text-rose-500" />}
                                    </div>

                                    <div>
                                        <div className={`text-xl font-black ${cat.status === 'poor' ? 'text-rose-600' : 'text-gray-900'}`}>
                                            %{cat.margin}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-medium mt-1">Marj</div>
                                    </div>

                                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-3">
                                        <div
                                            className={`h-full rounded-full ${cat.status === 'poor' ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${(cat.revenue / maxCategoryRevenue) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 text-right">₺{cat.revenue >= 1000 ? (cat.revenue / 1000).toFixed(0) + 'K' : cat.revenue} Ciro</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: COMPETITION */}
            {activeReportTab === 'competition' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 text-[100px] text-slate-50 -mt-4 -mr-4"><Target /></div>
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Piyasa Fiyat Endeksi</p>
                                <h3 className="text-3xl font-black text-gray-900 mb-2">
                                    {tabAnalytics.competitionTab?.marketIndex > 0 ? '+' : ''}
                                    %{tabAnalytics.competitionTab?.marketIndex.toFixed(1) || '0.0'}
                                </h3>
                                <p className="text-sm font-medium text-emerald-600 mb-6">
                                    {tabAnalytics.competitionTab?.marketIndex < 0
                                        ? `Piyasa genelinden ortalama %${Math.abs(tabAnalytics.competitionTab.marketIndex).toFixed(1)} daha ucuzsunuz.`
                                        : (tabAnalytics.competitionTab?.marketIndex > 0
                                            ? `Piyasa genelinden ortalama %${tabAnalytics.competitionTab.marketIndex.toFixed(1)} daha pahalısınız.`
                                            : 'Piyasa ortalaması ile aynı fiyattasınız.')}
                                </p>

                                <div className="w-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-400 h-4 rounded-full relative shadow-inner">
                                    <div className="absolute -mt-2 w-1 h-8 bg-gray-900 rounded-full shadow-md z-10" style={{ left: `${Math.min(Math.max(50 + (tabAnalytics.competitionTab?.marketIndex || 0) * 2, 0), 100)}%` }}></div>
                                    <div className="absolute -mt-8 ml-[-14px] text-xs font-bold bg-gray-900 text-white px-2 py-0.5 rounded shadow-sm" style={{ left: `${Math.min(Math.max(50 + (tabAnalytics.competitionTab?.marketIndex || 0) * 2, 0), 100)}%` }}>Biz</div>
                                    <div className="absolute left-[50%] -mt-1 w-0.5 h-6 bg-white/50 rounded-full"></div>
                                    <div className="absolute left-[50%] top-6 ml-[-20px] text-[10px] font-bold text-gray-400 uppercase">Piyasa Ort.</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute right-0 top-0 text-[100px] text-rose-50 -mt-4 -mr-4"><TrendingDown /></div>
                            <div className="relative z-10">
                                <p className="text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">Fiyat Kırma Fırsat Maliyeti</p>
                                <div className="flex items-end gap-3 mb-2">
                                    <h3 className="text-4xl font-black text-rose-600 leading-none">₺{(tabAnalytics.competitionTab?.opportunityCost || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
                                    <span className="text-sm font-medium text-rose-400 mb-1">/ Aylık</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed max-w-sm">"Sıkışmış" olarak etiketlenen ürünlerinizde lider olduğunuz halde rakipten gereksiz yere daha ucuza satarak <strong>masada bıraktığınız (feragat ettiğiniz)</strong> tahmini net kâr tutarı.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: INVENTORY */}
            {activeReportTab === 'inventory' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-8 -mt-8 opacity-20 blur-2xl"></div>
                            <div className="absolute bottom-0 right-0 text-amber-500/10 text-9xl transform translate-x-4 translate-y-8">
                                <PackageX />
                            </div>
                            <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Bağlı (Ölü) Sermaye</p>
                                    <h3 className="text-4xl font-black text-white mb-2">₺{(tabAnalytics.inventoryTab?.deadCapital || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
                                </div>
                                <p className="text-sm text-indigo-300 font-medium">Seçili dönemde hiç satmayan, depoda kilitlenmiş stokların toplam maliyeti. Nakit akışını yavaşlatıyor.</p>
                            </div>
                        </div>

                        <div className="bg-rose-50 p-8 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 text-rose-500/10 text-9xl transform translate-x-4 translate-y-8">
                                <TrendingDown />
                            </div>
                            <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                                <div>
                                    <p className="text-rose-500 text-xs font-bold uppercase tracking-wider mb-2">Muhtemel Ciro Kaybı (15 Günlük OOS Riski)</p>
                                    <h3 className="text-4xl font-black text-rose-600 mb-2">₺{(tabAnalytics.inventoryTab?.oosRisk || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
                                </div>
                                <p className="text-sm text-rose-800 font-medium">En kârlı 3 kategori lideri ürününüzün stoğu 15 gün içinde tükenecek. Acil sipariş verilmezse potansiyel kayıp.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
