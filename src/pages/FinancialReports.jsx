import React, { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, ReferenceLine, ReferenceDot, BarChart, Bar, Cell, Label
} from 'recharts';
import {
    TrendingDown, AlertOctagon, PackageX, Truck,
    Target, TrendingUp, Calendar, AlertCircle, Info, Loader2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { expensesData, calculateDailyExpense } from '../data/expensesData';

export const FinancialReports = () => {
    // State for Annual Goal
    const [annualGoal, setAnnualGoal] = useState(2000000); // 2M TL default
    const [growthRate, setGrowthRate] = useState(12); // Growth Rate Simulation %
    const [chartPeriod, setChartPeriod] = useState('buAy'); // 'buAy', 'gecenAy', 'buYil'

    const { ordersData, analyticsData, globalDateRange } = useData();
    const { orders, loading: ordersLoading } = ordersData;
    const { data: gaData, loading: gaLoading } = analyticsData;

    const isLoading = ordersLoading || gaLoading;

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
        }).sort((a,b) => b.revenue - a.revenue);

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
            targetDate.setHours(0,0,0,0);
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

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Finansal Raporlar</h1>
                <p className="text-sm text-gray-500">Operasyonel verimlilik ve finansal hedef takibi.</p>
            </div>

            {/* LEVEL 1: EXECUTIVE SUMMARY (CFO KOKPİT - EN ÜST) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">{executiveData.revenue.label}</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-2xl font-black text-gray-900 leading-none">₺{executiveData.revenue.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                        <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg mb-1">
                            <TrendingUp size={12} className="mr-1" />
                            %{executiveData.revenue.trend}
                        </span>
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">{executiveData.netProfit.label}</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-2xl font-black text-gray-900 leading-none">₺{executiveData.netProfit.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                        <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg mb-1">
                            <TrendingUp size={12} className="mr-1" />
                            %{executiveData.netProfit.trend}
                        </span>
                    </div>
                </div>

                {/* Net Margin Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">{executiveData.netMargin.label}</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className="text-3xl font-black text-blue-600">%{executiveData.netMargin.value}</span>
                        <span className="flex items-center text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-lg mb-1">
                            <TrendingDown size={12} className="mr-1" />
                            {executiveData.netMargin.trend} (Geçen Ay)
                        </span>
                    </div>
                </div>
            </div>

            {/* LEVEL 2: PROFITABILITY HEATMAP (STRATEGIC) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900">Kârlılık Haritası</h3>
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

            {/* LEVEL 3: OPERATIONAL LEAKS & DETAILS (EXISTING) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 2. LOST MONEY COUNTER (MOVED DOWN & STANDARDIZED) */}
                <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                                <AlertOctagon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">İade & İptal Maliyeti</h3>
                                <p className="text-xs text-rose-600 font-medium">Operasyonel Kayıp Sayacı</p>
                            </div>
                        </div>
                        <span className="bg-white text-rose-700 text-xs font-bold px-2.5 py-1 rounded border border-rose-200">
                            Son 30 Gün
                        </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="text-center mb-8">
                            <p className="text-sm text-gray-500 font-medium mb-1">Toplam "Çöpe Giden" Para</p>
                            <div className="text-5xl font-black text-rose-600 tracking-tight">
                                -₺{lostMoneyData.totalLoss.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {lostMoneyData.returnCount} İade • {lostMoneyData.cancelCount} İptal
                            </p>
                        </div>

                        {/* Standardized UI: Rose Theme, No Icons, Rounded-2xl */}
                        <div className="grid grid-cols-3 gap-4">
                            {lostMoneyData.breakdown.map((item, idx) => (
                                <div key={idx} className="bg-rose-50 px-2 py-4 rounded-2xl border border-rose-100 text-center flex flex-col justify-center h-full">
                                    <div className="text-xl font-black text-rose-600">₺{item.value.toLocaleString()}</div>
                                    <div className="text-[10px] font-bold text-rose-800 uppercase mt-1 leading-tight px-1">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* LEVEL 4: FINANCIAL DETAIL & FORECAST (EXISTING) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 3. BREAK-EVEN DAY (Kâra Geçiş Noktası) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="text-gray-400" size={20} />
                                Şirket Kârlılık Noktası
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {chartPeriod === 'buAy' ? 'Bu ay' : chartPeriod === 'gecenAy' ? 'Geçen ay' : 'Bu yıl'} kümülatif kârın negatiftan pozitife geçtiği gün.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Date Toggle */}
                            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-bold text-gray-500">
                                <button
                                    onClick={() => setChartPeriod('buAy')}
                                    className={`px-3 py-1.5 rounded-md transition-all ${chartPeriod === 'buAy' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-700'}`}
                                >
                                    Bu Ay
                                </button>
                                <button
                                    onClick={() => setChartPeriod('gecenAy')}
                                    className={`px-3 py-1.5 rounded-md transition-all ${chartPeriod === 'gecenAy' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-700'}`}
                                >
                                    Geçen Ay
                                </button>
                                <button
                                    onClick={() => setChartPeriod('buYil')}
                                    className={`px-3 py-1.5 rounded-md transition-all ${chartPeriod === 'buYil' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-700'}`}
                                >
                                    Bu Yıl
                                </button>
                            </div>

                            {breakEvenLabel && (
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 text-right hidden sm:block">
                                    <div className="text-xs font-bold uppercase opacity-80">Kâra Geçiş</div>
                                    <div className="text-xl font-bold">{breakEvenLabel}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    minTickGap={10}
                                />
                                <YAxis
                                    hide={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    tickFormatter={(val) => `₺${val >= 1000 || val <= -1000 ? (val / 1000).toFixed(0) + 'K' : val}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const val = payload[0].value;
                                            return (
                                                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                                                    <p className="text-xs text-slate-500 font-bold mb-1">{label}</p>
                                                    <p className={`text-sm font-bold ${val >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        Kümülatif Kâr : ₺{val.toLocaleString()}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

                                {breakEvenIndex !== -1 && (
                                    <ReferenceLine x={chartData[breakEvenIndex]?.label} stroke="#10b981" strokeDasharray="3 3">
                                        <Label value="Kâra Geçiş" position="top" fill="#10b981" fontSize={10} fontWeight="bold" />
                                    </ReferenceLine>
                                )}

                                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getBarColor(entry.profit, minProfit, maxProfit)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. ANNUAL PROFIT GOAL (INTERACTIVE SIMULATOR) */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl lg:col-span-2 p-8 text-white relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 md:items-center justify-between">

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-300 border border-indigo-500/30">
                                    <Target size={24} />
                                </div>
                                <h3 className="text-xl font-bold">Yıllık Kâr Hedefi & Simülasyon</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Goal Input */}
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Hedeflenen Net Kâr (Yıllık)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                                        <input
                                            type="number"
                                            value={annualGoal}
                                            onChange={(e) => setAnnualGoal(Number(e.target.value))}
                                            className="w-full bg-slate-800 border-slate-700 text-white pl-8 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-lg transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Growth Slider (New) */}
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2 flex justify-between">
                                        <span>Büyüme Hızı Simülasyonu</span>
                                        <span className={`${growthRate >= 12 ? 'text-emerald-400' : 'text-slate-400'}`}>%{growthRate}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-10"
                                        max="50"
                                        value={growthRate}
                                        onChange={(e) => setGrowthRate(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                        <span>Stabil (-10%)</span>
                                        <span>Mevcut (%12)</span>
                                        <span>Aggresif (+50%)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        İlerleme: %{percentProgress.toFixed(1)}
                                        {percentProgress >= 100 && (
                                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 animate-pulse">
                                                TAMAMLANDI 🎉
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-white">₺{currentYTDProfit.toLocaleString()} / ₺{annualGoal.toLocaleString()}</span>
                                </div>
                                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(percentProgress, 100)}%` }}
                                    ></div>
                                </div>

                            </div>
                        </div>

                        {/* Analysis Card */}
                        <div className="md:w-72 bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm flex flex-col justify-center">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Tahmini Hedef Tarihi</p>
                            <div className="text-2xl font-black text-white mb-1">
                                {estimatedDateFormatted}
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-start gap-3">
                                <TrendingUp size={16} className={`${growthRate > 12 ? 'text-emerald-400' : 'text-indigo-400'} mt-0.5`} />
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    {growthRate > 12
                                        ? <span>Simüle edilen <strong className="text-emerald-400">%{growthRate}</strong> büyüme ile hedefe daha erken ulaşacaksınız. Harika!</span>
                                        : <span>Mevcut <strong className="text-indigo-400">%{growthRate}</strong> büyüme hızıyla hedefe planlanan sürede ilerliyorsunuz.</span>
                                    }
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};
