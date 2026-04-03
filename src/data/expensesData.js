export const expensesData = [
    // OPEX
    { id: 1, name: 'Ofis Kirası', amount: 18500, frequency: 'Aylık', category: 'opex', valueType: 'amount', allocationScope: { type: 'global' } },
    { id: 2, name: 'Personel Maaşları', amount: 85000, frequency: 'Aylık', category: 'opex', valueType: 'amount', allocationScope: { type: 'global' } },
    { id: 3, name: 'Yazılım Abonelikleri (SaaS)', amount: 4200, frequency: 'Aylık', category: 'opex', valueType: 'amount', allocationScope: { type: 'global' } },
    { id: 4, name: 'İnternet & Faturalar', amount: 2400, frequency: 'Aylık', category: 'opex', valueType: 'amount', allocationScope: { type: 'global' } },
    { id: 'aws-cloud', name: 'AWS Sunucu Hizmetleri', amount: 3420, frequency: 'Aylık', category: 'opex', valueType: 'amount', currency: 'USD', originalAmount: 100, exchangeRate: 34.20, allocationScope: { type: 'channel', target: 'Web Sitesi' } },
    { id: 'ikas-platform', name: 'Ikas Altyapı Ücreti', amount: 3500, frequency: 'Aylık', category: 'opex', valueType: 'amount', allocationScope: { type: 'channel', target: 'Web Sitesi' } },

    // SPECIAL (Example for Category Scope)
    { id: 'packaging', name: 'Özel Ambalaj Gideri', amount: 1500, frequency: 'Aylık', category: 'opex', valueType: 'amount', allocationScope: { type: 'category', target: 'Hassas Ürünler' } },

    // FINANCE
    { id: 5, name: 'Muhasebe Ücreti', amount: 3500, frequency: 'Aylık', category: 'opex', valueType: 'amount', allocationScope: { type: 'global' } },
    { id: 8, name: 'Kredi Faiz Gideri', amount: 4500, frequency: 'Aylık', category: 'finance', valueType: 'amount', allocationScope: { type: 'global' } },

    // CAPEX
    { id: 6, name: 'Sunucu Maliyetleri', amount: 12000, frequency: 'Aylık', category: 'capex', valueType: 'amount', allocationScope: { type: 'global' } },

    // TAX
    { id: 9, name: 'Kurumlar Vergisi', amount: 25, frequency: 'Aylık', category: 'tax', valueType: 'percentage', percentageBase: 'net_profit', allocationScope: { type: 'global' } },
    { id: 10, name: 'Kira Stopajı', amount: 25, frequency: 'Aylık', category: 'tax', valueType: 'percentage', percentageBase: 'rent', allocationScope: { type: 'global' } },
    { id: 11, name: 'Muhtasar Beyanname', amount: 3500, frequency: 'Aylık', category: 'tax', valueType: 'amount', allocationScope: { type: 'global' } },
    { id: 12, name: 'SGK Primleri', amount: 18500, frequency: 'Aylık', category: 'tax', valueType: 'amount', allocationScope: { type: 'global' } },
    { id: 'tax-kdv', name: 'Satış KDV Yükümlülüğü', amount: "1, 10, 20", frequency: 'Aylık', category: 'tax', valueType: 'percentage', percentageBase: 'sales', allocationScope: { type: 'global' } },
];

export const calculateDailyExpense = (expense) => {
    if (expense.valueType !== 'amount') return 0;
    const amount = Number(expense.amount || 0);
    const freq = (expense.frequency || 'Aylık').toLowerCase();
    
    if (freq.includes('yıllık') || freq.includes('yillik') || freq.includes('annual')) {
        return amount / 365;
    } else if (freq.includes('haftalık') || freq.includes('haftalik') || freq.includes('weekly')) {
        return amount / 7;
    } else if (freq.includes('günlük') || freq.includes('gunluk') || freq.includes('daily')) {
        return amount;
    }
    // Default fallback is Monthly (Aylık)
    return amount / 30;
};
