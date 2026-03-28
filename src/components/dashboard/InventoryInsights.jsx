import React, { useState } from 'react';
import { TrendingUp, Archive, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export function InventoryInsights({ t, products = [], orders = [] }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [enrichmentData, setEnrichmentData] = useState(null);

    // Combine orders and products to determine sales velocity
    const dynamicInsights = React.useMemo(() => {
        if (!products || products.length === 0) return { fastMovers: [], slowMovers: [] };

        const thirthyDaysAgo = new Date();
        thirthyDaysAgo.setDate(thirthyDaysAgo.getDate() - 30);

        const analyzed = products.map((product) => {
            let sales30Days = 0;
            // Scan real orders for this product
            if (orders && orders.length > 0) {
                const productOrders = orders.filter(order => order.dateRaw >= thirthyDaysAgo && order.productName === product.name);
                productOrders.forEach(() => {
                    sales30Days += 1;
                });
            }

            const dailyRate = sales30Days / 30;
            const currentStock = product.stock || 0;
            const daysLeft = dailyRate > 0 ? Math.floor(currentStock / dailyRate) : Infinity;
            const price = product.price || 0;
            const lockedCapital = currentStock * price;

            return {
                ...product,
                sales30Days,
                dailyRate,
                daysLeft,
                lockedCapital,
                image: product.img || "https://via.placeholder.com/100?text=Ikas",
            };
        });

        // Hızlı Tüketilenler (Fast Movers) - high sales, low days left
        const fast = analyzed
            .filter(p => p.sales30Days > 0) // Just require some sales
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 6)
            .map((p, idx) => ({
                id: p.id || `f-${idx}`,
                name: p.name,
                image: p.image,
                salesRate: `Günde ${p.dailyRate.toFixed(1)} adet`,
                daysLeft: p.daysLeft === Infinity ? 'Süresiz' : `${p.daysLeft} Gün Kaldı`,
                lockedCapital: `₺${p.lockedCapital.toLocaleString('tr-TR')}`,
                badge: p.daysLeft < 14 ? "Kritik: Sipariş Ver" : "Uyarı: Planla",
                badgeColor: p.daysLeft < 14 ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200",
                rawProduct: p
            }));

        // Ölü Stok Adayları (Slow Movers) - 0 or very low sales, high locked capital
        const slow = analyzed
            .filter(p => p.sales30Days <= 1 && p.lockedCapital > 0) // No movement, tied up cash
            .sort((a, b) => b.lockedCapital - a.lockedCapital)
            .slice(0, 6)
            .map((p, idx) => ({
                id: p.id || `s-${idx}`,
                name: p.name,
                image: p.image,
                lastSale: p.sales30Days === 0 ? "Son 30 günde satılmadı" : "Çok düşük hız",
                lockedCapital: `₺${p.lockedCapital.toLocaleString('tr-TR')}`,
                badge: p.lockedCapital > 5000 ? "Öneri: Tasfiye Et" : "Öneri: Kampanya",
                badgeColor: p.lockedCapital > 5000 ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200",
                rawProduct: p
            }));

        return { fastMovers: fast, slowMovers: slow };
    }, [products, orders]);

    const { fastMovers, slowMovers } = dynamicInsights;

    const handleOpenDetail = (item) => {
        const product = item.rawProduct;

        // Pass direct real data rather than randomizing
        setEnrichmentData({
            stock: product.stock,
            price: product.price,
            sku: product.sku || '—',
            brand: product.brand || '—',
            category: product.category || '—',
            reserved: 0, 
            available: product.stock,
            supplier: '—', 
            costPrice: product.costPrice || 0
        });
        setSelectedProduct(product);
        window.scrollTo(0, 0);
    };

    const handleCloseDetail = () => {
        setSelectedProduct(null);
        setEnrichmentData(null);
    };

    if (selectedProduct && enrichmentData) {
        return (
            <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col" id="inventory-detail-view">
                {/* Header with Back Button */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
                    <button
                        onClick={handleCloseDetail}
                        className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h3 className="font-semibold text-slate-900">Ürün Detayı</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Top Section: Image & Info */}
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-48 h-48 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                            <img
                                id="detail-img"
                                src={selectedProduct.image.replace('100&h=100', '400&h=400')}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 id="detail-name" className="text-2xl font-bold text-slate-900">{selectedProduct.name}</h2>
                                <p id="detail-sku" className="text-sm text-slate-500 font-mono mt-1">{enrichmentData.sku}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">MARKA</span>
                                    <p id="detail-brand" className="text-sm font-medium text-slate-900 mt-0.5">{enrichmentData.brand}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">KATEGORİ</span>
                                    <p id="detail-category" className="text-sm font-medium text-slate-900 mt-0.5">{enrichmentData.category}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                            <span className="text-sm text-slate-500 block mb-1">Toplam Stok</span>
                            <span id="detail-stock-total" className="text-2xl font-bold text-slate-900">{enrichmentData.stock}</span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                            <span className="text-sm text-slate-500 block mb-1">Rezerve</span>
                            <span id="detail-stock-reserved" className="text-2xl font-bold text-orange-600">{enrichmentData.reserved}</span>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                            <span className="text-sm text-slate-500 block mb-1">Kullanılabilir</span>
                            <span id="detail-stock-available" className="text-2xl font-bold text-emerald-600">{enrichmentData.available}</span>
                        </div>
                    </div>

                    {/* Supplier & Cost Info */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            Tedarik Bilgileri
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <span className="text-xs font-medium text-slate-500 uppercase">TEDARİKÇİ</span>
                                <p id="detail-supplier" className="text-base font-medium text-slate-900 mt-1">{enrichmentData.supplier}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-slate-500 uppercase">TAHMİNİ MALİYET</span>
                                <p id="detail-cost" className="text-base font-medium text-slate-900 mt-1">₺{enrichmentData.costPrice.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full" id="inventory-list-view">
            {/* Widget Header */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">📦 Stok ve Envanter Analizi</h3>
                <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer">
                    Rapor Detayı
                </span>
            </div>

            {/* Split Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                {/* Left Column: Top Movers */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-red-600" />
                        </div>
                        <h4 className="font-medium text-slate-900">Hızlı Tüketilenler (Riskli)</h4>
                    </div>

                    <div className="space-y-4">
                        {fastMovers.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 cursor-pointer group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors"
                                onClick={() => handleOpenDetail(item)}
                            >
                                <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0 border border-slate-200 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://via.placeholder.com/100?text=Product";
                                            e.currentTarget.onerror = null;
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-sm font-medium text-slate-900 truncate pr-2 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0 ml-2">{item.daysLeft}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">{item.salesRate}</span>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap", item.badgeColor)}>
                                            {item.badge}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Slow Movers */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Archive className="h-4 w-4 text-purple-600" />
                        </div>
                        <h4 className="font-medium text-slate-900">Ölü Stok Adayları ({'>'}60 Gün)</h4>
                    </div>

                    <div className="space-y-4">
                        {slowMovers.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 cursor-pointer group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors"
                                onClick={() => handleOpenDetail(item)}
                            >
                                <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0 border border-slate-200 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://via.placeholder.com/100?text=Product";
                                            e.currentTarget.onerror = null;
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-start justify-between mb-1.5 gap-2">
                                        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors" title={item.name}>{item.name}</p>
                                        <span className="text-[11px] font-medium text-slate-400 whitespace-normal text-right leading-tight shrink-0 w-20">{item.lastSale}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-500 whitespace-nowrap">Kilitli Para: {item.lockedCapital}</span>
                                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap", item.badgeColor)}>
                                            {item.badge}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
