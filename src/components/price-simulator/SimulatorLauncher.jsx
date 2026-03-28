import React from 'react';

export const SimulatorLauncher = ({ activeTab, onLaunch }) => {
    return (
        <div id="sim-launcher" className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center animate-fade-in relative overflow-hidden">

            {/* Background Decor (Subtle Glow) */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            {/* Header Section */}
            <div className="mb-20 max-w-3xl mx-auto relative z-10">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-indigo-50 mb-6">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                    Fiyat Simülatörü
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed">
                    Stratejik kararlar almak için nereden başlamak istersiniz? <br className="hidden md:block" />
                    Analiz kapsamını seçin ve işletmenizin finansal geleceğini bugünden kurgulayın.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">

                {/* 1. Ürün Bazlı (Highlighted) */}
                <button onClick={() => onLaunch('product')} className="group relative bg-white border border-gray-200 hover:border-indigo-500 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left flex flex-col h-full overflow-hidden">
                    {/* Badge */}
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Popüler
                    </div>

                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Ürün Bazlı</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">
                        Tek bir ürünün (SKU) fiyatını, maliyetini veya komisyonunu değiştirerek nokta atışı analiz yapın.
                    </p>
                    <div className="flex items-center text-sm font-bold text-indigo-600 mt-auto group-hover:underline decoration-2 underline-offset-4">
                        Simülasyonu Başlat <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </button>

                {/* 2. Kategori Bazlı */}
                <button onClick={() => onLaunch('category')} className="group relative bg-white border border-gray-200 hover:border-purple-500 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left flex flex-col h-full">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Kategori Bazlı</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">
                        "Elektronik" veya "Giyim" gibi tüm bir kategoride toplu fiyat artışı veya kampanya etkisi yaratın.
                    </p>
                    <div className="flex items-center text-sm font-bold text-purple-600 mt-auto group-hover:underline decoration-2 underline-offset-4">
                        Simülasyonu Başlat <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </button>

                {/* 3. Şirket Bazlı */}
                <button onClick={() => onLaunch('company')} className="group relative bg-white border border-gray-200 hover:border-blue-500 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left flex flex-col h-full">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Şirket Bazlı</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">
                        Sabit giderler, personel maaşları veya genel operasyonel maliyet değişimlerinin bilançoya etkisini görün.
                    </p>
                    <div className="flex items-center text-sm font-bold text-blue-600 mt-auto group-hover:underline decoration-2 underline-offset-4">
                        Simülasyonu Başlat <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </button>

                {/* 4. Kanal Bazlı */}
                <button onClick={() => onLaunch('channel')} className="group relative bg-white border border-gray-200 hover:border-orange-500 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left flex flex-col h-full">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Kanal Bazlı</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">
                        Trendyol, Hepsiburada veya Amazon pazaryerlerindeki komisyon farklarının kârlılığa etkisini karşılaştırın.
                    </p>
                    <div className="flex items-center text-sm font-bold text-orange-600 mt-auto group-hover:underline decoration-2 underline-offset-4">
                        Simülasyonu Başlat <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </button>

                {/* 5. Kombin (Set) Bazlı */}
                <button onClick={() => onLaunch('set')} className="group relative bg-white border border-gray-200 hover:border-pink-500 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 transform hover:-translate-y-1 text-left flex flex-col h-full md:col-span-2 lg:col-span-4 bg-gradient-to-r from-white to-pink-50/50">
                    <div className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Yeni
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">Kombin (Set) Bazlı</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Birden fazla ürünü birleştirerek (Bundle) satış yapmanın kârlılığa etkisini analiz edin. Sepet ortalamasını artırın.
                            </p>
                        </div>
                        <div className="flex items-center text-sm font-bold text-pink-600 mt-4 md:mt-0 group-hover:underline decoration-2 underline-offset-4 whitespace-nowrap">
                            Simülasyonu Başlat <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </div>
                </button>

            </div>
        </div>
    );
};
