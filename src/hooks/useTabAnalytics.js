import { useMemo } from 'react';
import competitorsFallback from '../server/competitors.json';

export function useTabAnalytics(orders, products, globalDateRange) {
    return useMemo(() => {
        // Fallback states if data is missing
        if (!orders || !products) {
            return {
                productsTab: null,
                competitionTab: null,
                inventoryTab: null
            };
        }

        const activeStartDate = new Date(globalDateRange.startDate);
        const activeEndDate = new Date(globalDateRange.endDate);
        activeEndDate.setHours(23, 59, 59, 999);

        const diffTime = Math.abs(activeEndDate - activeStartDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        // ---- SALES TAB LOGIC (Deep Analytics) ----
        let totalSalesRevenue = 0;
        let totalUniqueOrders = new Set();
        const basketBrackets = { '0-250₺': 0, '250-750₺': 0, '750-1500₺': 0, '1500₺+': 0 };
        const heatmap = {
            'Pzt': { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
            'Sal': { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
            'Çar': { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
            'Per': { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
            'Cum': { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
            'Cmt': { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 },
            'Paz': { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 }
        };
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

        const marginBrackets = {
            high: { label: 'Yüksek Kâr (>%30)', value: 0, revenue: 0 },
            medium: { label: 'Orta Kâr (%10-30)', value: 0, revenue: 0 },
            low: { label: 'Düşük Kâr (0-10%)', value: 0, revenue: 0 },
            loss: { label: 'Zararına (<0%)', value: 0, revenue: 0 }
        };

        let returnedItemsCount = 0;
        let returnedItemsRevenue = 0;
        let successfulItemsCount = 0;

        const allActiveOrders = orders.filter(o => {
            const d = new Date(o.dateRaw);
            return d >= activeStartDate && d <= activeEndDate;
        });

        allActiveOrders.forEach(o => {
            const rev = o.revenue || 0;
            const isReturned = o.statusObj?.label === 'İptal' || o.statusObj?.label === 'İade';

            if (isReturned) {
                returnedItemsCount++;
                returnedItemsRevenue += rev;
                return; // skip success metrics
            }

            successfulItemsCount++;
            totalSalesRevenue += rev;
            // Best effort unique order id: use orderNumber or orderId if available. Fallback to just counting if missing.
            const uniqueId = o.orderNumber || o.id || Math.random().toString();
            totalUniqueOrders.add(uniqueId);

            // Basket Brackets
            if (rev <= 250) basketBrackets['0-250₺']++;
            else if (rev <= 750) basketBrackets['250-750₺']++;
            else if (rev <= 1500) basketBrackets['750-1500₺']++;
            else basketBrackets['1500₺+']++;

            // Margin Brackets
            const margin = rev > 0 ? (o.profit / rev) * 100 : 0;
            if (margin > 30) { marginBrackets.high.value++; marginBrackets.high.revenue += rev; }
            else if (margin >= 10) { marginBrackets.medium.value++; marginBrackets.medium.revenue += rev; }
            else if (margin >= 0) { marginBrackets.low.value++; marginBrackets.low.revenue += rev; }
            else { marginBrackets.loss.value++; marginBrackets.loss.revenue += rev; }

            // Heatmap
            const orderDate = new Date(o.dateRaw);
            const dayName = dayNames[orderDate.getDay()]; // 0 is Sunday
            const hour = orderDate.getHours();
            let block = 'Night';
            if (hour >= 6 && hour < 12) block = 'Morning';
            else if (hour >= 12 && hour < 18) block = 'Afternoon';
            else if (hour >= 18 && hour < 24) block = 'Evening';

            heatmap[dayName][block]++;
        });

        // Heatmap array conversion for Recharts
        const heatmapData = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => ({
            name: day,
            '00:00 - 06:00': heatmap[day].Night,
            '06:00 - 12:00': heatmap[day].Morning,
            '12:00 - 18:00': heatmap[day].Afternoon,
            '18:00 - 24:00': heatmap[day].Evening
        }));

        const aov = totalUniqueOrders.size > 0 ? totalSalesRevenue / totalUniqueOrders.size : 0;
        const returnRate = (successfulItemsCount + returnedItemsCount) > 0
            ? (returnedItemsCount / (successfulItemsCount + returnedItemsCount)) * 100 : 0;

        const salesTab = {
            aov: Math.round(aov),
            totalUniqueOrders: totalUniqueOrders.size,
            basketBrackets: Object.entries(basketBrackets).map(([k, v]) => ({ name: k, value: v })),
            heatmapData,
            marginBrackets: Object.values(marginBrackets),
            operationalLeaks: {
                returnedValue: Math.round(returnedItemsRevenue),
                returnRate: returnRate.toFixed(1)
            }
        };

        // 1. Group Orders by Product
        const productStats = {};

        // Initialize from products array to capture items with 0 sales
        products.forEach(p => {
            productStats[p.name] = {
                id: p.id,
                name: p.name,
                revenue: 0,
                profit: 0,
                unitsSold: 0,
                stock: p.stock || 0,
                price: p.price || 0,
                category: p.category || 'Diğer'
            };
        });

        // Tally actual orders
        const validOrders = orders.filter(o => {
            if (o.statusObj?.label === 'İptal' || o.statusObj?.label === 'İade') return false;
            const orderDate = new Date(o.dateRaw);
            return orderDate >= activeStartDate && orderDate <= activeEndDate;
        });

        validOrders.forEach(o => {
            const name = o.productName || 'Bilinmeyen Ürün';
            if (!productStats[name]) {
                productStats[name] = {
                    id: o.productId,
                    name: name,
                    revenue: 0,
                    profit: 0,
                    unitsSold: 0,
                    stock: 0,
                    price: o.revenue || 0,
                    category: o.category || 'Diğer'
                };
            }
            productStats[name].revenue += (o.revenue || 0);
            productStats[name].profit += (o.profit || 0);
            productStats[name].unitsSold += 1; // Assuming 1 unit per order line for simplification
        });

        const activeProducts = Object.values(productStats).filter(p => p.revenue > 0);

        // ---- PRODUCTS TAB LOGIC (BCG Matrix & Top/Bottom) ----
        activeProducts.sort((a, b) => b.unitsSold - a.unitsSold);
        const medianUnits = activeProducts.length > 0
            ? activeProducts[Math.floor(activeProducts.length / 2)].unitsSold
            : 0;

        let champions = { count: 0, items: [] };
        let sleepers = { count: 0, items: [] };
        let dogs = { count: 0, items: [] };

        activeProducts.forEach(p => {
            const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
            const isHighVol = p.unitsSold >= medianUnits && p.unitsSold > 0;
            const isHighMargin = margin >= 20;

            if (margin <= 0) {
                dogs.count++;
                dogs.items.push(p);
            } else if (isHighVol && isHighMargin) {
                champions.count++;
                champions.items.push(p);
            } else if (!isHighVol && isHighMargin) {
                sleepers.count++;
                sleepers.items.push(p);
            } else {
                // Products in median zones (e.g. high vol, low but positive margin) can be grouped with dogs or sleepers
                if (isHighVol) {
                    dogs.count++;
                    dogs.items.push(p);
                } else {
                    sleepers.count++;
                    sleepers.items.push(p);
                }
            }
        });

        const sortedByProfit = [...activeProducts].sort((a, b) => b.profit - a.profit);
        const top5 = sortedByProfit.slice(0, 5);
        const bottom5 = [...sortedByProfit].reverse().slice(0, 5);

        const productsTab = {
            bcg: { champions, sleepers, dogs },
            top5,
            bottom5
        };

        // ---- COMPETITION TAB LOGIC ----
        let totalPriceDiffPct = 0;
        let compMatchCount = 0;
        let opportunityCost = 0;

        // Extract products mapped to competitors
        // competitor.productId points to our internal product ID, supposedly
        const compByProdId = {};
        competitorsFallback.forEach(c => {
            if (!compByProdId[c.productId]) compByProdId[c.productId] = [];
            compByProdId[c.productId].push(c);
        });

        Object.values(productStats).forEach(p => {
            const comps = compByProdId[p.id] || [];
            if (comps.length > 0 && p.price > 0) {
                const avgCompPrice = comps.reduce((sum, c) => sum + c.price, 0) / comps.length;
                const diffPct = ((p.price - avgCompPrice) / avgCompPrice) * 100;
                totalPriceDiffPct += diffPct;
                compMatchCount++;

                // Opportunity cost: if we are at least 5% cheaper than the competitor average, and we sold items
                // we could have mathematically sold them at (avgCompPrice - 1 TL) and still been the chosen one
                if (diffPct < -5 && p.unitsSold > 0) {
                    const missedMarginPerUnit = (avgCompPrice * 0.95) - p.price; // Target 5% below market
                    if (missedMarginPerUnit > 0) {
                        opportunityCost += missedMarginPerUnit * p.unitsSold;
                    }
                }
            }
        });

        const marketIndex = compMatchCount > 0 ? (totalPriceDiffPct / compMatchCount) : 0;

        const competitionTab = {
            marketIndex: isNaN(marketIndex) ? 0 : marketIndex,
            opportunityCost: Math.round(opportunityCost)
        };

        // ---- INVENTORY TAB LOGIC ----
        let deadCapital = 0;
        let oosRiskValue = 0;

        Object.values(productStats).forEach(p => {
            // Dead capital: Stock > 0 but 0 units sold in the active period
            if (p.unitsSold === 0 && p.stock > 0) {
                // Approximation of COGS if not explicit = 25% of price
                const estimatedCogs = p.price * 0.25;
                deadCapital += (p.stock * estimatedCogs);
            }

            // OOS Risk: Velocity > 0, stock will run out in < 15 days
            if (p.unitsSold > 0 && p.stock > 0) {
                const dailyVelocity = p.unitsSold / diffDays;
                const daysUntilOos = p.stock / dailyVelocity;

                if (daysUntilOos < 15) {
                    // Estimate 30 days of lost revenue if not restocked
                    const lostRevenue30d = dailyVelocity * 30 * p.price;
                    oosRiskValue += lostRevenue30d;
                }
            }
        });

        const inventoryTab = {
            deadCapital: Math.round(deadCapital),
            oosRisk: Math.round(oosRiskValue)
        };

        return {
            salesTab,
            productsTab,
            competitionTab,
            inventoryTab
        };
    }, [orders, products, globalDateRange]);
}
