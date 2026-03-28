import React, { useState, useMemo } from 'react';
import { Database, Banknote, RefreshCw, AlertTriangle, TrendingDown, ArrowRight, Package, Info, Lightbulb, X, Download, Star, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';
import { getFallbackProductImage } from '../hooks/useOrders';

export const InventoryHealth = () => {
    const [activeTab, setActiveTab] = useState('critical');

    // Utility Formatters
    const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);

    // Fetch Real Data from Context
    const { productsData, ordersData } = useData();
    const { products, loading: productsLoading } = productsData;
    const { orders, loading: ordersLoading } = ordersData;

    // Compute Metrics
    const {
        totalInventoryCost,
        totalSalesValue,
        inventoryTurnover,
        riskCapital,
        realAgingData = [], 
        realAbcData = [],
        realAbcDetailsData = {},
        realCriticalStockData = [],
        realDeadStockData = [],
        realOverstockData = []
    } = useMemo(() => {
        if (!products || products.length === 0) {
            return { totalInventoryCost: 0, totalSalesValue: 0, inventoryTurnover: 0, riskCapital: 0, realAgingData: [], realAbcData: [], realAbcDetailsData: {}, realCriticalStockData: [], realDeadStockData: [], realOverstockData: [] };
        }

        let costSum = 0;
        let salesSum = 0;
        let riskSum = 0;

        // Group orders by product for 90-day activity check & turnover calculation
        const now = new Date();
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const orderStats = {};
        let totalAllTimeRevenue = 0;

        if (orders) {
            orders.forEach(tx => {
                // Ignore returns for turnover velocity simplicity, or use them depending on strictness
                const isReturn = tx.statusObj?.label === 'İade' || tx.statusObj?.label === 'İptal' || tx.statusObj?.label === 'CANCELLED' || tx.statusObj?.label === 'REFUNDED';
                if (!isReturn && tx.dateRaw) {
                    const prodName = tx.productName || 'Unknown';
                    if (!orderStats[prodName]) {
                        orderStats[prodName] = { lastSold: tx.dateRaw, annualCOGS: 0, allTimeRevenue: 0, unitsSold30Days: 0 };
                    }
                    if (tx.dateRaw > orderStats[prodName].lastSold) {
                        orderStats[prodName].lastSold = tx.dateRaw;
                    }
                    if (tx.dateRaw >= oneYearAgo) {
                        orderStats[prodName].annualCOGS += (tx.cost || (tx.revenue * 0.4) || 0);
                    }
                    orderStats[prodName].allTimeRevenue += (tx.revenue || 0);
                    totalAllTimeRevenue += (tx.revenue || 0);

                    if (tx.dateRaw >= thirtyDaysAgo) {
                        orderStats[prodName].unitsSold30Days += (tx.quantity || 1);
                    }
                }
            });
        }

        let totalAnnualCOGS = 0;

        let agingSums = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        const productStatsArray = [];

        products.forEach(p => {
            const stockQty = p.stock || 0;
            const price = p.price || 0;
            const cost = price * 0.4; // Simulated 40% cost margin based on useOrders logic

            const productCostValue = stockQty * cost;
            const productSalesValue = stockQty * price;

            costSum += productCostValue;
            salesSum += productSalesValue;

            // Resolve actual name matching (simple fallback)
            const matchedName = Object.keys(orderStats).find(name => {
                const safeName = String(name).toLowerCase();
                const safePName = String(p.name || '').toLowerCase();
                return safeName.includes(safePName) || safePName.includes(safeName);
            });

            const stats = matchedName ? orderStats[matchedName] : null;

            let daysSinceLastSale = 999;
            if (stockQty > 0) {
                if (stats && stats.lastSold) {
                    daysSinceLastSale = Math.floor((now.getTime() - stats.lastSold.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysSinceLastSale <= 30) {
                        agingSums['0-30'] += productCostValue;
                    } else if (daysSinceLastSale <= 60) {
                        agingSums['31-60'] += productCostValue;
                    } else if (daysSinceLastSale <= 90) {
                        agingSums['61-90'] += productCostValue;
                    } else {
                        agingSums['90+'] += productCostValue;
                        riskSum += productCostValue; // Also add to risk sum
                    }
                    totalAnnualCOGS += stats.annualCOGS;
                } else {
                    // Never sold (or no data) -> Treat as 90+ days old / Dead Stock
                    agingSums['90+'] += productCostValue;
                    riskSum += productCostValue;
                }
            }

            productStatsArray.push({
                ...p,
                productAllTimeRevenue: stats ? stats.allTimeRevenue : 0,
                velocity30: stats ? stats.unitsSold30Days : 0,
                daysSinceLastSale,
                productCostValue
            });
        });

        const turnover = costSum > 0 ? (totalAnnualCOGS / costSum) : 0;

        const realAgingData = [
            { name: '0-30 Gün', value: agingSums['0-30'], color: '#10B981' }, // Green
            { name: '31-60 Gün', value: agingSums['31-60'], color: '#3B82F6' }, // Blue
            { name: '61-90 Gün', value: agingSums['61-90'], color: '#F59E0B' }, // Amber
            { name: '90+ Gün', value: agingSums['90+'], color: '#EF4444' },   // Red
        ];

        // ABC Analysis
        productStatsArray.sort((a, b) => b.productAllTimeRevenue - a.productAllTimeRevenue);

        let cumulativeRevenue = 0;
        const aClassItems = [];
        const bClassItems = [];
        const cClassItems = [];

        productStatsArray.forEach(p => {
            cumulativeRevenue += p.productAllTimeRevenue;
            const revPercent = totalAllTimeRevenue > 0 ? (cumulativeRevenue / totalAllTimeRevenue) : 0;
            
            const formatItem = {
                 name: p.name,
                 stock: `${p.stock || 0} Adet`,
                 velocity: `${p.velocity30} / ay`,
                 revenue: `₺${(p.productAllTimeRevenue || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
                 image: p.img || null
            };

            if (p.productAllTimeRevenue > 0) {
                if (revPercent <= 0.70) {
                    aClassItems.push(formatItem);
                } else if (revPercent <= 0.90) {
                    bClassItems.push(formatItem);
                } else {
                    cClassItems.push(formatItem);
                }
            } else {
                cClassItems.push(formatItem);
            }
        });

        const realAbcData = [
            { name: 'A Sınıfı', value: 70, count: aClassItems.length, color: '#6366F1' },
            { name: 'B Sınıfı', value: 20, count: bClassItems.length, color: '#8B5CF6' },
            { name: 'C Sınıfı', value: 10, count: cClassItems.length, color: '#CBD5E1' }
        ];

        const realAbcDetailsData = {
            'A Sınıfı': {
                 title: 'A Sınıfı Ürünler - Yüksek Ciro Etkisi',
                 subtitle: `Bu ${aClassItems.length} ürün toplam cironuzun yaklaşık %70'ini oluşturuyor.`,
                 color: 'bg-indigo-600',
                 items: aClassItems
            },
            'B Sınıfı': {
                 title: 'B Sınıfı Ürünler - Orta Değer',
                 subtitle: `Bu ${bClassItems.length} ürün cironuzun yaklaşık %20'sini oluşturuyor. Standart izleme gerektirir.`,
                 color: 'bg-violet-600',
                 items: bClassItems
            },
            'C Sınıfı': {
                 title: 'C Sınıfı Ürünler - Düşük Değer',
                 subtitle: `Bu ${cClassItems.length} ürün cironuzun sadece %10'unu oluşturuyor. Stok maliyetine dikkat.`,
                 color: 'bg-slate-500',
                 items: cClassItems
            }
        };

        // Action Tables Processing
        const realCriticalStockData = [];
        const realDeadStockData = [];
        const realOverstockData = [];

        productStatsArray.forEach(p => {
            const stock = p.stock || 0;
            const velocityPerDay = p.velocity30 / 30; // Avg sales per day over last 30 days
            const daysOfInventory = velocityPerDay > 0 ? (stock / velocityPerDay) : 999;
            const hasRecentSales = p.daysSinceLastSale < 90;

            const formatCurrencyVal = (v) => `₺${(v || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;

            // 1. Critical Stock (Running out in < 14 days and has velocity)
            if (stock > 0 && velocityPerDay > 0 && daysOfInventory <= 14) {
                realCriticalStockData.push({
                    id: p.id || Math.random(),
                    name: p.name,
                    image: p.img || null,
                    currentStock: stock,
                    salesVelocity: `${velocityPerDay.toFixed(1)} / gün`,
                    status: `${Math.floor(daysOfInventory)} Gün Kaldı`,
                    statusColor: daysOfInventory <= 3 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                });
            }

            // 2. Dead Stock (No sales in 90+ days OR never sold with > 0 stock)
            if (stock > 0 && (p.daysSinceLastSale >= 90 || !hasRecentSales)) {
                realDeadStockData.push({
                    id: p.id || Math.random(),
                    name: p.name,
                    image: p.img || null,
                    waitingTime: p.daysSinceLastSale === 999 ? "Hiç Satış Yok" : `${p.daysSinceLastSale} Gündür Satılmadı`,
                    costValue: formatCurrencyVal(p.productCostValue),
                    action: "İndirim Planla"
                });
            }

            // 3. Overstock (Has > 90 days of inventory and is actively selling, though slowly)
            if (stock > 0 && velocityPerDay > 0 && daysOfInventory > 90) {
                const monthsOfInventory = Math.floor(daysOfInventory / 30);
                realOverstockData.push({
                    id: p.id || Math.random(),
                    name: p.name,
                    image: p.img || null,
                    currentStock: `${stock} Adet`,
                    salesVelocity: `${p.velocity30} / ay`,
                    duration: `${monthsOfInventory > 120 ? '120+' : monthsOfInventory} Ay Stok`,
                    durationColor: monthsOfInventory > 12 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700",
                    costValue: formatCurrencyVal(p.productCostValue),
                    action: "Alımı Durdur"
                });
            }
        });

        // Ensure sorted tables intuitively
        realCriticalStockData.sort((a, b) => parseFloat(a.status) - parseFloat(b.status));
        realDeadStockData.sort((a, b) => b.costValue.localeCompare(a.costValue));
        realOverstockData.sort((a, b) => b.costValue.localeCompare(a.costValue));

        return {
            totalInventoryCost: costSum,
            totalSalesValue: salesSum,
            inventoryTurnover: turnover,
            riskCapital: riskSum,
            realAgingData,
            realAbcData,
            realAbcDetailsData,
            realCriticalStockData,
            realDeadStockData,
            realOverstockData
        };
    }, [products, orders]);






    // ABC Detail Modal State
    const [selectedABCClass, setSelectedABCClass] = useState(null);

    // Mock Data - ABC Drill Down
    const modalData = selectedABCClass ? realAbcDetailsData[selectedABCClass] : null;

    return (
        <div className="space-y-6 pb-10">
            <h1 className="text-2xl font-bold text-slate-900">Stok Sağlığı</h1>

            {/* Section 1: KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Available Cost */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Depodaki Maliyet</p>
                            <div className="group relative">
                                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Anlık stok adetleri ile ürün maliyetlerinin çarpımıyla hesaplanır.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalInventoryCost)}</h3>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Database className="h-5 w-5" />
                    </div>
                </div>

                {/* Potential Revenue */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tahmini Satış Değeri</p>
                            <div className="group relative">
                                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Anlık stok adetleri ile güncel satış fiyatlarının çarpımıyla hesaplanır.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalSalesValue)}</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Banknote className="h-5 w-5" />
                    </div>
                </div>

                {/* Turnover Rate */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stok Devir Hızı (Yıllık)</p>
                            <div className="group relative">
                                <Info className="h-3.5 w-3.5 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Son 1 yıllık sipariş maliyetlerinizin (COGS) güncel depo maliyetinize (Depodaki Maliyet) bölünmesiyle hesaplanır.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{inventoryTurnover.toFixed(1)}x</h3>
                        <p className="text-xs font-medium text-emerald-600 mt-1">Sektör ort: 3.5x</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <RefreshCw className="h-5 w-5" />
                    </div>
                </div>

                {/* Dead Stock */}
                <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Riskli Sermaye (&gt;90 Gün)</p>
                            <div className="group relative">
                                <Info className="h-3.5 w-3.5 text-red-300 cursor-help hover:text-red-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Son 90 gündür hiç siparişi olmayan (hareketsiz) ürünlerinizin depodaki toplam maliyet yüküdür.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(riskCapital)}</h3>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Section 2: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Aging Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Stok Yaşlandırma Analizi</h3>
                        <div className="group relative">
                            <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                Stok Yaşlandırma: Ürünlerin depoda ne kadar süredir beklediğini gösterir. 90 günden eski stoklar (Kırmızı), nakit akışınızı kilitleyen 'Ölü Sermaye'dir.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={realAgingData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    tickFormatter={(value) => `₺${value > 0 ? (value / 1000).toFixed(0) : 0}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`, 'Stok Değeri']}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {realAgingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ABC Analysis Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">ABC Analizi (Pareto)</h3>
                            <div className="group relative">
                                <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                    Pareto Prensibi (80/20 Kuralı): Ürünlerinizin ciroya katkısına göre sınıflandırılmasıdır.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Gelir Payı Dağılımı</span>
                    </div>

                    <div className="flex items-center flex-1">
                        {/* Chart Area */}
                        <div className="flex-1 h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={realAbcData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        onClick={(data) => setSelectedABCClass(data.name)}
                                        className="cursor-pointer"
                                    >
                                        {realAbcData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-xs text-slate-400 uppercase font-semibold">Toplam</p>
                                <p className="text-xl font-bold text-slate-900">{products.length}</p>
                                <p className="text-xs text-slate-500">Çeşit</p>
                            </div>
                        </div>

                        {/* Rich Legend */}
                        <div className="w-64 pl-4 border-l border-slate-100 flex flex-col justify-center space-y-5">
                            {/* A Class */}
                            {realAbcData.map(classData => {
                                const details = realAbcDetailsData[classData.name];
                                const isAClass = classData.name === 'A Sınıfı';
                                const isBClass = classData.name === 'B Sınıfı';

                                return (
                                    <div
                                        key={classData.name}
                                        onClick={() => setSelectedABCClass(classData.name)}
                                        className="cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: classData.color }} />
                                                <span className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700">{classData.name} {isAClass ? '(Yüksek)' : isBClass ? '(Orta)' : '(Düşük)'}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{classData.count} Ürün</span>
                                        </div>
                                        <p className={cn("text-xs font-medium pl-4.5 mt-0.5", isAClass ? "text-emerald-600" : isBClass ? "text-slate-500" : "text-orange-600")}>
                                            %{classData.value} Ciro Etkisi • {isAClass ? 'Asla yok satmamalı.' : isBClass ? 'Standart izleme.' : 'Stok yükü oluşturabilir.'}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Strategy Insight Footer */}
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-start gap-3">
                        <Lightbulb className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-900 leading-relaxed">
                            <span className="font-semibold">İpucu:</span> A Sınıfı {realAbcDetailsData['A Sınıfı']?.items?.length || 0} ürününüz, toplam gelirinizin büyük kısmını taşıyor. Bu ürünlerdeki %1'lik stok kaybı, cironuzu ciddi etkiler.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 3: Action Tables */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('critical')}
                        className={cn(
                            "px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            activeTab === 'critical'
                                ? "border-indigo-600 text-indigo-600 bg-indigo-50/10"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Tükenmek Üzere (Kritik)
                    </button>
                    <button
                        onClick={() => setActiveTab('dead')}
                        className={cn(
                            "px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            activeTab === 'dead'
                                ? "border-red-600 text-red-600 bg-red-50/10"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <Package className="h-4 w-4" />
                        Hareketsiz & Ölü Stok
                    </button>
                    <button
                        onClick={() => setActiveTab('overstock')}
                        className={cn(
                            "px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                            activeTab === 'overstock'
                                ? "border-amber-500 text-amber-600 bg-amber-50/10"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <Layers className="h-4 w-4" />
                        Aşırı Stok (Fazla Envanter)
                    </button>
                </div>

                {/* Table Content */}
                <div className="p-0">
                    {activeTab === 'critical' ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Ürün</th>
                                    <th className="px-6 py-3">Mevcut Adet</th>
                                    <th className="px-6 py-3">Satış Hızı</th>
                                    <th className="px-6 py-3">Tahmini Bitiş</th>
                                    <th className="px-6 py-3">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {realCriticalStockData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image || getFallbackProductImage(item.name)} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                <span className="font-semibold text-slate-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">{item.currentStock} Adet</td>
                                        <td className="px-6 py-4 text-slate-500">{item.salesVelocity}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", item.statusColor)}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1 hover:underline">
                                                Sipariş Oluştur <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {realCriticalStockData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            Tükenmek üzere olan ürün (veya stok/sipariş bilgisi) bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : activeTab === 'dead' ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Ürün</th>
                                    <th className="px-6 py-3">Bekleme Süresi</th>
                                    <th className="px-6 py-3">Bağlı Sermaye (Maliyet)</th>
                                    <th className="px-6 py-3">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {realDeadStockData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image || getFallbackProductImage(item.name)} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                <span className="font-semibold text-slate-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                {item.waitingTime}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-bold">{item.costValue}</td>
                                        <td className="px-6 py-4">
                                            <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">
                                                {item.action}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {realDeadStockData.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            Hareketsiz veya ölü durumda bir ürün (veya mevcut stok verisi) bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Ürün</th>
                                    <th className="px-6 py-3">Mevcut Stok</th>
                                    <th className="px-6 py-3">Satış Hızı (Aylık)</th>
                                    <th className="px-6 py-3">Stok Yetecek Süre (DOI)</th>
                                    <th className="px-6 py-3">Bağlı Sermaye</th>
                                    <th className="px-6 py-3">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {realOverstockData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image || getFallbackProductImage(item.name)} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                <div>
                                                    <span className="font-semibold text-slate-900 block">{item.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">{item.currentStock}</td>
                                        <td className="px-6 py-4 text-slate-500">{item.salesVelocity}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", item.durationColor)}>
                                                {item.duration}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-bold">{item.costValue}</td>
                                        <td className="px-6 py-4">
                                            <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors">
                                                {item.action}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {realOverstockData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            Fazla envanterli durumunda olan stok (veya bağlantılı veri) bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* ABC Detail Modal */}
            {selectedABCClass && modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedABCClass(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className={cn("p-6 flex items-start justify-between text-white", modalData.color)}>
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {modalData.title}
                                    {selectedABCClass === 'A Sınıfı' && <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
                                </h2>
                                <p className="text-white/80 mt-1 text-sm">{modalData.subtitle}</p>
                            </div>
                            <button
                                onClick={() => setSelectedABCClass(null)}
                                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Body - Product Table */}
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 z-10 shadow-sm border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Ürün</th>
                                        <th className="px-6 py-3">Stok</th>
                                        <th className="px-6 py-3">Satış Hızı</th>
                                        <th className="px-6 py-3">Ciro Katkısı</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {modalData.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image || getFallbackProductImage(item.name)} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                    <span className="font-semibold text-slate-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 font-medium">{item.stock}</td>
                                            <td className="px-6 py-4 text-slate-500">{item.velocity}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{item.revenue}</span>
                                                    {selectedABCClass === 'A Sınıfı' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                            Lider
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg text-sm font-medium transition-colors">
                                <Download className="h-4 w-4" />
                                Listeyi İndir (Excel)
                            </button>
                            <button
                                onClick={() => setSelectedABCClass(null)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm hover:shadow"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
