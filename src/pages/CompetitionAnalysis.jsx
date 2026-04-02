import React, { useState, useEffect } from 'react';
import competitorsFallback from '../server/competitors.json';
import targetsFallback from '../server/targets.json';
import {
    ArrowRight,
    ExternalLink,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Zap,
    Target,
    ShieldAlert,
    Swords,
    BarChart3,
    Settings,
    X,
    Plus,
    Globe,
    Store,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    PieChart,
    Sparkles,
    Info,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { cn } from '../lib/utils';
import { useIkasProducts } from '../hooks/useIkasProducts';
import { useOrders, getFallbackProductImage } from '../hooks/useOrdersLive';
import productCosts from '../data/productCosts.json';

// Helper for Sparkline SVG Path
const generateSparklinePath = (data, width = 100, height = 30) => {
    if (!data || data.length === 0) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    return data.map((val, i) => {
        const x = i * stepX;
        const y = height - ((val - min) / range) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
};

export const CompetitionAnalysis = () => {
    // State for Competitor Manager
    const [isManagerOpen, setIsManagerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [showNewCandidates, setShowNewCandidates] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [manualUrl, setManualUrl] = useState('');
    const [isLoadingManual, setIsLoadingManual] = useState(false);

    // Price Positioning Time Selection
    const [positionTimePeriod, setPositionTimePeriod] = useState('live');
    // New: Position Benchmark Selection
    const [positionBenchmark, setPositionBenchmark] = useState('market');

    const handlePositionTimeChange = (e) => {
        setPositionTimePeriod(e.target.value);
        // In a real app, this would trigger a data fetch or filter
    };

    const handleBenchmarkChange = (e) => {
        setPositionBenchmark(e.target.value);
    };

    // Chart Refresh Logic (Simulated)
    const [isChartRefreshing, setIsChartRefreshing] = useState(false);

    useEffect(() => {
        // Prevent running on initial mount if not desired, or let it run to show initial load. 
        // Showing for interaction.
        setIsChartRefreshing(true);

        // Find labels for logging
        const benchMap = { 'market': 'Piyasa Ortalaması', 'techshop': 'TechShop', 'megastore': 'MegaStore', 'amazon': 'Amazon' };
        const timeMap = { 'live': 'Canlı Görünüm', '7days': '7 Gün Önce', '30days': 'Geçen Ay', '3months': '3 Ay Önce' };

        console.log(`Chart Refresh: Comparing against [${benchMap[positionBenchmark]}] during [${timeMap[positionTimePeriod]}]`);

        const timer = setTimeout(() => {
            setIsChartRefreshing(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [positionBenchmark, positionTimePeriod]);

    // New: Pending Candidate State (Shared by Scan and Manual)
    const [pendingCandidate, setPendingCandidate] = useState(null);

    // Bulk Competitor Match State
    const [isBulkMatchOpen, setIsBulkMatchOpen] = useState(false);
    const [bulkMatchStep, setBulkMatchStep] = useState(1); // 1: Input, 2: Loading, 3: Review
    const [bulkScanError, setBulkScanError] = useState('');
    const [bulkSelectedChannel, setBulkSelectedChannel] = useState(''); // New: 'Web', 'Trendyol', 'Hepsiburada', 'Amazon', 'Pazarama'
    const [bulkCompetitorInput, setBulkCompetitorInput] = useState('');

    useEffect(() => {
        fetch('/api/targets')
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => {
                if (data.channel) setBulkSelectedChannel(data.channel);
                if (data.targets) setBulkCompetitorInput(data.targets);
            })
            .catch(err => {
                console.warn("Falling back to offline Targets DB", err);
                if (targetsFallback.channel) setBulkSelectedChannel(targetsFallback.channel);
                if (targetsFallback.targets) setBulkCompetitorInput(targetsFallback.targets);
            });
    }, []);
    const [bulkMatchResults, setBulkMatchResults] = useState([]);
    const [trendModalOpen, setTrendModalOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [selectedTrendProduct, setSelectedTrendProduct] = useState(null);
    const [trendChartData, setTrendChartData] = useState([]);

    const handleOpenTrendModal = (product) => {
        // Generate real daily history for the last 30 days based on fetchedOrders
        const history = [];
        const basePrice = product.myPrice || 450;
        const compPrice = product.competitorPrice || basePrice;

        // Mock base prices for other competitors as before, since they aren't in fetchedOrders
        const amazonBase = basePrice * 1.05;
        const megaStoreBase = basePrice * 0.98;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Pre-calculate daily averages for our product
        const dailyMyPrices = {};
        if (fetchedOrders) {
            fetchedOrders.forEach(order => {
                if (order.dateRaw >= thirtyDaysAgo && order.dateRaw <= now) {
                    const oNameStr = (order.productName || '').toLowerCase();
                    const pNameStr = (product.name || '').toLowerCase();
                    if (oNameStr.includes(pNameStr) || pNameStr.includes(oNameStr)) {
                        const dateStr = order.dateRaw.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                        if (!dailyMyPrices[dateStr]) dailyMyPrices[dateStr] = [];
                        dailyMyPrices[dateStr].push(order.revenue / (order.quantity || 1)); // unit price
                    }
                }
            });
        }

        let lastKnownPrice = basePrice;

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

            // Resolve real price or carry forward
            if (dailyMyPrices[dateStr] && dailyMyPrices[dateStr].length > 0) {
                const sum = dailyMyPrices[dateStr].reduce((a, b) => a + b, 0);
                lastKnownPrice = sum / dailyMyPrices[dateStr].length;
            }

            // Real data for our price, deterministic static variance for competitors (since no API for them yet)
            const varianceComp = Math.sin(i * 0.5) * 8;
            const varianceAmazon = Math.cos(i * 0.3) * 5;
            const varianceMega = Math.sin(i * 0.7) * 10;

            history.push({
                date: dateStr,
                userPrice: Math.max(0, lastKnownPrice),
                compPrice: Math.max(0, compPrice + varianceComp),
                amazonPrice: Math.max(0, amazonBase + varianceAmazon),
                megaStorePrice: Math.max(0, megaStoreBase + varianceMega)
            });
        }

        setTrendChartData(history);
        setSelectedTrendProduct(product);
        setIsClosing(false);
        setTrendModalOpen(true);
    };

    const handleCloseTrendModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setTrendModalOpen(false);
            setSelectedTrendProduct(null);
            setIsClosing(false);
        }, 200);
    };

    // AI Action Modal State
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'sending' | 'success'
    const [copyStatus, setCopyStatus] = useState('idle'); // 'idle' | 'copied'

    const handleOpenActionModal = () => {
        setEmailStatus('idle');
        setCopyStatus('idle');
        setIsActionModalOpen(true);
    };
    const handleCloseActionModal = () => setIsActionModalOpen(false);

    const handleExecuteActionPlan = () => {
        // Here you would implement the actual logic to apply changes
        alert("Aksiyon planı başarıyla uygulandı!");
        setIsActionModalOpen(false);
    };

    const handleShareViaEmail = () => {
        setEmailStatus('sending');

        setTimeout(() => {
            setEmailStatus('success');
            alert("Aksiyon planı 'eticaret@sirket.com' adresine başarıyla raporlandı.");

            setTimeout(() => {
                handleCloseActionModal();
                setEmailStatus('idle');
            }, 1200);
        }, 1500);
    };

    const handleCopyToClipboard = () => {
        // Collect checked strategies (Simulated access to checked items logic)
        // In a fully controlled component, we would map over state. 
        // For this specific UI, we are selecting all simulated items.

        const report = `🚀 *AI FinOps Aksiyon Planı*

✅ 1. Agresif Ürünlerde Kâr Artışı (+₺1.250/ay)
✅ 2. TechShop Savunma Kalkanı (Hedef: %95 Buybox Oranı)
✅ 3. Kopuk Ürünlerde Stok Eritme (Beklenen Nakit: ₺4.500)
✅ 4. Fırsat Ürünlerinde Buybox Atağı (Potansiyel Ciro Artışı: %12)
✅ 5. Psikolojik Fiyatlama Optimizasyonu (Beklenen Dönüşüm Etkisi: +%0.5)

🔗 Detaylar için panele gidin.`;

        navigator.clipboard.writeText(report).then(() => {
            setCopyStatus('copied');
            // alert("Aksiyon planı panoya kopyalandı."); // Removed alert to rely on button state simply

            setTimeout(() => {
                setCopyStatus('idle');
            }, 2000);
        });
    };

    const handleAddManualUrl = async () => {
        if (!manualUrl.trim()) {
            alert("Lütfen geçerli bir ürün linki girin.");
            return;
        }

        setIsLoadingManual(true);
        try {
            // Give AI a list of all our canonical product names to fuzzy-match against
            const ikasNames = fetchedProducts ? fetchedProducts.map(p => p.name || '') : [];
            
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: manualUrl.trim(), ikasProductNames: ikasNames })
            });

            if(!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Tarama hatası');
            }

            const json = await res.json();
            const payload = json.data;

            setPendingCandidate({
                name: payload.scrapedTitle || 'İsimsiz Rakip',
                price: payload.scrapedPrice || 0,
                source: payload.source || 'Bilinmiyor',
                sourceType: 'manual',
                url: payload.url,
                note: payload.bestMatch?.name ? `Yapay Zeka Eşleşmesi: ${payload.bestMatch.name} (${payload.bestMatch.confidencePct}%)` : 'Otomatik eşleşme bulunamadı',
                suggestedProductId: payload.bestMatch?.name ? fetchedProducts?.find(p => p.name === payload.bestMatch.name)?.id : null
            });
            
            // If the AI found a highly confident match, automatically focus the UI on the matching product ID
            if(payload.bestMatch?.confidencePct > 60) {
                 const matchedDbProd = fetchedProducts?.find(p => p.name === payload.bestMatch.name);
                 if(matchedDbProd) setSelectedProduct(matchedDbProd);
            }

            setShowNewCandidates(true);
            setManualUrl('');
        } catch(error) {
            console.error("Scan failed:", error);
            alert("Rakip taranamadı: " + error.message);
        } finally {
            setIsLoadingManual(false);
        }
    };

    // Dynamic Competitor List (Loaded from backend JSON)
    const [competitors, setCompetitors] = useState([]);

    const saveCompetitorsToDB = async (updatedList) => {
        try {
            await fetch('/api/competitors', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedList)
            });
        } catch (err) {
            console.error("Failed to sync competitors to DB:", err);
        }
    };

    // Fetch saved competitors on mount
    useEffect(() => {
        fetch('/api/competitors')
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(data => {
                if (Array.isArray(data)) {
                    setCompetitors(data);
                }
            })
            .catch(err => {
                console.warn("Vercel Edge offline fallback for Competitors");
                if (competitorsFallback && Array.isArray(competitorsFallback)) {
                    setCompetitors(competitorsFallback);
                }
            });
    }, []);

    // Fetch Real Data
    const { products: fetchedProducts, loading: productsLoading } = useIkasProducts();
    const { orders: fetchedOrders, loading: ordersLoading } = useOrders();

    // Map Real Products to Competitor Analysis Structure
    const products = React.useMemo(() => {
        if (!fetchedProducts || fetchedProducts.length === 0) return [];

        // Pre-calculate order stats to link to total/channel sales
        const orderStats = {};
        fetchedOrders.forEach(order => {
            const status = order.statusObj?.label || '';
            const isReturn = status === 'İade' || status === 'İptal' || status === 'CANCELLED' || status === 'REFUNDED';
            if (isReturn) return; // Skip returns for gross units

            order.lineItems?.forEach(item => {
                const name = item.name || '';
                const qty = item.quantity || 1;
                const channel = order.sourceName || 'Site';

                if (!orderStats[name]) {
                    orderStats[name] = { totalSales: 0, channelSales: { 'Trendyol': 0, 'Hepsiburada': 0, 'Amazon': 0, 'Site': 0 }, tyRevenue: 0 };
                }
                orderStats[name].totalSales += qty;

                if (channel.toLowerCase().includes('trendyol')) {
                    orderStats[name].channelSales['Trendyol'] += qty;
                    orderStats[name].tyRevenue += (item.finalPrice || item.price || 0) * qty;
                } else if (channel.toLowerCase().includes('hepsiburada')) {
                    orderStats[name].channelSales['Hepsiburada'] += qty;
                } else if (channel.toLowerCase().includes('amazon')) {
                    orderStats[name].channelSales['Amazon'] += qty;
                } else {
                    orderStats[name].channelSales['Site'] += qty;
                }
            });
        });

        return fetchedProducts.map((p, i) => {
            const basePrice = p.price || 100;

            // Match order stats by name fuzziness
            const pNameStr = p.name ? p.name.toLowerCase() : '';
            const matchName = Object.keys(orderStats).find(oName => {
                const oNameStr = oName.toLowerCase();
                return oNameStr.includes(pNameStr) || pNameStr.includes(oNameStr);
            });

            const stats = matchName ? orderStats[matchName] : { totalSales: 0, channelSales: { 'Trendyol': 0, 'Hepsiburada': 0, 'Amazon': 0, 'Site': 0 } };

            const productCompetitors = competitors.filter(c => c.productId === p.id);
            const activeComp = productCompetitors.find(c => c.status === 'Takipte') || productCompetitors[0];

            let simulatedCompPrice = null;
            let gapPct = 0;
            let buyboxOwner = true;

            if (activeComp && activeComp.price > 0) {
                simulatedCompPrice = activeComp.price;
                gapPct = ((basePrice - simulatedCompPrice) / simulatedCompPrice) * 100;
                buyboxOwner = basePrice <= simulatedCompPrice;
            }

            // Calculate Real Costs and Margin
            const skuKey = p.sku || 'DEFAULT';
            const costs = productCosts[skuKey] || productCosts['DEFAULT'] || { cogs: 300, shipping: 45 };
            const kdvRate = 0.20;
            const commRate = 0.15; // standard 15% marketplace commission simulation

            // Using identical logic to ProductProfitability
            const netPriceWithoutKdv = basePrice / (1 + kdvRate);
            const commission = basePrice * commRate;
            const totalVariableCost = costs.cogs + costs.shipping + commission;
            const profit = netPriceWithoutKdv - totalVariableCost;
            const margin = basePrice > 0 ? (profit / basePrice) * 100 : 0;
            const isProfitable = margin > 0;
            const isMarginLow = margin > 0 && margin <= 15; // Define < 15% as 'sınırda' (at limit)
            const isCheaper = simulatedCompPrice ? basePrice < simulatedCompPrice : false;
            const isMoreExpensive = simulatedCompPrice ? basePrice > simulatedCompPrice : false;

            let position = 'kayip';
            let positionLabel = '-';
            let positionColor = 'gray';
            let positionBadge = 'Rakip Yok';
            let btnAction = 'İzle';
            let btnColor = 'gray';

            if (simulatedCompPrice) {
                // Determine margin AT competitor's price (to check if we have discount room)
                const netPriceAtCompWithoutKdv = simulatedCompPrice / (1 + kdvRate);
                const commissionAtComp = simulatedCompPrice * commRate;
                const totalVariableCostAtComp = costs.cogs + costs.shipping + commissionAtComp;
                const profitAtCompPrice = netPriceAtCompWithoutKdv - totalVariableCostAtComp;

                if (profit > 0 && basePrice <= simulatedCompPrice) {
                    // Güçlü: Hem kârlı hem rakipten uygun (veya eşit)
                    position = 'guclu';
                    positionLabel = 'Güçlü';
                    positionColor = 'emerald';
                    positionBadge = 'Kârlı ve Ucuz';
                    btnAction = 'İzle';
                    btnColor = 'gray';
                } else if (profit > 0 && basePrice > simulatedCompPrice) {
                    if (profitAtCompPrice > 0) {
                        // Ayarlanabilir: Kârlı ama pahalı, indirim şansı var
                        position = 'ayarlanabilir';
                        positionLabel = 'Ayarlanabilir';
                        positionColor = 'blue';
                        positionBadge = 'Fiyat Kırılabilir';
                        btnAction = 'Fiyat Kır';
                        btnColor = 'indigo';
                    } else {
                        // Kilitli: Kârlı ama pahalı, marjı sınırda
                        position = 'kilitli';
                        positionLabel = 'Kilitli';
                        positionColor = 'purple';
                        positionBadge = 'Marj Sınırda';
                        btnAction = 'Detay';
                        btnColor = 'gray';
                    }
                } else if (profit <= 0 && basePrice < simulatedCompPrice) {
                    if (profitAtCompPrice > 0) {
                        // İyileştirilebilir: Zararda ama fiyat artışıyla kurtarılabilir
                        position = 'iyilestirilebilir';
                        positionLabel = 'İyileştirilebilir';
                        positionColor = 'amber';
                        positionBadge = 'Gereksiz Ucuz';
                        btnAction = 'Kâr Artır';
                        btnColor = 'amber';
                    } else {
                        // Sıkışmış: Zararda ve maliyet yüzünden kâra geçemiyor (Rakip fiyatını yakalasa bile zararda)
                        position = 'sikismis';
                        positionLabel = 'Sıkışmış';
                        positionColor = 'gray';
                        positionBadge = 'Maliyet Engeli';
                        btnAction = 'Yönet';
                        btnColor = 'gray';
                    }
                } else if (profit <= 0 && basePrice >= simulatedCompPrice) {
                    // Zayıf: Zararda ve rakipten pahalı (Çıkış yok)
                    position = 'zayif';
                    positionLabel = 'Zayıf';
                    positionColor = 'rose';
                    positionBadge = 'Zararına Satış';
                    btnAction = 'Analiz Et';
                    btnColor = 'rose';
                }
            } else {
                // Rakibi olmayan ürünleri durum tanımlarına göre kendi içlerinde işaretle
                if (margin > 0) {
                    position = 'guclu';
                    positionLabel = 'Güçlü';
                    positionColor = 'emerald';
                    positionBadge = 'Rakipsiz (Kârlı)';
                    btnAction = 'İzle';
                    btnColor = 'gray';
                } else {
                    position = 'iyilestirilebilir';
                    positionLabel = 'İyileştirilebilir';
                    positionColor = 'amber';
                    positionBadge = 'Rakipsiz (Zararda)';
                    btnAction = 'Kâr Artır';
                    btnColor = 'amber';
                }
            }

            const tyUnitsRaw = stats.channelSales['Trendyol'] || 0;
            const tyRevenue = stats.tyRevenue || 0;
            const tySalesPrice = tyUnitsRaw > 0 ? tyRevenue / tyUnitsRaw : basePrice;

            return {
                id: p.id,
                sku: p.sku || `SKU-00${i + 1}`,
                name: p.name,
                category: p.category || 'Belirtilmemiş',
                image: p.images?.length > 0 && p.images[0].imageId ? `https://image.ikas.com/ik-img/${p.images[0].imageId}` : getFallbackProductImage(p.name),
                myPrice: basePrice,
                competitorPrice: simulatedCompPrice,
                margin: margin,
                competitorName: activeComp ? activeComp.name : 'Rakip Yok',
                competitorSource: activeComp ? activeComp.source : null,
                activeCompetitors: productCompetitors.length,
                buyboxOwner: buyboxOwner,
                gap: gapPct,
                totalSales: stats.totalSales,
                channelSales: stats.channelSales,
                position: position,
                positionLabel: positionLabel,
                positionColor: positionColor,
                status: positionBadge, // Displaying badge instead of status
                btnAction: btnAction,
                btnColor: btnColor,
                trendyolMetrics: {
                    price: tySalesPrice,
                    sales: tyUnitsRaw,
                    competitorName: '-',
                    positionLabel: null
                },
                historyMe: Array.from({ length: 7 }).map((_, idx) => {
                    // Extract the last 7 days of real userPrice from our trend generation logic, locally scoped
                    const now = new Date();
                    const targetDate = new Date(now.getTime() - (6 - idx) * 24 * 60 * 60 * 1000);
                    let histPrice = basePrice;
                    if (fetchedOrders) {
                        const matchingOrders = fetchedOrders.filter(o =>
                            o.dateRaw &&
                            o.dateRaw.toDateString() === targetDate.toDateString() &&
                            ((o.productName || '').toLowerCase().includes(pNameStr) || pNameStr.includes((o.productName || '').toLowerCase()))
                        );
                        if (matchingOrders.length > 0) {
                            histPrice = matchingOrders.reduce((acc, o) => acc + (o.revenue / (o.quantity || 1)), 0) / matchingOrders.length;
                        }
                    }
                    return histPrice;
                }),
                historyComp: Array(7).fill(0).map(() => simulatedCompPrice || basePrice),
                status: isCheaper ? 'Lider' : (isMoreExpensive ? 'Kaybetti' : 'Rekabetçi'),
                position: position,
                positionLabel: positionLabel,
                positionColor: positionColor,
                positionBadge: positionBadge,
                totalSales: stats.totalSales,
                channelSales: stats.channelSales,
                btnLabel: btnAction,
                btnColor: btnColor
            };
        });
    }, [fetchedProducts, fetchedOrders, competitors]);

    // KPI Calculations based on real products
    const kpiData = React.useMemo(() => {
        let winWinCount = 0;
        let totalWinSales = 0;
        let totalAllSales = 0;
        let totalTrackedCount = 0;

        let riskRevenue = 0;
        let riskCount = 0;

        let compCountMap = {};

        products.forEach(p => {
            const pSales = (p.totalSales || 0) * (p.myPrice || 0);
            totalAllSales += pSales;

            if (p.competitorPrice) {
                totalTrackedCount++;
                if (p.buyboxOwner) {
                    winWinCount++;
                    totalWinSales += pSales;
                } else { // Lost buybox
                    riskCount++;
                    riskRevenue += pSales;

                    if (p.competitorSource && p.competitorSource !== 'Rakip Yok') {
                        let brandRaw = p.competitorSource.replace('www.', '').replace('.com', '').replace('.tr', '').replace('/', '');
                        let brand = brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1);
                        compCountMap[brand] = (compCountMap[brand] || 0) + 1;
                    }
                }
            }
        });

        const winRate = totalTrackedCount > 0 ? (winWinCount / totalTrackedCount) * 100 : 0;
        const ciroPayi = totalAllSales > 0 ? (totalWinSales / totalAllSales) * 100 : 0;

        let maxComp = { name: '-', count: 0 };
        for (const [name, count] of Object.entries(compCountMap)) {
            if (count > maxComp.count) {
                maxComp = { name, count };
            }
        }

        return {
            winRate,
            ciroPayi,
            winCount: winWinCount,
            totalTrackedCount,
            riskRevenue,
            riskCount,
            intenseCount: competitors.length,
            aggressiveName: maxComp.name,
            aggressiveCount: maxComp.count
        };
    }, [products, competitors]);

    const actionPlan = React.useMemo(() => {
        const plan = [];
        
        let buyboxAttackProducts = [];
        let marginOppProducts = [];
        let stockClearanceProducts = [];

        products.forEach(p => {
             if (p.competitorPrice) {
                 const priceDiffPct = Math.abs(p.myPrice - p.competitorPrice) / p.myPrice;
                 
                 if (!p.buyboxOwner) {
                     if (priceDiffPct <= 0.05) {
                         buyboxAttackProducts.push(p);
                     } else if (priceDiffPct > 0.15) {
                         stockClearanceProducts.push(p);
                     }
                 } else {
                     if (priceDiffPct > 0.10) {
                         // We are the winner, but we are >10% cheaper than the competitor! Bad!
                         marginOppProducts.push(p);
                     }
                 }
             }
        });

        // 1. Margin Opp
        if (marginOppProducts.length > 0) {
            plan.push({
                id: 'margin_opp',
                title: 'Kâr Optimizasyonu Fırsatı',
                badge: 'KÂR ARTIRIMI',
                color: 'emerald',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
                desc: `${marginOppProducts.length} adet üründe rakipten gereğinden fazla ucuzuz (Buybox bizde). Rekabetçi konumunuzu kaybetmeden fiyatları yukarı yönlü test edip kârlılığınızı artırmayı değerlendirebilirsiniz.`,
                impact: `Gizli kâr potansiyelinin açığa çıkarılması`,
                selected: true
            });
        }

        // 2. Buybox Attack
        if (buyboxAttackProducts.length > 0) {
            plan.push({
                id: 'buybox_attack',
                title: 'Fırsat Ürünlerinde Rekabet Atağı',
                badge: 'BÜYÜME',
                color: 'purple',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
                desc: `Fiyat farkının birbirine çok yakın olduğu ${buyboxAttackProducts.length} üründe mikro fiyat stratejileri deneyerek pazar payınızı genişletme fırsatı bulunuyor. Kâr marjınız elveriyorsa ufak indirimler test edilebilir.`,
                impact: `Satış hacminde ve görünürlükte olası artış`,
                selected: true
            });
        }

        // 3. Defense against Aggressive Name
        if (kpiData.aggressiveName && kpiData.aggressiveName !== '-') {
             plan.push({
                id: 'defense',
                title: `${kpiData.aggressiveName} İle Taktiksel Rekabet`,
                badge: 'REKABET STRATEJİSİ',
                color: 'indigo',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
                desc: `En sık karşılaştığınız "${kpiData.aggressiveName}" mağazası fiyatlama açısından oldukça aktif görünüyor. Buybox rekabetini korumak için bu satıcıya özel taktiksel fiyat uyarlamalarını gözden geçirmeniz önerilir.`,
                impact: `Pazar liderliğinin izlenmesi ve korunması`,
                selected: true
            });
        }

        // 4. Stock clearance
         if (stockClearanceProducts.length > 0) {
             plan.push({
                id: 'stock_clearance',
                title: 'Stok ve Rekabet İncelemesi',
                badge: 'STOK YÖNETİMİ',
                color: 'amber',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
                desc: `Fiyat olarak piyasanın epey üzerinde kalan ${stockClearanceProducts.length} adet üründe durgunluk yaşanabilir. Nakit akışını canlandırmak adına bu ürün grupları için farklı pazarlama veya indirim kurguları geliştirebilirsiniz.`,
                impact: `Bekleyen stokların nakde dönüştürülme şansı`,
                selected: false
            });
         }

        // 5. Psychological logic always applies
        plan.push({
                id: 'psy_pricing',
                title: 'Psikolojik Fiyatlama Denemesi',
                badge: 'DÖNÜŞÜM ODAKLI',
                color: 'pink',
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
                desc: `Tam sayı (örn: 1250.00 TL) ile biten kârlı ürün fiyatlarında alışverişçinin pürüz algısını kırmak ve sepet dönüşümünü esnetmek için .90 veya .99 kullanımını (1249.90 TL vb.) test etmek isteyebilirsiniz.`,
                impact: `Ziyaretçilerin ödeme adımına geçişinde pozitif ihtimal`,
                selected: true
            });

        return plan;
    }, [products, kpiData]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const toggleRow = (id) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);
    };



    // Handlers
    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            // Auto Scan Mock Result
            setPendingCandidate({
                name: 'Atlas Bilgisayar',
                price: 415.00,
                source: 'Otomatik Tarama',
                sourceType: 'auto',
                rating: 8.2,
                acronym: 'AB',
                color: 'indigo'
            });
            setShowNewCandidates(true);
            setScanSuccess(true);
        }, 2000);
    };

    const handleApprove = () => {
        if (!pendingCandidate) return;

        const newCompetitor = {
            id: Date.now(),
            productId: selectedProduct?.id,
            name: pendingCandidate.name,
            price: pendingCandidate.price,
            rating: pendingCandidate.rating || 0,
            status: 'Takipte',
            isBuybox: false,
            acronym: pendingCandidate.acronym || 'M',
            color: pendingCandidate.color || 'purple',
            isNew: true,
            isManual: pendingCandidate.sourceType === 'manual',
            note: pendingCandidate.note
        };

        const newList = [newCompetitor, ...competitors];
        setCompetitors(newList);
        saveCompetitorsToDB(newList);

        setShowNewCandidates(false);
        setPendingCandidate(null);
        setScanSuccess(false);
    };

    const handleReject = () => {
        setShowNewCandidates(false);
        setScanSuccess(false);
    };

    const handleDelete = (id) => {
        const updatedList = competitors.filter(c => c.id !== id);
        setCompetitors(updatedList);
        saveCompetitorsToDB(updatedList);
        setActiveMenuId(null);
    };

    const handleEdit = (id) => {
        const competitor = competitors.find(c => c.id === id);
        if (!competitor) return;

        const newName = window.prompt("Rakip adını düzenleyin:", competitor.name);
        if (newName && newName.trim() !== "") {
            const updatedName = newName.trim();
            const updatedList = competitors.map(c =>
                c.id === id ? { ...c, name: updatedName } : c
            );
            setCompetitors(updatedList);
            saveCompetitorsToDB(updatedList);
        }
        setActiveMenuId(null);
    };

    const openManager = (product) => {
        setSelectedProduct(product);
        setIsManagerOpen(true);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuId && !event.target.closest('.competitor-row')) {
                setActiveMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenuId]);

    // Active Filter Logic
    const [activeFilter, setActiveFilter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [channelFilter, setChannelFilter] = useState('Tümü');

    const getFilteredProducts = () => {
        let filtered = products;

        if (channelFilter !== 'Tümü') {
            filtered = filtered.filter(p => p.competitorSource === channelFilter);
        }

        // Apply Card Filters
        if (activeFilter) {
            filtered = filtered.filter(p => {
                if (activeFilter === 'win') return p.status === 'Lider' || p.status === 'Fırsat';
                if (activeFilter === 'risk') return p.status === 'Kaybetti';
                if (activeFilter === 'intensity') return p.activeCompetitors > 4;
                if (activeFilter === 'aggressive') return p.competitorName === 'TechShop';

                // Histogram Filters
                if (['zayif', 'sikismis', 'iyilestirilebilir', 'kilitli', 'ayarlanabilir', 'guclu'].includes(activeFilter)) {
                    return p.position === activeFilter;
                }

                return true;
            });
        }

        // Apply Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query)
            );
        }

        return filtered;
    };
    const filteredProducts = getFilteredProducts();

    // Pagination Logic (Applied to Filtered Results)
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const changeRowsPerPage = (matches) => {
        setItemsPerPage(Number(matches));
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const handleJumpToPage = () => {
        const pageStr = window.prompt(`Gitmek istediğiniz sayfayı girin (1-${totalPages}):`);
        if (pageStr) {
            const pageNum = parseInt(pageStr);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                setCurrentPage(pageNum);
            }
        }
    };

    // Auto-scroll to table when filter changes
    useEffect(() => {
        if (activeFilter) {
            const tableElement = document.getElementById('products-table-section');
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [activeFilter]);

    // Configuration for Filter Chips
    const positionConfig = {
        'zayif': { text: 'Konum: Zayıf (Zarar+Pahalı)', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
        'sikismis': { text: 'Konum: Sıkışmış (Zarar+Ucuz)', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
        'iyilestirilebilir': { text: 'Konum: İyileştirilebilir', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        'kilitli': { text: 'Konum: Kilitli Kârlılık', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
        'ayarlanabilir': { text: 'Konum: Ayarlanabilir', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
        'guclu': { text: 'Konum: Güçlü Pozisyon', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    };

    const positionCounts = React.useMemo(() => {
        return products.reduce((acc, p) => {
            if (acc[p.position] !== undefined) acc[p.position]++;
            return acc;
        }, { zayif: 0, sikismis: 0, iyilestirilebilir: 0, kilitli: 0, ayarlanabilir: 0, guclu: 0 });
    }, [products]);

    const maxPositionCount = Math.max(...Object.values(positionCounts), 1);

    const getActiveChipStyle = () => {
        if (!activeFilter) return null;
        if (positionConfig[activeFilter]) return positionConfig[activeFilter];

        // Fallback for main KPIs
        if (activeFilter === 'win') return { text: 'Buybox Lideri', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' };
        if (activeFilter === 'risk') return { text: 'Kaybedilen Ürünler', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' };
        if (activeFilter === 'intensity') return { text: 'Yüksek Rekabet', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' };
        if (activeFilter === 'aggressive') return { text: 'Agresif Rakipler', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' };

        return { text: activeFilter, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' };
    };

    const activeStyle = getActiveChipStyle();

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rekabet Analizi</h1>
                    <p className="text-slate-500 mt-1">Piyasa dinamikleri, rakip fiyatlar ve Buybox durumu.</p>
                </div>
                <button
                    onClick={() => {
                        setBulkScanError('');
                        setBulkMatchStep(1);
                        setIsBulkMatchOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                    <Globe className="w-4 h-4" />
                    Toplu Tarama
                </button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* Buybox Win Rate */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-slate-500">Buybox Kazanma</h3>
                            <div className="group relative">
                                <Info className="h-4 w-4 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Kendi fiyatınızın rekabette en ucuz olduğu (Buybox kazandığınız) ürünlerin oranı ve toplam cirodaki payı.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl font-bold text-slate-900">{kpiData.winRate.toFixed(0)}%</span>
                    </div>
                    <div className="mt-auto pt-3 flex items-center bg-white border-t border-slate-100">
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {kpiData.winCount} Lider / {kpiData.totalTrackedCount} Toplam Eşleşme
                        </div>
                    </div>
                </div>

                {/* Risk Revenue */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-slate-500">Risk Altındaki Ciro</h3>
                            <div className="group relative">
                                <Info className="h-4 w-4 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Daha ucuz bir rakip yüzünden satış kaybetme riski taşıyan ürünlerinizin toplam cirosu.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl font-bold text-slate-900">₺{(kpiData.riskRevenue / 1000).toFixed(1)}K</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                            {kpiData.riskCount} Ürün
                        </span>
                    </div>
                    <div className="mt-auto pt-3 flex items-center bg-white border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                            Fiyat farklılıkları kaynaklı potansiyel kayıp
                        </div>
                    </div>
                </div>

                {/* Intensity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-slate-500">Rekabet Yoğunluğu</h3>
                            <div className="group relative">
                                <Info className="h-4 w-4 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Pazarınızdaki toplam aktif rakip sayısı ve fiyat trend eğilimi.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl font-bold text-slate-900">{kpiData.intenseCount > 5 ? 'Yüksek' : 'Orta'}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {kpiData.intenseCount} Rakip Ürün
                        </span>
                    </div>
                    <div className="mt-auto pt-3 flex items-center bg-white border-t border-slate-100">
                        <div className="text-[11px] font-medium text-slate-500">
                            Anlık takip edilen agresif aktör sayısı
                        </div>
                    </div>
                </div>

                {/* Aggressive Competitor */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-full hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-slate-500">En Agresif Rakip</h3>
                            <div className="group relative">
                                <Info className="h-4 w-4 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                                    Sizinle en çok üründe Buybox rekabetine giren ve fiyat kıran mağaza.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                            </div>
                        </div>
                        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                            <Swords className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-2xl font-bold text-slate-900 truncate max-w-[150px]" title={kpiData.aggressiveName}>{kpiData.aggressiveName}</span>
                    </div>
                    <div className="mt-auto pt-3 flex items-center bg-white border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                            Etki: <span className="font-semibold text-slate-900">{kpiData.aggressiveCount} Buybox Kaybı</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* Market Price Positioning Analysis - 2 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Left Column: Chart (66%) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">

                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-lg">Konumlandırma Analizi</h3>

                            <div className="relative group">
                                <svg className="w-4 h-4 text-gray-400 hover:text-indigo-600 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left border border-gray-700 leading-relaxed">
                                    <p className="font-bold border-b border-gray-600 pb-1 mb-2 text-gray-200">Durum Tanımları</p>
                                    <ul className="space-y-1.5">
                                        <li><span className="text-emerald-400 font-bold">Güçlü:</span> Hem kârlı hem rakipten uygun.</li>
                                        <li><span className="text-blue-400 font-bold">Ayarlanabilir:</span> Kârlı ama pahalı, indirim şansı var.</li>
                                        <li><span className="text-purple-400 font-bold">Kilitli:</span> Kârlı ama pahalı, marjı sınırda.</li>
                                        <li><span className="text-orange-400 font-bold">İyileştirilebilir:</span> Zararda ama fiyat artışıyla kurtarılabilir.</li>
                                        <li><span className="text-gray-400 font-bold">Sıkışmış:</span> Zararda ve maliyet yüzünden kâra geçemiyor.</li>
                                        <li><span className="text-rose-400 font-bold">Zayıf:</span> Zararda ve rakipten pahalı (Çıkış yok).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {activeFilter && positionConfig[activeFilter] && (
                                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-fade-in flex items-center">
                                    Filtre: {positionConfig[activeFilter].text.split(':')[1].trim()}
                                    <button onClick={() => setActiveFilter(null)} className="ml-2 hover:text-indigo-200">✕</button>
                                </span>
                            )}
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">Canlı Veri</span>
                        </div>
                    </div>

                    <div className="relative flex-grow h-64 w-full flex items-end justify-between px-1 sm:px-4 gap-2 border-b border-gray-100 pb-1">

                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 pb-10">
                            <div className="border-t border-dashed border-gray-100 w-full h-0"></div>
                            <div className="border-t border-dashed border-gray-100 w-full h-0"></div>
                            <div className="border-t border-dashed border-gray-100 w-full h-0"></div>
                        </div>

                        <div
                            onClick={() => setActiveFilter(activeFilter === 'zayif' ? null : 'zayif')}
                            className={cn(
                                "chart-bar relative flex flex-col items-center justify-end w-1/6 h-full group cursor-pointer transition-all duration-300",
                                activeFilter && activeFilter !== 'zayif' ? "opacity-30 grayscale scale-95" : "opacity-100 scale-100"
                            )}
                        >
                            <div className="mb-1 text-xs font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{positionCounts.zayif} Ürün</div>
                            <div className={cn("w-full max-w-[56px] rounded-t border-t-2 transition-all", activeFilter === 'zayif' ? "bg-rose-500 border-rose-600 shadow-md" : "bg-rose-50 hover:bg-rose-500 border-rose-500")} style={{ height: `${Math.max(5, (positionCounts.zayif / maxPositionCount) * 100)}%` }}></div>
                            <div className="mt-3 text-center w-full">
                                <div className="text-[10px] font-bold text-gray-600">Zayıf</div>
                                <div className="text-[9px] text-rose-500 scale-90 origin-top">Zarar + Pahalı</div>
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveFilter(activeFilter === 'sikismis' ? null : 'sikismis')}
                            className={cn(
                                "chart-bar relative flex flex-col items-center justify-end w-1/6 h-full group cursor-pointer transition-all duration-300",
                                activeFilter && activeFilter !== 'sikismis' ? "opacity-30 grayscale scale-95" : "opacity-100 scale-100"
                            )}
                        >
                            <div className="mb-1 text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">{positionCounts.sikismis} Ürün</div>
                            <div className={cn("w-full max-w-[56px] rounded-t border-t-2 transition-all", activeFilter === 'sikismis' ? "bg-gray-400 border-gray-500 shadow-md" : "bg-gray-100 hover:bg-gray-400 border-gray-400")} style={{ height: `${Math.max(5, (positionCounts.sikismis / maxPositionCount) * 100)}%` }}></div>
                            <div className="mt-3 text-center w-full">
                                <div className="text-[10px] font-bold text-gray-600">Sıkışmış</div>
                                <div className="text-[9px] text-gray-400 scale-90 origin-top">Zarar + Çıkışsız</div>
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveFilter(activeFilter === 'iyilestirilebilir' ? null : 'iyilestirilebilir')}
                            className={cn(
                                "chart-bar relative flex flex-col items-center justify-end w-1/6 h-full group cursor-pointer transition-all duration-300",
                                activeFilter && activeFilter !== 'iyilestirilebilir' ? "opacity-30 grayscale scale-95" : "opacity-100 scale-100"
                            )}
                        >
                            <div className="mb-1 text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 whitespace-nowrap">{positionCounts.iyilestirilebilir} Ürün</div>
                            <div className={cn("w-full max-w-[56px] rounded-t border-t-2 transition-all", activeFilter === 'iyilestirilebilir' ? "bg-amber-400 border-amber-500 shadow-md" : "bg-amber-50 hover:bg-amber-400 border-amber-400")} style={{ height: `${Math.max(5, (positionCounts.iyilestirilebilir / maxPositionCount) * 100)}%` }}></div>
                            <div className="mt-3 text-center w-full">
                                <div className="text-[10px] font-bold text-gray-600 truncate">İyileştirilebilir</div>
                                <div className="text-[9px] text-amber-600 scale-90 origin-top">Potansiyel Kâr</div>
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveFilter(activeFilter === 'kilitli' ? null : 'kilitli')}
                            className={cn(
                                "chart-bar relative flex flex-col items-center justify-end w-1/6 h-full group cursor-pointer transition-all duration-300",
                                activeFilter && activeFilter !== 'kilitli' ? "opacity-30 grayscale scale-95" : "opacity-100 scale-100"
                            )}
                        >
                            <div className="mb-1 text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 whitespace-nowrap">{positionCounts.kilitli} Ürün</div>
                            <div className={cn("w-full max-w-[56px] rounded-t border-t-2 transition-all", activeFilter === 'kilitli' ? "bg-purple-400 border-purple-500 shadow-md" : "bg-purple-50 hover:bg-purple-400 border-purple-400")} style={{ height: `${Math.max(5, (positionCounts.kilitli / maxPositionCount) * 100)}%` }}></div>
                            <div className="mt-3 text-center w-full">
                                <div className="text-[10px] font-bold text-gray-600">Kilitli</div>
                                <div className="text-[9px] text-purple-500 scale-90 origin-top">Kârlı + Statik</div>
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveFilter(activeFilter === 'ayarlanabilir' ? null : 'ayarlanabilir')}
                            className={cn(
                                "chart-bar relative flex flex-col items-center justify-end w-1/6 h-full group cursor-pointer transition-all duration-300",
                                activeFilter && activeFilter !== 'ayarlanabilir' ? "opacity-30 grayscale scale-95" : "opacity-100 scale-100"
                            )}
                        >
                            <div className="mb-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 whitespace-nowrap">{positionCounts.ayarlanabilir} Ürün</div>
                            <div className={cn("w-full max-w-[56px] rounded-t transition-all", activeFilter === 'ayarlanabilir' ? "bg-blue-600" : "bg-blue-500 hover:bg-blue-600")} style={{ height: `${Math.max(5, (positionCounts.ayarlanabilir / maxPositionCount) * 100)}%` }}></div>
                            <div className="mt-3 text-center w-full">
                                <div className="text-[10px] font-bold text-blue-700">Ayarlanabilir</div>
                                <div className="text-[9px] text-blue-600 scale-90 origin-top">Marj Müsait</div>
                            </div>
                        </div>

                        <div
                            onClick={() => setActiveFilter(activeFilter === 'guclu' ? null : 'guclu')}
                            className={cn(
                                "chart-bar relative flex flex-col items-center justify-end w-1/6 h-full group cursor-pointer transition-all duration-300",
                                activeFilter && activeFilter !== 'guclu' ? "opacity-30 grayscale scale-95" : "opacity-100 scale-100"
                            )}
                        >
                            <div className="mb-1 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 whitespace-nowrap">{positionCounts.guclu} Ürün</div>
                            <div className={cn("w-full max-w-[56px] rounded-t border-t-2 transition-all", activeFilter === 'guclu' ? "bg-emerald-500 border-emerald-600 shadow-md" : "bg-emerald-100 hover:bg-emerald-500 border-emerald-500")} style={{ height: `${Math.max(5, (positionCounts.guclu / maxPositionCount) * 100)}%` }}></div>
                            <div className="mt-3 text-center w-full">
                                <div className="text-[10px] font-bold text-gray-600">Güçlü</div>
                                <div className="text-[9px] text-emerald-600 scale-90 origin-top">Lider Konum</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column: AI Executive Summary (33%) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-shadow">

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">Yönetici Özeti</h3>
                            <p className="text-xs text-indigo-600 font-medium tracking-wide uppercase">Yapay Zeka Analizi</p>
                        </div>
                    </div>

                    <div className="flex-grow space-y-5">
                        <div className="flex gap-3 items-start">
                            <span className="mt-2 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 ring-4 ring-emerald-50"></span>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                <strong className="text-gray-900 font-semibold">{kpiData.winCount} Ürün</strong> için fiyatlarınız rekabette oldukça avantajlı görünüyor ("Lider"). Bu gruptaki ürünlerinizin büyüme üzerinde destekleyici bir etkisi olması beklenebilir.
                            </p>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="mt-2 w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 ring-4 ring-amber-50"></span>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                <strong className="text-gray-900 font-semibold">{kpiData.riskCount} Ürün</strong> için piyasadaki bazı satıcıların sizin altınızda fiyatlama yaptığını gözlemliyoruz. Rekabetçi konumunuzu gözden geçirmek faydalı olabilir.
                            </p>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="mt-2 w-2 h-2 bg-rose-500 rounded-full flex-shrink-0 ring-4 ring-rose-50"></span>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                <strong className="text-gray-900 font-semibold">Tedarikçi Yoğunluğu:</strong> Ağırlıklı olarak <strong className="text-gray-900 font-semibold">{kpiData.aggressiveName}</strong> isimli satıcı <strong className="text-gray-900 font-semibold">{kpiData.aggressiveCount} üründe</strong> karşınıza çıkıyor. Bu aktörle ortak ürün gamınızı incelemek stratejik avantaj sağlayabilir.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <button
                            onClick={handleOpenActionModal}
                            className="w-full group flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <span>Otomatik Aksiyon Planı Oluştur</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </button>
                    </div>

                </div>
            </div>

            {/* Products Table (Advanced) */}
            < div id="products-table-section" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 border-b border-slate-100">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Detaylı Fiyat Takibi</h3>
                        <p className="text-sm text-slate-500 mt-1">Toplam <span className="font-medium text-slate-900">{filteredProducts.length} Ürün</span> izleniyor</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">



                        {activeFilter && activeStyle && (
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-2 border rounded-lg animate-in fade-in zoom-in-95 duration-200 flex-shrink-0",
                                activeStyle.bg, activeStyle.border, activeStyle.color
                            )}>
                                <span className="text-xs font-bold">
                                    {activeStyle.text}
                                </span>
                                <button
                                    onClick={() => setActiveFilter(null)}
                                    className="ml-1 p-0.5 rounded-full hover:bg-white/50 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        <div className="relative w-full sm:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                                placeholder="Ürün adı veya SKU ara..."
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={channelFilter}
                                onChange={(e) => setChannelFilter(e.target.value)}
                                className="block w-full sm:w-40 pl-3 pr-8 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 shadow-sm cursor-pointer"
                            >
                                <option value="Tümü">Tüm Satıcılar</option>
                                {Array.from(new Set(competitors.filter(c => c.status === 'Takipte').map(c => c.source).filter(Boolean))).map(source => (
                                    <option key={source} value={source}>{source}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ürün Detayı</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fiyat & Marj</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">En İyi Rakip</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Konum</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Satış (30 Gün)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentProducts.map((product) => (
                                <React.Fragment key={product.id}>
                                <tr className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => toggleRow(product.id)} data-position={product.position}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0">
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{product.sku} • {product.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">₺{product.myPrice.toFixed(2)}</div>
                                        <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            {product.activeCompetitors} Rakip
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900">{product.competitorPrice ? `₺${product.competitorPrice.toFixed(2)}` : '-'}</div>
                                        <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={product.competitorName}>{product.competitorName}</div>
                                        {product.competitorSource && (
                                            <div className="mt-1">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 inline-block border border-indigo-100">
                                                    {product.competitorSource}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.positionLabel ? (
                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold",
                                                product.positionColor === 'amber' ? "bg-amber-100 text-amber-700" :
                                                    product.positionColor === 'emerald' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                                            )}>
                                                {product.positionLabel}
                                            </span>
                                        ) : (
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold",
                                                product.status === 'Lider' ? "bg-emerald-100 text-emerald-700" :
                                                    product.status === 'Kaybetti' ? "bg-rose-100 text-rose-700" :
                                                        "bg-amber-100 text-amber-700"
                                            )}>
                                                {product.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <div className="text-sm font-bold text-slate-900 inline-block">
                                                {Math.max(0, product.totalSales - product.trendyolMetrics.sales).toLocaleString()} Adet
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openManager(product); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                                Rakipleri Yönet
                                            </button>
                                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                                {expandedRows.has(product.id) ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Trendyol Sub-Row Accordion */}
                                {expandedRows.has(product.id) && (
                                    <tr className="bg-slate-50 border-t border-slate-100/60">
                                        <td className="px-6 py-3 relative">
                                            <div className="absolute left-[3.25rem] top-0 bottom-1/2 border-l border-slate-300"></div>
                                            <div className="absolute left-[3.25rem] bottom-1/2 w-4 border-b border-slate-300"></div>
                                            <div className="flex items-center gap-3 ml-12">
                                                <div className="w-10 h-10 rounded-md overflow-hidden bg-[#F27A1A] flex items-center justify-center shrink-0 border border-gray-100 shadow-[0_2px_8px_rgba(242,122,26,0.2)]">
                                                    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="100" height="100" fill="#F27A1A" />
                                                        <rect y="32" width="100" height="36" fill="#111111" />
                                                        <text x="50" y="53" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="21" fill="#FFFFFF" textAnchor="middle" dominantBaseline="middle" letterSpacing="-1">trendyol</text>
                                                    </svg>
                                                </div>
                                                <span className="font-bold text-gray-800 tracking-wide text-[11px]">Trendyol</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-[13px] font-bold text-slate-700">₺{product.trendyolMetrics.price.toFixed(2)}</div>
                                            <div className="text-[10px] text-slate-500">Satış Fiyatınız</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-[13px] font-medium text-slate-500">-</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-[11px] text-slate-400 italic font-medium">Veri Bekleniyor</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-[13px] font-bold text-slate-700 inline-block">
                                                {product.trendyolMetrics.sales.toLocaleString()} Adet
                                            </div>
                                            <div className="text-[10px] text-slate-500">Satış (30 Gün)</div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-2xl">

                    <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-500 font-medium">
                            Toplam <span className="font-bold text-gray-900">{filteredProducts.length}</span> üründen <span className="font-bold text-gray-900">{filteredProducts.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredProducts.length)}</span> arası
                        </div>

                        <div className="flex items-center gap-2">
                            <label htmlFor="rows-per-page" className="text-xs text-gray-500">Göster:</label>
                            <select
                                id="rows-per-page"
                                value={itemsPerPage}
                                onChange={(e) => changeRowsPerPage(e.target.value)}
                                className="text-xs border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 py-1 pl-2 pr-6 bg-gray-50 cursor-pointer text-gray-700 font-bold"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto">
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            Önceki
                        </button>

                        <div className="text-sm font-medium text-slate-500 min-w-[100px] text-center">
                            Sayfa <span className="text-slate-900">{currentPage}</span> / <span className="text-slate-900">{totalPages || 1}</span>
                        </div>

                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 border mx-2 rounded-lg disabled:opacity-40 shadow-sm disabled:cursor-not-allowed transition-colors"
                        >
                            Sonraki
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Competitor Manager Slide-Over */}
            {
                isManagerOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsManagerOpen(false)}
                        ></div>

                        {/* Drawer Panel */}
                        <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 mt-16 border-l border-slate-100">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Rakip Yönetimi</h2>
                                    <p className="text-sm text-slate-500">{selectedProduct?.name}</p>
                                </div>
                                <button
                                    onClick={() => setIsManagerOpen(false)}
                                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div id="competitor-slide-over" className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

                                {/* Manual Scan Section */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-6">
                                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Link İle Ekle</h3>
                                    <p className="text-xs text-slate-500 mb-4">Rakip ürün web linkini yapıştırarak manuel takip başlatın.</p>

                                    <div className="mt-2 flex gap-2">
                                        <div className="relative flex-grow">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <ExternalLink className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={manualUrl}
                                                onChange={(e) => setManualUrl(e.target.value)}
                                                className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                                placeholder="Rakip ürün web linkini yapıştırın..."
                                            />
                                        </div>

                                        <button
                                            onClick={handleAddManualUrl}
                                            disabled={!manualUrl.trim() || isLoadingManual}
                                            className="flex-shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoadingManual ? (
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Ekle
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1.5 text-[10px] text-slate-400">Rakibinizin e-ticaret sitesindeki direk ürün sayfasının bağlantısını girin.</p>
                                </div>

                                {/* New Candidates Section (Pending Review) */}
                                {showNewCandidates && pendingCandidate && (
                                    <div id="new-findings-area" className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100 animate-in fade-in slide-in-from-top-4">
                                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span>⚠️ Onay Bekleyen Aday</span>
                                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px]">{pendingCandidate.source}</span>
                                        </h4>

                                        <div id="pending-card" className="flex items-start justify-between p-3 bg-white rounded-lg border border-amber-100 transition-colors shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center text-xl shadow-sm border border-slate-100">
                                                    🔗
                                                </div>

                                                <div className="flex flex-col">
                                                    <span id="pending-name" className="font-bold text-slate-900 text-sm">{pendingCandidate.name}</span>
                                                    <div className="text-xs text-slate-500 mb-1">
                                                        Fiyat: <span id="pending-price" className="font-bold text-slate-900">₺{pendingCandidate.price.toFixed(2)}</span>
                                                        {pendingCandidate.note && <span className="text-slate-400 text-[10px] ml-1">({pendingCandidate.note})</span>}
                                                    </div>

                                                    {pendingCandidate.url && (
                                                        <a href={pendingCandidate.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5 group">
                                                            <span>🔗 Kaynak Ürünü İncele</span>
                                                            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 min-w-[100px]">
                                                <button
                                                    onClick={handleApprove}
                                                    className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Takibe Al
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    className="w-full py-2 px-3 text-xs font-medium text-slate-500 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-all flex items-center justify-center"
                                                >
                                                    Yoksay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tracked Competitors List */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                                        <span>Takip Edilen Satıcılar</span>
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{competitors.filter(c => c.productId === selectedProduct?.id).length} Satıcı</span>
                                    </h4>

                                    <div className="space-y-2">
                                        {competitors.filter(c => c.productId === selectedProduct?.id).map((comp) => (
                                            <div key={comp.id} className="competitor-row relative flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:border-indigo-200/60 hover:shadow-md group">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm border border-slate-100",
                                                        comp.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                                            comp.color === 'amber' ? "bg-amber-50 text-amber-600" :
                                                                comp.color === 'purple' ? "bg-purple-50 text-purple-600" :
                                                                    "bg-slate-50 text-slate-400"
                                                    )}>
                                                        {comp.acronym}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm flex gap-2 items-center">
                                                            {comp.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5 whitespace-nowrap flex items-center">
                                                            <span className="font-medium text-slate-700">₺{comp.price.toFixed(2)}</span>
                                                            <span className="text-slate-300 mx-1">•</span>
                                                            {comp.source && (
                                                                <span className="text-indigo-600 font-medium overflow-hidden text-ellipsis max-w-[80px]" title={comp.source}>{comp.source}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {/* Toggle Status */}
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase tracking-wider",
                                                            comp.status === 'Takipte' ? "text-emerald-600" : "text-slate-400"
                                                        )}>
                                                            {comp.status}
                                                        </span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={comp.status === 'Takipte'}
                                                                onChange={() => {
                                                                    const updatedList = competitors.map(c =>
                                                                        c.id === comp.id ? { ...c, status: c.status === 'Takipte' ? 'Yoksay' : 'Takipte' } : c
                                                                    );
                                                                    setCompetitors(updatedList);
                                                                    saveCompetitorsToDB(updatedList);
                                                                }}
                                                            />
                                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                                        </label>
                                                    </div>

                                                    <div className="h-4 w-px bg-slate-100"></div>

                                                    {/* Action Menu */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveMenuId(activeMenuId === comp.id ? null : comp.id)}
                                                            className={cn(
                                                                "p-1.5 rounded-md transition-colors",
                                                                activeMenuId === comp.id ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>

                                                        {activeMenuId === comp.id && (
                                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl ring-1 ring-slate-900/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => handleEdit(comp.id)}
                                                                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                        Düzenle
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(comp.id)}
                                                                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-50 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        Listeden Çıkar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* AI Action Plan Modal */}
            {isActionModalOpen && (
                <div id="ai-action-modal" className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseActionModal}></div>

                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100">

                            <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-5 border-b border-indigo-100 flex justify-between items-center sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Önerilen Stratejik Aksiyonlar</h3>
                                        <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                            Yapay zeka 5 kritik fırsat tespit etti
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                        Tümünü Seç
                                    </label>
                                    <button onClick={handleCloseActionModal} className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-6 max-h-[65vh] overflow-y-auto bg-gray-50/50 space-y-4">

                                {actionPlan.length > 0 ? actionPlan.map(action => (
                                    <div key={action.id} className={`bg-white border rounded-xl p-5 hover:shadow-md transition-all relative group cursor-pointer border-gray-200 hover:border-${action.color}-300`}>
                                        <div className="absolute top-5 right-5">
                                            <input type="checkbox" defaultChecked={action.selected} className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className={`mt-1 w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center text-${action.color}-600 flex-shrink-0`}>
                                                {action.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-base font-bold text-gray-900 pr-5">{action.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-${action.color}-50 text-${action.color}-700 border border-${action.color}-100 uppercase`}>
                                                        {action.badge}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 leading-relaxed max-w-lg">{action.desc}</p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className={`text-xs font-bold text-${action.color}-700 bg-${action.color}-50 px-2 py-1 rounded-md border border-${action.color}-100 flex items-center gap-1`}>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                                        {action.impact}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-gray-500">
                                        Durumunuz mükemmel! Şu an için yapay zekanın önereceği ilave bir müdahale hamlesi bulunmuyor.
                                    </div>
                                )}

                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100 rounded-b-2xl sticky bottom-0 z-10">

                                <button
                                    type="button"
                                    onClick={handleShareViaEmail}
                                    disabled={emailStatus !== 'idle'}
                                    className={cn(
                                        "flex-1 inline-flex justify-center items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95 group",
                                        emailStatus === 'success'
                                            ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                                            : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                    )}
                                >
                                    {emailStatus === 'sending' ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Gönderiliyor...
                                        </>
                                    ) : emailStatus === 'success' ? (
                                        <>
                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            İletildi!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            <span>E-Posta Olarak Gönder</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopyToClipboard}
                                    className={cn(
                                        "flex-1 inline-flex justify-center items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm ring-1 ring-inset transition-colors active:scale-95 group",
                                        copyStatus === 'copied'
                                            ? "bg-emerald-50 text-emerald-600 ring-emerald-200 hover:bg-emerald-100"
                                            : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-50 hover:text-indigo-600"
                                    )}
                                >
                                    {copyStatus === 'copied' ? (
                                        <>
                                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            <span>Kopyalandı</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                            <span>Panoya Kopyala</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Trend Analysis Modal */}
            {trendModalOpen && selectedTrendProduct && (
                <div id="trend-modal" className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div
                        className={cn("fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-200", isClosing ? "opacity-0" : "opacity-100")}
                        onClick={handleCloseTrendModal}
                    ></div>

                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

                        <div
                            className={cn(
                                "relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all duration-200 sm:my-8 sm:w-full sm:max-w-3xl ring-1 ring-gray-900/5",
                                isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100 animate-in fade-in zoom-in-95"
                            )}
                        >

                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedTrendProduct.name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">{selectedTrendProduct.sku}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Son 30 Günlük Piyasa Hareketi</p>
                                </div>
                                <button onClick={handleCloseTrendModal} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="px-8 py-6 bg-white">
                                <div className="relative h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendChartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                            <defs>
                                                <linearGradient id="modernGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.1} />
                                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                                                dy={10}
                                                interval={4}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                                tickFormatter={(value) => `₺${value}`}
                                            />
                                            <Tooltip
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[220px]">
                                                                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide border-b border-gray-100 pb-1">{label}</p>
                                                                <div className="space-y-2">
                                                                    {payload.map((entry, index) => (
                                                                        <div key={index} className="flex justify-between items-center">
                                                                            <div className="flex items-center gap-2">
                                                                                <span
                                                                                    className="w-2.5 h-2.5 rounded-full"
                                                                                    style={{ backgroundColor: entry.color }}
                                                                                ></span>
                                                                                <span className={cn("text-xs font-medium", entry.name === 'Siz' ? "text-gray-900 font-bold" : "text-gray-600")}>
                                                                                    {entry.name}
                                                                                </span>
                                                                            </div>
                                                                            <span className={cn("text-xs font-bold", entry.name === 'Siz' ? "text-indigo-600" : "text-gray-600")}>
                                                                                ₺{entry.value.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            {/* Amazon (Subtle) */}
                                            <Line
                                                type="monotone"
                                                dataKey="amazonPrice"
                                                name="Amazon"
                                                stroke="#fb923c"
                                                strokeWidth={2}
                                                strokeOpacity={0.6}
                                                dot={false}
                                                activeDot={{ r: 4 }}
                                            />
                                            {/* MegaStore (Subtle) */}
                                            <Line
                                                type="monotone"
                                                dataKey="megaStorePrice"
                                                name="MegaStore"
                                                stroke="#9ca3af"
                                                strokeWidth={2}
                                                strokeOpacity={0.5}
                                                strokeDasharray="4 4"
                                                dot={false}
                                                activeDot={{ r: 4 }}
                                            />
                                            {/* Main Competitor (TechShop) */}
                                            <Line
                                                type="monotone"
                                                dataKey="compPrice"
                                                name={selectedTrendProduct.competitorName}
                                                stroke="#f43f5e"
                                                strokeWidth={2}
                                                strokeOpacity={0.8}
                                                dot={false}
                                                activeDot={{ r: 4 }}
                                            />
                                            {/* User Price (Highlight) */}
                                            <Line
                                                type="monotone"
                                                dataKey="userPrice"
                                                name="Siz"
                                                stroke="#4f46e5"
                                                strokeWidth={3}
                                                fill="url(#modernGradient)"
                                                dot={{ r: 0 }}
                                                activeDot={{ r: 6, stroke: "white", strokeWidth: 2, className: "animate-pulse" }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-gray-50/80 px-8 py-6 border-t border-gray-100 backdrop-blur-sm">
                                <div className="grid grid-cols-3 gap-12 items-center">

                                    <div className="text-left group">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 group-hover:text-indigo-600 transition-colors">30 Günlük Aralık</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-gray-900 tracking-tight">
                                                ₺{Math.min(...trendChartData.map(d => Math.min(d.userPrice, d.compPrice, d.amazonPrice, d.megaStorePrice))).toFixed(0)}
                                            </span>
                                            <span className="text-gray-300 font-light text-xl">/</span>
                                            <span className="text-2xl font-bold text-gray-900 tracking-tight">
                                                ₺{Math.max(...trendChartData.map(d => Math.max(d.userPrice, d.compPrice, d.amazonPrice, d.megaStorePrice))).toFixed(0)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-left relative group cursor-help">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold group-hover:text-amber-600 transition-colors">Volatilite</p>
                                            <svg className="w-3 h-3 text-gray-400 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-amber-600 transition-colors">Orta <span className="text-lg text-gray-400 font-medium ml-1">(%8)</span></span>

                                        <div className="absolute bottom-full left-0 mb-3 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                            Fiyatlar %8 oranında dalgalanıyor. Rekabet orta seviyede.
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">Mevcut Durum</p>
                                        {selectedTrendProduct.competitorPrice ? (
                                            selectedTrendProduct.myPrice === selectedTrendProduct.competitorPrice ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-xs font-bold">Liderle Eşit Fiyat</span>
                                                </div>
                                            ) : selectedTrendProduct.myPrice > selectedTrendProduct.competitorPrice ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span className="text-xs font-bold">Liderden %{Math.abs(((selectedTrendProduct.myPrice - selectedTrendProduct.competitorPrice) / selectedTrendProduct.competitorPrice) * 100).toFixed(0)} Pahalı</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                                                    <TrendingDown className="w-4 h-4" />
                                                    <span className="text-xs font-bold">Liderden %{Math.abs(((selectedTrendProduct.myPrice - selectedTrendProduct.competitorPrice) / selectedTrendProduct.competitorPrice) * 100).toFixed(0)} Ucuz</span>
                                                </div>
                                            )
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500">
                                                <span className="text-xs font-bold">Rakip Verisi Yok</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Competitor Match Modal */}
            {isBulkMatchOpen && (
                <div id="bulk-match-modal" className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsBulkMatchOpen(false)}></div>
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl ring-1 ring-gray-900/5">

                            {/* Modal Header */}
                            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Toplu Rakip Eşleştirme</h3>
                                    <p className="text-xs text-gray-500 font-medium tracking-wide">Kategori Bazlı Otomatik Tarama</p>
                                </div>
                                <button onClick={() => setIsBulkMatchOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Step 1: Input Phase */}
                            {bulkMatchStep === 1 && (
                                <div className="px-8 py-8 animate-in fade-in duration-300">
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">1. Rakibin Bulunduğu Kanalı Seçin</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Web', 'Trendyol'].map(channel => (
                                                <button
                                                    key={channel}
                                                    onClick={() => setBulkSelectedChannel(channel)}
                                                    className={cn(
                                                        "px-3 py-3 rounded-xl border text-sm font-bold transition-all focus:outline-none flex items-center justify-center gap-2",
                                                        bulkSelectedChannel === channel
                                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 shadow-sm transition-transform active:scale-95"
                                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-transform active:scale-95"
                                                    )}
                                                >
                                                    {channel === 'Web' ? <Globe className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                                                    {channel}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {bulkSelectedChannel && (
                                        <>
                                            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    {bulkSelectedChannel === 'Web' ? '2. Hedef Web Sitesi Adı veya Linki' : '2. Hedef Trendyol Mağazası veya Linki'}
                                                </label>
                                                <textarea
                                                    value={bulkCompetitorInput}
                                                    onChange={(e) => setBulkCompetitorInput(e.target.value)}
                                                    rows="4"
                                                    placeholder={bulkSelectedChannel === 'Web' ? "Örn: https://www.rakip.com, Rakip Store" : "Örn: https://trendyol.com/magaza/atlas, TechShop"}
                                                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-gray-50/50"
                                                ></textarea>
                                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                                    {bulkSelectedChannel === 'Web' ? 'Her satıra bir rakip web sitesi domaini veya adı yapıştırabilirsiniz.' : 'Her satıra bir Trendyol mağaza linki veya adı yapıştırabilirsiniz.'}
                                                </p>
                                            </div>

                                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start mb-6 animate-in fade-in duration-300">
                                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-bold text-indigo-900 mb-1">Akıllı Algoritma</p>
                                                    <p className="text-indigo-700/80 leading-relaxed">Sistem, girdiğiniz {bulkSelectedChannel === 'Web' ? 'web sitelerinin' : 'Trendyol mağazalarının'} kataloglarını ve ürünlerini tarayarak, sizin envanterinizdeki <b>{products.length}</b> aktif ürün arasından isim benzerliğiyle makine öğrenimi eşleşmeleri bulacaktır.</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {bulkScanError && (
                                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-3 text-sm animate-in fade-in duration-300 text-left">
                                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="font-semibold leading-relaxed">{bulkScanError}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2 border-t border-gray-100">
                                        <button
                                            disabled={!bulkCompetitorInput.trim() || !bulkSelectedChannel}
                                            onClick={async () => {
                                                setBulkMatchStep(2);

                                                try {
                                                    // Save targets to backend for persistence
                                                    await fetch('/api/targets', {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ channel: bulkSelectedChannel, targets: bulkCompetitorInput })
                                                    });
                                                } catch (e) {
                                                    console.error("Failed to sync targets:", e);
                                                }

                                                try {
                                                    const targetUrlsArray = bulkCompetitorInput.split('\n').map(u => u.trim()).filter(Boolean);
                                                    if(targetUrlsArray.length === 0) {
                                                        throw new Error('Lütfen en az 1 adet rakip linki giriniz.');
                                                    }

                                                    // Use our shiny new API endpoint for each valid URL
                                                    const results = await Promise.all(targetUrlsArray.map(async (url) => {
                                                        const ikasNames = products.map(p => p.name || '');
                                                        const res = await fetch('/api/scan', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ url, ikasProductNames: ikasNames })
                                                        });
                                                        if(res.ok) {
                                                            const json = await res.json();
                                                            return json.data;
                                                        }
                                                        return null;
                                                    }));

                                                    const validResults = results.flat().filter(Boolean);
                                                    
                                                    if (validResults.length > 0) {
                                                        // Structure the scraped data into the Bulk Match UI format
                                                        const matchedResultsForUI = validResults.map((r, index) => {
                                                             let matchedIkasProduct = products.find(p => p.name === r.bestMatch?.name);
                                                             return {
                                                                 id: matchedIkasProduct ? matchedIkasProduct.id : `temp_${index}`,
                                                                 myImage: matchedIkasProduct ? matchedIkasProduct.image : '',
                                                                 myName: matchedIkasProduct ? matchedIkasProduct.name : 'Eşleşen Ürün Bulunamadı',
                                                                 mySku: matchedIkasProduct ? matchedIkasProduct.sku : '-',
                                                                 myPrice: matchedIkasProduct ? matchedIkasProduct.myPrice : 0,
                                                                 compName: r.scrapedTitle || 'İsimsiz Ürün',
                                                                 compPrice: r.scrapedPrice || 0,
                                                                 compSeller: r.source || bulkSelectedChannel,
                                                                 matchConfidence: r.bestMatch?.confidencePct || 0,
                                                                 compImage: r.scrapedImage || '',
                                                                 compUrl: r.url,
                                                                 selected: r.bestMatch?.confidencePct > 50 // auto-select high confidence ones
                                                             };
                                                        });
                                                        setBulkScanError('');
                                                        setBulkMatchResults(matchedResultsForUI);
                                                        setBulkMatchStep(3);
                                                    } else {
                                                        setBulkScanError("Tarama başarısız oldu veya site bot korumasına takıldı.");
                                                        setBulkMatchStep(1);
                                                    }
                                                } catch (error) {
                                                    setBulkScanError("Bağlantı Hatası: " + error.message);
                                                    setBulkMatchStep(1);
                                                }
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                                        >
                                            Taramayı Başlat
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Loading Sim */}
                            {bulkMatchStep === 2 && (
                                <div className="px-8 py-16 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Kataloglar Karşılaştırılıyor</h4>
                                    <p className="text-sm text-gray-500 max-w-sm text-center">"{bulkSelectedChannel}" üzerindeki rakip ürünler mevcut kataloğunuzla eşleştiriliyor...</p>
                                </div>
                            )}

                            {/* Step 3: Review Results */}
                            {bulkMatchStep === 3 && (
                                <div className="flex flex-col h-[650px] animate-in slide-in-from-right-4 duration-300">
                                    <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-emerald-900">Tarama Tamamlandı ({bulkSelectedChannel})</h4>
                                                <p className="text-xs text-emerald-700">{bulkMatchResults.length} potansiyel eşleşme bulundu. Yanlış olanların tikini kaldırın.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-5">
                                        {bulkMatchResults.map((match, idx) => (
                                            <div key={idx} className={cn("bg-white border rounded-xl overflow-hidden transition-all", match.selected ? "border-indigo-200 ring-1 ring-indigo-500 shadow-sm" : "border-gray-200 opacity-60")}>
                                                <div className="flex flex-col md:flex-row items-stretch">

                                                    {/* Checkbox Column */}
                                                    <div className="px-5 py-4 border-b md:border-b-0 md:border-r border-gray-100 flex items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
                                                        onClick={() => {
                                                            const newResults = [...bulkMatchResults];
                                                            newResults[idx].selected = !newResults[idx].selected;
                                                            setBulkMatchResults(newResults);
                                                        }}>
                                                        <div className={cn("w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shadow-sm", match.selected ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300")}>
                                                            {match.selected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                    </div>

                                                    {/* Your Product */}
                                                    <div className="flex-1 min-w-0 p-5 border-b md:border-b-0 md:border-r border-gray-100 flex items-start gap-4 flex-col sm:flex-row">
                                                        <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center border border-gray-200/50">
                                                            {match.myName === 'Eşleşen Ürün Bulunamadı' ? (
                                                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                            ) : (
                                                                <img src={match.myImage} alt="product" className="w-full h-full object-cover" onError={(e) => { e.target.src = getFallbackProductImage(match.myName); }} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-0.5">
                                                            <div className="font-bold text-[13px] text-slate-800 leading-snug line-clamp-2 mb-2" title={match.myName}>{match.myName}</div>
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate border border-slate-200/60">{match.mySku}</span>
                                                                <span className="shrink-0 text-slate-300">•</span>
                                                                <span className="text-slate-900 font-bold shrink-0">₺{match.myPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Target Product */}
                                                    <div className="flex-1 min-w-0 p-5 flex items-start flex-col sm:flex-row gap-4">
                                                        <div className="w-16 h-16 rounded-lg bg-white shrink-0 shadow-sm overflow-hidden flex items-center justify-center border border-gray-200/50">
                                                            <img referrerPolicy="no-referrer" src={match.compImage || ""} alt="product" className="w-full h-full object-cover opacity-90" onError={(e) => { e.target.src = getFallbackProductImage(match.compName); }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center h-full pt-0.5">
                                                            <div className="font-bold text-[13px] text-slate-800 leading-snug line-clamp-2 mb-2" title={match.compName}>{match.compName}</div>
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 w-full">
                                                                <a href={match.compUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 truncate max-w-[120px] sm:max-w-[180px]" title="Rakip Ürün Linki">
                                                                    <ExternalLink className="w-3 h-3 shrink-0" /> <span className="truncate">Uzantıyı Gör</span>
                                                                </a>
                                                                <span className="shrink-0 text-slate-300">•</span>
                                                                <span className="text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded shrink-0">₺{match.compPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white shrink-0">
                                        <button
                                            onClick={() => setBulkMatchStep(1)}
                                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 focus:outline-none"
                                        >
                                            Geri Dön
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const selectedMatches = bulkMatchResults.filter(r => r.selected);

                                                const newCompetitors = selectedMatches.map(match => ({
                                                    id: 'comp_' + Math.random().toString(36).substring(2, 9),
                                                    productId: match.id,
                                                    name: match.compName,
                                                    price: match.compPrice,
                                                    source: match.compSeller || bulkSelectedChannel,
                                                    sourceType: 'auto',
                                                    url: match.compUrl,
                                                    rating: 0,
                                                    status: 'Takipte',
                                                    isBuybox: match.compPrice < match.myPrice,
                                                    acronym: match.compName.substring(0, 2).toUpperCase(),
                                                    color: 'indigo',
                                                    isNew: true,
                                                    isManual: false,
                                                    note: 'AI Eşleşmesi'
                                                }));

                                                try {
                                                    const currentList = [...competitors];

                                                    newCompetitors.forEach(nc => {
                                                        const brand = (nc.source || '').toLowerCase().replace('www.', '').replace('.com', '').replace('.tr', '').trim();
                                                        const existingIdx = currentList.findIndex(c => {
                                                            const cBrand = (c.source || '').toLowerCase().replace('www.', '').replace('.com', '').replace('.tr', '').trim();
                                                            return c.productId === nc.productId && cBrand === brand;
                                                        });

                                                        if (existingIdx >= 0) {
                                                            // Update existing competitor with new prices
                                                            currentList[existingIdx] = {
                                                                ...currentList[existingIdx],
                                                                price: nc.price,
                                                                name: nc.name,
                                                                url: nc.url,
                                                                status: 'Takipte',
                                                                isBuybox: nc.isBuybox
                                                            };
                                                        } else {
                                                            // Add new competitor
                                                            currentList.push(nc);
                                                        }
                                                    });

                                                    setCompetitors(currentList);
                                                    saveCompetitorsToDB(currentList);

                                                    setIsBulkMatchOpen(false);

                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Kaydetme işlemi başarısız oldu. Lütfen sunucunun çalıştığına emin olun.");
                                                }
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            <CheckCircle2 className="w-4.5 h-4.5" strokeWidth={2.5} />
                                            {bulkMatchResults.filter(r => r.selected).length} Eşleşmeyi Kaydet
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
