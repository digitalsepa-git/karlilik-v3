import React, { useState } from 'react';

export const ChannelFlow = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1); // 1: Channels, 2: Params

    const [channels, setChannels] = useState([
        { id: 'trendyol', name: 'Trendyol', type: 'marketplace', selected: true, connected: true, badge: 'Yüksek Trafik', badgeColor: 'bg-orange-100 text-orange-700', logo: 'https://cdn.dsmcdn.com/web/logo/ty-web.svg' },
        { id: 'hepsiburada', name: 'Hepsiburada', type: 'marketplace', selected: false, connected: true, badge: 'Sadık Kitle', badgeColor: 'bg-orange-100 text-orange-700', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Hepsiburada_logo_official.svg' },
        { id: 'amazon', name: 'Amazon', type: 'marketplace', selected: false, connected: false, badge: 'Global Erişim', badgeColor: 'bg-gray-100 text-gray-600', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg' },
        { id: 'web', name: 'Kendi Sitem (Web)', type: 'direct', selected: false, connected: true, badge: 'Yüksek Kar %', badgeColor: 'bg-blue-100 text-blue-700', logo: '/assets/ikas.png' },
    ]);

    const [params, setParams] = useState({
        marketplaceCommission: 20, // %
        marketplaceAdCost: 5, // %
        fixedCost: 0, // TL
        webAdCost: 15, // % equivalent CPA
        shippingDiff: 0 // Extra cost for marketplace
    });

    const categories = [
        { id: 'clothing', name: 'Giyim & Aksesuar', commission: 21 },
        { id: 'electronics', name: 'Elektronik', commission: 5 },
        { id: 'home', name: 'Ev & Yaşam', commission: 15 },
        { id: 'cosmetics', name: 'Kozmetik', commission: 17 },
        { id: 'shoes', name: 'Ayakkabı & Çanta', commission: 23 },
        { id: 'other', name: 'Diğer', commission: 20 }
    ];

    const [selectedCategory, setSelectedCategory] = useState('');

    const handleCategoryChange = (e) => {
        const catId = e.target.value;
        setSelectedCategory(catId);
        const cat = categories.find(c => c.id === catId);
        if (cat) {
            setParams(prev => ({ ...prev, marketplaceCommission: cat.commission }));
        }
    };

    const handleToggleChannel = (id) => {
        // Find the channel to check its connection status
        const selectedChannel = channels.find(c => c.id === id);
        if (!selectedChannel || !selectedChannel.connected) return;

        // Enforce Single Selection
        setChannels(channels.map(c => ({
            ...c,
            selected: c.id === id
        })));
    };

    const selectedChannel = channels.find(c => c.selected);

    const handleComplete = () => {
        onComplete({
            mode: 'channel',
            selectedChannels: [selectedChannel],
            params: params,
            // Strategy is irrelevant for single channel
            strategy: { unifiedPrice: true }
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
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-orange-100">

                        {/* Header */}
                        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {step === 1 && "Kanal Seçimi"}
                                    {step === 2 && "Maliyet Parametreleri"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {step === 1 && "Simüle etmek istediğiniz satış kanalını seçin."}
                                    {step === 2 && "Seçilen kanal için maliyet parametrelerini doğrulayın."}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Progress Bar - 2 Steps Only */}
                        <div className="w-full bg-gray-50 h-1.5 flex">
                            <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-orange-500' : 'bg-transparent'}`} style={{ width: '50%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-orange-500' : 'bg-transparent'}`} style={{ width: '50%' }}></div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">

                            {/* STEP 1: CHANNELS */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {channels.map(channel => (
                                            <div
                                                key={channel.id}
                                                onClick={() => handleToggleChannel(channel.id)}
                                                className={`relative p-4 rounded-xl border-2 transition-all 
                                                    ${!channel.connected
                                                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                        : channel.selected
                                                            ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100 ring-1 ring-orange-500 cursor-pointer'
                                                            : 'border-gray-200 hover:border-orange-200 bg-white cursor-pointer'
                                                    }`}
                                            >
                                                {/* Top Badge - Connection Status Only */}
                                                <div className="flex justify-end items-start mb-3">
                                                    {channel.connected ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Bağlı
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                            Bağlı Değil
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm overflow-hidden p-1 ${channel.logo ? 'bg-white border border-gray-100' : (channel.type === 'marketplace' ? 'bg-orange-500' : 'bg-blue-500')}`}>
                                                            {channel.logo ? (
                                                                <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <span className="font-bold text-white text-lg">{channel.name.charAt(0)}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-900 leading-tight">{channel.name}</h4>
                                                            <p className="text-[10px] text-gray-500 uppercase mt-0.5">{channel.type === 'marketplace' ? 'Pazaryeri' : 'Direct Satış'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Radio Button Visual */}
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${channel.selected ? 'border-orange-500' : 'border-gray-300'}`}>
                                                        {channel.selected && (
                                                            <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 items-start">
                                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-xs text-blue-800 leading-relaxed">
                                            <span className="font-bold">Bilgi:</span> Seçtiğiniz kanal üzerinden karlılık simülasyonu başlatılacaktır.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PARAMS */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fade-in pt-4">

                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6 flex items-start gap-3">
                                        <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden p-1 ${selectedChannel?.logo ? 'bg-white border border-gray-100' : (selectedChannel?.type === 'marketplace' ? 'bg-orange-500' : 'bg-blue-500')}`}>
                                            {selectedChannel?.logo ? (
                                                <img src={selectedChannel.logo} alt={selectedChannel.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="font-bold text-white text-lg">{selectedChannel?.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">{selectedChannel?.name} Maliyet Yapısı</h4>
                                            <p className="text-xs text-gray-600">
                                                {selectedChannel?.type === 'marketplace'
                                                    ? 'Pazaryeri komisyon oranını girerek net karınızı hesaplayın.'
                                                    : 'Web siteniz için reklam/pazarlama maliyetini (CPA) belirleyin.'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedChannel?.type === 'marketplace' ? (
                                        <div className="space-y-4">
                                            {/* Category Selection */}
                                            {/* Category Selection - Chips with Embedded Inputs */}
                                            <div className="mb-6">
                                                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase">Hızlı Kategori Seçimi (Komisyon Oranı)</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {categories.map(cat => {
                                                        const isSelected = selectedCategory === cat.id;
                                                        const displayRate = isSelected ? (params.marketplaceCommission || 0) : cat.commission;

                                                        return (
                                                            <div
                                                                key={cat.id}
                                                                onClick={() => {
                                                                    if (!isSelected) {
                                                                        setSelectedCategory(cat.id);
                                                                        setParams(prev => ({ ...prev, marketplaceCommission: cat.commission }));
                                                                    }
                                                                }}
                                                                className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isSelected
                                                                    ? 'bg-orange-50 border-orange-500 text-orange-900 shadow-sm'
                                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                                                                    }`}
                                                            >
                                                                <span className="flex-1 mr-2">{cat.name}</span>
                                                                <div className={`flex items-center px-2 py-1 rounded text-[10px] ${isSelected ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                                                    <span className={`mr-0.5 ${isSelected ? 'text-orange-700' : 'text-gray-500'}`}>%</span>
                                                                    <input
                                                                        type="number"
                                                                        value={displayRate}
                                                                        onChange={(e) => {
                                                                            const val = parseFloat(e.target.value);
                                                                            if (!isSelected) {
                                                                                setSelectedCategory(cat.id);
                                                                            }
                                                                            setParams(prev => ({ ...prev, marketplaceCommission: val }));
                                                                        }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className={`w-8 bg-transparent text-right outline-none p-0 border-none text-[10px] font-bold ${isSelected ? 'text-orange-900' : 'text-gray-600'}`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Removed separate Commission, Ad Cost, and Fixed Cost inputs as requested */}

                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Web Sitesi Pazarlama Gideri (Tahmini %)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={params.webAdCost}
                                                    onChange={(e) => setParams({ ...params, webAdCost: parseFloat(e.target.value) })}
                                                    className="block w-full pl-3 pr-8 py-3 border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 font-bold text-gray-900 shadow-sm"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">%</span></div>
                                            </div>
                                        </div>
                                    )}

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

                            {step < 2 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!selectedChannel}
                                    className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all ${selectedChannel ? 'bg-gray-900 hover:bg-gray-800 shadow-gray-200' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                                >
                                    Devam Et
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-200 transition-all transform hover:scale-105"
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
