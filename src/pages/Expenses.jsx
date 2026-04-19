import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    DollarSign,
    Package,
    Megaphone,
    X,
    ChevronDown,
    Globe,
    Tag,
    ShoppingBag,
    CreditCard,
    Truck,
    Calculator
} from 'lucide-react';
import { cn } from '../lib/utils';
import { expensesData, variableRulesData } from '../data/expensesData';

import { AddVariableExpenseModal } from '../components/expenses/AddVariableExpenseModal';

export const Expenses = ({ t }) => {
    const [activeTab, setActiveTab] = useState('fixed');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Context-Aware Modal Logic
    const renderModal = () => {
        if (!isModalOpen) return null;

        if (activeTab === 'variable') {
            return (
                <AddVariableExpenseModal
                    t={t}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(data) => {
                        console.log("Saving Variable Expense:", data);
                        setIsModalOpen(false);
                    }}
                />
            );
        }

        return <AddExpenseModal t={t} onClose={() => setIsModalOpen(false)} />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">{t.expenses.title}</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {activeTab === 'fixed' ? t.expenses.addButton : "Kural Ekle"}
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('fixed')}
                        className={cn(
                            "py-4 px-1 border-b-2 text-sm font-medium transition-colors",
                            activeTab === 'fixed'
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        )}
                    >
                        {t.expenses.tabs.fixed}
                    </button>
                    <button
                        onClick={() => setActiveTab('variable')}
                        className={cn(
                            "py-4 px-1 border-b-2 text-sm font-medium transition-colors",
                            activeTab === 'variable'
                                ? "border-indigo-600 text-indigo-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        )}
                    >
                        {t.expenses.tabs.variable}
                    </button>
                </div>
            </div>

            <div className="mt-6">
                {activeTab === 'fixed' ? <FixedExpenses t={t} /> : <VariableExpenses t={t} />}
            </div>

            {/* Render Context-Aware Modal */}
            {renderModal()}
        </div>
    );
};

const FixedExpenses = ({ t }) => {
    const expenses = expensesData;

    const categoryOrder = ['opex', 'capex', 'finance', 'tax'];

    const groupedExpenses = categoryOrder.reduce((acc, cat) => {
        const items = expenses.filter(e => e.category === cat);
        if (items.length > 0) {
            acc[cat] = items;
        }
        return acc;
    }, {});

    // Calculate total only for 'amount' types AND exclude 'tax' category
    const totalAmount = expenses
        .filter(e => e.valueType === 'amount' && e.category !== 'tax')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const getCurrencySymbol = (currency) => {
        switch (currency) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': return '£';
            default: return '₺';
        }
    };

    const renderScopeBadge = (scope) => {
        switch (scope.type) {
            case 'global':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <Globe className="w-3 h-3" />
                        {t.expenses.scope.prefix.global}
                    </span>
                );
            case 'category':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        <Tag className="w-3 h-3" />
                        {t.expenses.scope.prefix.specific}{scope.target}
                    </span>
                );
            case 'channel':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                        <ShoppingBag className="w-3 h-3" />
                        {t.expenses.scope.prefix.specific}{scope.target}
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="min-w-full table-fixed divide-y divide-slate-100">
                <thead className="bg-slate-50">
                    <tr className="border-b-2 border-slate-100">
                        <th className="w-[35%] px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pl-8">{t.expenses.table.name}</th>
                        <th className="w-[15%] px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.expenses.table.amount}</th>
                        <th className="w-[15%] px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.expenses.table.frequency}</th>
                        <th className="w-[25%] px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.expenses.table.scope}</th>
                        <th className="w-[10%] px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.expenses.table.actions}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                    {Object.keys(groupedExpenses).map((categoryKey, index) => {
                        const items = groupedExpenses[categoryKey];
                        // Only sum actual amounts for the header subtotal
                        const categoryTotal = items
                            .filter(e => e.valueType === 'amount')
                            .reduce((sum, item) => sum + item.amount, 0);

                        return (
                            <React.Fragment key={categoryKey}>
                                {/* Category Header */}
                                <tr className={cn(
                                    "bg-slate-50 border-b border-slate-100",
                                    index !== 0 && "border-t-4 border-t-white" // Visual separation
                                )}>
                                    <td colSpan={5} className="px-6 py-3">
                                        <div className="flex items-center justify-between pl-2">
                                            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                                {t.expenses.categories[categoryKey]}
                                            </span>
                                            {categoryTotal > 0 && (
                                                <span className="text-sm font-bold text-slate-900 mr-28 tabular-nums">
                                                    ₺{categoryTotal.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {/* Expense Items */}
                                {items.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 pl-8">
                                            {expense.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                                            {expense.valueType === 'percentage' ? (
                                                <div className="flex justify-end">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {['1, 10, 20'].includes(expense.amount)
                                                            ? `%${expense.amount} (${t.expenses.base[expense.percentageBase]})`
                                                            : `%${expense.amount} (${t.expenses.base[expense.percentageBase]})`
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                expense.currency && expense.currency !== 'TRY' ? (
                                                    <div className="flex flex-col items-end" title={`Kur: 1 ${expense.currency} = ${expense.exchangeRate.toFixed(2)} TL`}>
                                                        <span className="font-medium text-slate-900 tabular-nums">
                                                            ₺{expense.amount.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                                                            {getCurrencySymbol(expense.currency)}{expense.originalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="tabular-nums font-medium text-slate-900">
                                                        ₺{expense.amount.toLocaleString()}
                                                    </span>
                                                )
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                                            <span className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium bg-blue-100/50 text-blue-700 border border-blue-100">
                                                {expense.frequency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="flex items-center h-full">
                                                {renderScopeBadge(expense.allocationScope || { type: 'global' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        );
                    })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                    <tr>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 pl-8">
                            {t.expenses.table.totalLabel}
                            <span className="text-xs font-normal text-slate-500 ml-1">{t.expenses.table.excludingTaxes}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-right tabular-nums">
                            ₺{totalAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">{t.expenses.table.perMonth}</span>
                        </td>
                        <td colSpan={3}></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

const VariableExpenses = ({ t }) => {
    // Shared Data for Cost Rules
    const rules = variableRulesData.map(r => ({
        ...r,
        name: t?.expenses?.variable?.items?.[r.nameKey] || r.name // Auto-translation fallback if available
    }));

    const renderRuleBadge = (rule) => {
        let text = '';
        let colorClass = '';

        if (rule.type === 'percentage') {
            text = `%${rule.val1}`;
            colorClass = 'bg-blue-50 text-blue-700 border-blue-100';
        } else if (rule.type === 'amount') {
            text = `₺${rule.val1.toFixed(2)}`;
            colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
        } else if (rule.type === 'hybrid') {
            text = `%${rule.val1} + ₺${rule.val2.toFixed(2)}`;
            colorClass = 'bg-purple-50 text-purple-700 border-purple-100';
        }

        return (
            <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border", colorClass)}>
                {text}
            </span>
        );
    };

    const categories = [
        { id: 'payment', title: t.expenses.variable.categories.payment, icon: CreditCard, color: 'emerald' },
        { id: 'logistics', title: t.expenses.variable.categories.logistics, icon: Truck, color: 'blue' },
        { id: 'marketing', title: t.expenses.variable.categories.marketing, icon: Megaphone, color: 'indigo' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                    const catRules = rules.filter(r => r.category === cat.id);
                    const Icon = cat.icon;
                    return (
                        <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${cat.color}-50 text-${cat.color}-600`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm">{cat.title}</h3>
                                </div>
                                <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition text-slate-400 hover:text-indigo-600">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100 flex-1">
                                {catRules.map((rule) => (
                                    <div key={rule.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{rule.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5 capitalize">{t.expenses.variable.labels.unit[rule.unit]}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {renderRuleBadge(rule)}
                                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                                <button className="p-1 text-slate-300 hover:text-indigo-600">
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button className="p-1 text-slate-300 hover:text-rose-600">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {catRules.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        Kural bulunamadı.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AddExpenseModal = ({ t, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState("opex");
    const [valueType, setValueType] = useState("amount"); // amount | percentage
    const [frequency, setFrequency] = useState("monthly");
    const [vatRate, setVatRate] = useState("20");
    const [currency, setCurrency] = useState("TRY");
    const [exchangeRate, setExchangeRate] = useState(1.0);
    const [amount, setAmount] = useState("");
    const [allocationScope, setAllocationScope] = useState("global");
    const [scopeTarget, setScopeTarget] = useState("");

    const handleCurrencyChange = (newCurrency) => {
        setCurrency(newCurrency);
        // Mock TCMB Rates (Updated based on user request)
        const rates = {
            'TRY': 1.0,
            'USD': 34.20,
            'EUR': 37.50,
            'GBP': 43.10
        };
        setExchangeRate(rates[newCurrency] || 1.0);
    };

    const calculatedTL = amount ? (parseFloat(amount) * exchangeRate) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-slate-900">{t.expenses.addButton}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t.expenses.table.name}
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Örn: Personel Yemek"
                        />
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Kategori
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="opex">{t.expenses.categories.opex}</option>
                            <option value="capex">{t.expenses.categories.capex}</option>
                            <option value="finance">{t.expenses.categories.finance}</option>
                            <option value="tax">{t.expenses.categories.tax}</option>
                        </select>
                    </div>

                    {/* Frequency Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tekrarlama Sıklığı
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="daily">{t.expenses.frequency.daily}</option>
                            <option value="weekly">{t.expenses.frequency.weekly}</option>
                            <option value="monthly">{t.expenses.frequency.monthly}</option>
                            <option value="yearly">{t.expenses.frequency.yearly}</option>
                        </select>
                    </div>

                    {/* Allocation Scope Selection */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t.expenses.scope.label}
                        </label>
                        <select
                            value={allocationScope}
                            onChange={(e) => setAllocationScope(e.target.value)}
                            className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 mb-2"
                        >
                            <option value="global">{t.expenses.scope.global}</option>
                            <option value="category">{t.expenses.scope.category}</option>
                            <option value="channel">{t.expenses.scope.channel}</option>
                        </select>
                        {(allocationScope === 'category' || allocationScope === 'channel') && (
                            <input
                                type="text"
                                value={scopeTarget}
                                onChange={(e) => setScopeTarget(e.target.value)}
                                className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder={t.expenses.scope.target}
                            />
                        )}
                    </div>

                    {/* Dynamic Tax Inputs */}
                    {selectedCategory === 'tax' && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                                    Değer Tipi
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setValueType("amount")}
                                        className={cn(
                                            "flex-1 py-1.5 px-3 rounded-md text-sm font-medium border transition-colors",
                                            valueType === "amount"
                                                ? "bg-white border-indigo-600 text-indigo-600 shadow-sm"
                                                : "bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200"
                                        )}
                                    >
                                        Tutar (₺)
                                    </button>
                                    <button
                                        onClick={() => setValueType("percentage")}
                                        className={cn(
                                            "flex-1 py-1.5 px-3 rounded-md text-sm font-medium border transition-colors",
                                            valueType === "percentage"
                                                ? "bg-white border-indigo-600 text-indigo-600 shadow-sm"
                                                : "bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200"
                                        )}
                                    >
                                        Oran (%)
                                    </button>
                                </div>
                            </div>

                            {valueType === "percentage" && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Neye Göre? (Referans)
                                    </label>
                                    <select className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                                        <option value="rent">{t.expenses.base.rent}</option>
                                        <option value="net_profit">{t.expenses.base.net_profit}</option>
                                        <option value="sales">{t.expenses.base.sales}</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Amount Input Group */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {valueType === 'percentage' ? 'Vergi Oranı (%)' : t.expenses.table.amount}
                        </label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="block w-full rounded-none rounded-l-lg border-slate-200 pl-3 sm:text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="0.00"
                            />
                            {valueType === 'percentage' ? (
                                <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 text-slate-500 sm:text-sm font-medium">
                                    %
                                </span>
                            ) : (
                                <select
                                    value={currency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 text-slate-500 sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 bg-slate-50"
                                >
                                    <option value="TRY">TRY</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Exchange Rate & Conversion Section */}
                    {valueType === 'amount' && currency !== 'TRY' && (
                        <div className="bg-slate-50 p-3 rounded-md mt-2 border border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-indigo-600" />
                                {t.expenses.currency.rateInfo}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        {t.expenses.currency.exchangeRate}
                                    </label>
                                    <input
                                        type="number"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(e.target.value)}
                                        className="w-full text-xs rounded-md border-slate-200 p-1.5 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {t.expenses.currency.autoRateHelper}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">
                                        {t.expenses.currency.tlEquivalent}
                                    </label>
                                    <div className="w-full text-sm font-bold text-indigo-600 bg-white border border-slate-200 rounded-md p-1.5 px-3">
                                        ₺{calculatedTL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <p className="text-[10px] text-indigo-400 mt-1">
                                        {t.expenses.currency.reportNote}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VAT Liability Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {t.expenses.vat.label}
                        </label>
                        <select
                            value={vatRate}
                            onChange={(e) => setVatRate(e.target.value)}
                            className="w-full rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="20">{t.expenses.vat.vat20}</option>
                            <option value="10">{t.expenses.vat.vat10}</option>
                            <option value="1">{t.expenses.vat.vat1}</option>
                            <option value="0">{t.expenses.vat.vat0}</option>
                            <option value="no_invoice">{t.expenses.vat.noInvoice}</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow">
                            Kaydet ve Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
