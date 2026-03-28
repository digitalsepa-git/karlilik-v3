import React, { useState, useEffect, useRef } from 'react';
import { RAW_PRODUCTS } from '../../../data/mockProducts';

export const ProductFlow = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1); // 1: Search, 2: Preview, 3: Targets
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [commissionRate, setCommissionRate] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [targets, setTargets] = useState({ price: 0, margin: 20 });

    // Helper: Calculate Metrics (Used in both List and Preview)
    const getProductMetrics = (product) => {
        if (!product) return {};
        const currentPrice = product.channels?.[0]?.price || 0;
        // Improved mock cost calc: COGS + Shipping + (AdSpend or 0) + FixedCost
        const totalCost = product.cogs + product.shipping + (product.adSpend || 0) + product.fixedCost;
        const currentMargin = currentPrice > 0 ? ((currentPrice - totalCost) / currentPrice) * 100 : 0;
        return {
            price: currentPrice,
            margin: currentMargin.toFixed(1),
            stock: product.stock,
            category: product.category,
            unitsSold: product.unitsSold || 0
        };
    };

    // Helper: Determine Competitive Status
    const getCompetitiveStatus = (product, metrics) => {
        const margin = parseFloat(metrics.margin);
        const myPrice = metrics.price;
        const compPrice = product.competitorPrice;
        const velocity = product.unitsSold || 0;

        // 1. Zayıf (Weak) - Zarar + Pahalı
        if (margin <= 0 && myPrice > compPrice) {
            return { label: 'Zayıf', color: 'bg-red-100 text-red-700 border-red-200', icon: '⚠️', desc: 'Zarar + Pahalı' };
        }
        // 2. Sıkışmış (Squeezed) - Zarar + Çıkışsız
        if (margin <= 0 && myPrice <= compPrice) {
            return { label: 'Sıkışmış', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🛑', desc: 'Zarar + Çıkışsız' };
        }
        // 3. Güçlü (Strong) - Lider Konum (High Velocity + Competitive + Good Margin)
        if (velocity > 300 && myPrice <= compPrice && margin > 10) {
            return { label: 'Güçlü', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '💎', desc: 'Lider Konum' };
        }
        // 4. Kilitli (Locked) - Kârlı + Statik (Low Velocity)
        if (velocity < 30 && margin > 10) {
            return { label: 'Kilitli', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: '🔒', desc: 'Kârlı + Statik' };
        }
        // 5. İyileştirilebilir (Improvable) - Potansiyel Kâr (Losing on price but profitable)
        if (myPrice > compPrice && margin > 5) {
            return { label: 'İyileştirilebilir', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📈', desc: 'Potansiyel Kâr' };
        }
        // 6. Ayarlanabilir (Adjustable) - Marj Müsait (Fallback)
        return { label: 'Ayarlanabilir', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '⚡', desc: 'Marj Müsait' };
    };

    // Helper: Get Velocity Label
    const getVelocityLabel = (units) => {
        let color = 'text-slate-500';
        if (units > 300) color = 'text-emerald-600';
        else if (units > 100) color = 'text-indigo-600';
        else if (units > 30) color = 'text-amber-600';

        return { label: `Son 30 günde ${units} adet`, color };
    };

    // Helper: Get Current Channel Details
    const getCurrentChannel = (product, channelId) => {
        if (!product || !channelId) return null;
        return product.channels?.find(c => c.id === channelId) || product.channels?.[0];
    };

    // Step 1: Search & Filter Logic
    const filteredProducts = RAW_PRODUCTS.filter(p => {
        // 1. Text Search
        const q = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        // 2. Filter Chips
        if (activeFilter === 'ALL') return true;

        const metrics = getProductMetrics(p);
        const margin = parseFloat(metrics.margin);

        if (activeFilter === 'LOSS_MAKER') return margin <= 0; // Loss Makers (Neg or Zero Margin)
        if (activeFilter === 'LOW_STOCK') return p.stock < 50; // Low Stock Threshold
        if (activeFilter === 'BEST_SELLER') return p.unitsSold > 100; // High Velocity

        return true;
    });

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);

        // Default to 'Web' channel if available, otherwise first channel
        const defaultChannel = product.channels?.find(c => c.type === 'web') || product.channels?.[0];
        setSelectedChannelId(defaultChannel?.id);

        // Calculate initial commission rate for the channel
        const price = defaultChannel?.price || 0;
        const comm = defaultChannel?.commission || 0;
        const rate = price > 0 ? (comm / price) * 100 : 0;
        setCommissionRate(parseFloat(rate.toFixed(1)));

        // Pre-fill targets based on selected channel price
        const currentPrice = defaultChannel?.price || 0;
        setTargets(prev => ({ ...prev, price: currentPrice }));
        setStep(2); // Auto-advance to Preview
    };

    // Old helper removed (moved up)

    const handleComplete = () => {
        onComplete({
            mode: 'product',
            productId: selectedProduct.id,
            selectedChannelId: selectedChannelId,
            commissionRate: commissionRate,
            initialTargets: targets
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                    {/* Modal Panel */}
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-100">

                        {/* Header */}
                        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {step === 1 && "Ürün Seçimi"}
                                    {step === 2 && "Ürün Önizleme"}
                                    {step === 3 && "Hedef Belirleme"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {step === 1 && "Simülasyon yapmak istediğiniz ürünü bulun."}
                                    {step === 2 && "Mevcut verileri kontrol edin."}
                                    {step === 3 && "Başlangıç hedeflerinizi girin."}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-50 h-1.5 flex">
                            <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-indigo-600' : 'bg-transparent'}`} style={{ width: '33%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-indigo-600' : 'bg-transparent'}`} style={{ width: '33%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 3 ? 'bg-indigo-600' : 'bg-transparent'}`} style={{ width: '34%' }}></div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 min-h-[500px] max-h-[85vh] overflow-y-auto custom-scrollbar">

                            {/* STEP 1: SEARCH & FILTER */}
                            {step === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors sm:text-sm"
                                            placeholder="Ürün adı, SKU veya marka..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Quick Filter Chips */}
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                        {[
                                            { id: 'ALL', label: 'Tümü' },
                                            { id: 'LOSS_MAKER', label: '⚠️ Zarar Edenler', activeClass: 'bg-red-100 text-red-700 border-red-200' },
                                            { id: 'LOW_STOCK', label: '📉 Düşük Stok', activeClass: 'bg-orange-100 text-orange-700 border-orange-200' },
                                            { id: 'BEST_SELLER', label: '🔥 Çok Satanlar', activeClass: 'bg-amber-100 text-amber-700 border-amber-200' }
                                        ].map(filter => (
                                            <button
                                                key={filter.id}
                                                onClick={() => setActiveFilter(filter.id)}
                                                className={`
                                                    px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all
                                                    ${activeFilter === filter.id
                                                        ? (filter.activeClass || 'bg-indigo-100 text-indigo-700 border-indigo-200')
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Product List */}
                                    <div className="space-y-2">
                                        {filteredProducts.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500 text-sm">
                                                Aradığınız kriterlere uygun ürün bulunamadı.
                                            </div>
                                        ) : (
                                            filteredProducts.map(product => {
                                                const metrics = getProductMetrics(product);
                                                const isLoss = parseFloat(metrics.margin) <= 0;
                                                const status = getCompetitiveStatus(product, metrics);
                                                const velocity = getVelocityLabel(product.unitsSold || 0);

                                                return (
                                                    <div
                                                        key={product.id}
                                                        onClick={() => handleSelectProduct(product)}
                                                        className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-all group"
                                                    >
                                                        <div className="relative">
                                                            <img
                                                                src={product.image}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/f3f4f6/6b7280?text=Product'; }}
                                                                className="w-14 h-14 rounded-lg object-cover bg-gray-100 border border-slate-200"
                                                                alt={product.name}
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-slate-100 shadow-sm">
                                                                {/* Optional small icon if needed */}
                                                            </div>
                                                        </div>

                                                        {/* Product Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-700">{product.name}</h4>
                                                                {product.type === 'critical' && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                                <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{product.sku}</span>

                                                                {/* Velocity Indicator */}
                                                                <div className="flex items-center gap-1">
                                                                    <svg className={`w-3 h-3 ${velocity.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                                    <span className={`${velocity.color} font-medium`}>{velocity.label}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Status & Metrics Column */}
                                                        <div className="text-right flex flex-col items-end gap-1.5">
                                                            {/* Competitive Badge */}
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.color}`}>
                                                                <span>{status.icon}</span>
                                                                {status.label}
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-900">₺{metrics.price}</span>
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isLoss
                                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                    }`}>
                                                                    %{metrics.margin}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PREVIEW */}
                            {step === 2 && selectedProduct && (
                                <div className="p-1">
                                    <ProductPreview product={selectedProduct} />
                                </div>
                            )}

                            {/* STEP 3: TARGETS */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in max-w-sm mx-auto pt-4">

                                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-start gap-3">
                                        <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-xs text-indigo-800">
                                            Simülasyon başlangıcı için varsayılan hedeflerinizi belirleyin. Bu değerleri daha sonra panelden değiştirebilirsiniz.
                                        </p>
                                    </div>

                                    {/* Channel Selector */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">Satış Kanalı</label>
                                        <div className="relative">
                                            <select
                                                value={selectedChannelId || ''}
                                                onChange={(e) => {
                                                    const newChannelId = e.target.value;
                                                    setSelectedChannelId(newChannelId);

                                                    const channel = selectedProduct?.channels?.find(c => c.id === newChannelId);
                                                    if (channel) {
                                                        // Update commission rate default for this channel
                                                        const price = channel.price || 0;
                                                        const comm = channel.commission || 0;
                                                        const rate = price > 0 ? (comm / price) * 100 : 0;
                                                        setCommissionRate(parseFloat(rate.toFixed(1)));

                                                        // Reset price to channel default and recalculate margin
                                                        const p = selectedProduct;
                                                        const fixedCosts = p.cogs + p.shipping + (p.adSpend || 0) + (p.fixedCost || 0);
                                                        const newPrice = channel.price;
                                                        const calculatedCommission = (newPrice * rate) / 100;
                                                        const returns = newPrice * 0.03;
                                                        const totalCost = fixedCosts + calculatedCommission + returns;
                                                        const newMargin = newPrice > 0 ? ((newPrice - totalCost) / newPrice) * 100 : 0;
                                                        setTargets({ price: newPrice, margin: parseFloat(newMargin.toFixed(1)) });
                                                    }
                                                }}
                                                className="block w-full pl-3 pr-10 py-3 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl border bg-gray-50"
                                            >
                                                {selectedProduct?.channels?.map(channel => (
                                                    <option key={channel.id} value={channel.id}>
                                                        {channel.name} — {channel.type === 'web' ? 'Web Sitesi' : 'Pazar Yeri'}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Adjustable Commission (Only for Marketplaces) */}
                                    {getCurrentChannel(selectedProduct, selectedChannelId)?.type === 'marketplace' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold text-gray-700 uppercase">Komisyon Oranı (%)</label>
                                                <span className="text-xs font-mono font-bold text-indigo-600">%{commissionRate}</span>
                                            </div>
                                            <div className="relative mb-3">
                                                <input
                                                    type="number"
                                                    value={commissionRate}
                                                    onChange={(e) => {
                                                        const newRate = parseFloat(e.target.value) || 0;
                                                        setCommissionRate(newRate);

                                                        // Recalculate Margin based on new commission rate (Price stays same)
                                                        const p = selectedProduct;
                                                        const price = targets.price;
                                                        const fixedCosts = p.cogs + p.shipping + (p.adSpend || 0) + (p.fixedCost || 0);
                                                        const calculatedCommission = (price * newRate) / 100;
                                                        const returns = price * 0.03;
                                                        const totalCost = fixedCosts + calculatedCommission + returns;
                                                        const newMargin = price > 0 ? ((price - totalCost) / price) * 100 : 0;
                                                        setTargets(prev => ({ ...prev, margin: parseFloat(newMargin.toFixed(1)) }));
                                                    }}
                                                    className="block w-full pl-3 pr-8 py-3 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold text-gray-900 border"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">%</span></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Target Price */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-700 uppercase">Hedef Satış Fiyatı</label>
                                            <span className="text-xs font-mono font-bold text-indigo-600">₺{targets.price}</span>
                                        </div>
                                        <div className="relative mb-3">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">₺</span></div>
                                            <input
                                                type="number"
                                                value={targets.price}
                                                onChange={(e) => {
                                                    const newPrice = parseFloat(e.target.value) || 0;
                                                    if (selectedProduct) {
                                                        const p = selectedProduct;

                                                        const fixedCosts = p.cogs + p.shipping + (p.adSpend || 0) + (p.fixedCost || 0);
                                                        // Use dynamic commission rate
                                                        const calculatedCommission = (newPrice * commissionRate) / 100;
                                                        const returns = newPrice * 0.03;
                                                        const totalCost = fixedCosts + calculatedCommission + returns;
                                                        const newMargin = newPrice > 0 ? ((newPrice - totalCost) / newPrice) * 100 : 0;
                                                        setTargets({ price: newPrice, margin: parseFloat(newMargin.toFixed(1)) });
                                                    } else {
                                                        setTargets(prev => ({ ...prev, price: newPrice }));
                                                    }
                                                }}
                                                className="block w-full pl-8 pr-3 py-3 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold text-gray-900 border"
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min={Math.round((getCurrentChannel(selectedProduct, selectedChannelId)?.price || 100) * 0.5)}
                                            max={Math.round((getCurrentChannel(selectedProduct, selectedChannelId)?.price || 100) * 2)}
                                            value={targets.price}
                                            onChange={(e) => {
                                                const newPrice = parseFloat(e.target.value) || 0;
                                                if (selectedProduct) {
                                                    const p = selectedProduct;

                                                    const fixedCosts = p.cogs + p.shipping + (p.adSpend || 0) + (p.fixedCost || 0);
                                                    // Use dynamic commission rate
                                                    const calculatedCommission = (newPrice * commissionRate) / 100;
                                                    const returns = newPrice * 0.03;
                                                    const totalCost = fixedCosts + calculatedCommission + returns;
                                                    const newMargin = newPrice > 0 ? ((newPrice - totalCost) / newPrice) * 100 : 0;
                                                    setTargets({ price: newPrice, margin: parseFloat(newMargin.toFixed(1)) });
                                                }
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1 px-1">
                                            <span>₺{Math.round((getCurrentChannel(selectedProduct, selectedChannelId)?.price || 100) * 0.5)}</span>
                                            <span>₺{Math.round((getCurrentChannel(selectedProduct, selectedChannelId)?.price || 100) * 2)}</span>
                                        </div>
                                    </div>

                                    {/* Target Margin */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-700 uppercase">Hedef Kâr Marjı (%)</label>
                                            <span className="text-xs font-mono font-bold text-indigo-600">%{targets.margin}</span>
                                        </div>
                                        <div className="relative mb-3">
                                            <input
                                                type="number"
                                                value={targets.margin}
                                                onChange={(e) => {
                                                    const newMargin = parseFloat(e.target.value) || 0;
                                                    if (selectedProduct) {
                                                        const p = selectedProduct;

                                                        const fixedCosts = p.cogs + p.shipping + (p.adSpend || 0) + (p.fixedCost || 0);

                                                        // Price = Fixed Costs / (1 - Margin% - Commission% - Returns%)
                                                        // Returns = 3%, Commission = commissionRate
                                                        const denominator = 1 - (newMargin / 100) - (commissionRate / 100) - 0.03;

                                                        let newPrice = 0;
                                                        if (denominator > 0.01) {
                                                            newPrice = fixedCosts / denominator;
                                                        } else {
                                                            newPrice = fixedCosts * 100; // Cap
                                                        }
                                                        setTargets({ price: parseFloat(newPrice.toFixed(0)), margin: newMargin });
                                                    } else {
                                                        setTargets(prev => ({ ...prev, margin: newMargin }));
                                                    }
                                                }}
                                                className="block w-full pl-3 pr-8 py-3 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-bold text-gray-900 border"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">%</span></div>
                                        </div>
                                        <input
                                            type="range"
                                            min="-20"
                                            max="80"
                                            step="0.5"
                                            value={targets.margin}
                                            onChange={(e) => {
                                                const newMargin = parseFloat(e.target.value) || 0;
                                                if (selectedProduct) {
                                                    const p = selectedProduct;

                                                    const fixedCosts = p.cogs + p.shipping + (p.adSpend || 0) + (p.fixedCost || 0);
                                                    const denominator = 1 - (newMargin / 100) - (commissionRate / 100) - 0.03;

                                                    let newPrice = 0;
                                                    if (denominator > 0.01) {
                                                        newPrice = fixedCosts / denominator;
                                                    } else {
                                                        newPrice = fixedCosts * 100;
                                                    }
                                                    setTargets({ price: parseFloat(newPrice.toFixed(0)), margin: newMargin });
                                                }
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1 px-1">
                                            <span>-%20</span>
                                            <span>%80</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Footer Controls */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    ← Geri
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={step === 1 && !selectedProduct}
                                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Devam Et
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105"
                                >
                                    Simülasyonu Başlat 🚀
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper: Detailed Metrics for Preview
const getDetailedMetrics = (product) => {
    if (!product) return {};
    const channel = product.channels?.[0] || {};
    const price = channel.price || 0;
    const commission = channel.commission || 0;

    const cogs = product.cogs || 0;
    const shipping = product.shipping || 0;
    const adSpend = product.adSpend || 0;
    // Estimate returns as 3% of price (Mock logic)
    const returns = price * 0.03;

    const totalCost = cogs + shipping + adSpend + commission + returns + (product.fixedCost || 0);
    const netProfit = price - totalCost;
    const margin = price > 0 ? (netProfit / price) * 100 : 0;

    // Inventory Days
    // Velocity is unitsSold per 30 days
    const dailyTurnover = (product.unitsSold || 0) / 30;
    const stockDays = dailyTurnover > 0 ? Math.round(product.stock / dailyTurnover) : 999;

    return {
        price,
        netProfit: netProfit.toFixed(2),
        margin: margin.toFixed(1),
        costs: {
            cogs,
            shipping,
            adSpend,
            commission,
            returns: returns.toFixed(2),
        },
        stockDays,
        competitorPrice: product.competitorPrice
    };
};

// Step 2 UI Component
const ProductPreview = ({ product }) => {
    const metrics = getDetailedMetrics(product);
    const priceDiff = metrics.price - metrics.competitorPrice;
    const isExpensive = priceDiff > 0;

    return (
        <div className="space-y-6 animate-fade-in text-center">
            <div className="flex items-start gap-6 text-left">
                {/* Image */}
                <div className="w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border border-gray-200">
                    <img
                        src={product.image}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/f3f4f6/6b7280?text=Product'; }}
                        className="w-full h-full object-cover"
                        alt={product.name}
                    />
                </div>

                {/* Header Info */}
                <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{product.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold font-mono">{product.sku}</span>
                        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-xs font-bold">{product.category}</span>
                    </div>

                    {/* Summary Badges */}
                    <div className="flex gap-3 mt-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-xs text-slate-500 font-bold uppercase">Stok Ömrü</span>
                            <span className="text-sm font-bold text-slate-900">{metrics.stockDays} Gün</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg ${isExpensive ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <span className={`text-xs font-bold uppercase ${isExpensive ? 'text-red-500' : 'text-emerald-500'}`}>
                                {isExpensive ? 'Pahalı' : 'Avantajlı'}
                            </span>
                            <span className={`text-sm font-bold ${isExpensive ? 'text-red-900' : 'text-emerald-900'}`}>
                                {Math.abs(priceDiff)}₺
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Price & Profit */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Satış Fiyatı</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-mono font-bold text-gray-900">₺{metrics.price}</span>
                            <span className="text-xs text-gray-400 font-medium line-through">Rakip: ₺{metrics.competitorPrice}</span>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Net Kâr Tutarı</div>
                        <div className="text-xl font-mono font-bold text-emerald-600">₺{metrics.netProfit}</div>
                        <div className="text-xs text-emerald-600/70 font-bold">Marj: %{metrics.margin}</div>
                    </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-4 bg-white rounded-xl border border-gray-200 text-left">
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-3 text-center">Maliyet Kırılımı</div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Ürün Maliyeti</span>
                            <span className="font-mono font-bold text-gray-900">-₺{metrics.costs.cogs}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Komisyon</span>
                            <span className="font-mono font-bold text-gray-900">-₺{metrics.costs.commission}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Lojistik / Kargo</span>
                            <span className="font-mono font-bold text-gray-900">-₺{metrics.costs.shipping}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pazarlama</span>
                            <span className="font-mono font-bold text-gray-900">-₺{metrics.costs.adSpend}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">İadeler (Tahmini)</span>
                            <span className="font-mono font-bold text-gray-900">-₺{metrics.costs.returns}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
