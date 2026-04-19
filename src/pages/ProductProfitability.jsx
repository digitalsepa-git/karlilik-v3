
import React, { useState } from 'react';
import { ArrowUpDown, Download, AlertTriangle, Info, ChevronRight, ChevronDown, Layers, ShoppingBag, Globe, TrendingUp, Zap, RefreshCw, RefreshCcw, ArrowUpRight, BarChart2, Sparkles, AlertCircle, X, PauseCircle, Tag, Search, Package, Truck, Megaphone, CreditCard, CheckCircle, Database, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { PieChart, Pie, LineChart, Line, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ReferenceLine, Cell, Treemap, Sankey } from 'recharts';

// UP1 Fix: Deterministic sparkline — no Math.random(), stable across renders.
const generateSparklineData = (startValue, endValue) => {
    const steps = 30;
    const stepValue = (endValue - startValue) / steps;
    return Array.from({ length: steps }, (_, i) => ({
        day: i + 1,
        value: startValue + (stepValue * i) + Math.sin(i * 0.9) * (Math.abs(startValue || endValue || 1) * 0.08)
    }));
};

import { useData } from '../context/DataContext';
import { getFallbackProductImage } from '../hooks/useOrdersLive';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { expensesData, calculateDailyExpense } from '../data/expensesData';
import productCosts from '../data/productCosts.json';

export const ProductProfitability = ({ t, onConsultAI, filters = {} }) => {
    // Utility Formatting Functions
    const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val || 0);
    const formatNumber = (val) => new Intl.NumberFormat('tr-TR').format(val || 0);
    const formatCompact = (val) => {
        if (typeof val !== 'number') return '₺0';
        return `₺${val.toLocaleString('tr-TR', { notation: 'compact', maximumFractionDigits: 1 })}`;
    };

    // 1. Fetch Real Data from Context
    const { productsData, ordersData } = useData();
    const { products: fetchedProducts, loading: productsLoading } = productsData;
    const { orders: fetchedOrders, loading: ordersLoading } = ordersData;

    // DYNAMIC FILTERING & SORTING LOGIC
    const [sortConfig, setSortConfig] = React.useState({ key: 'margin', direction: 'desc' }); // Default: En Kârlı (Marj)
    const [searchQuery, setSearchQuery] = React.useState('');

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const activeCategory = filters.category || 'all';
    const activeChannel = filters.channel || 'all';
    const activeDateRange = filters.dateRange || 'last30';

    const getDateRangeBounds = (rangeFilter) => {
        const now = new Date();

        // Form strict TRT (UTC+3) midnight
        const trtNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const startOfTRTDay = new Date(Date.UTC(trtNow.getUTCFullYear(), trtNow.getUTCMonth(), trtNow.getUTCDate(), -3, 0, 0));
        const endOfTRTDay = new Date(startOfTRTDay.getTime() + (24 * 60 * 60 * 1000) - 1);

        switch (rangeFilter) {
            case 'thisMonth':
                return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: endOfTRTDay };
            case 'lastQuarter': {
                const m = now.getMonth();
                let startMonth, year = now.getFullYear();
                if (m === 11 || m === 0 || m === 1) { startMonth = 11; if (m !== 11) year -= 1; }
                else if (m >= 2 && m <= 4) startMonth = 2;
                else if (m >= 5 && m <= 7) startMonth = 5;
                else startMonth = 8;
                return { start: new Date(year, startMonth, 1), end: endOfTRTDay };
            }
            case 'thisYear':
                return { start: new Date(now.getFullYear(), 0, 1), end: endOfTRTDay };
            default:
                if (rangeFilter && rangeFilter.startsWith('custom:')) {
                    const parts = rangeFilter.split(':');
                    return { start: new Date(parts[1] + 'T00:00:00Z'), end: new Date(parts[2] + 'T23:59:59.999Z') };
                }
                return { start: new Date(startOfTRTDay.getTime() - 29 * 24 * 60 * 60 * 1000), end: endOfTRTDay };
        }
    };

    const { start: dateStart, end: dateEnd } = React.useMemo(() => getDateRangeBounds(activeDateRange), [activeDateRange]);
    const { data: ga, loading: gaLoading } = useGoogleAnalytics(dateStart.toISOString().split('T')[0], dateEnd.toISOString().split('T')[0]);

    // -----------------------------------------------------------------
    // Stable "Lifetime/90-Day" Basis for Unit Economics Buffer Pricing
    // -----------------------------------------------------------------
    const { start: globalStart, end: globalEnd, totalDays: globalTotalDays } = React.useMemo(() => {
        const now = new Date();
        const trtNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
        const endOfTRTDay = new Date(Date.UTC(trtNow.getUTCFullYear(), trtNow.getUTCMonth(), trtNow.getUTCDate(), 20, 59, 59));

        let oldestOrderDay = endOfTRTDay;
        if (fetchedOrders && fetchedOrders.length > 0) {
            oldestOrderDay = fetchedOrders.reduce((oldest, tx) => {
                if (!tx.dateRaw) return oldest;
                const d = new Date(tx.dateRaw);
                return d < oldest ? d : oldest;
            }, endOfTRTDay);
        }

        const absoluteMin = new Date(endOfTRTDay.getTime() - 30 * 24 * 60 * 60 * 1000); // Max 30 days lookback (Last 1 Month)
        const actualStart = oldestOrderDay < absoluteMin ? absoluteMin : oldestOrderDay;

        const spanDays = Math.max(1, Math.ceil((endOfTRTDay.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24)));
        return { start: actualStart, end: endOfTRTDay, totalDays: spanDays };
    }, [fetchedOrders]);

    const { data: globalGa } = useGoogleAnalytics(globalStart.toISOString().split('T')[0], globalEnd.toISOString().split('T')[0]);
    // -----------------------------------------------------------------

    const { filteredOrders, filteredOrdersPrev } = React.useMemo(() => {
        if (!fetchedOrders) return { filteredOrders: [], filteredOrdersPrev: [] };
        const durationMs = dateEnd.getTime() - dateStart.getTime();
        const prevEnd = new Date(dateStart.getTime() - 1);
        const prevStart = new Date(dateStart.getTime() - durationMs);

        const filterOrder = (tx, s, e) => {
            if (!tx.dateRaw) return false;
            // Since tx.dateRaw might be an empty string, handle standard checks. (Our mock populates it via hook).
            if (tx.dateRaw < s || tx.dateRaw > e) return false;

            const activeChLower = activeChannel?.toLowerCase() || 'all';
            const txChLower = tx.channel?.toLowerCase() || '';
            const chMatch = activeChLower === 'all' || txChLower === activeChLower || (activeChLower === 'web' && txChLower.includes('ikas'));
            const catMatch = activeCategory === 'all' || tx.category === activeCategory;
            return chMatch && catMatch;
        };

        const current = fetchedOrders.filter(tx => filterOrder(tx, dateStart, dateEnd));
        const prev = fetchedOrders.filter(tx => filterOrder(tx, prevStart, prevEnd));

        return { filteredOrders: current, filteredOrdersPrev: prev };
    }, [fetchedOrders, dateStart, dateEnd, activeChannel, activeCategory]);

    // 2. Dynamic Computation Block
    const computedData = React.useMemo(() => {
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

        // Derive ABC prorated fixed costs
        const _diffDays = Math.max(1, Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24)));
        
        // Isolate Ikas Only Expenses vs Shared Overheads
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
        // -------------------------------------------------------------

        const matchedOrderUids = new Set();
        const matchedPrevOrderUids = new Set();

        // First Pass: Enriched RAW Products with Sales Velocity
        const enrichedRawProducts = fetchedProducts.map((p, idx) => {
            
            // Match Current Orders exactly mapping SKUs and Variants
            const pOrders = filteredOrders.filter(o => {
                if (matchedOrderUids.has(o._uid)) return false;
                
                let isMatch = false;
                // 1. Strict SKU / Multi-Variant Matching
                if (o.sku && p.allSkus && p.allSkus.includes(String(o.sku))) isMatch = true;
                else if (o.sku && p.sku && String(o.sku) === String(p.sku)) isMatch = true;
                
                // 2. Fallback Loose Name Matching
                else if (o.productName && p.name) {
                    const safeO = String(o.productName).toLowerCase().trim();
                    const safeP = String(p.name).toLowerCase().trim();
                    if (safeO.includes(safeP) || safeP.includes(safeO)) isMatch = true;
                }
                
                if (isMatch) matchedOrderUids.add(o._uid);
                return isMatch;
            });

            // Match Previous Orders exactly mapping SKUs and Variants
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

            // Calculate aggregated global stats
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

            // Load real aggregated costs from orderStats properly summing KDV values
            const cogs = stats.cogs || 0;
            const shipping = stats.shipping || 0;
            const commission = stats.commission || 0;
            const tax = stats.tax || 0;

            const prevCogs = statsPrev.cogs || 0;
            const prevShipping = statsPrev.shipping || 0;
            const prevCommission = statsPrev.commission || 0;
            const prevTax = statsPrev.tax || 0;

            return {
                ...p,
                id: idx + 1,
                unitsSold,
                prevUnitsSold,
                salesPrice,
                cogs,
                shipping,
                commission,
                tax,
                prevCogs,
                prevShipping,
                prevCommission,
                prevTax,
                actualRevenue: stats.revenue,
                prevRevenue: statsPrev.revenue,
                returnQty: stats.returns,
                returnAmt: stats.returnAmt,
                channels: [],
                pOrders
            };
        });

        const TOTAL_UNITS = enrichedRawProducts.reduce((sum, p) => sum + p.unitsSold, 0) || 1; // Prevent DivBy0
        const TOTAL_PREV_UNITS = enrichedRawProducts.reduce((sum, p) => sum + p.prevUnitsSold, 0) || 1;
        const TOTAL_PREV_REVENUE = enrichedRawProducts.reduce((sum, p) => sum + (p.prevRevenue || 0), 0) || 1;

        // -------------------------------------------------------------
        // NEW: "Son 3 Aylık / Eldeki Tüm Veri" Sabit & Reklam Payı Hesaplaması
        // (De-coupled from the active UI Date Dropdown filter)
        // -------------------------------------------------------------
        let GLOBAL_TOTAL_UNITS = 0;
        let GLOBAL_TOTAL_REVENUE = 0;
        let GLOBAL_IKAS_REVENUE = 0;
        let GLOBAL_TOTAL_COGS = 0;
        let GLOBAL_IKAS_COGS = 0;
        let GLOBAL_IKAS_UNITS = 0;
        
        let rawChannelMets = {
            ikas: { revenue: 0, cogs: 0, commission: 0, shipping: 0, tax: 0, sales: 0, name: 'Web', color: 'bg-indigo-500', icon: '🟣', id: 'ikas' },
            trendyol: { revenue: 0, cogs: 0, commission: 0, shipping: 0, tax: 0, sales: 0, name: 'Trendyol', color: 'bg-orange-500', icon: '🟠', id: 'trendyol' }
        };

        fetchedOrders.forEach(o => {
            if (!o.dateRaw) return;
            const d = new Date(o.dateRaw);
            if (d >= globalStart && d <= globalEnd) {
                const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'İptal' || o.statusObj?.label === 'CANCELLED' || o.statusObj?.label === 'REFUNDED';
                if (!isReturn) {
                    const qty = o.quantity || 1;
                    const cogsAmount = o.cogs || 0;
                    GLOBAL_TOTAL_UNITS += qty;
                    GLOBAL_TOTAL_REVENUE += (o.revenue || 0);
                    GLOBAL_TOTAL_COGS += cogsAmount;
                    
                    const chLower = o.channel?.toLowerCase() || '';
                    const isIkas = chLower.includes('web') || chLower.includes('ikas');
                    const isTy = chLower.includes('trendyol');

                    if (isIkas) {
                        GLOBAL_IKAS_REVENUE += (o.revenue || 0);
                        GLOBAL_IKAS_COGS += cogsAmount;
                        GLOBAL_IKAS_UNITS += qty;
                    }

                    const target = isIkas ? rawChannelMets.ikas : (isTy ? rawChannelMets.trendyol : null);
                    if (target) {
                        target.revenue += (o.revenue || 0);
                        target.cogs += cogsAmount;
                        target.commission += (o.commission || 0);
                        target.shipping += (o.shipping || o.shippingCost || 0);
                        target.tax += (o.tax || 0);
                        target.sales += qty;
                    }
                }
            }
        });
        GLOBAL_TOTAL_UNITS = Math.max(1, GLOBAL_TOTAL_UNITS); // Prevent DivBy0
        GLOBAL_TOTAL_REVENUE = Math.max(1, GLOBAL_TOTAL_REVENUE);
        GLOBAL_IKAS_REVENUE = Math.max(1, GLOBAL_IKAS_REVENUE);
        GLOBAL_TOTAL_COGS = Math.max(1, GLOBAL_TOTAL_COGS);
        GLOBAL_IKAS_COGS = Math.max(1, GLOBAL_IKAS_COGS);
        GLOBAL_IKAS_UNITS = Math.max(1, GLOBAL_IKAS_UNITS);

        const GLOBAL_AD_BUDGET = globalGa?.totalAdCost || 0;

        const GLOBAL_TOTAL_FIXED = expensesData
            .filter(e => e.valueType === 'amount')
            .reduce((sum, e) => sum + calculateDailyExpense(e), 0) * globalTotalDays; // Not actually used for unit economics further down

        // YÖNTEM 1: Reklam Gider Payı (Ikas Cirosu üstünden hesaplanmış % Oran - Ciro Rasyosu Maliyete Çarpılacak)
        // Dönemlik Filtrelenmiş Reklam Bütçesi
        const TOTAL_AD_BUDGET = ga?.totalAdCost || 0;
        const globalAdRatio = GLOBAL_IKAS_REVENUE > 0 ? (TOTAL_AD_BUDGET / GLOBAL_IKAS_REVENUE) : 0;
        
        // YÖNTEM 2: Şirket Gider Payını (CİROYA % OLARAK ORANLIYORUZ - Bulunan yüzdeliği Maliyetle Çarpıyoruz)
        // Kullanıcı isteğine göre Şirket Gider Rasyosu "Toplam Gider / Toplam Ciro" alınır, ürüne basılırken "Rasyo * Maliyet" yapılır.
        const globalSharedFixedRatio = TOTAL_SHARED_FIXED_OVERHEAD / GLOBAL_TOTAL_REVENUE;
        const globalIkasOnlyFixedRatio = IKAS_ONLY_FIXED_OVERHEAD / GLOBAL_IKAS_REVENUE;
        const globalIkasFullFixedRatio = globalSharedFixedRatio + globalIkasOnlyFixedRatio;
        const globalFixedRatio = globalIkasFullFixedRatio; // Keep variable assignment intact for broad reference

        // Kanal Bazlı ABC Hesaplaması 
        const calcChannelProfit = (mets, adRatio, sharedRatio, ikasRatio = 0) => {
            const ad = adRatio * mets.cogs;
            const fixed = (sharedRatio * mets.cogs) + (ikasRatio * mets.cogs);
            const netProfit = mets.revenue - mets.cogs - mets.shipping - mets.commission - mets.tax - ad - fixed;
            const margin = mets.revenue > 0 ? (netProfit / mets.revenue) * 100 : 0;
            return {
                ...mets,
                ad,
                fixed,
                netProfit,
                margin
            };
        };

        const channelMetrics = [
            calcChannelProfit(rawChannelMets.trendyol, 0, globalSharedFixedRatio, 0),
            calcChannelProfit(rawChannelMets.ikas, globalAdRatio, globalSharedFixedRatio, globalIkasOnlyFixedRatio)
        ];

        // For Previous scope comparison (mock tracking similar logic if needed)
        const TOTAL_PREV_AD_BUDGET = ga?.prevTotalAdCost || TOTAL_AD_BUDGET;

        const prevGlobalUnitAdCost = TOTAL_PREV_AD_BUDGET / Math.max(1, TOTAL_PREV_UNITS);
        const prevGlobalFixedRatio = TOTAL_SHARED_FIXED_OVERHEAD / Math.max(1, TOTAL_PREV_REVENUE); // Placeholder
        // -------------------------------------------------------------

        // Second Pass: Computed Products with mathematically strict Allocation
        const computedProducts = enrichedRawProducts.map(product => {
            // Ikas bazlı Maliyet ve Adet bulma (Reklam sadece ona orantılı dağılır, altyapı ona verilir)
            let productIkasRev = 0;
            let productIkasCogs = 0;
            if (product.pOrders) {
                product.pOrders.forEach(o => {
                    const chLower = o.channel?.toLowerCase() || '';
                    const isIkasOrWeb = chLower.includes('web') || chLower.includes('ikas');
                    if (isIkasOrWeb && o.statusObj?.label !== 'İade' && o.statusObj?.label !== 'İptal' && o.statusObj?.label !== 'CANCELLED' && o.statusObj?.label !== 'REFUNDED') {
                        productIkasRev += (o.revenue || 0);
                        productIkasCogs += (o.cogs || 0);
                    }
                });
            }

            // REKLAM (Sadece Ikas Maliyeti Üstünden), SABİT GİDER (Maliyet Oranı Tümü + Sadece Ikas Altyapı Maliyet Oranı)
            const allocatedAdBudget = globalAdRatio * productIkasCogs;
            const allocatedFixed = (globalSharedFixedRatio * product.cogs) + (globalIkasOnlyFixedRatio * productIkasCogs);

            // Önceki dönem değişkenleri
            const prevGlobalUnitAdCost = TOTAL_PREV_AD_BUDGET / Math.max(1, TOTAL_PREV_UNITS);
            
            const prevAllocatedAdBudget = prevGlobalUnitAdCost * product.prevUnitsSold;
            // Eski veri mimarisini bozmamak adına prevFixed approximate
            const prevAllocatedFixed = prevGlobalFixedRatio * (product.actualRevenue || 0);

            // Tampon Fiyat (Buffer Price - Break-Even) Maktu hesap
            let bufferPrice = 0;
            if (product.unitsSold > 0 && product.actualRevenue > 0) {
                const unitSmm = product.cogs / product.unitsSold;
                const unitShipping = product.shipping / product.unitsSold;
                const unitFixed = allocatedFixed / product.unitsSold;
                const unitAd = allocatedAdBudget / product.unitsSold;
                
                // Komisyon fiyata orantılıdır (Blended rate)
                const blended_c_rate = product.commission / product.actualRevenue;
                
                // Tam Cebirsel Break-Even Çözümü (Vergi / 6 Input Mahsuplaşması Dahil)
                // P(1-C) = SMM + KARGO + REKLAM(sabit) + GIDER(sabit) 
                // Reklam ve Şirket gideri SMM bazlı olduğu için fiyata bağımlı esnemezler.
                const bufferNumerator = unitSmm + unitShipping + (1.2 * unitAd) + (1.2 * unitFixed);
                const bufferDenominator = 1 - blended_c_rate;
                
                bufferPrice = bufferDenominator > 0 ? (bufferNumerator / bufferDenominator) : 0;
            }

            // Full Absorption logic for Unit Economics table (including Fixed Overhead) so the table visually balances
            const totalVariableCosts = product.cogs + product.shipping + product.commission + product.tax + allocatedAdBudget + allocatedFixed;
            const prevTotalVariableCosts = product.prevCogs + product.prevShipping + product.prevCommission + product.prevTax + prevAllocatedAdBudget;

            // True corporate profit for this specific underlying product matching exactly the Dashboard scale
            const netProfit = product.actualRevenue - totalVariableCosts;
            const netProfitPerUnit = product.unitsSold > 0 ? netProfit / product.unitsSold : 0;

            const margin = product.actualRevenue !== 0 ? (netProfit / product.actualRevenue) * 100 : 0;

            const currentTotalProfit = netProfit;
            const prevTotalProfit = product.prevRevenue - prevTotalVariableCosts;
            const prevNetProfitPerUnit = product.prevUnitsSold > 0 ? (prevTotalProfit / product.prevUnitsSold) : 0;

            const trendValue = currentTotalProfit - prevTotalProfit;
            let trendPercent = 0;
            if (prevTotalProfit !== 0) {
                trendPercent = (trendValue / Math.abs(prevTotalProfit)) * 100;
            } else if (trendValue > 0) {
                trendPercent = 100;
            } else if (trendValue < 0) {
                trendPercent = -100;
            }

            const trendUnits = product.unitsSold - product.prevUnitsSold;
            let trendUnitsPercent = 0;
            if (product.prevUnitsSold > 0) {
                trendUnitsPercent = (trendUnits / Math.abs(product.prevUnitsSold)) * 100;
            } else if (trendUnits > 0) {
                trendUnitsPercent = 100;
            } else if (trendUnits < 0) {
                trendUnitsPercent = -100;
            }

            // Dynamic Diagnosis Engine for the Trend Modal
            let diagnosis = null;
            if (trendValue < 0) {
                if (allocatedAdBudget > (product.actualRevenue * 0.2)) {
                    diagnosis = {
                        type: 'high_cpa',
                        badge: 'Yüksek Reklam',
                        actionLabel: 'Reklam Analizi',
                        actionTooltip: 'Reklam harcaması ciroya oranla çok yüksek. ACOS/ROAS optimizasyonu önerilir.',
                        actionColor: 'red',
                        actionIcon: AlertCircle
                    };
                } else if (trendUnits < 0) {
                    diagnosis = {
                        type: 'volume_drop',
                        badge: 'Hacim Düşüşü',
                        actionLabel: 'Kampanya Öner',
                        actionTooltip: 'Geçen aya göre satış adetlerinde daralma var. Bundle kurgusu gerekebilir.',
                        actionColor: 'blue',
                        actionIcon: Package
                    };
                } else if (margin < 15) {
                    diagnosis = {
                        type: 'low_margin',
                        badge: 'Kâr Marjı Daralması',
                        actionLabel: 'Fiyat Simülasyonu',
                        actionTooltip: 'Operasyon maliyetleri marjı yutuyor. Fiyat artırma esnekliği test edilmeli.',
                        actionColor: 'amber',
                        actionIcon: TrendingUp
                    };
                }
            }

            return {
                ...product,
                totalVariableCosts,
                adSpend: allocatedAdBudget,
                allocatedAdBudget,
                totalAdBudget: TOTAL_AD_BUDGET,
                netProfit: netProfitPerUnit,
                actualNetProfit: netProfit,
                margin,
                channelDetails: product.channels,
                trendValue,
                trendPercent,
                lastMonthProfit: prevTotalProfit,
                lastMonthUnits: product.prevUnitsSold,
                trendUnits,
                trendUnitsPercent,
                sparklineData: generateSparklineData(prevNetProfitPerUnit, netProfit),
                fixedCost: allocatedFixed,
                bufferPrice,
                diagnosis
            };
        });

        // Third Pass: Table Products
        const tableProducts = computedProducts.map(p => {
            const returnQty = p.returnQty;
            const returnAmt = p.returnAmt;
            const totalProductRev = p.actualRevenue;

            const productSku = p.sku || `SKU-${p.name ? p.name.substring(0, 6) : 'DEFAULT'}`;
            const fallbackCost = productCosts[productSku] || productCosts["DEFAULT"];

            // Compute per unit costs for the table (table columns denote `/Birim`)
            const computeRow = (units, salesPrice, cogs, shipping, commission, allocatedAd, allocatedFixed, isTrendyol) => {
                let _cunit = 0; let _sunit = 0; let _comunit = 0; let _aunit = 0; 
                let _taxunit = 0; let _fixedunit = 0; let _finalMargin = 0; let _finalUnitNetProfit = 0; let _finalBufferPrice = 0;

                if (units > 0) {
                    _cunit = cogs / units;
                    _sunit = shipping / units;
                    
                    // SABİTLENMİŞ KOMİSYON ORANI %2 Ikas vs %15 Trendyol
                    _comunit = isTrendyol ? (salesPrice * 0.15) : (salesPrice * 0.02);
                    
                    // REKLAM HARCAMASI SADECE IKASA BÖLÜŞTÜRÜLDÜ - SMM (COGS) ORANIYLA
                    _aunit = isTrendyol ? 0 : (_cunit * globalAdRatio);
                    
                    // SABİT GİDER SMM (COGS) ÜZERİNDEN YÜZDESEL ORANLANIR! TREDNYOL'DA IKAS ALTYAPISI HARİÇ.
                    const currentFixedRatio = isTrendyol ? globalSharedFixedRatio : globalIkasFullFixedRatio;
                    _fixedunit = _cunit * currentFixedRatio;
                    
                    const kdvRate = 0.20;
                    const outputVat = salesPrice - (salesPrice / (1 + kdvRate));
                    const cogsVat = _cunit - (_cunit / (1 + kdvRate));
                    const shippingVat = _sunit - (_sunit / (1 + kdvRate));
                    const commissionVat = _comunit - (_comunit / (1 + kdvRate));
                    _taxunit = Math.max(0, outputVat - cogsVat - shippingVat - commissionVat);
                    
                    const c_rate = isTrendyol ? 0.15 : 0.02;
                    
                    // Ürün SMM (COGS) bağlı hesaplanan Reklam ve Sabit Gider tutarı (Örn: 950 TL) sabittir.
                    // Algebrası şuna evrilir: P(1 - c) = SMM + Kargo + 1.2(Reklam) + 1.2(Gider)
                    const bufferNumerator = _cunit + _sunit + (1.2 * _aunit) + (1.2 * _fixedunit);
                    const bufferDenominator = 1 - c_rate;
                    _finalBufferPrice = bufferDenominator > 0 ? (bufferNumerator / bufferDenominator) : 0;
                    
                    const hypotheticalCosts = _cunit + _sunit + _comunit + _taxunit + _aunit + _fixedunit;
                    _finalUnitNetProfit = salesPrice - hypotheticalCosts;
                    _finalMargin = (_finalUnitNetProfit / salesPrice) * 100;
                } else {
                    _cunit = Math.round(salesPrice * 0.25);
                    _sunit = fallbackCost.shipping;
                    
                    // SABİTLENMİŞ KOMİSYON ORANI %2 Ikas vs %15 Trendyol
                    _comunit = isTrendyol ? (salesPrice * 0.15) : (salesPrice * 0.02);

                    const kdvRate = 0.20;
                    const outputVat = salesPrice - (salesPrice / (1 + kdvRate));
                    const cogsVat = _cunit - (_cunit / (1 + kdvRate));
                    const shippingVat = _sunit - (_sunit / (1 + kdvRate));
                    const commissionVat = _comunit - (_comunit / (1 + kdvRate));
                    _taxunit = Math.max(0, outputVat - cogsVat - shippingVat - commissionVat);

                    // REKLAM HARCAMASI SADECE IKASA BÖLÜŞTÜRÜLDÜ - SMM ORANIYLA
                    _aunit = isTrendyol ? 0 : (_cunit * globalAdRatio);
                    
                    // SABİT GİDER SMM (COGS) ÜZERİNDEN YÜZDESEL ORANLANIR! TREDNYOL'DA IKAS ALTYAPISI HARİÇ.
                    const currentFixedRatio = isTrendyol ? globalSharedFixedRatio : globalIkasFullFixedRatio;
                    _fixedunit = _cunit * currentFixedRatio;

                    const c_rate = isTrendyol ? 0.15 : 0.02;
                    
                    // Ürün SMM (COGS) bağlı hesaplanan Reklam ve Sabit Gider tutarı sabittir.
                    // Algebrası şuna evrilir: P(1 - c) = SMM + Kargo + 1.2(Reklam) + 1.2(Gider)
                    const bufferNumerator = _cunit + _sunit + (1.2 * _aunit) + (1.2 * _fixedunit);
                    const bufferDenominator = 1 - c_rate;
                    _finalBufferPrice = bufferDenominator > 0 ? (bufferNumerator / bufferDenominator) : 0;

                    const hypotheticalCosts = _cunit + _sunit + _comunit + _taxunit + _aunit + _fixedunit;
                    _finalUnitNetProfit = salesPrice - hypotheticalCosts;
                    _finalMargin = (_finalUnitNetProfit / salesPrice) * 100;
                }
                return { cunit:_cunit, sunit:_sunit, comunit:_comunit, aunit:_aunit, taxunit:_taxunit, fixedunit:_fixedunit, finalMargin:_finalMargin, finalUnitNetProfit:_finalUnitNetProfit, finalBufferPrice:_finalBufferPrice };
            };

            // Calculate Trendyol metrics decoupled from global stats
            // We can just reuse pOrders and filter by channel! This saves us another loop visually!
            let tyUnitsRaw = 0; let tyRevRaw = 0; let tyCogsRaw = 0; 
            let tyShipRaw = 0; let tyCommRaw = 0; let tyTaxRaw = 0;
            if (p.pOrders) {
                p.pOrders.forEach(o => {
                    if (o.channel?.toLowerCase().includes('trendyol')) {
                    const isReturn = o.statusObj?.label === 'İade' || o.statusObj?.label === 'İptal' || o.statusObj?.label === 'CANCELLED' || o.statusObj?.label === 'REFUNDED';
                    const qty = o.quantity || 1;
                    if (isReturn) {
                        tyShipRaw += o.shipping || 0;
                    } else {
                        tyRevRaw += o.revenue || 0;
                        tyCogsRaw += o.cogs || 0;
                        tyShipRaw += o.shipping || 0;
                        tyCommRaw += o.commission || 0;
                        tyTaxRaw += o.tax || 0;
                    }
                    tyUnitsRaw += qty;
                }
            });
            }

            // Derive Ikas absolute counts
            let ikasUnits = Math.max(0, p.unitsSold - tyUnitsRaw);
            let ikasRev = Math.max(0, p.actualRevenue - tyRevRaw);
            let ikasCogs = Math.max(0, p.cogs - tyCogsRaw);
            let ikasShip = Math.max(0, p.shipping - tyShipRaw);
            let ikasComm = Math.max(0, p.commission - tyCommRaw);
            
            const ikasAd = ikasUnits > 0 ? (ikasUnits / p.unitsSold) * p.adSpend : 0;
            const ikasFixed = ikasRev > 0 ? (ikasRev / p.actualRevenue) * p.fixedCost : 0;
            const tyAd = tyUnitsRaw > 0 ? (tyUnitsRaw / p.unitsSold) * p.adSpend : 0;
            const tyFixed = tyRevRaw > 0 ? (tyRevRaw / p.actualRevenue) * p.fixedCost : 0;
            
            const salesPriceIkas = ikasUnits > 0 ? ikasRev / ikasUnits : p.salesPrice;
            const salesPriceTy = tyUnitsRaw > 0 ? tyRevRaw / tyUnitsRaw : p.salesPrice;

            const mainRow = computeRow(ikasUnits, salesPriceIkas, ikasCogs, ikasShip, ikasComm, ikasAd, ikasFixed, false);
            const tyRow = computeRow(tyUnitsRaw, salesPriceTy, tyCogsRaw, tyShipRaw, tyCommRaw, tyAd, tyFixed, true);

            // Değişken kalemleri (Kargo + Komisyon) Operasyonel Giderler olarak grupla
            const unitOperasyonelGiderler = mainRow.sunit + mainRow.comunit;

            return {
                ...p,
                price: p.salesPrice, // Used strictly for display fallback
                salesPrice: salesPriceIkas, // Overwrite underlying price for Ikas view
                cogs: mainRow.cunit,
                shipping: mainRow.sunit,
                commission: mainRow.comunit,
                operasyonelGiderler: unitOperasyonelGiderler,
                fixedCost: mainRow.fixedunit,
                ads: mainRow.aunit,
                tax: mainRow.taxunit,
                unitNetProfit: mainRow.finalUnitNetProfit,
                bufferPrice: mainRow.finalBufferPrice,
                margin: mainRow.finalMargin,
                trendyolMetrics: {
                    price: salesPriceTy,
                    cogs: tyRow.cunit,
                    shipping: tyRow.sunit,
                    commission: tyRow.comunit,
                    fixedCost: tyRow.fixedunit,
                    ads: tyRow.aunit,
                    tax: tyRow.taxunit,
                    unitNetProfit: tyRow.finalUnitNetProfit,
                    bufferPrice: tyRow.finalBufferPrice,
                    margin: tyRow.finalMargin
                }
            };
        });

        // 3. SOrt Table Products based on dynamic UI selection
        // Sorting moved outside of this heavy useMemo to respect sortConfig without re-computing everything.

        return {
            channelMetrics,
            PRODUCTS: computedProducts,
            TABLE_PRODUCTS: tableProducts,
            totalSales: sumSales,
            totalCOGS: sumCOGS,
            totalShipping: sumShipping,
            totalCommission: sumCommission,
            totalTax: sumTax,
            totalFixedCost: TOTAL_SHARED_FIXED_OVERHEAD + IKAS_ONLY_FIXED_OVERHEAD,
            totalReturnAmt: sumRetAmt,
            totalReturnQty: sumRetQty,
            TOTAL_AD_BUDGET
        };
    }, [fetchedProducts, filteredOrders, filteredOrdersPrev, ga, dateStart, dateEnd]);

    const { channelMetrics, PRODUCTS, TABLE_PRODUCTS, totalSales, totalCOGS, totalShipping, totalCommission, totalTax, totalFixedCost, totalReturnAmt, totalReturnQty, TOTAL_AD_BUDGET } = computedData;
    
    const sortedTableProducts = React.useMemo(() => {
        const sorted = [...TABLE_PRODUCTS].filter(p => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (p.name && p.name.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
        });

        sorted.sort((a, b) => {
            const getSortValue = (item) => {
                switch (sortConfig.key) {
                    case 'price': return item.price;
                    case 'cogs': return item.cogs;
                    case 'shipping': return item.shipping;
                    case 'commission': return item.commission;
                    case 'fixedCost': return item.fixedCost;
                    case 'ads': return item.ads;
                    case 'tax': return item.tax;
                    case 'margin': return item.margin;
                    case 'unitNetProfit': return item.unitNetProfit;
                    case 'revenue': default: return item.actualRevenue || 0;
                }
            };

            const aVal = getSortValue(a);
            const bVal = getSortValue(b);

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [TABLE_PRODUCTS, sortConfig, searchQuery]);

    const [selectedExpense, setSelectedExpense] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- Pagination Logic (UP3 fix: uses TABLE_PRODUCTS) ---
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedTableProducts.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(sortedTableProducts.length / rowsPerPage);

    const changePage = (direction) => {
        if (direction === -1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        } else if (direction === 1 && currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const updateRowsPerPage = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // --- Summary Calculations (UP3+UP7 fix: computed from TABLE_PRODUCTS real data) ---
    const totalQty = TABLE_PRODUCTS.reduce((sum, item) => sum + item.sold, 0);
    const totalRevenue = TABLE_PRODUCTS.reduce((sum, item) => sum + item.revenue, 0);
    const totalNetProfit = TABLE_PRODUCTS.reduce((sum, item) => sum + item.netProfitTotal, 0);
    const totalNetRevenue = totalRevenue - totalReturnAmt;
    const avgMargin = totalNetRevenue !== 0 ? (totalNetProfit / totalNetRevenue) * 100 : 0;

    const [showTrendModal, setShowTrendModal] = useState(false);
    const [trendModalTab, setTrendModalTab] = useState('winners');
    const [trendMetric, setTrendMetric] = useState('profit'); // Widget toggle
    const [modalMetric, setModalMetric] = useState('profit'); // Modal toggle independent
    const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
    const [isLossModalOpen, setIsLossModalOpen] = useState(false);
    const [isMerModalOpen, setIsMerModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);


    // --- Derived Top Card Modals Metrics --- 
    const marginTarget = 18.0; // Fixed Target %
    const marginAnalysisStats = React.useMemo(() => {
        const netProfitRatio = totalSales > 0 ? (totalNetProfit / totalSales) * 100 : 0;
        const cogsRatio = totalSales > 0 ? ((totalCOGS || 0) / totalSales) * 100 : 0;
        const adsRatio = totalSales > 0 ? ((TOTAL_AD_BUDGET || 0) / totalSales) * 100 : 0;
        const totalOps = PRODUCTS.reduce((sum, p) => sum + (p.shipping || 0) + (p.commission || 0) + (p.fixedCost || 0), 0);
        const opsRatio = totalSales > 0 ? (totalOps / totalSales) * 100 : 0;

        const worstMargins = [...PRODUCTS]
            .filter(p => p.salesPrice > 0)
            .sort((a, b) => a.margin - b.margin)
            .slice(0, 3)
            .map(p => ({
                id: p.id,
                name: p.name,
                image: p.img || getFallbackProductImage(p.name),
                margin: p.margin,
                reason: p.netProfit < 0 ? (p.adSpend > (p.actualRevenue * 0.3) ? "Yüksek Reklam Maliyeti" : "Düşük Brüt Marj / Kargo") : "Ortalama Altı Marj"
            }));

        return { netProfitRatio, cogsRatio, adsRatio, opsRatio, worstMargins };
    }, [PRODUCTS, totalSales, totalNetProfit, totalCOGS, TOTAL_AD_BUDGET]);

    const lossProductsStats = React.useMemo(() => {
        const losers = PRODUCTS.filter(p => p.netProfit < 0).sort((a, b) => a.netProfit - b.netProfit);
        const totalLossAmount = losers.reduce((sum, p) => sum + Math.abs(p.netProfitTotal), 0);
        return { count: losers.length, totalLossAmount, items: losers };
    }, [PRODUCTS]);

    const returnProductsStats = React.useMemo(() => {
        const returnedProducts = PRODUCTS
            .filter(p => p.returnQty > 0)
            .sort((a, b) => b.returnAmt - a.returnAmt)
            .slice(0, 5);
        return { items: returnedProducts };
    }, [PRODUCTS]);


    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleAIConsultation = (product, diagnosisType) => {
        if (!onConsultAI) return;

        let prompt = "";
        // Define calculation variables for prompts (Mock logic for now, using hardcoded or derived values)
        const currentMargin = product.margin ? Math.round(product.margin) : 15;
        const returnRate = 12; // Example fixed value as per mock data scenarios

        switch (diagnosisType) {
            case 'profit_drop':
                prompt = `"${product.name}" ürünü hala kar ediyor (Toplam Kar: ₺${Math.round(product.netProfit * product.unitsSold).toLocaleString()}) ancak geçen aya göre ciddi bir düşüş trendinde (-₺${Math.abs(Math.round(product.trendValue)).toLocaleString()}). Bu erimeyi durdurmak için ne yapmalıyım? Rakiplerin olası hamlelerini ve benim alabileceğim önlemleri (paketleme, reklam optimizasyonu vb.) listele.`;
                break;
            case 'high_cpa':
                prompt = `"${product.name}" ürünü için reklam maliyetleri (CPA) kritik seviyede görünüyor. Mevcut kampanyayı durdurmalı mıyım, yoksa negatif kelime veya hedefleme optimizasyonu ile kurtarabilir miyiz? Verilerimi analiz et.`;
                break;
            case 'volume_drop':
                prompt = `"${product.name}" ürününün satış hızı son ayda ciddi oranda düştü. Stok maliyetini azaltmak ve nakit akışı sağlamak için markama zarar vermeyecek agresif bir eritme (clearance) kampanyası kurgula.`;
                break;
            case 'low_margin':
                prompt = `"${product.name}" ürününde kar marjım sürdürülemez seviyede (%${currentMargin}). Kârlılığı güvenle artırabilmem için uygun fiyat artış stratejilerini veya maliyet optimizasyonu fikirlerini analiz et. Rakiplere göre fiyat konumlandırmamı gözden geçir.`;
                break;
            case 'high_returns':
                prompt = `"${product.name}" ürününün iade oranı %${returnRate} seviyesine çıktı. Müşteri yorumlarını ve iade nedenlerini analiz ederek, tedarikçiyle konuşmam gereken kalite kontrol maddelerini listele.`;
                break;

            case 'demand_drop':
                prompt = `"${product.name}" ürününün satış adetleri düşüyor (Trend: ${product.trendUnits} Adet). Karlılığım bozulmadı ama pazar payı kaybediyor olabilirim. Rakiplerin fiyat ve kampanya stratejilerini analiz etmem için bana bir kontrol listesi hazırla.`;
                break;
            case 'stock_bloat':
                prompt = `"${product.name}" satmıyor ve stok maliyeti oluşturuyor. Marka değerini düşürmeden nakite dönmek için (Bundle, BOGO vb.) yaratıcı kampanya kurguları öner.`;
                break;
            default:
                prompt = `"${product.name}" ürününün karlılık ve satış performansını analiz et ve iyileştirme önerileri sun.`;
        }

        // Pass structured payload to App.jsx
        onConsultAI({
            prompt: prompt,
            product: product,
            diagnosis: product.diagnosis
        });
    };

    // Calculate Summary Totals strictly matching Dashboard
    const macroNetProfit = totalSales - totalCOGS - TOTAL_AD_BUDGET - totalShipping - totalCommission - totalTax - totalFixedCost;
    const totalVariableCosts = PRODUCTS.reduce((acc, p) => acc + p.totalVariableCosts, 0);
    const totalFixedCosts = PRODUCTS.reduce((acc, p) => acc + p.fixedCost, 0);
    const totalProfit = macroNetProfit;
    const weightedMargin = totalSales !== 0 ? (macroNetProfit / totalSales) * 100 : 0;

    // Leaderboard Data Preparation
    // Trend Analysis Data Preparation
    // Trend Analysis Data Preparation
    const { winners, losers } = (() => {
        // Sort based on selected metric
        const sorter = trendMetric === 'profit'
            ? (a, b) => b.trendValue - a.trendValue
            : (a, b) => b.trendUnits - a.trendUnits;

        const sorted = [...PRODUCTS].sort(sorter);

        let winnersList, losersList;

        if (trendMetric === 'profit') {
            winnersList = sorted.filter(p => p.trendValue > 0).slice(0, 6);
            losersList = [...PRODUCTS].sort((a, b) => a.trendValue - b.trendValue).filter(p => p.trendValue < 0).slice(0, 6);
        } else {
            winnersList = sorted.filter(p => p.trendUnits > 0).slice(0, 6);
            losersList = [...PRODUCTS].sort((a, b) => a.trendUnits - b.trendUnits).filter(p => p.trendUnits < 0).slice(0, 6);
        }

        return { winners: winnersList, losers: losersList };
    })();






    // --- UP5+UP6 Fix: Compute Sankey values perfectly matching Dashboard ---
    const _sankeyRevenue = Math.round(totalSales);
    const _sankeyReturns = Math.round(totalReturnAmt);
    const _sankeyCOGS_Real = Math.round(totalCOGS);
    const _sankeyAds = Math.round(TOTAL_AD_BUDGET);
    const _sankeyCommission = Math.round(totalCommission);
    const _sankeyShipping = Math.round(totalShipping);
    const _sankeyTax = Math.round(totalTax);
    const _sankeyFixed = Math.round(totalFixedCost);
    // 100% Macro Accountant Net Profit matching Dashboard EXACTLY
    const _sankeyNetProfit = Math.max(0, _sankeyRevenue - _sankeyCOGS_Real - _sankeyAds - _sankeyShipping - _sankeyCommission - _sankeyTax - _sankeyFixed);

    const _pct = (v) => _sankeyRevenue > 0 ? Math.round((v / _sankeyRevenue) * 100) : 0;

    const sankeyData = {
        nodes: [
            { name: 'Toplam Ciro', type: 'source' },
            { name: 'İadeler', type: 'target', icon: RefreshCcw, color: '#ef4444', value: _sankeyReturns, percent: _pct(_sankeyReturns) },
            { name: 'Ürün Maliyeti', type: 'target', icon: ShoppingBag, color: '#f97316', value: _sankeyCOGS_Real, percent: _pct(_sankeyCOGS_Real) },
            { name: 'Pazarlama', type: 'target', icon: Megaphone, color: '#f59e0b', value: _sankeyAds, percent: _pct(_sankeyAds) },
            { name: 'Lojistik', type: 'target', icon: Truck, color: '#3b82f6', value: _sankeyShipping, percent: _pct(_sankeyShipping) },
            { name: 'Komisyon', type: 'target', icon: CreditCard, color: '#a855f7', value: _sankeyCommission, percent: _pct(_sankeyCommission) },
            { name: 'Vergi Kesintisi', type: 'target', icon: Database, color: '#ef0452', value: _sankeyTax, percent: _pct(_sankeyTax) },
            { name: 'Sabit Giderler', type: 'target', icon: Layers, color: '#444444', value: _sankeyFixed, percent: _pct(_sankeyFixed) },
            { name: 'NET KAR', type: 'target', icon: CheckCircle, color: '#10b981', value: Math.max(0, _sankeyNetProfit), percent: Math.max(0, _pct(_sankeyNetProfit)) }
        ],
        links: [
            { source: 0, target: 1, value: Math.max(1, _sankeyReturns) },
            { source: 0, target: 2, value: Math.max(1, _sankeyCOGS_Real) },
            { source: 0, target: 3, value: Math.max(1, _sankeyAds) },
            { source: 0, target: 4, value: Math.max(1, _sankeyShipping) },
            { source: 0, target: 5, value: Math.max(1, _sankeyCommission) },
            { source: 0, target: 6, value: Math.max(1, _sankeyTax) },
            { source: 0, target: 7, value: Math.max(1, _sankeyFixed) },
            { source: 0, target: 8, value: Math.max(1, _sankeyNetProfit) }
        ]
    };

    // gradients for links
    const gradients = sankeyData.nodes.slice(1).map((node, i) => (
        <linearGradient key={`grad-${i}`} id={`gradient-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.2" />
            <stop offset="100%" stopColor={node.color} stopOpacity="0.6" />
        </linearGradient>
    ));

    const renderCustomSankeyNode = ({ x, y, width, height, index, payload, containerWidth }) => {
        const isSource = payload.type === 'source';
        const Icon = payload.icon || Database;
        const color = payload.color || '#94a3b8';

        // Source Node (Left Side)
        if (isSource) {
            return (
                <foreignObject x={x} y={y} width={180} height={height}>
                    <div className="h-full w-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center px-4 relative overflow-hidden group hover:border-gray-300 transition-colors">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500" />
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <div className="p-1.5 bg-slate-100 rounded-md">
                                <Wallet className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Toplam Ciro</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{formatCompact(_sankeyRevenue)}</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">%100 Başlangıç</div>
                    </div>
                </foreignObject>
            );
        }

        // Target Nodes (Right Side - Card Style)
        return (
            <foreignObject x={x - 140} y={y} width={150} height={height}>
                <div
                    className="h-full w-full bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between px-3 relative overflow-hidden group"
                    style={{ borderLeft: `4px solid ${color}` }}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-md bg-gray-50 group-hover:bg-white transition-colors shrink-0">
                            <Icon className="w-3.5 h-3.5" style={{ color: color }} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-700 uppercase truncate leading-tight" title={payload.name}>{payload.name}</span>
                            <span className="text-[9px] text-gray-400 leading-tight">Gider Kalemi</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-1">
                        <span className="text-sm font-bold text-gray-900">%{payload.percent}</span>
                        <span className="text-[9px] font-medium text-gray-500">₺{(payload.value / 1000).toFixed(0)}K</span>
                    </div>
                </div>
            </foreignObject>
        );
    };

    const renderCustomSankeyLink = ({ sourceX, sourceY, targetX, targetY, linkWidth, index, payload }) => {
        // Map link index to target node color index (target index - 1 because distinct targets)
        // Actually payload.target.index is the node index.
        const targetIndex = payload.target.index - 1; // 0-based for gradients

        return (
            <path
                d={`
            M${sourceX + 180},${sourceY + linkWidth / 2}
            C${sourceX + 280},${sourceY + linkWidth / 2} ${targetX - 250},${targetY + linkWidth / 2} ${targetX - 140},${targetY + linkWidth / 2}
          `}
                fill="none"
                stroke={`url(#gradient-${targetIndex})`}
                strokeWidth={Math.max(linkWidth, 2)}
                strokeOpacity="0.8"
                style={{ transition: 'stroke-width 0.3s, stroke-opacity 0.3s' }}
                className="hover:opacity-100 opacity-80"
                onMouseEnter={(e) => { e.target.style.strokeOpacity = '1'; e.target.style.strokeWidth = Math.max(linkWidth, 2) + 2; }}
                onMouseLeave={(e) => { e.target.style.strokeOpacity = '0.8'; e.target.style.strokeWidth = Math.max(linkWidth, 2); }}
            />
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ürün & Karlılık</h1>
                    <p className="text-slate-500 mt-1">Ürün bazlı karlılık ve maliyet kırılımları</p>
                </div>
                <button
                    onClick={() => {
                        // UP10 Fix: Export real TABLE_PRODUCTS data as CSV
                        const headers = ['Ürün', 'SKU', 'Satış Fiyatı (₺)', 'Satış Adedi', 'Ciro (₺)', 'İade Adedi', 'İade Tutarı (₺)', 'COGS/Birim (₺)', 'Değişken Gider/Birim (₺)', 'Reklam/Birim (₺)', 'Sabit Gider/Birim (₺)', 'Net Kar Toplam (₺)', 'Kar Marjı (%)'];
                        const rows = TABLE_PRODUCTS.map(p => [
                            `"${p.name}"`,
                            p.sku || '-',
                            p.price.toFixed(0),
                            p.sold,
                            p.revenue.toFixed(0),
                            p.returns,
                            p.returnAmt.toFixed(0),
                            p.cogs.toFixed(0),
                            p.variableCosts.toFixed(0),
                            p.ads.toFixed(0),
                            p.fixed.toFixed(0),
                            p.netProfitTotal.toFixed(0),
                            p.margin.toFixed(1)
                        ]);
                        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `unit_economics_${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition shadow-sm"
                >
                    <Download className="h-4 w-4" />
                    Raporu İndir
                </button>
            </div>

            {/* KPI Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                {/* Card 1: Overall Margin */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm group">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">Ortalama Net Kar Marjı</span>
                            <div className="relative flex items-center group/tooltip">
                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none w-56 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 text-center font-normal">
                                    Tüm ürünlerin satışından elde edilen toplam net karın toplam ciroya oranıdır.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-\[5px\] border-transparent border-t-slate-800"></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        %{weightedMargin.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium">
                        {/* UP8 Fix: Compare portfolio margin to 30% target, not hardcoded +1.2% */}
                        {weightedMargin >= 30 ? (
                            <><ArrowUpRight className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Hedef marj (%30) üzerinde</span></>
                        ) : (
                            <><ArrowUpRight className="w-3 h-3 rotate-90 text-amber-500" /><span className="text-amber-600">Hedef marj (%30) altında</span></>
                        )}
                    </div>
                </div>

                {/* Card 2: Toxic SKUs */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm group">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-500 group-hover:text-rose-600 transition-colors">Zarar Eden Ürün Sayısı</span>
                            <div className="relative flex items-center group/tooltip">
                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none w-64 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 text-center font-normal">
                                    Birim maliyetleri ve giderleri, satış fiyatından yüksek olan ve net zarar üreten ürünlerin sayısıdır.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-\[5px\] border-transparent border-t-slate-800"></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                            <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {PRODUCTS.filter(p => p.netProfit < 0).length} Ürün
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-rose-600">
                        <span>Acil aksiyon gerekiyor</span>
                    </div>
                </div>

                {/* Card 3: MER (Marketing Efficiency) */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm group">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-500 group-hover:text-amber-600 transition-colors">Pazarlama Verimliliği (MER)</span>
                            <div className="relative flex items-center group/tooltip">
                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none w-64 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 text-center font-normal">
                                    Toplam cironun toplam reklam harcamasına bölünmesiyle elde edilen pazarlama yatırım getirisidir.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-\[5px\] border-transparent border-t-slate-800"></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                            <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {gaLoading ? 'Yükleniyor...' : (TOTAL_AD_BUDGET > 0 ? ((totalSales / TOTAL_AD_BUDGET)).toFixed(1) : 'Veri Yok')}
                        {TOTAL_AD_BUDGET > 0 && !gaLoading && <span className="text-sm font-medium text-gray-500 ml-1">x</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
                        {gaLoading ? (
                            <span className="text-gray-400">Veriler getiriliyor...</span>
                        ) : TOTAL_AD_BUDGET > 0 ? (
                            (totalSales / TOTAL_AD_BUDGET) >= 4 ? <span>Hedef (4.0x) üzerinde</span> : <span className="text-amber-600">Hedef (4.0x) altında</span>
                        ) : (
                            <span className="text-gray-400">Reklam harcaması 0 veya bulunamadı</span>
                        )}
                    </div>
                </div>

                {/* Card 4: Return Loss */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm group">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-500 group-hover:text-purple-600 transition-colors">İade Kayıp Tutarı (Aylık)</span>
                            <div className="relative flex items-center group/tooltip">
                                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none w-56 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 text-center font-normal">
                                    İptal ve iade edilen siparişlerin toplam cirodan düşürdüğü tutardır.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-\[5px\] border-transparent border-t-slate-800"></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <RefreshCw className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-2">
                        {/* UP7 Fix: Use computed totalReturnAmt from TABLE_PRODUCTS */}
                        -{formatCurrency(totalReturnAmt)}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-rose-600">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>{totalReturnQty} Adet iade edildi</span>
                    </div>
                </div>
            </div>

            {/* Strategic Analysis Section: 2+1 Asymmetric Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">

                {/* Left Column (Span 2): Data Visualization Stack */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">



                    {/* Chart B: Premium Profitability Bridge (Money Flow) - HTML Implementation */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[440px] overflow-hidden">

                        {/* 1. Summary Header - Status Bar */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Diagram Title & Subtitle */}
                            <div className="flex flex-col">
                                <div className="text-[17px] font-black text-slate-800 tracking-tight">Kâr/Zarar Akış Diyagramı</div>
                                <div className="text-[12px] font-medium text-slate-500 mt-1">Net cironun gider kalemlerine dağılımı ve net kâr dönüşüm haritası.</div>
                            </div>

                            {/* Distribution Progress Bar */}
                            {/* UP6 Fix: Compute expense/profit percentages from real data */}
                            {(() => {
                                const netProfitPct = Math.max(0, _pct(_sankeyNetProfit));
                                const expensePct = 100 - netProfitPct;
                                return (
                                    <div className="flex flex-col items-end gap-1.5 w-full md:w-1/2 max-w-sm">
                                        <div className="flex w-full text-[10px] font-bold uppercase tracking-wider justify-between px-1">
                                            <span className="text-rose-500">Giderler %{expensePct}</span>
                                            <span className="text-emerald-600">Net Kar %{netProfitPct}</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                                            <div className="bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 relative group cursor-pointer" style={{ width: `${expensePct}%` }}>
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 relative group cursor-pointer" style={{ width: `${netProfitPct}%` }}>
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 2. Main Flow Diagram (Fluid Push-to-Edges) */}
                        <div className="w-full relative py-6 px-0 flex justify-between items-center">

                            {/* Column 1: Source Card (Pinned Left) */}
                            <div className="flex-shrink-0 w-48 relative z-10 pl-6">
                                <div className="bg-white shadow-lg rounded-2xl p-6 border-l-8 border-indigo-600 w-full hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex items-center gap-3 mb-3 text-slate-500">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">CİRO</span>
                                    </div>
                                    <div className="text-2xl font-black text-slate-900 tracking-tight">{formatCompact(_sankeyRevenue)}</div>
                                </div>
                            </div>

                            {/* Column 2: The Fluid SVG Flow (Fills Gap) */}
                            <div className="flex-1 h-[530px] relative min-w-[200px] z-0">
                                <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 530" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#ef0452" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#ef0452" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="grad-slate" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#444444" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#444444" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                                        </linearGradient>
                                    </defs>

                                    {/* Paths connecting Source (0) to Destinations (100) */}
                                    {sankeyData.nodes.slice(1).map((node, i) => {
                                        // 0. Pre-calculate heights for ALL nodes to ensure correct stacking
                                        const allNodes = sankeyData.nodes.slice(1);
                                        const totalValue = Math.max(1, _sankeyRevenue);
                                        // Source Thickness logic. Reduced multiplier from 180 to 90 to prevent overflow on the Left Card (~120px tall)
                                        const allHeights = allNodes.map(n => Math.max(4, (n.value / totalValue) * 90));

                                        // 1. Calculate Global Stack Geometry
                                        const totalStackHeight = allHeights.reduce((sum, h) => sum + h, 0);
                                        const centerAnchorY = 265; // Vertical Center of the container (530px / 2)
                                        const globalStartY = centerAnchorY - (totalStackHeight / 2);

                                        // 2. Determine THIS Ribbon's Start Position (Cumulative)
                                        const prevStackHeight = allHeights.slice(0, i).reduce((sum, h) => sum + h, 0);
                                        const myHeight = allHeights[i];

                                        const startTopY = globalStartY + prevStackHeight;
                                        // Overlap Fix: Add +1px to visual height to eliminate anti-aliasing gaps between stacked ribbons
                                        const startBottomY = startTopY + myHeight + 1;
                                        // START at 0 (Left edge of fluid container)
                                        const startX = 0;

                                        // 3. Destination Position (Right)
                                        const targetYs = [30, 96, 162, 228, 294, 360, 426, 492];
                                        const targetY = targetYs[i] || 30 + (i * 66);
                                        // END at 100 (Right edge of fluid container)
                                        const endX = 100;

                                        // Use proportional height but maxed at card height to prevent overflow (Max ~48px per card)
                                        const endHeight = Math.max(4, (node.value / Math.max(1, _sankeyRevenue)) * 48);
                                        const endTopY = targetY - (endHeight / 2);
                                        const endBottomY = targetY + (endHeight / 2) + 1; // +1px for consistency

                                        // Control Points for smooth S-Curve (Proportional to 0-100 width)
                                        const cp1X = 40;
                                        const cp2X = 60;

                                        // Ribbon Path (Closed Shape)
                                        const ribbonPath = `
                                            M ${startX},${startTopY}
                                            C ${cp1X},${startTopY} ${cp2X},${endTopY} ${endX},${endTopY}
                                            L ${endX},${endBottomY}
                                            C ${cp2X},${endBottomY} ${cp1X},${startBottomY} ${startX},${startBottomY}
                                            Z
                                        `;

                                        // Color Mapping
                                        const gradId =
                                            i === 0 ? "grad-red" :
                                                i === 1 ? "grad-orange" :
                                                    i === 2 ? "grad-amber" :
                                                        i === 3 ? "grad-blue" :
                                                            i === 4 ? "grad-purple" :
                                                                i === 5 ? "grad-rose" :
                                                                    i === 6 ? "grad-slate" : "grad-emerald";

                                        return (
                                            <g key={i} className="group cursor-pointer">
                                                <path
                                                    d={ribbonPath}
                                                    fill={`url(#${gradId})`}
                                                    stroke={`url(#${gradId})`}
                                                    strokeWidth="0.5" // Thinner stroke for fluid scaling
                                                    vectorEffect="non-scaling-stroke" // Ensure stroke doesn't get distorted
                                                    className="opacity-50 group-hover:opacity-90 transition-all duration-300 pointer-events-auto hover:drop-shadow-md"
                                                    style={{ mixBlendMode: 'multiply' }}
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* Column 3: Destination Cards (Pinned Right) */}
                            <div className="flex-shrink-0 flex flex-col justify-between py-2 relative z-10 gap-3 w-64 pr-6">

                                {/* 1. Iadeler */}
                                <div
                                    onClick={() => setSelectedExpense({
                                        title: 'İadeler',
                                        color: 'red',
                                        value: _sankeyReturns,
                                        percent: _pct(_sankeyReturns),
                                        subItems: []
                                    })}
                                    className="bg-white border border-gray-100 border-l-4 border-l-red-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-red-50 text-red-500 rounded-md group-hover:bg-red-100 transition-colors">
                                            <RefreshCcw className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500">İadeler</div>
                                            <div className="text-[11px] font-semibold text-slate-800">{formatCompact(_sankeyReturns)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-red-500">%{_pct(_sankeyReturns)}</div>
                                </div>

                                {/* 2. Urun Maliyeti */}
                                <div
                                    onClick={() => setSelectedExpense({
                                        title: 'Ürün Maliyeti',
                                        color: 'orange',
                                        value: _sankeyCOGS_Real,
                                        percent: _pct(_sankeyCOGS_Real),
                                        subItems: []
                                    })}
                                    className="bg-white border border-gray-100 border-l-4 border-l-orange-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-orange-50 text-orange-500 rounded-md group-hover:bg-orange-100 transition-colors">
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500">Ürün Maliyeti</div>
                                            <div className="text-[11px] font-semibold text-slate-800">{formatCompact(_sankeyCOGS_Real)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-orange-500">%{_pct(_sankeyCOGS_Real)}</div>
                                </div>

                                {/* 3. Pazarlama */}
                                <div
                                    onClick={() => setSelectedExpense({
                                        title: 'Pazarlama',
                                        color: 'amber',
                                        value: _sankeyAds,
                                        percent: _pct(_sankeyAds),
                                        subItems: []
                                    })}
                                    className="bg-white border border-gray-100 border-l-4 border-l-amber-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-amber-50 text-amber-500 rounded-md group-hover:bg-amber-100 transition-colors">
                                            <Megaphone className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500">Pazarlama</div>
                                            <div className="text-[11px] font-semibold text-slate-800">{formatCompact(_sankeyAds)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-amber-500">%{_pct(_sankeyAds)}</div>
                                </div>

                                {/* 4. Lojistik */}
                                <div
                                    onClick={() => setSelectedExpense({
                                        title: 'Lojistik',
                                        color: 'blue',
                                        value: _sankeyShipping,
                                        percent: _pct(_sankeyShipping),
                                        subItems: []
                                    })}
                                    className="bg-white border border-gray-100 border-l-4 border-l-blue-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-blue-50 text-blue-500 rounded-md group-hover:bg-blue-100 transition-colors">
                                            <Truck className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500">Lojistik</div>
                                            <div className="text-[11px] font-semibold text-slate-800">{formatCompact(_sankeyShipping)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-blue-500">%{_pct(_sankeyShipping)}</div>
                                </div>

                                {/* 5. Komisyon */}
                                <div
                                    onClick={() => setSelectedExpense({
                                        title: 'Komisyon',
                                        color: 'purple',
                                        value: _sankeyCommission,
                                        percent: _pct(_sankeyCommission),
                                        subItems: []
                                    })}
                                    className="bg-white border border-gray-100 border-l-4 border-l-purple-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-purple-50 text-purple-500 rounded-md group-hover:bg-purple-100 transition-colors">
                                            <CreditCard className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500">Komisyon</div>
                                            <div className="text-[11px] font-semibold text-slate-800">{formatCompact(_sankeyCommission)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-purple-500">%{_pct(_sankeyCommission)}</div>
                                </div>

                                {/* 6. Vergi */}
                                <div
                                    onClick={() => setSelectedExpense({
                                        title: 'Vergi Kesintisi',
                                        color: 'rose',
                                        value: _sankeyTax,
                                        percent: _pct(_sankeyTax),
                                        subItems: []
                                    })}
                                    className="bg-white border border-gray-100 border-l-4 border-l-rose-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-rose-50 text-rose-500 rounded-md group-hover:bg-rose-100 transition-colors">
                                            <Database className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500">Vergi Kesintisi</div>
                                            <div className="text-[11px] font-semibold text-slate-800">{formatCompact(_sankeyTax)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-rose-500">%{_pct(_sankeyTax)}</div>
                                </div>

                                {/* 7. Sabit Giderler */}
                                <div
                                    onClick={() => setSelectedExpense({
                                        title: 'Sabit Giderler',
                                        color: 'slate',
                                        value: _sankeyFixed,
                                        percent: _pct(_sankeyFixed),
                                        subItems: []
                                    })}
                                    className="bg-white border border-gray-100 border-l-4 border-l-slate-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between items-center group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-slate-50 text-slate-500 rounded-md group-hover:bg-slate-100 transition-colors">
                                            <Layers className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase font-bold text-slate-500">Sabit Giderler</div>
                                            <div className="text-[11px] font-semibold text-slate-800">{formatCompact(_sankeyFixed)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-slate-500">%{_pct(_sankeyFixed)}</div>
                                </div>

                                {/* 8. NET KAR (Subtle Emphasis - Clean) */}
                                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-2.5 rounded-lg shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 flex justify-between items-center group cursor-pointer mt-1 relative z-20">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md group-hover:bg-emerald-200 transition-colors">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider">NET KAR</div>
                                            <div className="text-sm font-black text-slate-800">{formatCompact(_sankeyNetProfit)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-emerald-600">%{Math.max(0, _pct(_sankeyNetProfit))}</div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Chart A: Product Trend Analysis (Winners & Losers) */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[420px] overflow-hidden shrink-0">
                        {/* Global Header */}
                        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Ürün Trend Analizi <span className="text-gray-400 font-normal text-xs ml-1">(Önceki Döneme Göre)</span></h3>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                    {trendMetric === 'profit'
                                        ? 'Net kar değişimine göre sıralanmıştır.'
                                        : 'Satış adedi değişimine göre sıralanmıştır.'}
                                </div>
                            </div>
                            {/* Segmented Control */}
                            <div className="bg-slate-100 p-1 rounded-lg flex gap-1 shrink-0">
                                <button
                                    onClick={() => setTrendMetric('profit')}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                        trendMetric === 'profit'
                                            ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Net Kar
                                </button>
                                <button
                                    onClick={() => setTrendMetric('volume')}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                        trendMetric === 'volume'
                                            ? "bg-white text-indigo-600 shadow-sm font-semibold"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Satış Adedi
                                </button>
                            </div>
                        </div>

                        {/* Split Content */}
                        <div className="flex-1 grid grid-cols-2 min-h-0 divide-x divide-gray-100">
                            {/* Left: Winners (Emerald) */}
                            <div className="flex flex-col min-h-0">
                                <div className="px-3 py-2 bg-emerald-50/40 border-b border-emerald-100/50 flex items-center gap-1.5 sticky top-0 backdrop-blur-sm z-[5]">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Yükselenler</span>
                                </div>
                                <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-emerald-100">
                                    {winners.slice(0, 6).map(product => (
                                        <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors px-1 group">
                                            {/* Product */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={product.img || getFallbackProductImage(product.name)}
                                                        className="w-7 h-7 rounded-lg object-cover border border-gray-100 shadow-sm group-hover:shadow transition-shadow bg-white"
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = getFallbackProductImage(product.name);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <div className="text-sm font-medium text-slate-700 truncate cursor-default" title={product.name}>{product.name}</div>
                                                </div>
                                            </div>
                                            {/* Metric Stacked */}
                                            <div className="flex flex-col items-end shrink-0 pl-2">
                                                <div className="text-sm font-bold text-emerald-600">
                                                    {trendMetric === 'profit' ? `+₺${product.trendValue.toFixed(0)}` : `+${product.trendUnits} Adet`}
                                                </div>
                                                <div className="text-[11px] font-medium text-emerald-500">
                                                    +{trendMetric === 'profit' ? product.trendPercent.toFixed(1) : product.trendUnitsPercent.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Losers (Red) */}
                            <div className="flex flex-col min-h-0">
                                <div className="px-3 py-2 bg-red-50/40 border-b border-red-100/50 flex items-center gap-1.5 sticky top-0 backdrop-blur-sm z-[5]">
                                    <TrendingUp className="w-3.5 h-3.5 text-red-600 rotate-180" />
                                    <span className="text-[11px] font-bold text-red-800 uppercase tracking-wide">Düşenler</span>
                                </div>
                                <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-red-100">
                                    {losers.slice(0, 6).map(product => (
                                        <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors px-1 group">
                                            {/* Product */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={product.img || getFallbackProductImage(product.name)}
                                                        className="w-7 h-7 rounded-lg object-cover border border-gray-100 shadow-sm group-hover:shadow transition-shadow bg-white"
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = getFallbackProductImage(product.name);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <div className="text-sm font-medium text-slate-700 truncate" title={product.name}>{product.name}</div>
                                                </div>
                                            </div>
                                            {/* Metric Stacked */}
                                            <div className="flex flex-col items-end shrink-0 pl-2">
                                                {trendMetric === 'profit' ? (
                                                    <>
                                                        {/* Current Profit - Green if positive, Red if negative */}
                                                        <div className={cn(
                                                            "text-xs font-bold mb-0.5",
                                                            product.actualNetProfit > 0 ? "text-emerald-600" : "text-red-600"
                                                        )}>
                                                            {product.actualNetProfit > 0 ? '+' : ''}₺{product.actualNetProfit.toFixed(0)}
                                                        </div>
                                                        {/* Trend Change - Always Red for Losers */}
                                                        <div className="flex items-center gap-0.5 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                                                            <TrendingUp className="w-3 h-3 rotate-180" />
                                                            ₺{Math.abs(product.trendValue).toFixed(0)} ({product.trendPercent.toFixed(1)}%)
                                                        </div>
                                                    </>
                                                ) : (
                                                    /* Volume Logic (Unchanged) */
                                                    <>
                                                        <div className="text-sm font-bold text-red-600">
                                                            {product.trendUnits} Adet
                                                        </div>
                                                        <div className="text-[11px] font-medium text-red-400">
                                                            {product.trendUnitsPercent.toFixed(1)}%
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <button
                            onClick={() => setShowTrendModal(true)}
                            className="w-full py-3 bg-white border-t border-gray-100 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-center sticky bottom-0 z-10"
                        >
                            Tüm Listeyi İncele
                        </button>
                    </div>
                </div>

                {/* Right Column (Span 1): AI Insights (Full Height) */}
                <div className="lg:col-span-1 h-full">
                    {/* AI Smart Insights Module */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm">AI Finansal Öngörüler</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 pr-2">
                            {(() => {
                                // Helper to generate prompts based on insight type
                                const getInsightPrompt = (type, data) => {
                                    switch (type) {
                                        case 'opportunity':
                                            return `"${data.productName}" ürününde satış hacmini düşürmeden kârlılığı artırmak için nasıl bir fiyat stratejisi veya A/B testi uygulayabilirim? Bu değişimin toplam karlılığa etkisini simüle et.`;
                                        case 'critical':
                                            return `"${data.productName}" için reklam harcamaları (CPA: ₺${data.cpa}) hedefimin üzerinde. Bütçeyi optimize etmeli miyim yoksa hedef kitleyi mi daraltmalıyım? Verimsiz kanalları analiz et.`;
                                        case 'warning':
                                            return `"${data.productName}" stoğu ${data.days} gündür hareketsiz. Depo maliyetinden kurtulmak ve nakit akışını hızlandırmak için hangi kampanya stratejilerini (örn: bundle, sepet indirimi) kullanabilirim?`;
                                        case 'alert':
                                            return `"${data.productName}" iade oranı aniden %${data.rate}'e yükseldi. Müşteri şikayetlerindeki ortak kelimeleri (üretim hatası, beden uyumsuzluğu vb.) analiz edip raporla.`;
                                        case 'info':
                                            return `Son dönemde kargo maliyetlerim beklentinin üzerinde arttı. Desi başına maliyetleri ve kargo firması anlaşmalarımı piyasa ortalamasıyla kıyasla.`;
                                        default:
                                            return `"${data.productName}" hakkında finansal analiz yap.`;
                                    }
                                };

                                // UP9 Fix: Generate AI insights from real PRODUCTS data (Analytical & Suggestive)

                                // 1. Opportunity: profitable product with lowest margin
                                const profitableProducts = PRODUCTS.filter(p => p.netProfit > 0 && p.margin > 0);
                                const bestOpportunity = profitableProducts.length > 0
                                    ? [...profitableProducts].sort((a, b) => a.margin - b.margin)[0]
                                    : null;

                                // 2. Critical: product with highest CPA-to-revenue ratio
                                const worstCPA = [...PRODUCTS].filter(p => p.adSpend > 0).sort((a, b) => (b.adSpend / Math.max(b.actualRevenue || 1, 1)) - (a.adSpend / Math.max(a.actualRevenue || 1, 1)))[0];

                                // 3. Warning: product with high volume but very low margin
                                const highVolumeLowMargin = [...PRODUCTS].filter(p => p.unitsSold > 5 && p.margin > 0 && p.margin < 15).sort((a, b) => b.unitsSold - a.unitsSold)[0];

                                // 4. Alert: product with worst (most negative) net profit
                                const worstLoss = [...PRODUCTS].sort((a, b) => a.netProfit - b.netProfit)[0];

                                // 5. Info: product where ops costs (shipping + commission) eat the most revenue
                                const highOpsCost = [...PRODUCTS].filter(p => p.actualRevenue > 0).sort((a, b) => ((b.shipping + b.commission) / b.actualRevenue) - ((a.shipping + a.commission) / a.actualRevenue))[0];

                                const aiInsights = [
                                    bestOpportunity && {
                                        id: 1,
                                        type: 'opportunity',
                                        icon: TrendingUp,
                                        color: 'emerald',
                                        title: 'Fiyat & Marj Fırsatı',
                                        productName: bestOpportunity.name,
                                        productId: bestOpportunity.id,
                                        data: { productName: bestOpportunity.name },
                                        text: <span><strong>{bestOpportunity.name.split(' ').slice(0, 3).join(' ')}</strong> satış bandında istikrar yakalamış görünse de kâr marjı potansiyelinin gerisinde kalıyor. Satış hacmini kaybetmeden kârlılığı korumak adına ufak fiyat esneklik testleri (A/B) planlanabilir.</span>,
                                        action: 'Simüle Et'
                                    },
                                    worstCPA && {
                                        id: 2,
                                        type: 'critical',
                                        icon: AlertCircle,
                                        color: 'rose',
                                        title: 'Reklam Algoritması Uyarısı',
                                        productName: worstCPA.name,
                                        productId: worstCPA.id,
                                        data: { productName: worstCPA.name },
                                        text: <span><strong>{worstCPA.name.split(' ').slice(0, 3).join(' ')}</strong> ürününün müşteri edinimi ve pazarlama giderleri, getirdiği ciroya oranla oldukça yoğun seviyede. Hedef kitle optimizasyonu veya kanal bazlı bütçe daraltması değerlendirilmeli.</span>,
                                        action: 'Reklamları Analiz Et'
                                    },
                                    highVolumeLowMargin && {
                                        id: 3,
                                        type: 'warning',
                                        icon: BarChart2,
                                        color: 'amber',
                                        title: 'Sürümden Kazanma Krizi',
                                        productName: highVolumeLowMargin.name,
                                        productId: highVolumeLowMargin.id,
                                        data: { productName: highVolumeLowMargin.name },
                                        text: <span><strong>{highVolumeLowMargin.name.split(' ').slice(0, 3).join(' ')}</strong> ürünü oldukça yüksek satış hacmine sahip ancak kâr marjı çok düşük. Bu üründe yapılacak ufak bir (örn: %3-5) stratejik fiyat artışı toplam şirket karlılığına pazar payı kaybetmeden devasa katkı sağlayabilir.</span>,
                                        action: 'Fiyat Senaryosu Kur'
                                    },
                                    worstLoss && worstLoss.netProfit < 0 && {
                                        id: 4,
                                        type: 'alert',
                                        icon: RefreshCw,
                                        color: 'purple',
                                        title: 'Zarar Analizi Gerekli',
                                        productName: worstLoss.name,
                                        productId: worstLoss.id,
                                        data: { productName: worstLoss.name },
                                        text: <span><strong>{worstLoss.name.split(' ').slice(0, 3).join(' ')}</strong> kaleminde vergi, komisyon veya kargo düşüldükten sonra operasyonel net zararlar gözlemleniyor. Doğrudan maliyetlerin veya liste fiyatının acilen gözden geçirilmesi tavsiye edilir.</span>,
                                        action: 'Maliyetleri Ayır'
                                    },
                                    highOpsCost && {
                                        id: 5,
                                        type: 'info',
                                        icon: Truck,
                                        color: 'blue',
                                        title: 'Ağır Operasyon Gideri',
                                        productName: highOpsCost.name,
                                        productId: highOpsCost.id,
                                        data: { productName: highOpsCost.name },
                                        text: <span><strong>{highOpsCost.name.split(' ').slice(0, 3).join(' ')}</strong> satışlarında kargo ve platform komisyon bedelleri cironun aslan payını yutuyor. Desi/hacim optimizasyonu veya farklı pazar yerlerindeki komisyon oranlarının kıyaslanması önerilir.</span>,
                                        action: 'Ops Giderlerini İncele'
                                    }
                                ].filter(Boolean);

                                return aiInsights.map((insight) => (
                                    <div
                                        key={insight.id}
                                        className={cn(
                                            "p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 group",
                                            `border-${insight.color}-100`
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn("p-1.5 rounded-lg", `bg-${insight.color}-50 text-${insight.color}-600`)}>
                                                <insight.icon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-800">{insight.title}</h4>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {insight.text}
                                        </p>
                                        <button
                                            // Call onConsultAI directly with the formulated prompt.
                                            onClick={() => {
                                                if (onConsultAI) {
                                                    const prompt = getInsightPrompt(insight.type, insight.data);
                                                    onConsultAI({
                                                        prompt: prompt,
                                                        product: {
                                                            id: insight.productId,
                                                            name: insight.productName,
                                                            image: "https://placehold.co/100x100?text=Product"
                                                        },
                                                        diagnosis: {
                                                            type: insight.type,
                                                            badge: "AI ÖNGÖRÜSÜ",
                                                            actionColor: insight.color
                                                        }
                                                    });
                                                }
                                            }}
                                            className={cn(
                                                "text-xs font-semibold py-1.5 px-3 rounded text-center border mt-1 transition-all flex items-center justify-center gap-2",
                                                `text-${insight.color}-600 border-${insight.color}-100`,
                                                `group-hover:bg-${insight.color}-50`,
                                                // Hover state overrides
                                                "group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-200"
                                            )}
                                        >
                                            {/* Default State: Action Text */}
                                            <span className="group-hover:hidden">{insight.action}</span>

                                            {/* Hover State: AI Solves It */}
                                            <span className="hidden group-hover:inline-flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                AI ile Çöz
                                            </span>
                                        </button>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ürün Karlılık Aksiyonları (Dashboard'dan Alındı) */}
            {(() => {
                const criticalProducts = TABLE_PRODUCTS.flatMap(p => {
                    const results = [];
                    // Filtreleme (Mock çöp datalardan arındırma)
                    if (p.category === 'Aksesuar' || p.category === 'Diğer' || (p.name && p.name.toLowerCase().includes('manyetik'))) return results;
                    
                    // Web / Ikas Kontrolü
                    if (p.price > 0 && p.margin < 10) {
                        results.push({
                            id: `${p.id || p.sku}-ikas`,
                            name: p.name,
                            margin: p.margin,
                            price: p.price,
                            bufferPrice: p.bufferPrice,
                            channelLabel: 'Web / Ikas'
                        });
                    }
                    
                    // Trendyol Kontrolü
                    if (p.trendyolMetrics && p.trendyolMetrics.price > 0 && p.trendyolMetrics.margin < 10) {
                        results.push({
                            id: `${p.id || p.sku}-ty`,
                            name: p.name,
                            margin: p.trendyolMetrics.margin,
                            price: p.trendyolMetrics.price,
                            bufferPrice: p.trendyolMetrics.bufferPrice,
                            channelLabel: 'Trendyol'
                        });
                    }
                    
                    return results;
                }).sort((a,b) => a.margin - b.margin).slice(0, 8);

                if (criticalProducts.length === 0) return null;

                return (
                    <div className="w-full mb-8">
                        <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-4 md:p-5 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-gray-900 font-bold text-[15px] flex items-center gap-2">
                                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                        Ürün Karlılık Aksiyonları
                                    </h3>
                                    <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-md border border-rose-200">{criticalProducts.length} Kritik Alarm</span>
                                </div>
                            </div>
                            
                            <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
                                {criticalProducts.map((p, idx) => (
                                    <div key={p.id || idx} className="min-w-[280px] p-4 rounded-xl border border-rose-100 bg-rose-50/40 flex flex-col justify-between snap-start">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1 pr-2" title={p.name}>{p.name}</p>
                                                <span className="text-xs font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded shadow-sm">%{(p.margin || 0).toFixed(1)}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 mb-2">
                                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{p.channelLabel}</span>
                                                <p className="text-[12px] text-slate-500">Satışta olduğu fiyat: <b>₺{(p.price || 0).toLocaleString('tr-TR')}</b></p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-rose-100/60 pt-3 mt-1.5">
                                            <span className="text-[11px] text-slate-500 font-medium">Hedef Kârlılık İçin<br/>Tampon Fiyat:</span>
                                            <span className="text-[14px] font-bold text-gray-900 border border-gray-200 px-2 py-1 rounded-md bg-white shadow-sm">₺{(p.bufferPrice || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* KANAL BAZLI KARLILIK ÖZETİ & DOUGHNUT GRAFİKLER */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-5 h-5 text-gray-700" />
                    <h2 className="text-lg font-bold text-gray-800">Kanal Bazlı Karlılık</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    {/* Sol Kısım: Kartlar */}
                    <div className="lg:col-span-5 overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0">
                        <div className="flex md:grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[max-content] md:min-w-0">
                            {channelMetrics && channelMetrics.sort((a,b) => b.revenue - a.revenue).map((ch) => (
                                <div key={ch.id} className={`border rounded-2xl p-5 bg-white shadow-sm flex flex-col w-[260px] md:w-auto shrink-0 ${ch.id === 'trendyol' ? 'border-orange-200/50 shadow-orange-50' : 'border-indigo-200/50 shadow-indigo-50'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`w-2.5 h-2.5 rounded-full ${ch.id === 'trendyol' ? 'bg-orange-500' : 'bg-indigo-500'}`}></span>
                                        <h3 className="font-bold text-gray-800 text-sm">{ch.name}</h3>
                                    </div>
                                    <div className="space-y-2.5 flex-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Ciro</span>
                                            <span className="font-bold text-gray-900">{formatCompact(ch.revenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Kâr</span>
                                            <span className={`font-bold ${ch.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {formatCompact(ch.netProfit)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Marj</span>
                                            <span className={`font-bold ${ch.margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                %{Number(ch.margin || 0).toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Komisyon</span>
                                            <span className="font-bold text-purple-600">{formatCompact(ch.commission)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-gray-100">
                                            <span className="text-gray-500">Satış</span>
                                            <span className="font-bold text-gray-900 text-base">{formatNumber(ch.sales)} ad.</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sağ Kısım: Pasta Grafikler */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:border-l lg:border-gray-100 lg:pl-8">
                        {/* Ciro Grafiği */}
                        <div className="h-[240px] relative">
                            <h3 className="text-sm font-semibold text-gray-600 text-center mb-2">Ciro Dağılımı</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={channelMetrics.map(ch => ({ name: ch.name, value: Math.max(0, ch.revenue), id: ch.id }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {channelMetrics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.id === 'trendyol' ? '#f97316' : '#6366f1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCompact(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 top-6 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Toplam</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {formatCompact(channelMetrics.reduce((sum, ch) => sum + Math.max(0, ch.revenue), 0))}
                                </span>
                            </div>
                        </div>

                        {/* Kar Grafiği */}
                        <div className="h-[240px] relative">
                            <h3 className="text-sm font-semibold text-gray-600 text-center mb-2">Net Kâr Dağılımı</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={channelMetrics.map(ch => ({ name: ch.name, value: Math.max(0, ch.netProfit), id: ch.id }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {channelMetrics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.id === 'trendyol' ? '#f97316' : '#6366f1'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCompact(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 top-6 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Toplam</span>
                                <span className="text-xl font-bold text-emerald-600">
                                    {formatCompact(channelMetrics.reduce((sum, ch) => sum + Math.max(0, ch.netProfit), 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Unit Economics P&L Table (New) */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
                {/* TABLE HEADER WITH SEARCH */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Birim Ekonomi Tablosu</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Aşağıdaki tablodan ürün veya SKU bazlı karlılık bilgilerini arayabilir ve sıralayabilirsiniz.</p>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Ürün adı veya SKU ara..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="bg-white border border-gray-200 text-sm rounded-lg pl-9 pr-8 py-2 w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="relative z-20">
                            <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                                <th className="p-3 border-r border-gray-100" rowSpan="2">Ürün Detayı</th>
                                <th className="p-2 text-center border-r border-gray-100 text-indigo-400" colSpan="1">SATIŞ</th>
                                <th className="p-2 text-center border-r border-gray-100 text-orange-400" colSpan="6">BİRİM GİDERLER</th>
                                <th className="p-2 text-center text-emerald-600" colSpan="2">BİRİM SONUÇ</th>
                                {(activeChannel === 'all' || activeChannel === 'Tüm Kanallar') && <th className="p-3 text-center border-l border-gray-100 min-w-[50px] transition-all bg-gray-50 z-30" rowSpan="2">KANALLAR</th>}
                            </tr>

                            <tr className="bg-white text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200 leading-tight">

                                <th className="p-3 text-right border-r border-gray-50 min-w-[80px] relative group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSort('price')}>
                                    <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'price' && <ArrowUpDown className="w-3 h-3 text-indigo-500" />}
                                        <span className="border-b border-dotted border-gray-300">Satış Fiyatı</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-center normal-case pointer-events-none">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                        KDV dahil birim liste satış fiyatı. (Sıralamak için tıkla)
                                    </div>
                                </th>

                                <th className="p-3 text-right border-r border-gray-50 text-gray-400 relative group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSort('cogs')}>
                                    <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'cogs' && <ArrowUpDown className="w-3 h-3 text-orange-400" />}
                                        <span className="border-b border-dotted border-gray-300">Maliyet/SMM</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-center normal-case pointer-events-none">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                        Satılan bir malın brüt geliş veya üretim maliyeti. (Sıralamak için tıkla)
                                    </div>
                                </th>

                                <th className="p-3 text-right border-r border-gray-50 text-gray-400 relative group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSort('shipping')}>
                                     <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'shipping' && <ArrowUpDown className="w-3 h-3 text-orange-400" />}
                                        <span className="border-b border-dotted border-gray-300">Kargo & Pkt.</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-left normal-case pointer-events-none">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                        Lojistik ve koli maliyeti.
                                    </div>
                                </th>

                                <th className="p-3 text-right border-r border-gray-50 text-gray-400 relative group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSort('commission')}>
                                    <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'commission' && <ArrowUpDown className="w-3 h-3 text-orange-400" />}
                                        <span className="border-b border-dotted border-gray-300">Komisyon</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-left normal-case pointer-events-none">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                        Pazaryeri ve altyapı(ödeme) komisyonları.
                                    </div>
                                </th>

                                <th className="p-3 text-right border-r border-gray-50 text-gray-400 relative group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSort('fixedCost')}>
                                    <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'fixedCost' && <ArrowUpDown className="w-3 h-3 text-orange-400" />}
                                        <span className="border-b border-dotted border-gray-300">Şirket Gider Payı</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-left normal-case pointer-events-none">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                        Son 3 aylık kira, maaş, yazılım gibi genel giderlerin satılan adet başına payı.
                                    </div>
                                </th>

                                <th className="p-3 text-right border-r border-gray-50 text-orange-400 relative group cursor-pointer hover:bg-orange-50 transition-colors" onClick={() => handleSort('ads')}>
                                    <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'ads' && <ArrowUpDown className="w-3 h-3 text-orange-500" />}
                                        <span className="border-b border-dotted border-orange-300">Reklam (CPA)</span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-center normal-case pointer-events-none">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                                        1 adet satışı getirmek için harcanan ortalama pazarlama bütçesi.
                                    </div>
                                </th>

                                <th className="p-3 text-right border-r border-gray-100 text-gray-400 relative group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSort('tax')}>
                                    <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'tax' && <ArrowUpDown className="w-3 h-3 text-gray-400" />}
                                        <span className="border-b border-dotted border-gray-300">Vergi (KDV)</span>
                                    </div>
                                    <div className="absolute top-full right-0 mt-2 w-40 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-center normal-case pointer-events-none">
                                        <div className="absolute bottom-full right-4 border-4 border-transparent border-b-gray-900"></div>
                                        Devlete ödenecek tahmini net KDV yükü.
                                    </div>
                                </th>

                                <th className="p-3 text-right bg-emerald-50/30 text-emerald-600 min-w-[90px] relative group cursor-pointer hover:bg-emerald-50/70 transition-colors" onClick={() => handleSort('unitNetProfit')}>
                                    <div className="flex items-center justify-end gap-1">
                                        {sortConfig.key === 'unitNetProfit' && <ArrowUpDown className="w-3 h-3 text-emerald-500" />}
                                        <span className="border-b border-dotted border-emerald-300">BİRİM NET KÂR</span>
                                    </div>
                                    <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-center normal-case pointer-events-none">
                                        <div className="absolute bottom-full right-4 border-4 border-transparent border-b-gray-900"></div>
                                        1 üründen kesintiler düşüldükten sonra cebe kalan net tutar. (Sıralamak için tıkla)
                                    </div>
                                </th>

                                <th className="p-3 text-center text-gray-400 relative group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSort('margin')}>
                                    <div className="flex items-center justify-center gap-1">
                                        {sortConfig.key === 'margin' && <ArrowUpDown className="w-3 h-3 text-emerald-400" />}
                                        <span className="border-b border-dotted border-gray-300">Marj (%)</span>
                                    </div>
                                    <div className="absolute top-full right-0 mt-2 w-32 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] text-center normal-case pointer-events-none">
                                        <div className="absolute bottom-full right-2 border-4 border-transparent border-b-gray-900"></div>
                                        Birim Net Kâr / Satış Fiyatı oranı. (Sıralamak için tıkla)
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody id="table-body" className="text-xs text-gray-600 divide-y divide-gray-50">
                            {currentRows.map((item) => {
                                return (
                                    <React.Fragment key={item.id}>
                                    <tr className="hover:bg-gray-50 transition-colors group border-b border-gray-50">
                                        <td className="p-3 border-r border-gray-50">
                                            {/* Left side: Product Image and Names */}
                                            <div className="flex items-center gap-3 w-72 shrink-0 pr-4">
                                                <div className="group/img relative">
                                                    <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white shrink-0">
                                                        <img
                                                            src={item.img || getFallbackProductImage(item.name)}
                                                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                                                            alt={item.name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = getFallbackProductImage(item.name);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 opacity-0 group-hover/img:opacity-100 transition-opacity bg-white rounded-full p-0.5 shadow-sm border border-gray-100 cursor-pointer">
                                                        <ArrowUpRight className="w-3 h-3 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{item.name}</div>
                                                    <div className="text-[9px] text-gray-400">{item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-right border-r border-gray-50">
                                            <div className="text-indigo-600 font-bold">{formatCurrency(item.price)}</div>
                                            {item.bufferPrice > 0 && (
                                                <div
                                                    className={cn(
                                                        "text-[9.5px] mt-1 px-1.5 py-0.5 rounded font-medium inline-block relative group/tampon cursor-help",
                                                        item.price >= item.bufferPrice ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                                    )}
                                                >
                                                    Min: {formatCurrency(item.bufferPrice)}
                                                    <div className="absolute top-full right-0 mt-1.5 w-48 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover/tampon:opacity-100 group-hover/tampon:visible transition-all z-[100] text-right pointer-events-none">
                                                        <div className="absolute bottom-full right-4 border-4 border-transparent border-b-gray-900"></div>
                                                        Tüm sabit ve değişken giderler düşüldüğünde Zarar etmemek için satılması gereken <strong>Tampon Fiyat</strong>.
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 text-right border-r border-gray-50 text-rose-600">{formatCurrency(item.cogs)}</td>

                                        <td className="p-3 text-right border-r border-gray-50 text-gray-500">{formatCurrency(item.shipping)}</td>
                                        <td className="p-3 text-right border-r border-gray-50 text-gray-500">{formatCurrency(item.commission)}</td>
                                        <td className="p-3 text-right border-r border-gray-50 text-gray-500">{formatCurrency(item.fixedCost)}</td>

                                        <td className="p-3 text-right border-r border-gray-50 text-orange-600 font-bold">{formatCurrency(item.ads)}</td>
                                        <td className="p-3 text-right border-r border-gray-100 text-rose-400">{formatCurrency(item.tax)}</td>
                                        <td className={cn("p-3 text-right font-bold", item.unitNetProfit >= 0 ? "bg-emerald-50/50 text-emerald-600" : "bg-rose-50/50 text-rose-600")}>
                                            {formatCurrency(item.unitNetProfit)}
                                        </td>
                                        <td className="p-3 text-center text-gray-400 font-medium">{item.margin.toFixed(1)}%</td>
                                        {(activeChannel === 'all' || activeChannel === 'Tüm Kanallar') && (
                                            <td className="p-3 text-center border-l border-gray-50 border-r-0">
                                                {item.trendyolMetrics ? (
                                                    <button
                                                        onClick={(e) => toggleRow(item.id, e)}
                                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors mx-auto"
                                                    >
                                                        <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", expandedRows.has(item.id) ? "rotate-180" : "")} />
                                                    </button>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full border border-dashed border-gray-200 flex items-center justify-center mx-auto opacity-50 cursor-not-allowed">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                    {/* Trendyol Nested Row */}
                                    {(activeChannel === 'all' || activeChannel === 'Tüm Kanallar') && expandedRows.has(item.id) && item.trendyolMetrics && (
                                        <tr className="bg-gradient-to-r from-orange-50/40 via-white to-white border-b border-gray-50 text-[11px] hover:bg-orange-50/60 transition-all duration-300 ease-in-out">
                                            <td className="p-3 border-r border-gray-50 pl-6 relative">
                                                {/* Tree Connector Line */}
                                                <div className="absolute top-0 left-6 w-px h-1/2 bg-gray-200"></div>
                                                <div className="absolute top-1/2 left-6 w-6 h-px bg-gray-200"></div>
                                                
                                                <div className="flex items-center gap-2.5 ml-8">
                                                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#F27A1A] flex items-center justify-center shrink-0 border border-gray-100 shadow-[0_2px_8px_rgba(242,122,26,0.2)]">
                                                        <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect width="100" height="100" fill="#F27A1A" />
                                                            <rect y="32" width="100" height="36" fill="#111111" />
                                                            <text x="50" y="53" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="21" fill="#FFFFFF" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">trendyol</text>
                                                        </svg>
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <span className="font-bold text-gray-800 tracking-wide text-[11px]">Trendyol</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right border-r border-gray-50">
                                                <div className="text-[#F27A1A] font-bold">{formatCurrency(item.trendyolMetrics.price)}</div>
                                                {item.trendyolMetrics.bufferPrice > 0 && (
                                                    <div
                                                        className={cn(
                                                            "text-[9.5px] mt-1 px-1.5 py-0.5 rounded font-medium inline-block relative group/tamponTy cursor-help",
                                                            item.trendyolMetrics.price >= item.trendyolMetrics.bufferPrice ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                                        )}
                                                    >
                                                        Min: {formatCurrency(item.trendyolMetrics.bufferPrice)}
                                                        <div className="absolute top-full right-0 mt-1.5 w-48 p-2 bg-gray-900 text-white text-[10px] font-normal rounded-lg shadow-2xl opacity-0 invisible group-hover/tamponTy:opacity-100 group-hover/tamponTy:visible transition-all z-[100] text-right pointer-events-none">
                                                            <div className="absolute bottom-full right-4 border-4 border-transparent border-b-gray-900"></div>
                                                            Trendyol komisyonu (%15) ve KDV'ye göre uyarlanmış başabaş (zarar etmeme) sınırı.
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 text-right border-r border-gray-50 text-rose-500/70 font-medium">{formatCurrency(item.trendyolMetrics.cogs)}</td>
                                            <td className="p-3 text-right border-r border-gray-50 text-gray-400 font-medium">{formatCurrency(item.trendyolMetrics.shipping)}</td>
                                            <td className="p-3 text-right border-r border-gray-50 text-gray-400 font-medium">{formatCurrency(item.trendyolMetrics.commission)}</td>
                                            <td className="p-3 text-right border-r border-gray-50 text-gray-400 font-medium">{formatCurrency(item.trendyolMetrics.fixedCost)}</td>
                                            <td className="p-3 text-right border-r border-gray-50 text-[#F27A1A] font-medium">{formatCurrency(item.trendyolMetrics.ads)}</td>
                                            <td className="p-3 text-right border-r border-gray-50 text-rose-400/70 font-medium">{formatCurrency(item.trendyolMetrics.tax)}</td>
                                            <td className={cn("p-3 text-right font-extrabold w-24 border-r border-gray-50", item.trendyolMetrics.unitNetProfit >= 0 ? "bg-emerald-50/40 text-emerald-600" : "bg-rose-50/40 text-rose-600")}>
                                                {formatCurrency(item.trendyolMetrics.unitNetProfit)}
                                            </td>
                                            <td className={cn("p-3 text-center font-bold tracking-tight", item.trendyolMetrics.unitNetProfit >= 0 ? "text-emerald-600" : "text-rose-500")}>
                                                {item.trendyolMetrics.price > 0 ? ((item.trendyolMetrics.unitNetProfit / item.trendyolMetrics.price) * 100).toFixed(1) : 0}%
                                            </td>
                                            <td className="p-3 border-l border-gray-50 border-r-0"></td>
                                        </tr>
                                    )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">

                    <div className="flex flex-1 justify-between sm:hidden">
                        <button onClick={() => changePage(-1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Önceki</button>
                        <button onClick={() => changePage(1)} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Sonraki</button>
                    </div>

                    <div className="hidden sm:flex flex-1 items-center justify-between">

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-700">Satır:</span>
                                <select
                                    id="rows-per-page"
                                    value={rowsPerPage}
                                    onChange={updateRowsPerPage}
                                    className="block w-full rounded-md border-gray-300 py-1 pl-2 pr-8 text-xs focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs bg-gray-50"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-700">
                                <span id="start-index" className="font-medium">{indexOfFirstRow + 1}</span> - <span id="end-index" className="font-medium">{Math.min(indexOfLastRow, TABLE_PRODUCTS.length)}</span> / <span id="total-entries" className="font-medium">{TABLE_PRODUCTS.length}</span> gösteriliyor
                            </p>
                        </div>

                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button onClick={() => changePage(-1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                                    <span className="sr-only">Previous</span>
                                    <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={cn(
                                            "relative inline-flex items-center px-4 py-2 text-sm font-semibold",
                                            currentPage === page
                                                ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                        )}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button onClick={() => changePage(1)} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                                    <span className="sr-only">Next</span>
                                    <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trend Analysis Modal */}
            {
                showTrendModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Ürün Trend Detayları</h3>
                                    <p className="text-sm text-slate-500">Tüm ürünlerin geçen aya göre performansı.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Modal Level Toggle */}
                                    <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                                        <button
                                            onClick={() => setModalMetric('profit')}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                                modalMetric === 'profit' ? "bg-white text-indigo-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            Net Kar
                                        </button>
                                        <button
                                            onClick={() => setModalMetric('volume')}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                                modalMetric === 'volume' ? "bg-white text-indigo-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            Satış Adedi
                                        </button>
                                    </div>

                                    <button onClick={() => setShowTrendModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Tabs */}
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setTrendModalTab('winners')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                                        trendModalTab === 'winners'
                                            ? "border-emerald-500 text-emerald-700 bg-emerald-50/10"
                                            : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Yükselenler</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setTrendModalTab('losers')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                                        trendModalTab === 'losers'
                                            ? "border-red-500 text-red-700 bg-red-50/10"
                                            : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <TrendingUp className="w-4 h-4 rotate-180" />
                                        <span>Düşenler</span>
                                    </div>
                                </button>
                            </div>

                            {/* Modal Table */}
                            <div className="flex-1 overflow-auto bg-slate-50/50 p-4">
                                <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden border-collapse text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                                        <tr>
                                            <th className="p-3 border-b border-gray-100">Sıra</th>
                                            <th className="p-3 border-b border-gray-100">Ürün</th>
                                            {modalMetric === 'profit' ? (
                                                <>
                                                    <th className="p-3 border-b border-gray-100 text-right">Geçen Ay Kar</th>
                                                    <th className="p-3 border-b border-gray-100 text-right">Bu Ay Kar</th>
                                                    <th className="p-3 border-b border-gray-100 text-right">Değişim (₺)</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="p-3 border-b border-gray-100 text-right">Geçen Ay Adet</th>
                                                    <th className="p-3 border-b border-gray-100 text-right">Bu Ay Adet</th>
                                                    <th className="p-3 border-b border-gray-100 text-right">Değişim (Ad.)</th>
                                                </>
                                            )}
                                            <th className="p-3 border-b border-gray-100 text-right">Değişim (%)</th>

                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm md:text-base">
                                        {PRODUCTS
                                            .filter(p => {
                                                const val = modalMetric === 'profit' ? p.trendValue : p.trendUnits;
                                                if (trendModalTab === 'winners') return val > 0;
                                                if (trendModalTab === 'losers') return val < 0;
                                                return true;
                                            })
                                            .sort((a, b) => {
                                                const valA = modalMetric === 'profit' ? a.trendValue : a.trendUnits;
                                                const valB = modalMetric === 'profit' ? b.trendValue : b.trendUnits;

                                                if (trendModalTab === 'winners') return valB - valA; // Descending
                                                return valA - valB; // Ascending (most negative first)
                                            })
                                            .map((product, index) => {
                                                // Dynamic Values
                                                const isProfit = modalMetric === 'profit';
                                                const currentVal = isProfit ? product.actualNetProfit : product.unitsSold;
                                                const lastVal = isProfit ? product.lastMonthProfit : product.lastMonthUnits;
                                                const changeVal = isProfit ? product.trendValue : product.trendUnits;
                                                const changePct = isProfit ? product.trendPercent : product.trendUnitsPercent;

                                                // Check direction for color (safety check in case filter logic changes)
                                                const isPositive = changeVal > 0;
                                                const colorClass = isPositive ? "text-emerald-600" : "text-red-600";

                                                return (
                                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-3 text-slate-400 font-mono text-xs w-12 text-center">{index + 1}</td>
                                                        <td className="p-3 font-medium text-slate-700">{product.name}</td>

                                                        {/* Last Month */}
                                                        <td className="p-3 text-right text-slate-500">
                                                            {isProfit
                                                                ? `₺${Math.round(lastVal).toLocaleString('tr-TR')}`
                                                                : `${Math.round(lastVal)} Ad.`}
                                                        </td>

                                                        {/* Current Month */}
                                                        <td className="p-3 text-right text-slate-700 font-medium">
                                                            {isProfit
                                                                ? `₺${Math.round(currentVal).toLocaleString('tr-TR')}`
                                                                : `${Math.round(currentVal)} Ad.`}
                                                        </td>

                                                        {/* Change Value */}
                                                        <td className={cn("p-3 text-right font-bold w-32", colorClass)}>
                                                            {isPositive ? '+' : ''}
                                                            {isProfit
                                                                ? `₺${Math.round(changeVal).toLocaleString('tr-TR')}`
                                                                : `${Math.round(changeVal)} Ad.`}
                                                        </td>

                                                        {/* Change % */}
                                                        <td className={cn("p-3 text-right font-medium w-24", colorClass)}>
                                                            {isPositive ? '+' : ''}{changePct.toFixed(1)}%
                                                        </td>


                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Expense Detail Modal */}
            {
                selectedExpense && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedExpense(null)}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                            {/* Header */}
                            <div className={`px-5 py-4 flex justify-between items-center bg-${selectedExpense.color}-50 border-b border-${selectedExpense.color}-100`}>
                                <h3 className={`text-sm font-bold uppercase tracking-wider text-${selectedExpense.color}-700`}>
                                    {selectedExpense.title} Gider Detayları
                                </h3>
                                <button
                                    onClick={() => setSelectedExpense(null)}
                                    className={`p-1 rounded-full hover:bg-${selectedExpense.color}-100 text-${selectedExpense.color}-600 transition-colors`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-0">
                                {selectedExpense.subItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                                            <span className="text-xs text-gray-400">Kalem {idx + 1}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-gray-900">₺{(item.value / 1000).toFixed(0)}K</span>
                                            <span className="text-xs font-medium text-gray-500">%{item.percent}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Totals */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">Toplam {selectedExpense.title}</span>
                                <div className="text-right">
                                    <div className="text-lg font-black text-gray-800">₺{(selectedExpense.value / 1000).toFixed(0)}K</div>
                                    <div className={`text-xs font-bold text-${selectedExpense.color}-600`}>%{selectedExpense.percent} Gelir Payı</div>
                                </div>
                            </div>

                        </div>
                    </div>
                )
            }

            {/* Net Margin Analysis Modal */}
            {
                isMarginModalOpen && (
                    <div id="margin-modal" className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMarginModalOpen(false)}></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl" onClick={e => e.stopPropagation()}>

                                <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Net Kâr Marjı Analizi</h3>
                                        <div className="flex items-baseline gap-3 mt-1">
                                            <span className="text-3xl font-bold text-gray-900">%{marginAnalysisStats.netProfitRatio.toFixed(1)}</span>
                                            <span className="text-sm font-medium text-gray-500">Hedef: <span className="text-gray-900 font-bold">%{marginTarget.toFixed(1)}</span></span>
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1", marginAnalysisStats.netProfitRatio >= marginTarget ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100")}>
                                                {marginAnalysisStats.netProfitRatio >= marginTarget ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                                )}
                                                {marginAnalysisStats.netProfitRatio >= marginTarget ? "Hedefin Üzerinde" : `Hedefin %${Math.abs(marginTarget - marginAnalysisStats.netProfitRatio).toFixed(1)} Altında`}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsMarginModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                <div className="px-6 py-6 space-y-8">

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">6 Aylık Trend</h4>
                                        <div className="relative h-40 w-full bg-gray-50 rounded-xl border border-gray-100 p-2">
                                            <div className="absolute top-[30%] left-0 right-0 border-t border-dashed border-gray-400 z-10"></div>
                                            <span className="absolute top-[22%] right-2 text-[9px] font-bold text-gray-500 bg-gray-50 px-1">Hedef %18</span>

                                            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M0,70 Q50,65 100,50 T200,60 T300,55" fill="url(#marginGradient)" stroke="none"></path>
                                                <path d="M0,70 Q50,65 100,50 T200,60 T300,55" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"></path>
                                                <circle cx="0" cy="70" r="3" fill="#10b981"></circle>
                                                <circle cx="100" cy="50" r="3" fill="#10b981"></circle>
                                                <circle cx="200" cy="60" r="3" fill="#10b981"></circle>
                                                <circle cx="300" cy="55" r="4" fill="white" stroke="#10b981" strokeWidth="2"></circle>
                                            </svg>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gelir Dağılımı (Maliyet Analizi)</h4>
                                            <span className="text-[10px] text-gray-400">100 TL'lik satışın hikayesi</span>
                                        </div>
                                        <div className="flex h-8 w-full rounded-lg overflow-hidden shadow-sm font-bold text-[10px] text-white leading-8 text-center bg-gray-100">
                                            {marginAnalysisStats.cogsRatio > 0 && <div className="bg-slate-500 hover:bg-slate-600 transition-colors" style={{ width: `${marginAnalysisStats.cogsRatio}%` }} title="Ürün Maliyeti">Ürün %{marginAnalysisStats.cogsRatio.toFixed(1)}</div>}
                                            {marginAnalysisStats.adsRatio > 0 && <div className="bg-orange-400 hover:bg-orange-500 transition-colors" style={{ width: `${marginAnalysisStats.adsRatio}%` }} title="Pazarlama">Ads %{marginAnalysisStats.adsRatio.toFixed(1)}</div>}
                                            {marginAnalysisStats.opsRatio > 0 && <div className="bg-blue-400 hover:bg-blue-500 transition-colors" style={{ width: `${marginAnalysisStats.opsRatio}%` }} title="Satış & Operasyon">Ops %{marginAnalysisStats.opsRatio.toFixed(1)}</div>}
                                            {marginAnalysisStats.netProfitRatio > 0 && (
                                                <div className="bg-emerald-500 hover:bg-emerald-600 transition-colors flex-grow relative" title="Net Kâr">
                                                    <span className="absolute inset-0 flex items-center justify-center">Net %{marginAnalysisStats.netProfitRatio.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        {marginAnalysisStats.adsRatio > 20 && (
                                            <div className="mt-2 text-[10px] text-orange-600 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                Dikkat: Pazarlama maliyet oranı (%{marginAnalysisStats.adsRatio.toFixed(1)}) sektör ortalamasının (~%20) üzerinde seyrediyor.
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Marjı Aşağı Çekenler (Son 30 Gün)</h4>
                                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase">
                                                    <tr>
                                                        <th className="px-4 py-2">Ürün</th>
                                                        <th className="px-4 py-2 text-right">Mevcut Marj</th>
                                                        <th className="px-4 py-2 text-right">Etki</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {marginAnalysisStats.worstMargins.map(p => (
                                                        <tr key={p.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded bg-gray-100 shrink-0">
                                                                    <img src={p.image} className="w-full h-full object-cover rounded" alt={p.name} />
                                                                </div>
                                                                <span className="font-bold text-gray-700 line-clamp-1" title={p.name}>{p.name}</span>
                                                            </td>
                                                            <td className={cn("px-4 py-3 text-right font-bold w-24", p.margin < 0 ? "text-rose-600" : "text-orange-500")}>
                                                                {p.margin > 0 ? "+" : ""}{p.margin.toFixed(1)}%
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-xs text-gray-400 w-32">{p.reason}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl">
                                    <button onClick={() => setIsMarginModalOpen(false)} className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-50 shadow-sm">
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Loss-Making Products Modal (Clean List Version) */}
            {
                isLossModalOpen && (
                    <div id="loss-modal" className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsLossModalOpen(false)}></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-3xl" onClick={e => e.stopPropagation()}>

                                <div className="bg-rose-50 px-6 py-5 border-b border-rose-100 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white rounded-full shadow-sm text-rose-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Zarar Eden Ürünler</h3>
                                            <p className="text-sm text-rose-700 font-medium">Toplam <span className="font-bold">{lossProductsStats.count} ürün</span> aylık <span className="font-extrabold text-rose-800 bg-rose-100 px-1 rounded">-₺{formatNumber(lossProductsStats.totalLossAmount)}</span> zarar oluşturuyor.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsLossModalOpen(false)} className="text-rose-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                <div className="overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3">Ürün Detayı</th>
                                                <th className="px-6 py-3 text-center">Satış Adedi (Ay)</th>
                                                <th className="px-6 py-3 text-right">Birim Zarar</th>
                                                <th className="px-6 py-3 text-right">Toplam Aylık Zarar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {lossProductsStats.count === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">Tebrikler, bu dönemde net zarar eden bir ürününüz bulunmuyor.</td>
                                                </tr>
                                            ) : (
                                                lossProductsStats.items.map(p => (
                                                    <tr key={p.id} className="hover:bg-rose-50/10 transition-colors">
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 p-0.5 shrink-0">
                                                                <img src={p.img || getFallbackProductImage(p.name)} className="w-full h-full object-cover rounded-md bg-white border border-gray-100" alt={p.name} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-gray-900 truncate block max-w-[200px]" title={p.name}>{p.name}</span>
                                                                <span className="text-xs text-gray-500 font-mono truncate max-w-[200px] block" title={p.id}>{p.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-medium text-gray-600">{formatNumber(p.unitsSold)} Adet</td>
                                                        <td className="px-6 py-4 text-right text-rose-500 font-medium whitespace-nowrap">-₺{Math.abs(p.netProfit).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="px-6 py-4 text-right whitespace-nowrap"><span className="font-bold text-rose-700">-₺{formatNumber(Math.abs(p.netProfitTotal))}</span></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl border-t border-gray-100">
                                    <button onClick={() => setIsLossModalOpen(false)} className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-all">
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MER Modal */}
            {
                isMerModalOpen && (
                    <div id="mer-modal" className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMerModalOpen(false)}></div>
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl" onClick={e => e.stopPropagation()}>
                                <div className="bg-amber-50 px-6 py-5 border-b border-amber-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Pazarlama Verimliliği (MER)</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-amber-600">{TOTAL_AD_BUDGET > 0 ? ((totalSales / TOTAL_AD_BUDGET)).toFixed(1) : 'B.Yok'}x</span>
                                            {TOTAL_AD_BUDGET > 0 && (
                                                <span className={cn("text-xs font-bold px-2 py-0.5 rounded", (totalSales / TOTAL_AD_BUDGET) >= 4 ? "text-amber-700 bg-amber-100" : "text-rose-700 bg-rose-100")}>
                                                    Hedef (4.0x) {(totalSales / TOTAL_AD_BUDGET) >= 4 ? "Üzerinde" : "Altında"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => setIsMerModalOpen(false)} className="text-amber-400 hover:text-amber-600 p-2 rounded-full hover:bg-amber-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-end"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kanal Bazlı Performans (Sadece API Akışı)</h4></div>
                                    {ga?.channels && Object.entries(ga.channels).map(([key, data]) => {
                                        if (data.cost <= 0 && data.revenue <= 0) return null;

                                        const title = key === 'googleAds' ? 'Google Ads (Search & Display)' :
                                            key === 'metaAds' ? 'Meta (FB/IG)' : 'Diğer Kanallar';

                                        const color = key === 'googleAds' ? 'emerald' :
                                            key === 'metaAds' ? 'orange' : 'blue';

                                        const roas = data.cost > 0 ? (data.revenue / data.cost) : 0;
                                        // Approximate split for visual bar based on channel share of total revenue
                                        const share = totalSales > 0 ? (data.revenue / totalSales) * 100 : 0;

                                        return (
                                            <div key={key} className="group">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-bold text-gray-700">{title}</span>
                                                    <span className={`text-sm font-bold text-${color}-600`}>{roas.toFixed(1)}x ROAS</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                    <span>Harcama: ₺{formatNumber(data.cost)}</span>
                                                    <span>Getiri: ₺{formatNumber(data.revenue)}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                    <div className={`bg-${color}-500 h-2.5 rounded-full`} style={{ width: `${Math.min(share, 100)}%` }}></div>
                                                </div>
                                                {roas < 2 && data.cost > 0 && <p className="text-[10px] text-gray-400 mt-1">Hedefin çok altında. Bütçeyi gözden geçirmeniz önerilir.</p>}
                                            </div>
                                        );
                                    })}
                                    {(!ga || ga.totalAdCost === 0) && (
                                        <div className="text-sm text-gray-500 italic text-center py-4">Gösterilecek aktif harcama verisi bulunamadı.</div>
                                    )}
                                </div>
                                <div className="bg-gray-50 px-6 py-4 text-right"><button onClick={() => setIsMerModalOpen(false)} className="text-sm font-bold text-gray-600 hover:text-gray-900">Kapat</button></div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Return Modal */}
            {
                isReturnModalOpen && (
                    <div id="return-modal" className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsReturnModalOpen(false)}></div>
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl" onClick={e => e.stopPropagation()}>
                                <div className="bg-purple-50 px-6 py-5 border-b border-purple-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">İade Kaynaklı Kayıp</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-purple-700">-₺{formatNumber(totalReturnAmt)}</span>
                                            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Reel Tutar Toplamı</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsReturnModalOpen(false)} className="text-purple-400 hover:text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="p-0">
                                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">En Yüksek Kayıp Yaratanlar (Bu Dönem)</div>
                                    <table className="w-full text-left text-sm">
                                        <tbody className="divide-y divide-gray-100">
                                            {returnProductsStats.items.length === 0 ? (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Bu dönemde iade edilen ürün bulunmuyor.</td></tr>
                                            ) : (
                                                returnProductsStats.items.map(p => (
                                                    <tr key={p.id} className="hover:bg-purple-50/10 transition-colors">
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-gray-100 shrink-0">
                                                                <img src={p.img || getFallbackProductImage(p.name)} className="w-full h-full object-cover rounded" alt={p.name} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-gray-700 block truncate max-w-[200px] sm:max-w-[250px]" title={p.name}>{p.name}</span>
                                                                <span className="text-[10px] text-gray-400 font-mono block truncate max-w-[200px]" title={p.id}>{p.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-right text-gray-500">{p.returnQty} İade</td>
                                                        <td className="px-6 py-3 text-right font-bold text-purple-600">-₺{formatNumber(p.returnAmt)}</td>
                                                        <td className="px-6 py-3 text-xs text-gray-400 text-right w-24">({((p.returnQty / (p.unitsSold || 1)) * 100).toFixed(1)}% Oran)</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 text-right"><button onClick={() => setIsReturnModalOpen(false)} className="text-sm font-bold text-gray-600 hover:text-gray-900">Kapat</button></div>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};
