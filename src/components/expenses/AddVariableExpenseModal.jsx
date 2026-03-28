import React, { useState, useEffect } from 'react';
import { X, CreditCard, Truck, Megaphone, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AddVariableExpenseModal = ({ t, onClose, onSave }) => {
    const [selectedCategory, setSelectedCategory] = useState('payment');
    const [name, setName] = useState('');
    const [logicType, setLogicType] = useState('percentage'); // fixed | percentage | hybrid
    const [fixedAmount, setFixedAmount] = useState('');
    const [percentageRate, setPercentageRate] = useState('');
    const [scope, setScope] = useState('global');

    // Simulation state
    const [simulatedCost, setSimulatedCost] = useState(0);
    const SIMULATION_BASKET_VALUE = 1000;

    const categories = [
        { id: 'payment', title: 'Ödeme & Komisyon', icon: CreditCard, color: 'emerald' },
        { id: 'logistics', title: 'Lojistik & Operasyon', icon: Truck, color: 'blue' },
        { id: 'marketing', title: 'Pazarlama', icon: Megaphone, color: 'indigo' },
    ];

    // Calculate simulation whenever inputs change
    useEffect(() => {
        let cost = 0;
        const rate = parseFloat(percentageRate) || 0;
        const fixed = parseFloat(fixedAmount) || 0;

        if (logicType === 'fixed') {
            cost = fixed;
        } else if (logicType === 'percentage') {
            cost = (SIMULATION_BASKET_VALUE * rate) / 100;
        } else if (logicType === 'hybrid') {
            cost = ((SIMULATION_BASKET_VALUE * rate) / 100) + fixed;
        }

        setSimulatedCost(cost);
    }, [logicType, fixedAmount, percentageRate]);

    const handleSave = () => {
        const expenseData = {
            name,
            category: selectedCategory,
            type: logicType,
            amount: parseFloat(fixedAmount) || 0,
            rate: parseFloat(percentageRate) || 0,
            scope
        };
        // onSave(expenseData); // In a real app
        console.log("Saving Rule:", expenseData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Yeni Değişken Gider Kuralı</h2>
                        <p className="text-sm text-slate-500 mt-1">Sipariş veya satış başına düşülecek maliyeti tanımlayın.</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* 1. Category Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-900 block">Kategori</label>
                        <div className="grid grid-cols-3 gap-3">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all h-24 gap-2 relative",
                                            isSelected
                                                ? `bg-${cat.color}-50 border-${cat.color}-500 ring-1 ring-${cat.color}-500`
                                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        {isSelected && (
                                            <div className={`absolute top-2 right-2 text-${cat.color}-600`}>
                                                <Check className="h-3.5 w-3.5" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isSelected ? `bg-white text-${cat.color}-600` : "bg-slate-100 text-slate-500"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-medium text-center leading-tight px-1",
                                            isSelected ? `text-${cat.color}-900` : "text-slate-600"
                                        )}>
                                            {cat.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Expense Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-900 block">Gider Adı</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Örn: Trendyol Komisyonu, Özel Paketleme..."
                            className="w-full rounded-lg border-slate-200 text-sm py-2.5 px-3 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400"
                        />
                    </div>

                    {/* 3. Logic Toggle & Inputs */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-900">Maliyet Mantığı</label>
                        </div>

                        <div className="bg-slate-100 p-1 rounded-lg grid grid-cols-3 gap-1">
                            {[
                                { id: 'fixed', label: 'Sabit Tutar (₺)' },
                                { id: 'percentage', label: 'Oran (%)' },
                                { id: 'hybrid', label: 'Hibrit (% + ₺)' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setLogicType(type.id)}
                                    className={cn(
                                        "py-1.5 px-3 text-xs font-medium rounded-md transition-all",
                                        logicType === type.id
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Percentage Rate Input */}
                            {(logicType === 'percentage' || logicType === 'hybrid') && (
                                <div className={logicType === 'percentage' ? "col-span-2" : "col-span-1"}>
                                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">Komisyon Oranı</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={percentageRate}
                                            onChange={(e) => setPercentageRate(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 text-sm py-2.5 pl-3 pr-8 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 text-sm font-bold">%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fixed Amount Input */}
                            {(logicType === 'fixed' || logicType === 'hybrid') && (
                                <div className={logicType === 'fixed' ? "col-span-2" : "col-span-1"}>
                                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                                        {logicType === 'hybrid' ? 'İşlem Ücreti (Sabit)' : 'Birim Maliyet'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 text-sm font-bold">₺</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={fixedAmount}
                                            onChange={(e) => setFixedAmount(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 text-sm py-2.5 pl-8 pr-3 focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Scope Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-900 block">Etki Alanı (Kanal)</label>
                        <select
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className="w-full rounded-lg border-slate-200 text-sm py-2.5 px-3 focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="global">Tüm Mağaza (Varsayılan)</option>
                            <option value="trendyol">Sadece Trendyol</option>
                            <option value="website">Sadece Web Sitesi</option>
                            <option value="hepsiburada">Sadece Hepsiburada</option>
                        </select>
                    </div>

                    {/* 5. Live Simulator */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Simülasyon (1.000 TL Sepet İçin)
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-medium">Önizleme</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900">
                                ₺{simulatedCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-sm font-medium text-slate-500">gider yansıtılacak.</span>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
                    >
                        Kuralı Kaydet
                    </button>
                </div>

            </div>
        </div>
    );
};
