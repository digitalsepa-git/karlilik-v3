import React, { useState, useMemo } from 'react';
import { RAW_PRODUCTS } from '../../../data/mockProducts';

export const CategoryFlow = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1); // 1: Select, 2: Preview, 3: Targets
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState('Web'); // Default to Web
    const [targets, setTargets] = useState({ priceIncrease: 0, marginTarget: 20 });
    const [targetMode, setTargetMode] = useState('priceIncrease'); // 'priceIncrease' | 'marginTarget'
    const [velocityChange, setVelocityChange] = useState(0); // Expected change in sales velocity (%)

    // Get all unique channels for the selector
    const availableChannels = useMemo(() => {
        const channels = new Set();
        RAW_PRODUCTS.forEach(p => {
            if (p.channels) {
                p.channels.forEach(c => channels.add(c.name));
            }
        });

        const channelList = Array.from(channels).filter(c => c !== 'Web' && c !== 'all');
        return channels.has('Web') ? ['Web', ...channelList] : channelList;
    }, []);

    // Helper to get product data for a specific channel
    const getProductChannelData = (product, channelName) => {
        if (channelName === 'all' || !product.channels) {
            return {
                price: product.channels?.[0]?.price || product.competitorPrice || 100,
                units: product.unitsSold || 1
            };
        }
        const channel = product.channels.find(c => c.name === channelName);
        if (!channel) return null; // Product not in this channel
        return {
            price: channel.price,
            units: channel.units || 1
        };
    };

    // Derive Categories with Financial Metrics based on Channel
    const categories = useMemo(() => {
        const uniqueCats = [...new Set(RAW_PRODUCTS.map(p => p.category))];

        const catStats = uniqueCats.map(c => {
            const products = RAW_PRODUCTS.filter(p => p.category === c);

            let totalRevenue = 0;
            let totalCost = 0;
            let totalStock = 0;
            let countInChannel = 0;

            products.forEach(p => {
                const channelData = getProductChannelData(p, selectedChannel);
                if (!channelData) return; // Skip if product not in this channel

                countInChannel++;
                const { price, units } = channelData;
                const cost = p.cogs + p.shipping + p.adSpend + p.fixedCost; // Assuming cost is same across channels for simplicity, ideally commission would be separate

                totalRevenue += price * units;
                totalCost += cost * units;
                totalStock += p.stock; // Stock is across all channels usually
            });

            const avgMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

            return {
                name: c,
                count: countInChannel,
                totalProducts: products.length,
                image: products[0]?.image,
                avgMargin: avgMargin.toFixed(1),
                totalRevenue: totalRevenue,
                totalStock: totalStock,
                isLowMargin: avgMargin < 15
            };
        }).filter(cat => cat.count > 0); // Only show categories with products in selected channel

        const grandTotalRevenue = catStats.reduce((sum, cat) => sum + cat.totalRevenue, 0);

        return catStats.map(cat => ({
            ...cat,
            revenueShare: grandTotalRevenue > 0 ? ((cat.totalRevenue / grandTotalRevenue) * 100).toFixed(1) : 0
        }));

    }, [selectedChannel]);

    // Calculate Category Aggregates for Preview Step
    const categoryStats = useMemo(() => {
        if (!selectedCategory) return null;
        const catData = categories.find(c => c.name === selectedCategory);
        if (!catData) return null;

        const products = RAW_PRODUCTS.filter(p => p.category === selectedCategory);
        let totalPriceSum = 0;
        let profitableCount = 0;
        let criticalCount = 0;
        let marginDistribution = { low: 0, medium: 0, high: 0 };

        const productsWithMetrics = [];

        products.forEach(p => {
            const channelData = getProductChannelData(p, selectedChannel);
            if (!channelData) return;

            const { price, units } = channelData;
            const cost = p.cogs + p.shipping + p.adSpend + p.fixedCost;
            const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

            productsWithMetrics.push({ ...p, margin, price, units });
        });

        productsWithMetrics.sort((a, b) => b.units - a.units);
        const starProduct = productsWithMetrics[0];

        productsWithMetrics.sort((a, b) => a.margin - b.margin);
        const problemProduct = productsWithMetrics[0];

        let realTotalStock = 0;

        productsWithMetrics.forEach(p => {
            totalPriceSum += p.price;
            realTotalStock += (p.stock || 0);

            if (p.margin < 10) {
                criticalCount++;
                marginDistribution.low++;
            } else {
                profitableCount++;
                if (p.margin < 30) marginDistribution.medium++;
                else marginDistribution.high++;
            }
        });

        return {
            avgPrice: (totalPriceSum / productsWithMetrics.length).toFixed(2),
            avgMargin: catData.avgMargin,
            totalStock: realTotalStock,
            productCount: catData.count,
            totalRevenue: catData.totalRevenue,
            profitableCount,
            criticalCount,
            starProduct,
            problemProduct,
            marginDistribution
        };
    }, [selectedCategory, categories, selectedChannel]);

    const handleSelectCategory = (categoryName) => {
        setSelectedCategory(categoryName);
    };

    const handleComplete = () => {
        onComplete({
            mode: 'category',
            categoryId: selectedCategory,
            channelId: selectedChannel,
            initialTargets: { ...targets, mode: targetMode },
            stats: categoryStats,
            velocityChange: velocityChange
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                    {/* Modal Panel */}
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100">

                        {/* Header */}
                        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {step === 1 && "Kategori Seçimi"}
                                    {step === 2 && "Kategori Özeti"}
                                    {step === 3 && "Toplu Hedefleme"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {step === 1 && "Simülasyon yapmak istediğiniz kategoriyi seçin."}
                                    {step === 2 && "Kategori genelindeki ortalama veriler."}
                                    {step === 3 && "Kategorideki tüm ürünler için hedef belirleyin."}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-50 h-1.5 flex">
                            <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-purple-600' : 'bg-transparent'}`} style={{ width: '33%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-purple-600' : 'bg-transparent'}`} style={{ width: '33%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 3 ? 'bg-purple-600' : 'bg-transparent'}`} style={{ width: '34%' }}></div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 h-[450px] overflow-y-auto custom-scrollbar bg-gray-50/50">

                            {/* STEP 1: SELECT */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Channel Selector */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-3">Satış Kanalı</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableChannels.map(channel => (
                                                <button
                                                    key={channel}
                                                    onClick={() => {
                                                        setSelectedChannel(channel);
                                                        setSelectedCategory(null); // Reset category selection when channel changes
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedChannel === channel
                                                        ? 'bg-purple-600 text-white shadow-md'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
                                                        }`}
                                                >
                                                    {channel}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Category Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {categories.map((cat, idx) => {
                                            const isSelected = selectedCategory === cat.name;
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSelectCategory(cat.name)}
                                                    className={`group relative overflow-hidden rounded-xl bg-white p-4 transition-all cursor-pointer text-left
                                                    ${isSelected
                                                            ? 'border-2 border-purple-600 shadow-xl shadow-purple-500/10 ring-1 ring-purple-600'
                                                            : 'border border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5'
                                                        }
                                                `}
                                                >
                                                    {/* Selection Check Icon */}
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 bg-purple-600 text-white rounded-full p-1 shadow-sm animate-scale-in">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-4">
                                                        {/* Image */}
                                                        <div className={`w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border ${isSelected ? 'border-purple-100' : 'border-gray-100'}`}>
                                                            <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.name} />
                                                        </div>

                                                        {/* Header Info */}
                                                        <div className="flex-1">
                                                            <h4 className={`text-base font-bold ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>{cat.name}</h4>
                                                            <p className="text-xs text-gray-500 mt-0.5">{cat.count} Ürün</p>

                                                            {/* Badges */}
                                                            {cat.isLowMargin && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 mt-2 border border-red-100">
                                                                    ⚠️ Düşük Kâr
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Metrics Divider */}
                                                    <div className="my-3 border-t border-gray-100 border-dashed"></div>

                                                    {/* Financial Metrics */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Net Kâr</p>
                                                            <p className={`text-sm font-bold font-mono ${cat.isLowMargin ? 'text-red-500' : 'text-green-600'}`}>
                                                                %{cat.avgMargin}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Son 30 Gün Ciro</p>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900 font-mono">
                                                                    {formatCurrency(cat.totalRevenue)}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    Pay: %{cat.revenueShare}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PREVIEW */}
                            {step === 2 && categoryStats && (
                                <div className="space-y-6 animate-fade-in text-center pt-2">

                                    {/* 1. Category Header & Stock Info */}
                                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                                <img src={categories.find(c => c.name === selectedCategory)?.image} className="w-full h-full object-cover rounded-lg opacity-90" alt={selectedCategory} />
                                            </div>
                                            <div className="text-left">
                                                <h2 className="text-xl font-extrabold text-gray-900">{selectedCategory}</h2>
                                                <p className="text-xs text-gray-500">{categoryStats.productCount} Ürün</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Toplam Envanter</p>
                                            <p className="text-lg font-mono font-bold text-gray-900">{categoryStats.totalStock} Adet</p>
                                        </div>
                                    </div>

                                    {/* 2. Main KPI Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Financial Potential */}
                                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                                                <span>Son 30 Gün Ciro Potansiyeli</span>
                                            </div>
                                            <div className="text-2xl font-mono font-bold text-gray-900 tracking-tight">
                                                {formatCurrency(categoryStats.totalRevenue)}
                                            </div>
                                        </div>

                                        {/* Margin Health */}
                                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                            <div className={`absolute right-0 top-0 w-16 h-full ${parseFloat(categoryStats.avgMargin) < 15 ? 'bg-red-50' : 'bg-green-50'} -mr-8 transform skew-x-12`}></div>
                                            <div className="relative z-10 flex flex-col items-start">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Ort. Marj</div>
                                                <div className={`text-2xl font-mono font-bold ${parseFloat(categoryStats.avgMargin) < 15 ? 'text-red-600' : 'text-green-600'}`}>
                                                    %{categoryStats.avgMargin}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1 font-medium">
                                                    {parseFloat(categoryStats.avgMargin) < 15 ? '📉 Hedefin Altında' : '✅ Hedefte'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Product Health Breakdown */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Health Distribution */}
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-left">
                                            <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 text-center">Ürün Kârlılık Dağılımı</h4>

                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                                    <div className="bg-red-500 h-full" style={{ width: `${(categoryStats.criticalCount / categoryStats.productCount) * 100}%` }}></div>
                                                    <div className="bg-green-500 h-full" style={{ width: `${(categoryStats.profitableCount / categoryStats.productCount) * 100}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between text-[11px] font-medium px-1">
                                                <span className="text-red-600">{categoryStats.criticalCount} Kritik (Zararda/Düşük)</span>
                                                <span className="text-green-600">{categoryStats.profitableCount} Kârlı</span>
                                            </div>
                                        </div>

                                        {/* Top/Bottom Insights */}
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center gap-3">
                                            {/* Star Product */}
                                            {categoryStats.starProduct && (
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">⭐</span>
                                                        <span className="text-gray-600 truncate max-w-[100px] font-medium" title={categoryStats.starProduct.name}>
                                                            {categoryStats.starProduct.name}
                                                        </span>
                                                    </div>
                                                    <span className={`font-bold px-1.5 py-0.5 rounded ${categoryStats.starProduct.margin < 0 ? 'bg-red-100 text-red-700' : (categoryStats.starProduct.margin < 15 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')}`}>
                                                        %{categoryStats.starProduct.margin.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                            {/* Problem Product */}
                                            {categoryStats.problemProduct && (
                                                <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">🆘</span>
                                                        <span className="text-gray-600 truncate max-w-[100px] font-medium" title={categoryStats.problemProduct.name}>
                                                            {categoryStats.problemProduct.name}
                                                        </span>
                                                    </div>
                                                    <span className={`font-bold px-1.5 py-0.5 rounded ${categoryStats.problemProduct.margin < 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        %{categoryStats.problemProduct.margin.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 4. Warning / Context */}
                                    <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-xl border border-blue-200 flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-left leading-relaxed">
                                            <span className="font-bold">Bilgi:</span> Bu simülasyon, fiyat stratejilerini güvenle test etmeniz içindir.
                                            Burada yapacağınız değişiklikler, <strong>canlı fiyatlarınızı anında etkilemez.</strong>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: TARGETS */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in max-w-sm mx-auto pt-4">

                                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-start gap-3">
                                        <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                        <p className="text-xs text-purple-800 leading-relaxed">
                                            Bir strateji belirleyin. Simülasyon, seçtiğiniz hedefe ulaşmak için optimum fiyatları önerecektir.
                                        </p>
                                    </div>

                                    {/* Selection Cards */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Option 1: Price Increase */}
                                        <div
                                            onClick={() => setTargetMode('priceIncrease')}
                                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${targetMode === 'priceIncrease' ? 'border-purple-600 bg-purple-50/50' : 'border-gray-200 hover:border-purple-200'}`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${targetMode === 'priceIncrease' ? 'border-purple-600' : 'border-gray-300'}`}>
                                                        {targetMode === 'priceIncrease' && <div className="w-2 h-2 rounded-full bg-purple-600"></div>}
                                                    </div>
                                                    <span className={`text-sm font-bold ${targetMode === 'priceIncrease' ? 'text-purple-900' : 'text-gray-600'}`}>Fiyat Artış Oranı</span>
                                                </div>
                                            </div>

                                            {targetMode === 'priceIncrease' && (
                                                <div className="animate-fade-in pl-6">
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            value={targets.priceIncrease}
                                                            onChange={(e) => setTargets({ ...targets, priceIncrease: parseFloat(e.target.value) })}
                                                            className="block w-full pl-4 pr-10 py-2.5 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold text-gray-900 text-sm"
                                                            placeholder="0"
                                                            autoFocus
                                                        />
                                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-gray-400 font-bold text-xs">%</span></div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1.5">
                                                        Negatif değer girerek indirim yapabilirsiniz.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Option 2: Margin Target */}
                                        <div
                                            onClick={() => setTargetMode('marginTarget')}
                                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${targetMode === 'marginTarget' ? 'border-purple-600 bg-purple-50/50' : 'border-gray-200 hover:border-purple-200'}`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${targetMode === 'marginTarget' ? 'border-purple-600' : 'border-gray-300'}`}>
                                                        {targetMode === 'marginTarget' && <div className="w-2 h-2 rounded-full bg-purple-600"></div>}
                                                    </div>
                                                    <span className={`text-sm font-bold ${targetMode === 'marginTarget' ? 'text-purple-900' : 'text-gray-600'}`}>Hedef Kâr Marjı (Min)</span>
                                                </div>
                                            </div>

                                            {targetMode === 'marginTarget' && (
                                                <div className="animate-fade-in pl-6">
                                                    <div className="relative group">
                                                        <input
                                                            type="number"
                                                            value={targets.marginTarget}
                                                            onChange={(e) => setTargets({ ...targets, marginTarget: parseFloat(e.target.value) })}
                                                            className="block w-full pl-4 pr-10 py-2.5 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold text-gray-900 text-sm"
                                                            placeholder="20"
                                                            autoFocus
                                                        />
                                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-gray-400 font-bold text-xs">%</span></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Velocity Assumption */}
                                    <div className="mt-8 border-t border-gray-100 pt-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-900">Satış Hızı Beklentisi</label>
                                                <div className="relative w-32">
                                                    <input
                                                        type="number"
                                                        value={velocityChange}
                                                        onChange={(e) => setVelocityChange(parseFloat(e.target.value) || 0)}
                                                        className="block w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-bold text-gray-900 text-sm text-right bg-gray-50 hover:bg-white transition-colors"
                                                        placeholder="0"
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-400 font-bold text-sm">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                Örneğin; fiyatları artırdığınızda satış hacminizin %10 düşeceğini öngörüyorsanız <span className="font-mono bg-gray-100 px-1 rounded">-10</span> yazın.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            )}

                        </div>

                        {/* Footer Controls */}
                        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-between items-center">

                            {/* Summary Text (Left Side) */}
                            <div className="hidden sm:block">
                                {step === 1 && selectedCategory && (() => {
                                    const cat = categories.find(c => c.name === selectedCategory);
                                    if (!cat) return null;
                                    return (
                                        <div className="text-xs text-gray-500 flex items-center gap-2 animate-fade-in">
                                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{cat.name}</span>
                                            <span>seçildi. {cat.count} Ürün, Ort. %{cat.avgMargin} Kâr Marjı analiz edilecek.</span>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex items-center gap-3 ml-auto">
                                {step > 1 ? (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                                    >
                                        Geri
                                    </button>
                                ) : (
                                    <div className="w-1"></div>
                                )}

                                {step < 3 ? (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        disabled={step === 1 && !selectedCategory}
                                        className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 group"
                                    >
                                        Devam Et
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleComplete}
                                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:scale-105 flex items-center gap-2"
                                    >
                                        Analizi Başlat
                                        <span className="text-lg">🚀</span>
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
};
