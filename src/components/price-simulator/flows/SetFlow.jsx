import React, { useState } from 'react';
import { RAW_PRODUCTS } from '../../../data/mockProducts';

export const SetFlow = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1); // 1: Selection, 2: Preview, 3: Targets
    const [selectionMode, setSelectionMode] = useState('manual'); // 'manual' | 'smart'

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Target State
    const [targets, setTargets] = useState({
        bundlePrice: 0,
        bundleMargin: 20
    });

    // Smart Groups Definitions
    const SMART_GROUPS = [
        {
            id: 'dead_stock',
            name: 'Ölü Stoklar',
            description: 'Stok adedi > 400 olan ve eritmeye uygun ürünler.',
            icon: '📦',
            color: 'orange',
            criteria: (p) => p.stock > 400
        },
        {
            id: 'rising_stars',
            name: 'Kârlılık Yıldızları',
            description: 'Kâr marjı yüksek olan potansiyel ürünler.',
            icon: '✨',
            color: 'purple',
            criteria: (p) => (p.channels[0]?.price - p.cogs) / p.channels[0]?.price > 0.6 // >60% margin
        },
        {
            id: 'economy',
            name: 'Ekonomik Paket',
            description: 'Fiyatı 500₺ altındaki uygun fiyatlı ürünler.',
            icon: '💰',
            color: 'emerald',
            criteria: (p) => p.channels[0]?.price < 500
        }
    ];

    const applySmartGroup = (group) => {
        const matchingProducts = RAW_PRODUCTS.filter(group.criteria);
        setSelectedProducts(matchingProducts);
        // Switch to manual view in case they go back
        setSelectionMode('manual');
        // Auto-advance to Step 2 (Preview/Summary)
        setStep(2);
    };

    // Filtering logic
    const filteredProducts = RAW_PRODUCTS.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q);
    });

    // Toggle Product Selection
    const toggleProduct = (product) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    // Derived Totals
    const totalCOGS = selectedProducts.reduce((sum, p) => sum + p.cogs, 0);
    const totalRegularPrice = selectedProducts.reduce((sum, p) => sum + (p.channels[0]?.price || 0), 0);

    const handleComplete = () => {
        onComplete({
            mode: 'set',
            products: selectedProducts,
            totalCOGS: totalCOGS,
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
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-pink-100">

                        {/* Header */}
                        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {step === 1 && "Set Oluşturucu"}
                                    {step === 2 && "Set Özeti"}
                                    {step === 3 && "Fiyatlandırma"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {step === 1 && "Kombin yapmak istediğiniz ürünleri seçin."}
                                    {step === 2 && "Seçilen ürünlerin toplam maliyet analizi."}
                                    {step === 3 && "Set için satış fiyatı belirleyin."}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-50 h-1.5 flex">
                            <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-pink-500' : 'bg-transparent'}`} style={{ width: '33%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-pink-500' : 'bg-transparent'}`} style={{ width: '33%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 3 ? 'bg-pink-500' : 'bg-transparent'}`} style={{ width: '34%' }}></div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 h-[450px] overflow-y-auto custom-scrollbar flex flex-col">

                            {/* STEP 1: SELECTION */}
                            {step === 1 && (
                                <div className="space-y-4 animate-fade-in flex-1 flex flex-col">

                                    {/* Selection Mode Tabs */}
                                    <div className="flex p-1 bg-gray-100 rounded-lg mb-2">
                                        <button
                                            onClick={() => setSelectionMode('manual')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectionMode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Manuel Seçim
                                        </button>
                                        <button
                                            onClick={() => setSelectionMode('smart')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectionMode === 'smart' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            ✨ Akıllı Gruplar
                                        </button>
                                    </div>

                                    {/* Selected Chips (Visible in both modes if items are selected) */}
                                    {selectedProducts.length > 0 && (
                                        <div className="flex gap-2 flex-wrap mb-2">
                                            {selectedProducts.map(p => (
                                                <div key={p.id} className="bg-pink-50 border border-pink-100 text-pink-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 animate-scale-in">
                                                    {p.name}
                                                    <button onClick={(e) => { e.stopPropagation(); toggleProduct(p); }} className="hover:text-pink-900 text-pink-400">×</button>
                                                </div>
                                            ))}
                                            <div className="ml-auto text-xs font-bold text-gray-500 self-center">{selectedProducts.length} Ürün Seçildi</div>
                                        </div>
                                    )}

                                    {/* MODE: MANUAL */}
                                    {selectionMode === 'manual' && (
                                        <>
                                            {/* Search */}
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-xl border-gray-300 pl-10 focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-3 shadow-sm bg-gray-50 focus:bg-white transition-colors"
                                                    placeholder="Ürün adı, SKU veya marka ara..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>

                                            {/* List */}
                                            <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1">
                                                {filteredProducts.map(product => {
                                                    const isSelected = selectedProducts.some(p => p.id === product.id);
                                                    return (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => toggleProduct(product)}
                                                            className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-gray-100 hover:border-pink-200 hover:shadow-sm'}`}
                                                        >
                                                            <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h4 className={`text-sm font-bold ${isSelected ? 'text-pink-900' : 'text-gray-900'}`}>{product.name}</h4>
                                                                        <p className="text-[10px] text-gray-500 font-mono">{product.sku}</p>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">₺{product.channels[0]?.price}</span>
                                                                </div>
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300 group-hover:border-pink-300'}`}>
                                                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}

                                    {/* MODE: SMART GROUPS */}
                                    {selectionMode === 'smart' && (
                                        <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
                                            {SMART_GROUPS.map(group => (
                                                <div
                                                    key={group.id}
                                                    onClick={() => applySmartGroup(group)}
                                                    className={`relative bg-white border border-gray-100 p-5 rounded-xl hover:border-${group.color}-300 hover:shadow-lg hover:shadow-${group.color}-100 transition-all cursor-pointer group`}
                                                >
                                                    <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-${group.color}-50 text-${group.color}-600 flex items-center justify-center text-lg`}>
                                                        {group.icon}
                                                    </div>
                                                    <h4 className={`text-sm font-bold text-gray-900 mb-1 group-hover:text-${group.color}-600`}>{group.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-4 pr-8">{group.description}</p>

                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                                        {RAW_PRODUCTS.filter(group.criteria).length} Ürün Bulundu
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-800 flex items-start gap-3">
                                                <span className="text-lg">💡</span>
                                                <div>
                                                    <p className="font-bold mb-1">Nasıl Çalışır?</p>
                                                    <p>Akıllı gruplar, envanterinizdeki verileri analiz ederek (stok yaşı, satış hızı, marj potansiyeli) sizin için otomatik kombin önerileri oluşturur. Seçim sonrası ürünleri düzenleyebilirsiniz.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: PREVIEW */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fade-in pt-4">
                                    <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 flex gap-4 items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs text-pink-600 font-bold uppercase">Toplam Normal Fiyat</p>
                                            <p className="text-2xl font-extrabold text-pink-900 line-through decoration-pink-300 decoration-2">₺{totalRegularPrice}</p>
                                        </div>
                                        <div className="text-pink-300 text-3xl">→</div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 font-bold uppercase">Toplam Maliyet (COGS)</p>
                                            <p className="text-2xl font-extrabold text-gray-800">₺{totalCOGS}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 px-1">Set İçeriği</h4>
                                        <div className="space-y-2">
                                            {selectedProducts.map(p => (
                                                <div key={p.id} className="flex justify-between items-center bg-white border border-gray-100 rounded-lg p-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <img src={p.image} className="w-8 h-8 rounded object-cover border border-gray-100" />
                                                        <span className="font-medium text-gray-700">{p.name}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block font-bold text-gray-900">₺{p.channels[0]?.price}</span>
                                                        <span className="block text-[10px] text-gray-400">Maliyet: ₺{p.cogs}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: TARGETS */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Hedef Set Fiyatı</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={targets.bundlePrice || totalRegularPrice * 0.9} // Default 10% discount suggestion
                                                    onChange={(e) => setTargets({ ...targets, bundlePrice: parseFloat(e.target.value) })}
                                                    className="block w-full pl-3 pr-8 py-3 border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 font-bold text-gray-900 text-lg"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">₺</span></div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2">Normal toplam (₺{totalRegularPrice}) üzerinden indirimli fiyat giriniz.</p>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Hedef Kâr Marjı (%)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={targets.bundleMargin}
                                                    onChange={(e) => setTargets({ ...targets, bundleMargin: parseFloat(e.target.value) })}
                                                    className="block w-full pl-3 pr-8 py-3 border-gray-300 rounded-xl focus:ring-pink-500 focus:border-pink-500 font-bold text-gray-900 text-lg"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">%</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl text-pink-800 text-xs">
                                        <p className="font-bold mb-1">Set Stratejisi:</p>
                                        <p>
                                            Birden fazla ürünü set yaparak ortalama sepet tutarını artırabilir, kargo maliyetinden tasarruf edebilirsiniz.
                                            Mevcut COGS toplamı: <b>₺{totalCOGS}</b>.
                                            Hedeflenen fiyat ile tahmini kâr: <b>₺{((targets.bundlePrice || totalRegularPrice * 0.9) - totalCOGS).toFixed(2)}</b>
                                        </p>
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
                                <div>
                                    {/* Optional left-side content */}
                                </div>
                            )}

                            {step < 3 ? (
                                <button
                                    disabled={step === 1 && selectedProducts.length < 2}
                                    onClick={() => setStep(step + 1)}
                                    className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all ${step === 1 && selectedProducts.length < 2
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gray-900 hover:bg-gray-800 shadow-gray-200'
                                        }`}
                                >
                                    {step === 1 && selectedProducts.length < 2 ? "En az 2 ürün seçin" : "Devam Et"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-200 transition-all transform hover:scale-105"
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
