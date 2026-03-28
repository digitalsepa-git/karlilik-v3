import React, { useState } from 'react';

export const CompanyFlow = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1); // 1: Expenses, 2: Period, 3: Gross Margin, 4: Target, 5: Review

    const [expenses, setExpenses] = useState([
        { id: '1', name: 'Depo Kirası', amount: 15000 },
        { id: '2', name: 'Personel Maaşı', amount: 30000 },
        { id: '3', name: 'Yazılım / FinOps', amount: 1500 },
        { id: '4', name: 'Muhasebe', amount: 2000 }
    ]);

    const [period, setPeriod] = useState('monthly'); // 'monthly' | 'yearly'
    const [grossMargin, setGrossMargin] = useState(40); // Default 40%
    const [targetMargin, setTargetMargin] = useState(20); // Default 20%
    const [targetProfit, setTargetProfit] = useState(50000); // Default 50k
    const [targetType, setTargetType] = useState('margin'); // 'margin' | 'amount'

    const totalFixedCosts = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const handleComplete = () => {
        onComplete({
            mode: 'company',
            period: period,
            expenses: expenses,
            totalFixedCosts: totalFixedCosts,
            grossMargin: grossMargin,
            targetMargin: targetMargin,
            targetProfit: targetProfit,
            targetType: targetType
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
                    <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-blue-100">

                        {/* Header */}
                        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {step === 1 && "Sabit Giderler"}
                                    {step === 2 && "Dönem Seçimi"}
                                    {step === 3 && "Ortalama Brüt Kâr Marjı"}
                                    {step === 4 && "Simülasyon Hedefiniz"}
                                    {step === 5 && "Gider Analizi"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {step === 1 && "Şirketinizin operasyonel sabit giderlerini girin."}
                                    {step === 2 && "Analiz periyodunu belirleyin."}
                                    {step === 3 && "Sistem tahminini onaylayın veya kendi brüt kâr oranınızı girin."}
                                    {step === 4 && "Şirket geneli için hedeflediğiniz net kâr veya tutar."}
                                    {step === 5 && "Toplam maliyet etkisini onaylayın."}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-50 h-1.5 flex">
                            <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-blue-600' : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 3 ? 'bg-blue-600' : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 4 ? 'bg-blue-600' : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                            <div className={`h-full transition-all duration-300 ${step >= 5 ? 'bg-blue-600' : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">

                            {/* STEP 1: EXPENSES */}
                            {step === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                        <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-900">Neden Girmeliyim?</h4>
                                            <p className="text-xs text-blue-700 mt-1">
                                                Sabit giderlerinizi ürünlerinize dağıtarak gerçek "Net Kâr" oranınızı hesaplayacağız.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {expenses.map((exp) => (
                                            <div key={exp.id} className="flex gap-3 items-center">
                                                <input
                                                    type="text"
                                                    value={exp.name}
                                                    onChange={(e) => setExpenses(expenses.map(x => x.id === exp.id ? { ...x, name: e.target.value } : x))}
                                                    placeholder="Gider Adı"
                                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                                <div className="relative w-32 shrink-0">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₺</span>
                                                    <input
                                                        type="number"
                                                        value={exp.amount === 0 ? '' : exp.amount}
                                                        onChange={(e) => setExpenses(expenses.map(x => x.id === exp.id ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))}
                                                        className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                                <button onClick={() => setExpenses(expenses.filter(x => x.id !== exp.id))} className="w-10 h-10 shrink-0 flex items-center justify-center text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setExpenses([...expenses, { id: Date.now().toString(), name: '', amount: 0 }])}
                                            className="w-full py-2.5 mt-1 flex items-center justify-center gap-2 text-sm font-bold text-blue-600 border border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                            Yeni Gider Ekle
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="text-sm font-bold text-gray-500">Toplam Tutarı:</span>
                                        <span className="text-lg font-black text-gray-900">₺{totalFixedCosts.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PERIOD */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fade-in text-center pt-8">
                                    <h3 className="text-base font-bold text-gray-900">Zaman Aralığı Seçin</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setPeriod('monthly')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${period === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                                        >
                                            <div className="text-3xl mb-2">📅</div>
                                            <div className="font-bold text-gray-900">Aylık</div>
                                            <div className="text-xs text-gray-500 mt-1">Standart Analiz</div>
                                        </div>

                                        <div
                                            onClick={() => setPeriod('yearly')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${period === 'yearly' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                                        >
                                            <div className="text-3xl mb-2">🗓️</div>
                                            <div className="font-bold text-gray-900">Yıllık</div>
                                            <div className="text-xs text-gray-500 mt-1">Projeksiyon</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600">
                                        Seçilen dönem: <span className="font-bold text-blue-600 uppercase">{period === 'monthly' ? 'Aylık' : 'Yıllık'}</span>
                                        <br />
                                        Bu dönemdeki toplam sabit gideriniz: <span className="font-bold text-gray-900">₺{(period === 'monthly' ? totalFixedCosts : totalFixedCosts * 12).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: GROSS MARGIN (NEW) */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in pt-6">
                                    <div className="text-center">
                                        <h3 className="text-base font-bold text-gray-900 mb-2">Ortalama Brüt Kâr Marjı</h3>
                                        <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-xl border border-blue-200 text-left mb-6">
                                            Sistem, geçmiş satış verilerinize dayanarak şirketinizin ortalama brüt kâr marjını <strong className="text-blue-900 border-b border-blue-400">%40</strong> olarak hesapladı. Simülasyonda işletme gelirini (%100) ve satılan malın maliyetini saptamak için bu referans kullanılacaktır.
                                            <br /><br />
                                            Bu oranı onaylayabilir veya kendi değerinizi girebilirsiniz.
                                        </div>
                                    </div>

                                    <div className="max-w-xs mx-auto">
                                        <div className="relative flex items-center justify-center mb-6">
                                            <span className="text-5xl font-black text-blue-600">%{grossMargin}</span>
                                        </div>

                                        <input
                                            type="range"
                                            min="0" max="90" step="1"
                                            value={grossMargin}
                                            onChange={(e) => setGrossMargin(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
                                        />

                                        <div className="grid grid-cols-4 gap-2">
                                            {[20, 30, 40, 50].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setGrossMargin(m)}
                                                    className={`py-2 text-xs font-bold rounded-lg ${grossMargin === m ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    %{m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: HEADERS TARGETING */}
                            {step === 4 && (
                                <div className="space-y-6 animate-fade-in pt-6">
                                    <div className="text-center">
                                        <h3 className="text-base font-bold text-gray-900 mb-2">Simülasyon Hedefiniz</h3>
                                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                                            Başarı kriterinizi belirleyin. İster kâr marjı oranı, ister net kâr tutarı hedefleyebilirsiniz.
                                        </p>

                                        {/* Toggle */}
                                        <div className="flex justify-center mb-6">
                                            <div className="bg-gray-100 p-1 rounded-lg flex">
                                                <button
                                                    onClick={() => setTargetType('margin')}
                                                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${targetType === 'margin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                                >
                                                    Kâr Marjı (%)
                                                </button>
                                                <button
                                                    onClick={() => setTargetType('amount')}
                                                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${targetType === 'amount' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                                >
                                                    Net Tutar (₺)
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-w-xs mx-auto">

                                        {targetType === 'margin' ? (
                                            <>
                                                <div className="relative flex items-center justify-center mb-6">
                                                    <span className="text-5xl font-black text-blue-600">%{targetMargin}</span>
                                                </div>

                                                <input
                                                    type="range"
                                                    min="0" max="80" step="1"
                                                    value={targetMargin}
                                                    onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
                                                />

                                                <div className="grid grid-cols-3 gap-2">
                                                    {[10, 20, 30, 40, 50].map(m => (
                                                        <button
                                                            key={m}
                                                            onClick={() => setTargetMargin(m)}
                                                            className={`py-2 text-xs font-bold rounded-lg ${targetMargin === m ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                                        >
                                                            %{m}
                                                        </button>
                                                    ))}
                                                    <button onClick={() => setTargetMargin(0)} className={`py-2 text-xs font-bold rounded-lg ${targetMargin === 0 ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>Min (0)</button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="relative flex items-center justify-center mb-6">
                                                    <span className="text-4xl font-black text-blue-600">₺{(targetProfit).toLocaleString()}</span>
                                                </div>

                                                <label className="block text-center text-xs text-gray-400 mb-2">Hedeflenen {period === 'yearly' ? 'Yıllık' : 'Aylık'} Net Kâr</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={period === 'yearly' ? 5000000 : 500000}
                                                    step={period === 'yearly' ? 10000 : 1000}
                                                    value={targetProfit}
                                                    onChange={(e) => setTargetProfit(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-8"
                                                />

                                                <div className="grid grid-cols-3 gap-2">
                                                    {[50000, 100000, 250000].map(m => (
                                                        <button
                                                            key={m}
                                                            onClick={() => setTargetProfit(period === 'yearly' ? m * 12 : m)}
                                                            className={`py-2 text-[10px] font-bold rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100`}
                                                        >
                                                            {period === 'yearly' ? `₺${(m * 12 / 1000)}k` : `₺${m / 1000}k`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: REVIEW */}
                            {step === 5 && (
                                <div className="space-y-6 animate-fade-in pt-4">
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Toplam Operasyonel Maliyet</p>
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                                            ₺{(period === 'monthly' ? totalFixedCosts : totalFixedCosts * 12).toLocaleString()}
                                        </h2>
                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                                            {period === 'monthly' ? 'Aylık' : 'Yıllık'}
                                        </span>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="flex justify-between p-3 border-b border-gray-100 text-sm">
                                            <span className="text-gray-600">Personel</span>
                                            <span className="font-bold text-gray-900">%{Math.round((expenses.personnel / totalFixedCosts) * 100)}</span>
                                        </div>
                                        <div className="flex justify-between p-3 border-b border-gray-100 text-sm">
                                            <span className="text-gray-600">Kira/Ofis</span>
                                            <span className="font-bold text-gray-900">%{Math.round((expenses.rent / totalFixedCosts) * 100)}</span>
                                        </div>
                                        <div className="flex justify-between p-3 border-b border-gray-100 text-sm">
                                            <span className="text-gray-600">Pazarlama</span>
                                            <span className="font-bold text-gray-900">%{Math.round((expenses.marketing / totalFixedCosts) * 100)}</span>
                                        </div>
                                        <div className="flex justify-between p-3 text-sm bg-gray-50">
                                            <span className="text-gray-600">Diğer</span>
                                            <span className="font-bold text-gray-900">%{Math.round((expenses.other / totalFixedCosts) * 100)}</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                                        <span className="text-xs font-bold text-blue-800">Hedef {targetType === 'margin' ? 'Kâr Marjı' : 'Net Kâr'}</span>
                                        <span className="text-lg font-black text-blue-600">
                                            {targetType === 'margin' ? `%${targetMargin}` : `₺${targetProfit.toLocaleString()}`}
                                        </span>
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

                            {step < 5 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-gray-200 transition-all"
                                >
                                    Devam Et
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-105"
                                >
                                    Hesaplamayı Başlat 🚀
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
