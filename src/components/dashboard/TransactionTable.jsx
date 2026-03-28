import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Globe, Store, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RAW_PRODUCTS } from '../../data/mockProducts';
import { getFallbackProductImage } from '../../hooks/useOrders';

const CHANNEL_ICONS = { marketplace: ShoppingBag, web: Globe };
const CHANNEL_COLORS = {
    Trendyol: 'text-orange-600 bg-orange-50 border-orange-100',
    Amazon: 'text-slate-700 bg-slate-50 border-slate-200',
    Hepsiburada: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    Web: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    ikas: 'text-indigo-600 bg-indigo-50 border-indigo-100', // ikas branding
};
const STATUSES = [
    { label: 'Kargolandı', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    { label: 'Teslim Edildi', color: 'bg-green-50 text-green-700 ring-green-600/20' },
    { label: 'Hazırlanıyor', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    { label: 'İade Talep', color: 'bg-red-50 text-red-700 ring-red-600/20' },
];
const STATUS_MAP_IKAS = {
    'PAID': { label: 'Ödendi / Bekliyor', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    'FULFILLED': { label: 'Kargolandı', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    'DELIVERED': { label: 'Teslim Edildi', color: 'bg-green-50 text-green-700 ring-green-600/20' },
    'REFUNDED': { label: 'İade Edildi', color: 'bg-red-50 text-red-700 ring-red-600/20' }
};

const CUSTOMERS = [
    { name: 'Ahmet Y.', city: 'İstanbul' },
    { name: 'Mehmet K.', city: 'Ankara' },
    { name: 'Ayşe S.', city: 'İzmir' },
    { name: 'Can B.', city: 'Bursa' },
    { name: 'Zeynep T.', city: 'Antalya' },
];



// Build base mock transactions
const ALL_TRANSACTIONS = [];
RAW_PRODUCTS.forEach((p) => {
    if (!p.channels || p.channels.length === 0) return;
    p.channels.forEach((channel) => {
        // Skip adding mock Web data entirely to make way for real ikas data
        if (channel.name === 'Web') return;
        
        const revenue = channel.price;
        const cost = (p.cogs || 0) + (p.shipping || 0) + (channel.commission || 0) + (p.adSpend || 0);
        const profit = revenue - cost;
        ALL_TRANSACTIONS.push({
            _uid: `${p.id}-${channel.id}`,
            productId: p.id,
            category: p.category || 'Diğer',
            channel: channel.name,
            channelType: channel.type,
            dateRaw: new Date(Date.now() - Math.random() * 86400000 * 365), // random past year to support date filtering
            channelIcon: CHANNEL_ICONS[channel.type] || Store,
            channelColor: CHANNEL_COLORS[channel.name] || 'text-gray-600 bg-gray-50 border-gray-100',
            productName: p.name,
            productImage: p.image,
            revenue,
            cost: Math.round(cost),
            costBreakdown: `Ürün: ₺${p.cogs} + Kargo: ₺${p.shipping} + Komisyon: ₺${channel.commission}`,
            profit,
            customerId: Math.floor(Math.random() * CUSTOMERS.length),
            statusObj: STATUSES[Math.floor(Math.random() * STATUSES.length)],
            id: `tx${Math.floor(Math.random() * 10000)}`
        });
    });
});

export function TransactionTable({ orders = [], loading = false, filters = {} }) {
    const activeChannel = filters.channel || 'all';
    const activeCategory = filters.category || 'all';
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const getDateRangeBounds = (rangeFilter) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch(rangeFilter) {
            case 'thisMonth':
                return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
            case 'lastQuarter': {
                // User defined quarters:
                // Q1: Dec, Jan, Feb
                // Q2: Mar, Apr, May
                // Q3: Jun, Jul, Aug
                // Q4: Sep, Oct, Nov
                const m = now.getMonth(); // 0-indexed (0=Jan, 11=Dec)
                let startMonth, year = now.getFullYear();
                if (m === 11 || m === 0 || m === 1) { // Dec, Jan, Feb -> Q1
                   startMonth = 11; // Dec
                   if (m !== 11) year -= 1; // if Jan or Feb, Q1 started in Dec of previous year
                } else if (m >= 2 && m <= 4) { // Mar, Apr, May -> Q2
                   startMonth = 2; // March
                } else if (m >= 5 && m <= 7) { // Jun, Jul, Aug -> Q3
                   startMonth = 5; // June
                } else { // Sep, Oct, Nov -> Q4
                   startMonth = 8; // September
                }
                const start = new Date(year, startMonth, 1);
                return { start, end: now };
            }
            case 'thisYear':
                return { start: new Date(now.getFullYear(), 0, 1), end: now };
            default:
                if (rangeFilter && rangeFilter.startsWith('custom:')) {
                    const parts = rangeFilter.split(':');
                    return { start: new Date(parts[1] + 'T00:00:00Z'), end: new Date(parts[2] + 'T23:59:59.999Z') };
                }
                // Default to last 30 days
                return { start: new Date(startOfDay.getTime() - 29 * 24 * 60 * 60 * 1000), end: now };
        }
    };

    const { filtered, paginatedData, totalPages } = useMemo(() => {
        // Sadece gerçek API verilerini kullan
        const combined = [...orders.map(o => ({...o, isReal: true}))];
        
        // Sort uniformly by actual date
        combined.sort((a, b) => b.dateRaw - a.dateRaw);

        // Format dates
        const formatted = combined.map(tx => ({
            ...tx,
            dateStr: `${tx.dateRaw.getDate()} ${tx.dateRaw.toLocaleString('tr-TR', { month: 'short' })}, ${tx.dateRaw.getHours()}:${String(tx.dateRaw.getMinutes()).padStart(2, '0')}`
        }));

        const { start, end } = getDateRangeBounds(filters.dateRange || 'last30');

        const filteredTx = formatted.filter((tx) => {
            // Check Date Range
            if (tx.dateRaw < start || tx.dateRaw > end) return false;

            // Check if activeChannel matches. 'Web' filter value should match 'Web Sitesi (ikas)' or anything containing ikas that we treat as the web channel
            // Ensure case insensitive match for channels like 'Trendyol' vs 'trendyol'
            const activeChLower = activeChannel?.toLowerCase() || 'all';
            const txChLower = tx.channel?.toLowerCase() || '';

            const chMatch = activeChLower === 'all' || 
                txChLower === activeChLower || 
                (activeChLower === 'web' && txChLower.includes('ikas'));
                
            const catMatch = activeCategory === 'all' || tx.category === activeCategory;
            return chMatch && catMatch;
        });

        const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
        const paginatedData = filteredTx.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return { filtered: filteredTx, paginatedData, totalPages };
    }, [activeChannel, activeCategory, filters.dateRange, orders, currentPage]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col pt-0">
            {/* Header */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        Son Satış İşlemleri
                        {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                    </h3>
                    {(activeChannel !== 'all' || activeCategory !== 'all' || filters.dateRange) && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {filtered.length} işlem bulunuyor
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {orders.length > 0 && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Canlı Veri Yayında ({orders.length})
                        </span>
                    )}
                    <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer">
                        Tümünü Gör
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Store className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Bu filtre için işlem bulunamadı</p>
                        <p className="text-xs mt-1">Farklı bir kanal veya kategori seçin</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Sipariş &amp; Kanal</th>
                                <th className="px-6 py-3 font-medium">Tarih</th>
                                <th className="px-6 py-3 font-medium">Ürün</th>
                                <th className="px-6 py-3 font-medium">Müşteri</th>
                                <th className="px-6 py-3 font-medium text-right">Tutar</th>
                                <th className="px-6 py-3 font-medium text-right" title="Ürün Alış, Kargo, Komisyon, KDV">Direkt Maliyet</th>
                                <th className="px-6 py-3 font-medium text-right">Brüt Kâr</th>
                                <th className="px-6 py-3 font-medium text-right" title="Maaş, Kira, Reklam Payı">Şirket Gider Payı (ABC)</th>
                                <th className="px-6 py-3 font-medium text-right">NET KAR</th>
                                <th className="px-6 py-3 font-medium">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.map((item, index) => {
                                const ChannelIcon = item.channelIcon;
                                const customer = item.customerObj || CUSTOMERS[item.customerId];
                                const status = item.statusObj;
                                return (
                                    <tr key={item._uid} className="hover:bg-slate-50/80 transition-colors">
                                        {/* ID & Channel */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn('p-1.5 rounded-lg border', item.channelColor)}>
                                                    <ChannelIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                                                        #{item.id}
                                                    </span>
                                                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                                        {item.channel}
                                                        {item.isReal && <span className="text-emerald-500 font-bold ml-1 text-[9px]" title="ikas Live API">● LIVE</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                                            {item.dateStr}
                                        </td>

                                        {/* Product */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded border border-slate-200 flex items-center justify-center overflow-hidden relative">
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-xs">
                                                        {item.channel === 'Trendyol' ? 'TY' : 'IK'}
                                                    </div>
                                                    {item.productImage && (
                                                        <img
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            className="h-full w-full object-cover rounded absolute inset-0 z-10 bg-white"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="max-w-[140px]">
                                                    <p className="text-slate-900 font-medium truncate" title={item.productName}>
                                                        {item.productName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">{item.category}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-slate-900 font-medium">{customer.name}</p>
                                                <p className="text-xs text-slate-500">{customer.city}</p>
                                            </div>
                                        </td>

                                        {/* Revenue */}
                                        <td className="px-6 py-4 text-right font-medium text-slate-900 whitespace-nowrap tabular-nums">
                                            ₺{item.revenue.toLocaleString('tr-TR')}
                                        </td>

                                        {/* Direct Cost */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap tabular-nums text-slate-600">
                                            ₺{item.directCost.toLocaleString('tr-TR')}
                                        </td>

                                        {/* Gross Profit */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap tabular-nums font-medium">
                                            <span className={item.grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                                {item.grossProfit > 0 ? '+' : ''}₺{item.grossProfit.toLocaleString('tr-TR')}
                                            </span>
                                        </td>

                                        {/* Indirect Cost (ABC) - Interactive Tooltip */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="group relative inline-block">
                                                <span className="text-slate-500 decoration-dashed underline decoration-slate-300 underline-offset-4 cursor-help tabular-nums">
                                                    ₺{item.indirectCost.toLocaleString('tr-TR')}
                                                </span>
                                                <div className={cn(
                                                    "absolute right-0 min-w-[280px] w-max hidden group-hover:block z-[99] animate-in fade-in",
                                                    index < 2 
                                                        ? "top-[calc(100%+8px)] slide-in-from-top-2" 
                                                        : "bottom-[calc(100%+8px)] slide-in-from-bottom-2"
                                                )}>
                                                    <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-lg px-4 py-3 shadow-2xl border border-slate-700/50">
                                                        {item.costBreakdown}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Net Profit */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap tabular-nums font-bold">
                                            <span className={cn(
                                                'font-bold tabular-nums',
                                                item.profit > 0 ? 'text-emerald-600' : 'text-rose-600'
                                            )}>
                                                {item.profit > 0 ? '+' : ''}₺{Math.abs(Math.round(item.profit)).toLocaleString('tr-TR')}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cn(
                                                'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ring-inset',
                                                status.color
                                            )}>
                                                {status.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Önceki
                    </button>
                    <span className="text-sm font-medium text-slate-500">
                        Sayfa {currentPage} <span className="text-slate-300 mx-1">/</span> {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Sonraki
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
