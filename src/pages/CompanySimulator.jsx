import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RAW_PRODUCTS } from '../data/mockProducts';

const FixedExpensesModal = ({ isOpen, onClose, expenses, onSave }) => {
    const [localExpenses, setLocalExpenses] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setLocalExpenses(Array.isArray(expenses) ? [...expenses] : []);
        }
    }, [isOpen, expenses]);

    const handleAdd = () => {
        setLocalExpenses([...localExpenses, { id: Date.now().toString(), name: '', amount: 0 }]);
    };

    const handleRemove = (id) => {
        setLocalExpenses(localExpenses.filter(e => e.id !== id));
    };

    const handleChange = (id, field, value) => {
        if (field === 'amount') {
            value = parseFloat(value) || 0;
        }
        setLocalExpenses(localExpenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const total = localExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Sabit Giderler</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                    {localExpenses.map((exp) => (
                        <div key={exp.id} className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={exp.name}
                                onChange={(e) => handleChange(exp.id, 'name', e.target.value)}
                                placeholder="Gider Adı"
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <div className="relative w-32 shrink-0">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₺</span>
                                <input
                                    type="number"
                                    value={exp.amount === 0 ? '' : exp.amount}
                                    onChange={(e) => handleChange(exp.id, 'amount', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-8 pr-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <button onClick={() => handleRemove(exp.id)} className="w-10 h-10 shrink-0 flex items-center justify-center text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAdd} className="w-full py-3 mt-2 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 border border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Yeni Gider Kalemi Ekle
                    </button>
                </div>

                <div className="p-5 border-t border-gray-100 bg-white rounded-b-2xl">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Toplam</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900">{total.toLocaleString()}</span>
                                <span className="text-sm font-bold text-gray-400">₺</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => { onSave(localExpenses); onClose(); }}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        Kaydet & Simüle Et
                    </button>
                    <div className="mt-4 flex gap-2 items-start bg-gray-50/50 p-3 rounded-lg border border-gray-100 text-[10px] text-gray-500">
                        <span className="text-yellow-500 shrink-0">💡</span>
                        <p>Bu değişiklikler sadece bu simülasyon özelinde geçerlidir, genel şirket ayarlarınızı kalıcı olarak etkilemez.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Reusing AI Insight Card Logic (Internal Component) ---
const AIInsightCard = ({ revenue, netProfit, margin, breakEven, openChatWithContext }) => {
    // Simple Logic for Company Context
    let status = 'neutral';
    let title = 'Şirket Finansal Analizi';
    let message = 'Veriler analiz ediliyor...';
    let colorClass = 'bg-gray-50 text-gray-700 border-gray-200';
    let iconColor = 'text-gray-400';

    if (netProfit < 0) {
        status = 'danger';
        title = 'Kârlılık Uyarısı';
        message = `Şirket şu an zarar ediyor. Sabit giderlerinizi karşılamak için cironuzu ₺${(breakEven - revenue).toLocaleString()} artırmanız gerekiyor.`;
        colorClass = 'bg-red-50 text-red-800 border-red-100';
        iconColor = 'text-red-500';
    } else if (margin < 10) {
        status = 'warning';
        title = 'Düşük Kâr Marjı';
        message = `Kâr marjınız (%${margin}) sektör ortalamasının altında kalabilir. Gider optimizasyonu yapmayı düşünebilirsiniz.`;
        colorClass = 'bg-orange-50 text-orange-800 border-orange-100';
        iconColor = 'text-orange-500';
    } else {
        status = 'success';
        title = 'Sağlıklı Finansal Yapı';
        message = "Tebrikler! Şirketiniz kârlı bir yapıda ve sağlıklı bir marj ile büyüyor.";
        colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-100';
        iconColor = 'text-emerald-500';
    }

    const prompt = `Şirket Finansal Analiz İsteği:
    
    Mevcut Durum:
    - Ciro: ₺${revenue.toLocaleString()}
    - Net Kâr: ₺${netProfit.toLocaleString()} (%${margin})
    - Başabaş Noktası: ₺${breakEven.toLocaleString()}
    
    Yapay Zeka Görüşü: ${title} - ${message}
    
    Bu tabloyu iyileştirmek için (gider kısıntısı, fiyat artışı, hacim artışı) ne önerirsin?`;

    return (
        <div className={`rounded-xl p-4 border ${colorClass} flex gap-4 items-start relative overflow-hidden transition-all duration-300`}>
            <div className={`p-2 rounded-full bg-white/50 shrink-0 ${iconColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" /></svg>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">{title}</h4>
                <p className="text-xs opacity-90 leading-relaxed mb-3">{message}</p>

                <button
                    onClick={() => openChatWithContext && openChatWithContext({ prompt, badgeText: 'Finansal Analiz', badgeColor: 'indigo' })}
                    className="text-[10px] font-bold bg-white/60 hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-black/5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    AI Asistan'a Sor
                </button>
            </div>
        </div>
    );
}

export const CompanySimulator = ({ openChatWithContext, onGoBack, initialData }) => {
    // 1. Initialize State
    const defaultCogsRate = useMemo(() => {
        // Bug Fix #1: RAW_PRODUCTS has `cogs` (not costProduct) and prices per channel.
        // We calculate a weighted average COGS rate using actual channel sales data.
        const totalCostWeighted = RAW_PRODUCTS.reduce((acc, p) => {
            const totalUnits = p.channels ? p.channels.reduce((s, c) => s + (c.units || 0), 0) : 0;
            return acc + (p.cogs || 0) * totalUnits;
        }, 0);
        const totalRevenueWeighted = RAW_PRODUCTS.reduce((acc, p) => {
            const channelRevenue = p.channels ? p.channels.reduce((s, c) => s + ((c.price || 0) * (c.units || 0)), 0) : 0;
            return acc + channelRevenue;
        }, 0);
        return totalRevenueWeighted > 0 ? (totalCostWeighted / totalRevenueWeighted) * 100 : 60;
    }, []);

    const [expenses, setExpenses] = useState(() => {
        const init = initialData?.expenses;
        if (Array.isArray(init)) return init;
        if (init && typeof init === 'object') {
            return [
                { id: 'rent', name: 'Depo Kirası', amount: init.rent || 0 },
                { id: 'personnel', name: 'Personel Maaşı', amount: init.personnel || 0 },
                { id: 'marketing', name: 'Pazarlama', amount: init.marketing || 0 },
                { id: 'other', name: 'Diğer', amount: init.other || 0 }
            ].filter(e => e.amount > 0);
        }
        return [
            { id: '1', name: 'Depo Kirası', amount: 15000 },
            { id: '2', name: 'Personel Maaşı', amount: 30000 },
            { id: '3', name: 'Yazılım / FinOps', amount: 1500 },
            { id: '4', name: 'Muhasebe', amount: 2000 }
        ];
    });

    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isScenariosOpen, setIsScenariosOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState('detailed'); // 'detailed' | 'summary'
    const [savedScenarios, setSavedScenarios] = useState([
        {
            id: 'default',
            name: 'Varsayılan Senaryo',
            financials: {
                cogsRate: Math.round(defaultCogsRate),
                variableExpenseRate: 15,
                targetNetMargin: 20,
                targetNetProfit: 50000,
                targetRevenue: 500000,
                targetType: 'revenue',
                period: 'monthly'
            },
            expenses: [
                { id: '1', name: 'Depo Kirası', amount: 15000 },
                { id: '2', name: 'Personel Maaşı', amount: 30000 },
                { id: '3', name: 'Yazılım / FinOps', amount: 1500 },
                { id: '4', name: 'Muhasebe', amount: 2000 }
            ]
        }
    ]);

    const saveCurrentScenario = () => {
        const name = prompt('Senaryo adı girin:', `Senaryo ${savedScenarios.length + 1}`);
        if (!name) return;
        const newScenario = {
            id: Date.now().toString(),
            name,
            financials: { ...financials },
            expenses: Array.isArray(expenses) ? expenses.map(e => ({ ...e })) : expenses
        };
        setSavedScenarios(prev => [...prev.slice(-2), newScenario]); // keep max 3
        setIsScenariosOpen(false);
    };

    const loadScenario = (scenario) => {
        setFinancials({ ...scenario.financials });
        setExpenses(Array.isArray(scenario.expenses) ? scenario.expenses.map(e => ({ ...e })) : scenario.expenses);
        setIsScenariosOpen(false);
    };

    const deleteScenario = (id) => {
        setSavedScenarios(prev => prev.filter(s => s.id !== id));
    };
    const [financials, setFinancials] = useState({
        cogsRate: initialData?.grossMargin !== undefined ? Math.round(100 - initialData.grossMargin) : Math.round(defaultCogsRate), // % (Product Cost)
        variableExpenseRate: initialData?.variableExpenseRate || 15, // %
        targetNetMargin: initialData?.targetMargin || 20, // %
        targetNetProfit: initialData?.targetProfit || 50000, // ₺ (Monthly Base)
        targetRevenue: 500000, // Default 500k Revenue Target
        targetType: initialData?.targetType || 'revenue', // 'revenue' | 'margin' | 'amount'
        period: initialData?.period || 'monthly'
    });

    // New: Reference State for Comparison
    const [reference, setReference] = useState(null);

    // 2. Calculations
    const calculateMetrics = (exp, fin) => {
        const totalFixedCosts = Array.isArray(exp) ? exp.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : Object.values(exp).reduce((a, b) => a + b, 0);

        // Use fallbacks to prevent NaN if reference metrics are missing the new property
        // For older data that might have grossMargin instead of cogsRate:
        const cogsRateValue = fin.cogsRate !== undefined ? fin.cogsRate : (fin.grossMargin !== undefined ? 100 - fin.grossMargin : 60);
        const cogsRate = cogsRateValue / 100;
        const grossMarginRate = 1 - cogsRate;
        const variableExpenseRate = (fin.variableExpenseRate || 0) / 100;
        const contributionMarginRate = grossMarginRate - variableExpenseRate;

        let requiredRevenue = 0;
        let projectedNetProfit = 0;
        let isImpossible = false;

        if (fin.targetType === 'revenue') {
            // Target: Revenue Driven
            const targetMonthlyRevenue = fin.period === 'yearly' ? fin.targetRevenue / 12 : fin.targetRevenue;
            requiredRevenue = targetMonthlyRevenue;
            projectedNetProfit = (targetMonthlyRevenue * contributionMarginRate) - totalFixedCosts;
            isImpossible = contributionMarginRate <= 0;
        } else if (fin.targetType === 'amount') {
            // Target: Absolute Profit Amount
            const targetMonthlyProfit = fin.period === 'yearly' ? fin.targetNetProfit / 12 : fin.targetNetProfit;

            if (contributionMarginRate > 0) {
                requiredRevenue = (totalFixedCosts + targetMonthlyProfit) / contributionMarginRate;
                projectedNetProfit = targetMonthlyProfit;
            } else {
                isImpossible = true;
            }
        } else {
            // Target: Net Margin %
            const targetNetMarginRate = (fin.targetNetMargin || 0) / 100;
            const effectiveMarginRate = contributionMarginRate - targetNetMarginRate;

            if (effectiveMarginRate > 0.001) {
                requiredRevenue = totalFixedCosts / effectiveMarginRate;
                projectedNetProfit = requiredRevenue * targetNetMarginRate;
            } else {
                isImpossible = true;
            }
        }

        // Common derivations
        const breakEvenRevenue = contributionMarginRate > 0 ? totalFixedCosts / contributionMarginRate : 0;
        const projectedCOGS = requiredRevenue * cogsRate;
        const projectedVariableExpenses = requiredRevenue * variableExpenseRate;

        return {
            totalFixedCosts,
            requiredRevenue,
            breakEvenRevenue,
            projectedNetProfit,
            projectedCOGS,
            projectedVariableExpenses,
            isImpossible
        };
    };

    const current = calculateMetrics(expenses, financials);
    const refMetrics = reference ? calculateMetrics(reference.expenses, reference.financials) : null;

    // Display Values (Monthly vs Yearly)
    const multiplier = financials.period === 'yearly' ? 12 : 1;

    // Define Display Variables (FIXING REFERENCE ERROR)
    const dRequiredRevenue = current.requiredRevenue * multiplier;
    const dBreakEven = current.breakEvenRevenue * multiplier;
    const dNetProfit = current.projectedNetProfit * multiplier;
    const dFixedCosts = current.totalFixedCosts * multiplier;
    const dCOGS = current.projectedCOGS * multiplier;
    const dVariableExpenses = (current.projectedVariableExpenses || 0) * multiplier; // Fallback to 0 if NaN/undefined
    const isImpossible = current.isImpossible;

    // Calculate True Net Margin
    const calculatedNetMargin = dRequiredRevenue > 0 ? (dNetProfit / dRequiredRevenue) * 100 : 0;

    // --- NEW: Calculate Time to Break-Even (Run-rate) ---
    // How long does it take to reach the break-even revenue given the target revenue velocity?
    let breakEvenTimeText = '';
    let breakEvenRatio = 0;

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;

    if (!isImpossible && dRequiredRevenue > 0) {
        breakEvenRatio = Math.min(dBreakEven / dRequiredRevenue, 1); // Clamp to 100% just in case

        if (dRequiredRevenue < dBreakEven) {
            breakEvenTimeText = 'Hedeflenen ciro, zararı kapatmak için yetersiz.';
        } else {
            if (financials.period === 'yearly') {
                const targetMonth = Math.ceil(breakEvenRatio * 12);
                const diff = targetMonth - currentMonth;
                if (diff > 0) {
                    breakEvenTimeText = `Şu an yılın ${currentMonth}. ayındayız. Bu hızla devam ederseniz ${diff} ay sonra (yılın ${targetMonth}. ayında) kâra geçmeye başlayacaksınız.`;
                } else if (diff === 0) {
                    breakEvenTimeText = `İçinde bulunduğumuz ${currentMonth}. ay, şirketinizin kâra geçiş (başabaş) eşiğini aştığı aydır. Zirvedesiniz!`;
                } else {
                    breakEvenTimeText = `Şu an yılın ${currentMonth}. ayındayız. Bu hesaba göre başabaş noktasını ${Math.abs(diff)} ay önce (yılın ${targetMonth}. ayında) çoktan geride bıraktınız. Şirket kârlı bölgede!`;
                }
            } else {
                const targetDay = Math.ceil(breakEvenRatio * 30);
                const diff = targetDay - currentDay;
                if (diff > 0) {
                    breakEvenTimeText = `Şu an ayın ${currentDay}. günündeyiz. Bu hızla devam ederseniz ${diff} gün sonra (ayın ${targetDay}. gününde) kâra geçmeye başlayacaksınız.`;
                } else if (diff === 0) {
                    breakEvenTimeText = `Bugün, (ayın ${currentDay}. günü) aylık kâra geçiş (başabaş) eşiğinizi aştığınız gündür. Harika!`;
                } else {
                    breakEvenTimeText = `Şu an ayın ${currentDay}. günündeyiz. Bu hesaba göre başabaş noktasını ${Math.abs(diff)} gün önce (ayın ${targetDay}. gününde) çoktan geride bıraktınız. Şirket kârlı bölgede!`;
                }
            }
        }
    }

    // Helpers for display
    const formatCurrency = (val) => `₺${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const formatCompact = (val) => `₺${val.toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 })}`;


    // 3. Handlers
    const applyPreset = (type) => {
        const totalFixed = Array.isArray(expenses) ? expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : Object.values(expenses).reduce((a, b) => a + b, 0);
        const baseProfit = financials.period === 'yearly' ? totalFixed * 12 : totalFixed;

        if (financials.targetType === 'revenue') {
            const baseRevenue = financials.period === 'yearly' ? 5000000 : 500000;
            if (type === 'startup') setFinancials(prev => ({ ...prev, targetRevenue: baseRevenue * 0.5 }));
            if (type === 'growth') setFinancials(prev => ({ ...prev, targetRevenue: baseRevenue }));
            if (type === 'profit') setFinancials(prev => ({ ...prev, targetRevenue: baseRevenue * 2 }));
        } else if (financials.targetType === 'amount') {
            if (type === 'startup') setFinancials(prev => ({ ...prev, targetNetProfit: 0 }));
            if (type === 'growth') setFinancials(prev => ({ ...prev, targetNetProfit: baseProfit * 0.5 }));
            if (type === 'profit') setFinancials(prev => ({ ...prev, targetNetProfit: baseProfit }));
        } else {
            if (type === 'startup') setFinancials(prev => ({ ...prev, targetNetMargin: 10 }));
            if (type === 'growth') setFinancials(prev => ({ ...prev, targetNetMargin: 20 }));
            if (type === 'profit') setFinancials(prev => ({ ...prev, targetNetMargin: 30 }));
        }
    };

    const toggleReference = () => {
        if (reference) {
            setReference(null);
        } else {
            setReference({
                expenses: Array.isArray(expenses) ? expenses.map(e => ({ ...e })) : { ...expenses },
                financials: { ...financials }
            });
        }
    };

    // Calculate Deltas if reference exists
    const getDelta = (currVal, refVal) => {
        if (!reference || refVal === undefined || refVal === null) return null;
        const diff = currVal - refVal;
        const percent = refVal !== 0 ? (diff / refVal) * 100 : 0;
        return { diff, percent };
    };

    // Calculate deltas using Display Values
    const refMultiplier = multiplier;
    const dRefTopNetProfit = refMetrics ? refMetrics.projectedNetProfit * refMultiplier : 0;
    const dRefReqRevenue = refMetrics ? refMetrics.requiredRevenue * refMultiplier : 0;

    const deltaNetProfit = getDelta(dNetProfit, dRefTopNetProfit);
    const deltaRevenue = getDelta(dRequiredRevenue, dRefReqRevenue);


    return (
        <div className="p-6 max-w-[1600px] mx-auto animate-fade-in font-sans pb-20">

            {/* 1. Header Area (Matching Product Simulator) */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <button
                        onClick={onGoBack}
                        className="flex items-center text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors mb-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6" /></svg>
                        Ana Menüye Dön
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Şirket Finansal Simülatörü</h1>
                    <p className="text-sm text-gray-500 mt-1">Sabit giderler ve kârlılık hedeflerine göre genel projeksiyon.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleReference}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition shadow-sm ${reference ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        {reference ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                Karşılaştırmayı Bitir
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Mevcut Durumu Baz Al
                            </>
                        )}
                    </button>

                    {/* Senaryolar Button + Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsScenariosOpen(prev => !prev)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition shadow-sm ${isScenariosOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            Senaryolar
                            <svg className={`w-3 h-3 transition-transform ${isScenariosOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {isScenariosOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="p-3 border-b border-gray-100">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Kayıtlı Senaryolar</p>
                                    {savedScenarios.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-2">Henüz kaydedilmiş senaryo yok.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {savedScenarios.map(s => (
                                                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group">
                                                    <button
                                                        onClick={() => loadScenario(s)}
                                                        className="flex-1 text-left text-sm font-medium text-gray-800 hover:text-indigo-700"
                                                    >
                                                        {s.name}
                                                    </button>
                                                    {s.id !== 'default' && (
                                                        <button
                                                            onClick={() => deleteScenario(s.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 rounded"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <button
                                        onClick={saveCurrentScenario}
                                        className="w-full py-2.5 text-sm font-bold text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Mevcut Simülasyonu Kaydet
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modu Değiştir Toggle */}
                    <button
                        onClick={() => setDisplayMode(prev => prev === 'detailed' ? 'summary' : 'detailed')}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition shadow-sm ${displayMode === 'summary' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        title={displayMode === 'detailed' ? 'Özet moda geç' : 'Detaylı moda geç'}
                    >
                        {displayMode === 'detailed' ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                                Özet Mod
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                Detaylı Mod
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* 2. Context Header (Blue Stripe) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-visible z-10">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"></div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <span className="text-2xl">🏢</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 leading-tight">Şirket Genel Durumu</h2>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Finansal Projeksiyon & Hedefleme</p>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFinancials(prev => ({ ...prev, period: 'monthly' }))}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${financials.period === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Aylık
                    </button>
                    <button
                        onClick={() => setFinancials(prev => ({ ...prev, period: 'yearly' }))}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${financials.period === 'yearly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Yıllık
                    </button>
                </div>
            </div>

            {/* NEW: Comparison Analysis Text */}
            {reference && deltaNetProfit && deltaRevenue && (
                <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-indigo-900 mb-1">Değişim Analizi</h3>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                            Baz alınan senaryoya göre; hedeflenen ciroda <span className="font-bold">{formatCompact(deltaRevenue.diff)} {deltaRevenue.diff > 0 ? 'artış' : 'azalış'}</span> öngörülürken,
                            tahmini net kârınızda <span className={`font-bold ${deltaNetProfit.diff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCompact(deltaNetProfit.diff)} {deltaNetProfit.diff > 0 ? 'iyileşme' : 'düşüş'}</span> gerçekleşti.
                            {deltaNetProfit.diff > 0
                                ? ' Bu değişim, hedeflerinize daha hızlı ulaşmanızı sağlayabilir.'
                                : ' Kârlılıktaki bu düşüşü dengelemek için sabit giderleri veya marjı gözden geçirmek isteyebilirsiniz.'}
                        </p>
                    </div>
                </div>
            )}

            {/* 3. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT: SIDEBAR --- */}
                <div className="lg:col-span-4 space-y-4">

                    {/* Dark Panel: Primary Targets */}
                    <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300">Simülasyon Hedefi</h3>
                                <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                                    <button
                                        onClick={() => setFinancials(prev => ({ ...prev, targetType: 'revenue' }))}
                                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${financials.targetType === 'revenue' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Ciro
                                    </button>
                                    <button
                                        onClick={() => setFinancials(prev => ({ ...prev, targetType: 'margin' }))}
                                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${financials.targetType === 'margin' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Marj
                                    </button>
                                    <button
                                        onClick={() => setFinancials(prev => ({ ...prev, targetType: 'amount' }))}
                                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${financials.targetType === 'amount' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Tutar
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {financials.targetType === 'revenue' ? (
                                    <>
                                        <div className="space-y-2 animate-fade-in">
                                            <label className="block text-xs font-bold text-gray-400 uppercase">
                                                Hedef Ciro ({financials.period === 'yearly' ? 'Yıllık' : 'Aylık'})
                                            </label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300 font-medium text-lg">₺</span>
                                                <input
                                                    type="number"
                                                    value={financials.targetRevenue}
                                                    onChange={(e) => setFinancials(prev => ({ ...prev, targetRevenue: parseInt(e.target.value) || 0 }))}
                                                    className="block w-full rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white font-bold text-2xl pl-10 py-3 focus:border-indigo-500 focus:ring-0 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={financials.period === 'yearly' ? 50000000 : 5000000}
                                            step={financials.period === 'yearly' ? 100000 : 10000}
                                            value={financials.targetRevenue}
                                            onChange={(e) => setFinancials(prev => ({ ...prev, targetRevenue: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </>
                                ) : financials.targetType === 'margin' ? (
                                    <>
                                        <div className="space-y-2 animate-fade-in">
                                            <label className="block text-xs font-bold text-gray-400 uppercase">Hedef Net Kâr Marjı (%)</label>
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    value={financials.targetNetMargin}
                                                    onChange={(e) => setFinancials(prev => ({ ...prev, targetNetMargin: parseInt(e.target.value) }))}
                                                    className="block w-full rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white font-bold text-2xl pl-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all text-right pr-10"
                                                />
                                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-300 font-medium text-lg">%</span>
                                            </div>
                                        </div>
                                        <input
                                            type="range" min="1" max={Math.max(1, (100 - financials.cogsRate) - 5)} step="1"
                                            value={financials.targetNetMargin}
                                            onChange={(e) => setFinancials(prev => ({ ...prev, targetNetMargin: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2 animate-fade-in">
                                            <label className="block text-xs font-bold text-gray-400 uppercase">
                                                Hedef Net Kâr ({financials.period === 'yearly' ? 'Yıllık' : 'Aylık'})
                                            </label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300 font-medium text-lg">₺</span>
                                                <input
                                                    type="number"
                                                    value={financials.targetNetProfit}
                                                    onChange={(e) => setFinancials(prev => ({ ...prev, targetNetProfit: parseInt(e.target.value) || 0 }))}
                                                    className="block w-full rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white font-bold text-2xl pl-10 py-3 focus:border-indigo-500 focus:ring-0 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={financials.period === 'yearly' ? 5000000 : 500000}
                                            step={financials.period === 'yearly' ? 10000 : 1000}
                                            value={financials.targetNetProfit}
                                            onChange={(e) => setFinancials(prev => ({ ...prev, targetNetProfit: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </>
                                )}

                                {/* Presets */}
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <button onClick={() => applyPreset('startup')} className="py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-[10px] font-bold border border-gray-700 transition-colors">Başlangıç</button>
                                    <button onClick={() => applyPreset('growth')} className="py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-[10px] font-bold border border-gray-700 transition-colors">Büyüme</button>
                                    <button onClick={() => applyPreset('profit')} className="py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded text-[10px] font-bold border border-gray-700 transition-colors">Kâr</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Light Panel: Expenses */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">Maliyet ve Giderler</h3>
                        </div>

                        {/* Product Cost (COGS) */}
                        <div>
                            <label className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                                <span>Ortalama Ürün Maliyeti (Cirodan %)</span>
                                <span className="text-slate-600">%{financials.cogsRate}</span>
                            </label>
                            <input
                                type="range" min="5" max="95" step="1"
                                value={financials.cogsRate}
                                onChange={(e) => setFinancials(prev => ({ ...prev, cogsRate: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-slate-500 mb-2"
                            />
                        </div>

                        {/* Variable Expenses */}
                        <div>
                            <label className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                                <span>Değişken Giderler (Cirodan %)</span>
                                <span className="text-purple-600">%{financials.variableExpenseRate || 0}</span>
                            </label>
                            <input
                                type="range" min="0" max="60" step="1"
                                value={financials.variableExpenseRate || 0}
                                onChange={(e) => setFinancials(prev => ({ ...prev, variableExpenseRate: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-2"
                            />
                        </div>

                        {/* Fixed Expenses Button */}
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsExpenseModalOpen(true)}
                                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group shadow-sm hover:shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-400 group-hover:text-indigo-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">Sabit Giderleri Yönet</h4>
                                        <p className="text-[10px] text-gray-500 font-medium mt-1">Toplam Sabit Gider: {dFixedCosts.toLocaleString()} ₺</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700">{dFixedCosts.toLocaleString()} ₺</span>
                                    <span className="text-gray-400 group-hover:text-gray-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                </div>

                {/* --- RIGHT: CONTENT --- */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Profit Card */}
                        <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-500/5 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg className="w-32 h-32 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Tahmini Net Kâr</h3>
                            <div className="flex items-baseline gap-2 relative z-10 flex-wrap">
                                <span className={`text-4xl xl:text-5xl font-extrabold tracking-tight ${!isImpossible ? 'text-emerald-600' : 'text-gray-300'}`}>
                                    {isImpossible ? '-' : formatCurrency(dNetProfit)}
                                </span>
                                {deltaNetProfit && (
                                    <div className="flex flex-col items-start">
                                        <span className={`text-sm font-bold px-2 py-1 rounded ${deltaNetProfit.diff >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {deltaNetProfit.diff > 0 ? '+' : ''}{formatCompact(deltaNetProfit.diff).replace('₺', '')} ({deltaNetProfit.diff > 0 ? '+' : ''}{deltaNetProfit.percent.toFixed(1)}%)
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium mt-1 ml-1">
                                            {deltaNetProfit.diff > 0
                                                ? 'Bu simülasyona göre mevcut duruma göre +' + formatCompact(deltaNetProfit.diff) + ' net kâr artışı olacak.'
                                                : 'Mevcut duruma göre net kârda ' + formatCompact(deltaNetProfit.diff) + ' düşüş öngörülüyor.'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg border ${!isImpossible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {isImpossible ? 'Hesaplanamadı' : `Gerçekleşen Net Kâr Marjı: %${calculatedNetMargin.toFixed(1)}`}
                                </span>
                            </div>
                        </div>

                        {/* 2. Revenue Card */}
                        <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-500/5 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                {financials.targetType === 'revenue' ? (
                                    <>🎯 Hedeflenen Ciro</>
                                ) : (
                                    <>Gereken Ciro</>
                                )}
                            </h3>
                            <div className="flex items-baseline gap-2 relative z-10 flex-wrap">
                                <span className={`text-4xl xl:text-5xl font-extrabold tracking-tight ${!isImpossible ? 'text-indigo-600' : 'text-red-500'}`}>
                                    {isImpossible ? 'Geçersiz' : formatCurrency(dRequiredRevenue)}
                                </span>
                                {deltaRevenue && (
                                    <div className="flex flex-col items-start">
                                        <span className={`text-sm font-bold px-2 py-1 rounded ${deltaRevenue.diff <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {deltaRevenue.diff > 0 ? '+' : ''}{formatCompact(deltaRevenue.diff).replace('₺', '')}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium mt-1 ml-1">
                                            {deltaRevenue.diff > 0
                                                ? '+' + formatCompact(deltaRevenue.diff) + ' ekstra.'
                                                : formatCompact(Math.abs(deltaRevenue.diff)) + ' daha az ciro ile hedefi tutturabilirsiniz.'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Break-Even Card */}
                        <div className="bg-white rounded-2xl border border-red-100 shadow-xl shadow-red-500/5 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg className="w-32 h-32 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                            </div>
                            <h3 className="text-sm font-bold text-red-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                🚨 Kritik Eşik (Başabaş)
                            </h3>
                            <div className="flex items-baseline gap-2 relative z-10 flex-wrap">
                                <span className={`text-4xl xl:text-5xl font-extrabold tracking-tight text-red-600`}>
                                    {formatCurrency(dBreakEven)}
                                </span>
                            </div>


                            {isImpossible && (
                                <div className="mt-4 bg-red-50/50 p-2 rounded border border-red-100">
                                    <span className="text-[10px] text-red-700 font-medium leading-tight block">
                                        Geçersiz veri: Brüt kâr marjınız 0 veya negatif olduğu için başabaş hesaplanamıyor.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Breakdown Chart — only in Detailed mode */}
                    {displayMode === 'detailed' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">Gelir Tablosu Simülasyonu</h3>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Maliyet Dağılımı</span>
                            </div>

                            {!isImpossible && (
                                <div className="space-y-6">
                                    {/* Visual Bars Container */}
                                    <div className="space-y-2">
                                        {/* 1. Main Bar (Current) */}
                                        <div className="h-16 w-full bg-gray-100 rounded-xl overflow-hidden flex text-xs font-bold text-white relative shadow-inner">
                                            <div style={{ width: `${financials.cogsRate}%` }} className="h-full bg-slate-400 flex flex-col items-center justify-center relative group px-1 border-r border-slate-300">
                                                <span className="drop-shadow-sm truncate w-full text-center">Maliyet</span>
                                                <span className="opacity-90 font-mono truncate w-full text-center">{formatCompact(dCOGS)}</span>
                                            </div>
                                            {financials.variableExpenseRate > 0 && (
                                                <div style={{ width: `${financials.variableExpenseRate}%` }} className="h-full bg-purple-500 flex flex-col items-center justify-center relative group px-1 border-r border-purple-400">
                                                    <span className="drop-shadow-sm truncate w-full text-center">Değişken</span>
                                                    <span className="opacity-90 font-mono truncate w-full text-center">{formatCompact(dVariableExpenses)}</span>
                                                </div>
                                            )}
                                            {/* Bug Fix #3: Fixed costs use actual ratio against revenue (which is < 100% by definition). */}
                                            {(() => {
                                                const fixedPct = dRequiredRevenue > 0 ? (dFixedCosts / dRequiredRevenue) * 100 : 0;
                                                // Net profit bar uses remaining space so total always equals 100%.
                                                const netPct = Math.max(0, 100 - financials.cogsRate - (financials.variableExpenseRate || 0) - fixedPct);
                                                return (
                                                    <>
                                                        <div style={{ width: `${fixedPct}%` }} className="h-full bg-orange-500 flex flex-col items-center justify-center relative group px-1 border-r border-orange-400">
                                                            <span className="drop-shadow-sm truncate w-full text-center">Sabit</span>
                                                            <span className="opacity-90 font-mono truncate w-full text-center">{formatCompact(dFixedCosts)}</span>
                                                        </div>
                                                        {netPct > 0 && (
                                                            <div style={{ width: `${netPct}%` }} className="h-full bg-emerald-500 flex flex-col items-center justify-center relative group px-1">
                                                                <span className="drop-shadow-sm truncate w-full text-center">Net Kâr</span>
                                                                <span className="opacity-90 font-mono truncate w-full text-center">{formatCompact(dNetProfit)}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div> {/* End Main Bar */}

                                        {/* 2. Reference Bar (Ghost) - Only if reference active */}
                                        {reference && refMetrics && !refMetrics.isImpossible && (
                                            <div className="h-4 w-full bg-gray-50 rounded-lg overflow-hidden flex opacity-60">
                                                <div style={{ width: `${reference.financials.cogsRate || (100 - reference.financials.grossMargin)}%` }} className="h-full bg-slate-200 border-r border-white"></div>
                                                <div style={{ width: `${(refMetrics.totalFixedCosts / refMetrics.requiredRevenue) * 100}%` }} className="h-full bg-orange-200 border-r border-white"></div>
                                                <div style={{ width: `${reference.financials.targetNetMargin}%` }} className="h-full bg-emerald-200"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Legend Grid - Now 5 Columns */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                                        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                            <span className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5 truncate">Toplam Ciro</span>
                                            <span className="block text-[13px] font-bold text-gray-900 truncate">{formatCurrency(dRequiredRevenue)}</span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                            <span className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5 truncate">Ürün Maliyeti</span>
                                            <span className="block text-[13px] font-bold text-gray-900 truncate">{formatCurrency(dCOGS)}</span>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-100">
                                            <span className="block text-[9px] font-bold text-purple-600 uppercase mb-0.5 truncate">Değişken Gider</span>
                                            <span className="block text-[13px] font-bold text-purple-700 truncate">{formatCurrency(dVariableExpenses)}</span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                            <span className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5 truncate">Sabit Giderler</span>
                                            <span className="block text-[13px] font-bold text-gray-900 truncate">{formatCurrency(dFixedCosts)}</span>
                                        </div>
                                        <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                                            <span className="block text-[9px] font-bold text-emerald-800 uppercase mb-0.5 truncate">Net Kâr</span>
                                            <span className="block text-[13px] font-bold text-emerald-700 truncate">{formatCurrency(dNetProfit)}</span>
                                        </div>
                                    </div>

                                    {/* Time to Break-Even UI */}
                                    {!isImpossible && dRequiredRevenue > 0 && dRequiredRevenue >= dBreakEven && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500 shrink-0 border border-indigo-100">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">Zamanla Yarış (Başabaş Süresi)</h4>
                                                    <p className="text-xs font-medium text-gray-500 mt-0.5">
                                                        {breakEvenTimeText}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress Bar Timeline */}
                                            <div className="px-1 space-y-2 relative">
                                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out py-0.5"
                                                        style={{ width: `${breakEvenRatio * 100}%` }}
                                                    >
                                                        <div className="w-full h-full bg-white opacity-20 rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest relative">
                                                    <span>Dönem Başı</span>
                                                    <span
                                                        className="absolute text-indigo-600 transform -translate-x-1/2 flex flex-col items-center"
                                                        style={{ left: `calc(${breakEvenRatio * 100}%)`, top: '-24px' }}
                                                    >
                                                        <div className="w-0.5 h-6 bg-indigo-300 mb-1"></div>
                                                        <span className="bg-white px-2 mt-2 py-0.5 rounded shadow-sm border border-indigo-100 whitespace-nowrap text-indigo-700">Kâra Geçiş</span>
                                                    </span>
                                                    <span>Dönem Sonu</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )} {/* end displayMode === 'detailed' */}

                    {/* AI Insight - Bug Fix #2: margin uses real calculatedNetMargin, not target */}
                    {!isImpossible && (
                        <AIInsightCard
                            revenue={dRequiredRevenue}
                            netProfit={dNetProfit}
                            margin={Math.round(calculatedNetMargin)}
                            breakEven={dBreakEven}
                            openChatWithContext={openChatWithContext}
                        />
                    )}

                </div>
            </div>

            <FixedExpensesModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                expenses={expenses}
                onSave={setExpenses}
            />
        </div>
    );
};

export default CompanySimulator;
