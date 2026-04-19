import React, { useMemo } from 'react';
import { calculateDailyExpense } from '../data/expensesData';

export const useComputedProducts = ({
    fetchedProducts,
    filteredOrders,
    filteredOrdersPrev,
    ga,
    globalGa,
    dateStart,
    dateEnd,
    globalStart,
    globalEnd,
    globalTotalDays,
    expensesData,
    productCosts
}) => {
    return useMemo(() => {
        if (!fetchedProducts || fetchedProducts.length === 0) {
            return { PRODUCTS: [], TABLE_PRODUCTS: [], totalSales: 0, totalCOGS: 0, totalShipping: 0, totalCommission: 0, totalTax: 0, totalFixedCost: 0, totalReturnAmt: 0, totalReturnQty: 0, TOTAL_AD_BUDGET: 0 };
        }

        // -------------------------------------------------------------
        // PRE-PASS: Calculate Macro Totals & Overheads For 100% ABC Accuracy
        // -------------------------------------------------------------
        let sumSales = 0, sumCOGS = 0, sumRetAmt = 0, sumRetQty = 0;
        let sumShipping = 0, sumCommission = 0, sumTax = 0;

        filteredOrders.forEach(order => {
            const isReturn = order.statusObj?.label === 'İade' || order.statusObj?.label === 'İptal' || order.statusObj?.label === 'CANCELLED' || order.statusObj?.label === 'REFUNDED';
            if (isReturn) {
                sumRetAmt += Math.abs(order.revenue || 0);
                sumRetQty += order.quantity || 1;
                sumShipping += order.shipping || 0;
            } else {
                sumSales += order.revenue || 0;
                sumCOGS += order.cogs || 0;
                sumShipping += order.shipping || 0;
                sumCommission += order.commission || 0;
                sumTax += order.tax || 0;
            }
        });

        const _diffDays = Math.max(1, Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24)));
        let sumProratedShared = 0;
        let sumProratedIkasOnly = 0;

        expensesData.filter(e => e.valueType === 'amount' && e.category !== 'tax' && e.category !== 'finance').forEach(e => {
            const expenseCost = calculateDailyExpense(e) * _diffDays;
            const isIkasInfra = e.id === 'aws-cloud' || e.id === 'ikas-platform' || (e.name || '').toLowerCase().includes('aws') || (e.name || '').toLowerCase().includes('altyapı');
            if (isIkasInfra) sumProratedIkasOnly += expenseCost;
            else sumProratedShared += expenseCost;
        });

        const proratedTaxAndFinance = expensesData
            .filter(e => e.valueType === 'amount' && (e.category === 'tax' || e.category === 'finance'))
            .reduce((sum, e) => sum + calculateDailyExpense(e), 0) * _diffDays;

        const TOTAL_SHARED_FIXED_OVERHEAD = sumProratedShared + proratedTaxAndFinance;
        const IKAS_ONLY_FIXED_OVERHEAD = sumProratedIkasOnly;

        const matchedOrderUids = new Set();
        const matchedPrevOrderUids = new Set();

        const enrichedRawProducts = fetchedProducts.map((p, idx) => {
            const pOrders = filteredOrders.filter(o => {
                if (matchedOrderUids.has(o._uid)) return false;
                let isMatch = false;
                if (o.sku && p.allSkus && p.allSkus.includes(String(o.sku))) isMatch = true;
                else if (o.sku && p.sku && String(o.sku) === String(p.sku)) isMatch = true;
                else if (o.productName && p.name) {
                    const safeO = String(o.productName).toLowerCase().trim();
                    const safeP = String(p.name).toLowerCase().trim();
                    if (safeO.includes(safeP) || safeP.includes(safeO)) isMatch = true;
                }
                if (isMatch) matchedOrderUids.add(o._uid);
                return isMatch;
            });

            const pOrdersPrev = filteredOrdersPrev.filter(o => {
                if (matchedPrevOrderUids.has(o._uid)) return false;
                let isMatch = false;
                if (o.sku && p.allSkus && p.allSkus.includes(String(o.sku))) isMatch = true;
                else if (o.sku && p.sku && String(o.sku) === String(p.sku)) isMatch = true;
                else if (o.productName && p.name) {
                    const safeO = String(o.productName).toLowerCase().trim();
                    const safeP = String(p.name).toLowerCase().trim();
                    if (safeO.includes(safeP) || safeP.includes(safeO)) isMatch = true;
                }
                if (isMatch) matchedPrevOrderUids.add(o._uid);
                return isMatch;
            });

            const stats = { unitsSold: 0, revenue: 0, returns: 0, returnAmt: 0, cogs: 0, shipping: 0, commission: 0, tax: 0 };
            pOrders.forEach(o => {
                const qty = o.quantity || 1;
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'İptal' || o.statusObj?.label === 'CANCELLED' || o.statusObj?.label === 'REFUNDED';
                if (isReturn) {
                    stats.returns += qty;
                    stats.returnAmt += Math.abs(o.revenue || 0);
                    stats.shipping += o.shipping || 0;
                } else {
                    stats.revenue += o.revenue || 0;
                    stats.cogs += o.cogs || 0;
                    stats.shipping += o.shipping || 0;
                    stats.commission += o.commission || 0;
                    stats.tax += o.tax || 0;
                }
                stats.unitsSold += qty;
            });

            const statsPrev = { unitsSold: 0, revenue: 0, returns: 0, returnAmt: 0, cogs: 0, shipping: 0, commission: 0, tax: 0 };
            pOrdersPrev.forEach(o => {
                const qty = o.quantity || 1;
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'İptal' || o.statusObj?.label === 'CANCELLED' || o.statusObj?.label === 'REFUNDED';
                if (isReturn) {
                    statsPrev.returns += qty;
                    statsPrev.returnAmt += Math.abs(o.revenue || 0);
                    statsPrev.shipping += o.shipping || 0;
                } else {
                    statsPrev.revenue += o.revenue || 0;
                    statsPrev.cogs += o.cogs || 0;
                    statsPrev.shipping += o.shipping || 0;
                    statsPrev.commission += o.commission || 0;
                    statsPrev.tax += o.tax || 0;
                }
                statsPrev.unitsSold += qty;
            });

            const actualUnits = stats.unitsSold;
            const unitsSold = actualUnits > 0 ? actualUnits : 0;
            const actualPrevUnits = statsPrev.unitsSold;
            const prevUnitsSold = actualPrevUnits > 0 ? actualPrevUnits : 0;

            const salesPrice = unitsSold > 0 ? stats.revenue / unitsSold : p.price;

            return {
                ...p,
                id: idx + 1,
                unitsSold,
                prevUnitsSold,
                salesPrice,
                cogs: stats.cogs || 0,
                shipping: stats.shipping || 0,
                commission: stats.commission || 0,
                tax: stats.tax || 0,
                prevCogs: statsPrev.cogs || 0,
                prevShipping: statsPrev.shipping || 0,
                prevCommission: statsPrev.commission || 0,
                prevTax: statsPrev.tax || 0,
                actualRevenue: stats.revenue,
                prevRevenue: statsPrev.revenue,
                returnQty: stats.returns,
                returnAmt: stats.returnAmt,
                channels: [],
                pOrders
            };
        });

        const TOTAL_UNITS = enrichedRawProducts.reduce((sum, p) => sum + p.unitsSold, 0) || 1;
        const TOTAL_PREV_UNITS = enrichedRawProducts.reduce((sum, p) => sum + p.prevUnitsSold, 0) || 1;
        const TOTAL_PREV_REVENUE = enrichedRawProducts.reduce((sum, p) => sum + (p.prevRevenue || 0), 0) || 1;

        let GLOBAL_TOTAL_UNITS = 0;
        let GLOBAL_TOTAL_REVENUE = 0;
        let GLOBAL_IKAS_REVENUE = 0;
        let GLOBAL_IKAS_UNITS = 0;
        
        // This array must come from original hook call - pass fetchedOrders as filteredOrders fallback if needed
        // Actually, we need ALL unfiltered orders here for global math
        // Let's add allOrders to hook args
        let allOrders = window._ALL_ORDERS || []; // Fallback, will be replaced by actual param
