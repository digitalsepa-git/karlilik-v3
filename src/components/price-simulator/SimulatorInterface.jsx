import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RAW_PRODUCTS } from '../../data/mockProducts';
import { BreakEvenChart } from './BreakEvenChart';
import { PriceProfitCurve } from './PriceProfitCurve';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

const AIInsightCard = ({ currentPrice, buyboxPrice, margin, openChatWithContext, productName, isSimulated, onApplyScenario, isCategoryMode }) => {
    // Logic
    let status = 'neutral';
    let title = 'AI Fiyat Analizi';
    let message = 'Veriler analiz ediliyor...';
    let colorClass = 'bg-gray-50 text-gray-700 border-gray-200';
    let iconColor = 'text-gray-400';

    const priceDiffQuery = buyboxPrice > 0 ? ((currentPrice - buyboxPrice) / buyboxPrice) * 100 : 0;
    const prefix = isSimulated ? "Simülasyon Sonucu: " : "";

    const quickActions = [];
    const smartQuestions = [];

    if (isCategoryMode) {
        // --- CATEGORY MODE LOGIC ---
        if (margin < 15) {
            status = 'danger';
            title = prefix + 'Kritik Kategori Kârlılığı';
            message = "Kategorinin ortalama kâr marjı %15'in altında. Kârlılığı iyileştirmek için fiyatlandırma stratejileri test edilebilir veya maliyet optimizasyonu analiz edilebilir.";
            colorClass = 'bg-red-50 text-red-800 border-red-100';
            iconColor = 'text-red-500';

            smartQuestions.push(`${productName} kategorisinde kârlılığı artırmak için toplu olarak ne yapabilirim?`);
            smartQuestions.push('Bu kategorideki en çok zarar eden ürünleri nasıl tespit edebilirim?');
        } else if (margin > 25) {
            status = 'success';
            title = prefix + 'Yüksek Kârlı Kategori';
            message = "Bu kategoride kâr marjınız çok sağlıklı. Pazar payını artırmak için stratejik olarak pazarlama bütçesini artırmayı değerlendirebilirsiniz.";
            colorClass = 'bg-indigo-50 text-indigo-800 border-indigo-100';
            iconColor = 'text-indigo-500';

            smartQuestions.push('Kârlılığı koruyarak bu kategoride pazar payımı nasıl artırabilirim?');
            smartQuestions.push('Bu kategoride hangi ürünleri reklama çıkarmalıyım?');
        } else {
            status = 'warning';
            title = prefix + 'Kategori Optimizasyon Fırsatı';
            message = "Kategorideki ürünlerin genel fiyatlandırma ve maliyet yapısı optimize edilebilir.";
            colorClass = 'bg-orange-50 text-orange-800 border-orange-100';
            iconColor = 'text-orange-500';

            smartQuestions.push('Bu kategoride maliyet optimizasyonu için en iyi stratejiler nelerdir?');
            smartQuestions.push('Tüm kategoriye %10 indirim yaparsam satış hacmini ne kadar artırmam gerekir?');
        }
    } else {
        // --- PRODUCT MODE LOGIC (Existing logic) ---
        if (currentPrice > buyboxPrice * 1.02) {
            // Scenario A: Price > Buybox (High Price)
            status = 'warning';
            title = prefix + 'Fiyat Rekabet Avantajını Kaybettiriyor';
            message = `Fiyatınız Buybox'ın %${priceDiffQuery.toFixed(1)} üzerinde. Satış hacmini artırmak için fiyatı düşürmeyi veya maliyetleri optimize etmeyi düşünün.`;
            colorClass = 'bg-orange-50 text-orange-800 border-orange-100';
            iconColor = 'text-orange-500';

            quickActions.push({ label: '⚡️ Buybox\'ı Eşle', code: 'match_buybox', color: 'indigo' });
            quickActions.push({ label: '🛡️ Hafif Rekabet', code: 'undercut', color: 'blue' });

            smartQuestions.push('Fiyatım yüksek ama markam var, ne yapmalıyım?');
        } else if (currentPrice <= buyboxPrice && margin > 20) {
            // Scenario B: Price <= Buybox & Margin > 20% (Optimal)
            status = 'success';
            title = prefix + 'Rekabetçi ve Kârlı';
            message = "Harika! Hem rekabetçi bir fiyata sahipsiniz hem de sağlıklı bir kâr marjı koruyorsunuz.";
            colorClass = 'bg-indigo-50 text-indigo-800 border-indigo-100';
            iconColor = 'text-indigo-500';

            quickActions.push({ label: '📉 Sürümü Artır', code: 'break_even', color: 'orange' });
            smartQuestions.push('Satış hacmini daha da artırmak için ne yapabilirim?');
        } else if (margin < 15) {
            // Scenario C: Low Margin
            status = 'danger';
            title = prefix + 'Düşük Kârlılık Riski';
            message = "Kâr marjınız kritik seviyenin altında (%15). Sürdürülebilirlik için maliyet optimizasyonu yapılması veya fiyat konumlandırmasının incelenmesi önerilir.";
            colorClass = 'bg-red-50 text-red-800 border-red-100';
            iconColor = 'text-red-500';

            quickActions.push({ label: '💰 Kârı Artır (%20)', code: 'maximize_profit', color: 'emerald' });
            smartQuestions.push('Maliyetleri nasıl düşürebilirim?');
            smartQuestions.push('Reklam bütçesini düşürürsem ne olur?');
        } else if (currentPrice < buyboxPrice * 0.9) {
            // Scenario D: Price < Buybox - 10% (Leaving money on table)
            status = 'info';
            title = prefix + 'Potansiyel Kâr Fırsatı';
            message = `Fiyatınız Buybox'ın çok altında. Kâr marjınızı artırmak için fiyatı biraz yükseltebilirsiniz.`;
            colorClass = 'bg-blue-50 text-blue-800 border-blue-100';
            iconColor = 'text-blue-500';

            quickActions.push({ label: '📈 Fiyatı Optimiz et', code: 'maximize_profit', color: 'emerald' });
            smartQuestions.push('Fiyatı ne kadar artırırsam satışlarım düşmez?');
        }
    }

    return (
        <div className={`rounded-xl p-4 border ${colorClass} flex gap-4 items-start relative overflow-hidden transition-all duration-300`}>
            <div className={`p-2 rounded-full bg-white/50 shrink-0 ${iconColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    {title}
                </h4>
                <p className="text-xs opacity-90 leading-relaxed mb-3">
                    {message}
                </p>

                {/* Quick Actions (Only rendered if they exist and onApplyScenario is valid) */}
                {onApplyScenario && quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {quickActions.map(action => (
                            <button
                                key={action.code}
                                onClick={() => onApplyScenario(action.code)}
                                className={`text-[10px] font-bold px-2 py-1 rounded border border-${action.color}-200 bg-${action.color}-50 text-${action.color}-700 hover:bg-${action.color}-100 transition-colors`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Smart Questions */}
                {smartQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {smartQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (openChatWithContext) {
                                        openChatWithContext({
                                            productName: productName,
                                            prompt: `Şu an **${productName}** ${isCategoryMode ? 'kategorisi' : 'ürünü'} için simülasyon yapıyorum. ${q} \n\nVeriler: Fiyat/Hedef: ${currentPrice}, Marj: %${margin}`
                                        });
                                    }
                                }}
                                className="text-[10px] text-gray-600 bg-white/50 border border-gray-200 px-2 py-1 rounded hover:bg-white hover:border-gray-300 transition-colors text-left"
                            >
                                ❓ {q}
                            </button>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => {
                        if (openChatWithContext) {
                            const prompt = `Şu an **${productName}** ${isCategoryMode ? 'kategorisi' : 'ürünü'} için simülasyon yapıyorum. 
                            
                            Mevcut Durum:
                            - Satış/Hedef Fiyatı: ₺${currentPrice.toFixed(2)}
                            ${!isCategoryMode ? `- Buybox Fiyatı: ₺${buyboxPrice.toFixed(2)}` : ''}
                            - Kâr Marjı: %${margin.toFixed(1)}
                            
                            Sistem Uyarısı: "${title} - ${message}"
                            
                            Bu durumda kârlılığımı optimize etmek için ne önerirsin?`;

                            openChatWithContext({
                                productName: productName,
                                productImage: null,
                                issue: status === 'success' ? 'optimization' : 'pricing_issue',
                                badgeText: isCategoryMode ? 'Kategori Simülasyonu' : 'Ürün Simülasyonu',
                                badgeColor: 'indigo',
                                prompt: prompt
                            });
                        }
                    }}
                    className="text-[10px] font-bold bg-white/60 hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-black/5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    AI Asistan'a Sor
                </button>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            </div>
        </div>
    );
};

// --- HELPER FUNCTIONS ---

const calculateActuals = (product, channelId = null) => {
    const totalUnits = product.unitsSold || 0;

    // Filter logic if channel selected
    let targetChannel = null;
    if (channelId) {
        targetChannel = product.channels?.find(c => c.id === channelId);
    }

    const price = targetChannel ? targetChannel.price : (product.channels?.[0]?.price || 0);

    const adSpendPerUnit = totalUnits > 0 ? product.adSpend / totalUnits : 0;
    const variableCost = (product.shipping || 0) + adSpendPerUnit;

    const dailyVelocity = Math.ceil((targetChannel ? targetChannel.units : totalUnits) / 30) || 1;

    return {
        velocity: dailyVelocity,
        costProduct: product.cogs || 0,
        costFixed: product.fixedCost || 0,
        costVariable: Number(variableCost.toFixed(2)) || 0,
        targetPrice: Number(price.toFixed(2)) || 0
    };
};

const getInitialState = (initialData) => {
    // Default State (Product)
    const defaultProduct = RAW_PRODUCTS[0];
    const defaultActuals = calculateActuals(defaultProduct);

    const baseState = {
        context: {
            title: defaultProduct.name,
            subtitle: `${defaultProduct.sku} • ${defaultProduct.category}`,
            image: defaultProduct.image,
            type: 'product',
            badge: defaultProduct.stock > 0 ? { text: `${defaultProduct.stock} Stok`, color: 'emerald' } : { text: 'Stok Yok', color: 'red' },
            currentPrice: defaultActuals.targetPrice,
            competitorPrice: defaultProduct.competitorPrice || 0,
            buyboxPrice: defaultProduct.competitorPrice || 0
        },
        inputs: {
            velocity: defaultActuals.velocity,
            costProduct: defaultActuals.costProduct,
            costFixed: defaultActuals.costFixed,
            costVariable: defaultActuals.costVariable,
            commissionRate: 0, // Simplified default
            targetPrice: defaultActuals.targetPrice,
            targetMargin: 20
        },
        originalInputs: null,
        mode: 'price',
        productId: defaultProduct.id,
        channelId: null
    };
    baseState.originalInputs = { ...baseState.inputs };

    if (!initialData) return baseState;

    // --- MODE: CATEGORY ---
    if (initialData.mode === 'category') {
        const stats = initialData.stats;
        if (!stats) return baseState;

        // Filter products based on channel to get accurate avg values
        const productsList = RAW_PRODUCTS.filter(p => !initialData.categoryId || p.category === initialData.categoryId);

        let totalRevTemp = 0;
        let totalCostTemp = 0;
        let countInChannel = 0;

        productsList.forEach(p => {
            let channelData = null;
            if (!initialData.channelId || initialData.channelId === 'all') {
                channelData = { price: p.channels?.[0]?.price || p.competitorPrice || 100, units: p.unitsSold || 1 };
            } else {
                const c = p.channels?.find(ch => ch.name === initialData.channelId);
                if (c) channelData = { price: c.price, units: c.units || 1 };
            }

            if (channelData) {
                countInChannel++;
                const cost = p.cogs + p.shipping + p.adSpend + p.fixedCost;
                totalRevTemp += channelData.price * channelData.units;
                totalCostTemp += cost * channelData.units;
            }
        });

        const safeAvgPrice = countInChannel > 0 ? (totalRevTemp / countInChannel) / (totalRevTemp / totalCostTemp / countInChannel || 1) : 100; // Rough proxy, Simulator mainly uses relative % anyway
        const safeAvgMargin = totalRevTemp > 0 ? ((totalRevTemp - totalCostTemp) / totalRevTemp) * 100 : 0;

        let avgPrice = parseFloat(stats.avgPrice) || safeAvgPrice;
        const avgMargin = parseFloat(stats.avgMargin) || safeAvgMargin;
        if (avgPrice <= 0) avgPrice = 100;

        const avgMarginDecimal = avgMargin / 100;
        const avgCost = avgPrice * (1 - avgMarginDecimal);
        const estimatedProductCost = avgCost * 0.8;
        const estimatedVariableCost = avgCost * 0.2;

        const targetMode = initialData.initialTargets?.mode || 'priceIncrease';
        let newTargetPrice = avgPrice;
        let newTargetMargin = avgMargin;
        let newSimMode = 'price';

        if (targetMode === 'priceIncrease') {
            newSimMode = 'price';
            const increasePercent = initialData.initialTargets?.priceIncrease || 0;
            newTargetPrice = avgPrice * (1 + increasePercent / 100);
            if (newTargetPrice > 0) {
                newTargetMargin = ((newTargetPrice - avgCost) / newTargetPrice) * 100;
            } else {
                newTargetMargin = 0;
            }
        } else if (targetMode === 'marginTarget') {
            newSimMode = 'margin';
            newTargetMargin = initialData.initialTargets?.marginTarget || 20;
            if ((1 - newTargetMargin / 100) > 0) {
                newTargetPrice = avgCost / (1 - newTargetMargin / 100);
            } else {
                newTargetPrice = avgCost * 1.5;
            }
        }

        const totalRev = parseFloat(stats.totalRevenue) || 0;
        const baseVelocity = (avgPrice > 0 && totalRev > 0) ? Math.ceil(totalRev / avgPrice / 30) : 1;
        const velocityChange = initialData.velocityChange || 0;
        const estimatedVelocity = Math.max(1, Math.round(baseVelocity * (1 + (velocityChange / 100))));

        const catInputs = {
            velocity: estimatedVelocity,
            costProduct: estimatedProductCost || 0,
            costFixed: 0,
            costVariable: estimatedVariableCost || 0,
            commissionRate: 0,
            vatRate: 0,
            targetPrice: newTargetPrice || avgPrice,
            targetMargin: newTargetMargin || 0
        };

        return {
            context: {
                title: `Kategori: ${initialData.categoryId || 'Genel'}`,
                subtitle: `${stats.productCount || 0} Ürün Ortalaması`,
                image: stats.starProduct?.image || null,
                type: 'category',
                badge: { text: (stats.productCount || 0) + ' Ürün', color: 'purple' },
                currentPrice: avgPrice,
                competitorPrice: 0,
                buyboxPrice: 0,
                channelId: initialData.channelId || 'all',
                velocityChange: initialData.velocityChange || 0
            },
            inputs: catInputs,
            originalInputs: { targetPrice: avgPrice, targetMargin: avgMargin, velocity: baseVelocity },
            mode: newSimMode,
            productId: null,
            channelId: initialData.channelId || 'all'
        };
    }

    // --- MODE: CHANNEL ---
    if (initialData.mode === 'channel') {
        const channel = initialData.selectedChannels?.[0];
        const params = initialData.params || {};

        // Default Category Mix (Example)
        const defaultCategories = [
            { id: 1, name: 'Elektronik', salesShare: 40, commissionRate: 12 },
            { id: 2, name: 'Tekstil', salesShare: 30, commissionRate: 20 },
            { id: 3, name: 'Kozmetik', salesShare: 30, commissionRate: 15 }
        ];

        const chanInputs = {
            revenue: 500000,          // Monthly Turnover Target
            aov: 500,                 // Average Order Value (TL)
            categories: defaultCategories,
            cogsRate: 50,             // % COGS (Cost of Goods Sold)
            marketingRate: params.marketplaceAdCost || 10,
            marketingType: 'percent', // 'percent' or 'fixed'
            costFixed: params.fixedCost || 5000, // Total Fixed Cost (e.g. Personnel, Software)
            shippingCost: 30,         // Avg Shipping Cost Per Order
            returnRate: 5,            // Avg Return Rate %
        };

        return {
            context: {
                title: channel ? channel.name : 'Pazaryeri',
                subtitle: 'Kanal Kârlılık Simülasyonu',
                image: channel?.logo || null,
                type: 'channel',
                badge: { text: 'Finansal Simülasyon', color: 'orange' },
                currentPrice: 0,
                competitorPrice: 0,
                buyboxPrice: 0
            },
            inputs: chanInputs,
            originalInputs: { ...chanInputs },
            mode: 'channel_revenue',
            productId: null,
            channelId: channel?.id
        };
    }

    // --- MODE: PRODUCT ---
    if (initialData.mode === 'product') {
        const product = RAW_PRODUCTS.find(p => p.id === initialData.productId);
        if (product) {
            let channelId = initialData.selectedChannelId;
            if (!channelId && product.channels?.length > 0) {
                const def = product.channels.find(c => c.type === 'web') || product.channels[0];
                channelId = def.id;
            }

            const currentChannel = product.channels?.find(c => c.id === channelId) || product.channels?.[0];
            const currentPrice = currentChannel?.price || 0;

            let commissionRate = 0;
            if (initialData.commissionRate !== null && initialData.commissionRate !== undefined) {
                commissionRate = initialData.commissionRate;
            } else {
                const commVal = currentChannel?.commission || 0;
                commissionRate = currentPrice > 0 ? (commVal / currentPrice) * 100 : 0;
            }

            const actuals = calculateActuals(product, channelId);
            const prodInputs = {
                velocity: actuals.velocity,
                costProduct: actuals.costProduct,
                costFixed: actuals.costFixed,
                costVariable: actuals.costVariable,
                commissionRate: parseFloat(commissionRate.toFixed(1)),
                targetPrice: initialData.initialTargets?.price || actuals.targetPrice,
                targetMargin: initialData.initialTargets?.margin || 20
            };

            return {
                context: {
                    title: product.name,
                    subtitle: `${product.sku} • ${product.category}`,
                    image: product.image,
                    type: 'product',
                    badge: product.stock > 0 ? { text: `${product.stock} Stok`, color: 'emerald' } : { text: 'Stok Yok', color: 'red' },
                    currentPrice: currentPrice,
                    competitorPrice: product.competitorPrice || 0,
                    buyboxPrice: product.competitorPrice || 0
                },
                inputs: prodInputs,
                originalInputs: { ...prodInputs },
                mode: initialData.initialTargets?.margin ? 'margin' : 'price',
                productId: product.id,
                channelId: channelId
            };
        }
    }

    // Fallback for other modes (company, channel, set) - Keeping it simple for now as they are less risky
    // You handle them if needed, or they use default fallback above
    return baseState;
};

export const SimulatorInterface = ({ activeTab, setActiveTab, onGoBack, initialData, openChatWithContext }) => {
    // Initialize State Synchronously from props
    const [initialState] = useState(() => getInitialState(initialData));

    // Simulator Context
    const [simContext, setSimContext] = useState(initialState.context);

    // Inputs State
    const [originalInputs, setOriginalInputs] = useState(initialState.originalInputs);
    const [inputs, setInputs] = useState(initialState.inputs);

    // Simulator Modes
    const [simMode, setSimMode] = useState(initialState.mode);

    // Internal State for Product Mode
    const [selectedProductId, setSelectedProductId] = useState(initialState.productId);
    const [selectedChannelId, setSelectedChannelId] = useState(initialState.channelId);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [excludedProducts, setExcludedProducts] = useState(new Set());

    // Effect to update handling if initialData props change AFTER mount (e.g. navigation)
    useEffect(() => {
        if (initialData) {
            const newState = getInitialState(initialData);
            setSimContext(newState.context);
            setInputs(newState.inputs);
            setOriginalInputs(newState.originalInputs);
            setSimMode(newState.mode);
            setSelectedProductId(newState.productId);
            setSelectedChannelId(newState.channelId);
        }
    }, [initialData]);

    // Legacy loaders (kept for internal resets/interactions)
    const loadProductData = (product, initialTargets = null, initialChannelId = null, initialCommissionRate = null) => {
        // ... (logic reused from helper concept or simplified)
        // For now we can rely on internal logic, but since we extracted logic to helper, 
        // we might want to unify. But for "Reset" button, we need to imperatively set state.

        // RE-INLINING simplified logic for interactivity:
        setSelectedProductId(product.id);
        let channelId = initialChannelId;
        if (!channelId && product.channels?.length > 0) {
            const def = product.channels.find(c => c.type === 'web') || product.channels[0];
            channelId = def.id;
        }
        setSelectedChannelId(channelId);

        const currentChannel = product.channels?.find(c => c.id === channelId) || product.channels?.[0];
        const currentPrice = currentChannel?.price || 0;
        let commissionRate = 0;
        if (initialCommissionRate !== null) {
            commissionRate = initialCommissionRate || 0;
        } else {
            const commVal = currentChannel?.commission || 0;
            commissionRate = currentPrice > 0 ? (commVal / currentPrice) * 100 : 0;
        }

        setSimContext({
            title: product.name,
            subtitle: `${product.sku} • ${product.category}`,
            image: product.image,
            type: 'product',
            badge: product.stock > 0 ? { text: `${product.stock} Stok`, color: 'emerald' } : { text: 'Stok Yok', color: 'red' },
            currentPrice: currentPrice,
            competitorPrice: product.competitorPrice || 0,
            buyboxPrice: product.competitorPrice || 0
        });

        const actuals = calculateActuals(product, channelId);
        const newInputs = {
            velocity: actuals.velocity,
            costProduct: actuals.costProduct,
            costFixed: actuals.costFixed,
            costVariable: actuals.costVariable,
            commissionRate: parseFloat(commissionRate.toFixed(1)),
            targetPrice: initialTargets?.price || actuals.targetPrice,
            targetMargin: initialTargets?.margin || 20
        };
        setInputs(newInputs);
        setOriginalInputs(newInputs);
        if (initialTargets?.margin) setSimMode('margin');
    };

    // Kept for consistency if other functions call it
    const loadCategoryData = (data) => {
        // This is mostly covered by the effect now, but if called manually...
        // We can use the helper:
        const state = getInitialState({ ...initialData, mode: 'category', ...data });
        // Note: 'data' passed here might be slightly different shape than initialData, verify usage
        // Assuming data IS the initialData payload for category:
        const newState = getInitialState(data);
        setSimContext(newState.context);
        setInputs(newState.inputs);
        setOriginalInputs(newState.originalInputs);
        setSimMode(newState.mode);
    };

    // ... define loadCompanyData, loadChannelData etc similarly or leave empty if not used interactively
    const loadCompanyData = () => { };
    const loadChannelData = () => { };
    const loadSetData = () => { };






    // --- CALCULATION LOGIC ---
    const [results, setResults] = useState({
        netProfit: 0, margin: 0, breakEven: 0, totalProfit: 0, calculatedPrice: 0, costs: { cogs: 0, fixed: 0, variable: 0 }
    });
    const [originalResults, setOriginalResults] = useState(null);

    // --- NEW ADVANCED COST MANAGEMENT STATES ---
    const [activeDrawer, setActiveDrawer] = useState(null); // 'variable' | 'fixed' | null

    const [detailedVariableCosts, setDetailedVariableCosts] = useState([
        { id: 'v1', name: 'Ambalaj / Kutu', value: 5.00 },
        { id: 'v2', name: 'Kargo Maliyeti', value: 20.00 },
        { id: 'v3', name: 'İçine Konan Hediye', value: 1.50 }
    ]);

    const [detailedFixedCosts, setDetailedFixedCosts] = useState([
        { id: 'f1', name: 'Depo Kirası', value: 15000 },
        { id: 'f2', name: 'Personel Maaşı', value: 30000 },
        { id: 'f3', name: 'Yazılım / FinOps', value: 1500 },
        { id: 'f4', name: 'Muhasebe', value: 2000 }
    ]);
    // -------------------------------------------

    // Reusable Calculation Function
    const calculateMetrics = (data, mode = simMode) => {

        // --- CHANNEL REVENUE MODE ---
        if (mode === 'channel_revenue' || (simContext && simContext.type === 'channel')) {
            const revenue = data.revenue || 0;
            const aov = data.aov || 1;
            const totalOrders = revenue > 0 ? Math.ceil(revenue / (aov > 0 ? aov : 1)) : 0;

            // Weighted Commission Calculation
            let weightedCommRate = 0;
            if (data.categories && data.categories.length > 0) {
                weightedCommRate = data.categories.reduce((acc, cat) => {
                    return acc + (cat.commissionRate * (cat.salesShare / 100));
                }, 0);
            } else {
                weightedCommRate = data.commissionRate || 0; // Fallback
            }

            const cogsRate = data.cogsRate || 0;
            const marketingRate = data.marketingRate || 0;
            const returnRate = data.returnRate || 0;

            // Costs
            const totalCOGS = revenue * (cogsRate / 100);
            const totalCommission = revenue * (weightedCommRate / 100);

            // Marketing (Fixed or Percent)
            const totalMarketing = data.marketingType === 'fixed'
                ? (data.marketingValue || 0)
                : revenue * (marketingRate / 100);

            // Variable Costs (Shipping + Returns)
            const totalShipping = totalOrders * (data.shippingCost || 0);
            // Simple return logic: % of orders are returns, costing shipping * 2 (round trip) + maybe handling?
            // Keeping it simple: Return Cost is separate line item or part of variable? 
            // Let's treat Return Rate as % of Revenue lost OR cost impact. 
            // Usually Returns = Revenue * ReturnRate -> Refunded. But COGS lost? Shipping lost?
            // Simplified: Return Cost = (Shipping * 2) * (Orders * ReturnRate%)
            const returnCount = totalOrders * (returnRate / 100);
            const totalReturnCost = returnCount * ((data.shippingCost || 0) * 1.5); // 1.5x shipping for return logistics

            const totalFixed = data.costFixed || 0;

            const totalVariable = totalCommission + totalShipping + totalReturnCost + totalMarketing;
            const totalExpenses = totalCOGS + totalVariable + totalFixed;

            const netProfit = revenue - totalExpenses;
            const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            // Break-even
            // BEP Revenue = Total Fixed / (1 - VariableRate)
            // Variable Rate here includes COGS, Comm, Mkt(if %), Shipping(as % of AOV approximately)
            const shippingRateExpected = aov > 0 ? (data.shippingCost / aov) : 0;
            const returnRateExpected = aov > 0 ? ((data.shippingCost * 1.5 * (returnRate / 100)) / aov) : 0;

            const totalVariableRate = (cogsRate / 100) + (weightedCommRate / 100) + (marketingRate / 100) + shippingRateExpected + returnRateExpected;
            const contributionMarginRate = 1 - totalVariableRate;

            const breakEvenRevenue = contributionMarginRate > 0 ? totalFixed / contributionMarginRate : 0;

            return {
                netProfit,
                margin,
                breakEven: breakEvenRevenue,
                totalProfit: netProfit,
                calculatedPrice: aov, // Using AOV as 'price' proxy for display if needed
                weightedCommissionRate: weightedCommRate,
                totalOrders,
                costs: {
                    cogs: totalCOGS,
                    commission: totalCommission,
                    marketing: totalMarketing,
                    shipping: totalShipping,
                    returns: totalReturnCost, // New
                    fixed: totalFixed,
                    variable: totalVariable
                }
            };
        }

        // --- PRODUCT / CATEGORY MODES (Legacy/Existing) ---
        const velocity = data.velocity || 0;
        const costProduct = data.costProduct || 0;
        const costFixed = data.costFixed || 0;
        const costVariable = data.costVariable || 0;
        const targetPrice = data.targetPrice || 0;
        const targetMargin = data.targetMargin || 0;
        const commissionRate = data.commissionRate || 0;

        const calculateTotalCost = (price) => {
            const commissionAmount = price * (commissionRate / 100);
            const marketingAmount = data.marketingType === 'percent' ? price * ((data.marketingValue || 0) / 100) : (data.marketingValue || 0) / (velocity || 1);
            return costProduct + costFixed + costVariable + commissionAmount + marketingAmount;
        };

        let salesPrice = 0;
        let netProfit = 0;
        let finalTotalCost = 0;

        if (mode === 'price') {
            salesPrice = targetPrice;
            finalTotalCost = calculateTotalCost(salesPrice);
            netProfit = salesPrice - finalTotalCost;
        } else {
            const marginDecimal = targetMargin / 100;
            const commDecimal = commissionRate / 100;
            const marketingDecimal = data.marketingType === 'percent' ? (data.marketingValue || 0) / 100 : 0;

            const denominator = 1 - marginDecimal - commDecimal - marketingDecimal;
            const fixedPortion = costProduct + costFixed + costVariable + (data.marketingType === 'fixed' ? (data.marketingValue || 0) / (velocity || 1) : 0);

            if (denominator > 0.001) {
                salesPrice = fixedPortion / denominator;
            } else {
                salesPrice = fixedPortion * 1000; // Fallback if denominator is too small
            }
            finalTotalCost = calculateTotalCost(salesPrice);
            netProfit = salesPrice - finalTotalCost;
        }

        const margin = salesPrice > 0 ? (netProfit / salesPrice) * 100 : 0;
        const totalProfit = netProfit * velocity * 30;
        const commDec = commissionRate / 100;
        const breakEvenPrice = (1 - commDec) > 0 ? (costProduct + costFixed + costVariable) / (1 - commDec) : 0;

        return {
            netProfit: netProfit || 0,
            margin: margin || 0,
            breakEven: breakEvenPrice || 0,
            totalProfit: totalProfit || 0,
            calculatedPrice: salesPrice || 0,
            costs: {
                cogs: costProduct,
                fixed: costFixed,
                variable: (costVariable + (salesPrice * commissionRate / 100)) || 0
            }
        };
    };

    // --- DYNAMIC COST RECALCULATION (THE "AHA" MOMENT) ---
    useEffect(() => {
        if (simContext?.type !== 'product') return;

        // 1. Calculate Monthly Fixed Costs & Unit Fixed Cost
        const totalMonthlyFixed = detailedFixedCosts.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

        // 2. Calculate Base Variable Cost from Detailed List
        const totalVariableBase = detailedVariableCosts.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);

        setInputs(prev => {
            const currentVelocity = prev.velocity || 1;
            const monthlyVolume = Math.max(1, currentVelocity * 30);
            const newFixedPerUnit = totalMonthlyFixed / monthlyVolume;

            // Economies of Scale for Variable Costs
            let newVariableCost = totalVariableBase;
            if (originalInputs && originalInputs.velocity > 0) {
                const baseVelocity = originalInputs.velocity;
                const velocityDeltaPercent = (currentVelocity - baseVelocity) / baseVelocity;
                const elasticity = 0.2; // 10% volume increase = 2% cost reduction

                newVariableCost = totalVariableBase * (1 - (velocityDeltaPercent * elasticity));
                // Boundaries: Max -50% reduction, Max +50% increase from base variable cost
                newVariableCost = Math.max(totalVariableBase * 0.5, Math.min(totalVariableBase * 1.5, newVariableCost));
            }

            // Prevent state thrashing
            if (Math.abs((prev.costFixed || 0) - newFixedPerUnit) < 0.01 &&
                Math.abs((prev.costVariable || 0) - newVariableCost) < 0.01) {
                return prev;
            }

            return {
                ...prev,
                costFixed: parseFloat(newFixedPerUnit.toFixed(2)),
                costVariable: parseFloat(newVariableCost.toFixed(2))
            };
        });
    }, [detailedFixedCosts, detailedVariableCosts, inputs.velocity, simContext?.type]);

    useEffect(() => {
        // Calculate Current Simulation Results
        const currentParams = { ...inputs, targetPrice: inputs.targetPrice, targetMargin: inputs.targetMargin };
        const curr = calculateMetrics(inputs, simMode);
        setResults(curr);

        // Calculate Original (Baseline) Results if originalInputs exists
        if (originalInputs) {
            const orig = calculateMetrics(originalInputs, 'price');
            setOriginalResults(orig);
        }
    }, [inputs, simMode, originalInputs]);


    // --- HANDLERS ---

    const handleInput = (e) => {
        const { id, value } = e.target;
        let key = id;

        let parsedValue = parseFloat(value) || 0;

        if (id.startsWith('sim-')) {
            const map = {
                'sim-velocity': 'velocity',
                // Detailed Cost Mgmt replaces direct costFixed/costVariable inputs
                'sim-target-price': 'targetPrice',
                'sim-target-margin': 'targetMargin',
                'sim-commission-rate': 'commissionRate'
            };
            key = map[id] || id;
        }

        setInputs(prev => ({ ...prev, [key]: parsedValue }));
    };

    // --- CATEGORY MIX HANDLERS ---
    const handleCategoryChange = (id, field, value) => {
        setInputs(prev => ({
            ...prev,
            categories: prev.categories.map(c => c.id === id ? { ...c, [field]: parseFloat(value) || 0 } : c)
        }));
    };

    const addCategory = () => {
        setInputs(prev => {
            const newId = Math.max(...prev.categories.map(c => c.id), 0) + 1;
            return {
                ...prev,
                categories: [...prev.categories, { id: newId, name: `Kategori ${newId}`, salesShare: 0, commissionRate: 20 }]
            };
        });
    };

    const removeCategory = (id) => {
        setInputs(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== id)
        }));
    };

    // Product Search Handlers (only for Product Mode)
    const filteredProducts = RAW_PRODUCTS.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });

    // Handle Reset logic (simplified)
    const handleReset = () => {
        if (initialData?.mode === 'product' && selectedProductId) {
            const product = RAW_PRODUCTS.find(p => p.id === selectedProductId);
            if (product) loadProductData(product);
        }
    };


    // Handle Scenario Application
    const handleApplyScenario = (scenario) => {
        const currentRefPrice = simContext.buyboxPrice || simContext.currentPrice || 100;
        const safeBuybox = simContext.buyboxPrice || 0;

        switch (scenario) {
            case 'match_buybox':
                // Set price to Buybox
                if (safeBuybox > 0) {
                    setSimMode('price');
                    setInputs(prev => ({ ...prev, targetPrice: safeBuybox }));
                }
                break;
            case 'undercut':
                // Set price 1% below Buybox
                if (safeBuybox > 0) {
                    setSimMode('price');
                    setInputs(prev => ({ ...prev, targetPrice: safeBuybox * 0.99 }));
                }
                break;
            case 'maximize_profit':
                // Set target margin to 25%
                setSimMode('margin');
                setInputs(prev => ({ ...prev, targetMargin: 20 })); // Or 25 depending on strategy
                break;
            case 'break_even':
                // Set target margin to 0% (or very low) to maximize volume
                setSimMode('margin');
                setInputs(prev => ({ ...prev, targetMargin: 5 }));
                break;
            default:
                break;
        }
    };


    // --- CATEGORY DELTA MATH ENGINE ---
    const categorySimMetrics = useMemo(() => {
        if (simContext.type !== 'category') return null;

        const categoryName = simContext.title.replace('Kategori: ', '').trim();
        const realCategoryName = categoryName === 'Genel' ? '' : categoryName;
        const productsList = realCategoryName ? RAW_PRODUCTS.filter(p => p.category === realCategoryName) : RAW_PRODUCTS;
        const channelId = simContext.channelId || 'all';

        // Helper to get product data for a specific channel
        const getProductChannelData = (product, channelName) => {
            if (channelName === 'all' || !product.channels) {
                return {
                    price: product.channels?.[0]?.price || product.competitorPrice || 100,
                    units: product.unitsSold || 1
                };
            }
            const channel = product.channels.find(c => c.name === channelName);
            if (!channel) return null; // Product not in this channel
            return {
                price: channel.price,
                units: channel.units || 1
            };
        };

        let oldTotalRev = 0;
        let newTotalRev = 0;
        let oldTotalProfit = 0;
        let newTotalProfit = 0;
        let oldLosingCount = 0;
        let rescuedCount = 0;
        let oldTotalUnits = 0;
        const affectedProducts = [];

        // Find price and velocity multipliers
        const priceMultiplier = (originalInputs && originalInputs.targetPrice > 0) ? (inputs.targetPrice / originalInputs.targetPrice) : 1;
        const velocityMultiplier = (originalInputs && originalInputs.velocity > 0) ? (inputs.velocity / originalInputs.velocity) : 1;

        productsList.forEach(p => {
            const channelData = getProductChannelData(p, channelId);
            if (!channelData) return; // Skip product if not in the selected channel

            const { price: oldPrice, units: baseUnits } = channelData;
            const units = Math.max(0, Math.round(baseUnits * velocityMultiplier));
            const isExcluded = excludedProducts.has(p.id);
            const cost = p.cogs + p.shipping + p.adSpend + p.fixedCost; // simplified cost estimation from mock data

            const oldUnitProfit = oldPrice - cost;
            const newPrice = isExcluded ? oldPrice : (oldPrice * priceMultiplier);
            const newUnitProfit = newPrice - cost;

            oldTotalRev += oldPrice * units;
            newTotalRev += newPrice * units;

            oldTotalProfit += oldUnitProfit * units;
            newTotalProfit += newUnitProfit * units;
            oldTotalUnits += units;

            const wasLosing = oldUnitProfit < 0;
            const isNowWinning = newUnitProfit > 0;

            if (wasLosing) {
                oldLosingCount++;
                if (!isExcluded && isNowWinning) rescuedCount++;
                if (isExcluded && oldUnitProfit >= 0) rescuedCount++; // technicality
            }

            affectedProducts.push({
                ...p,
                oldPrice,
                newPrice,
                oldUnitProfit,
                newUnitProfit,
                monthlyVolume: units,
                isExcluded,
                wasLosing,
                isNowWinning,
                status: isExcluded ? 'excluded' : (wasLosing && isNowWinning ? 'rescued' : (newUnitProfit < 0 ? 'losing' : 'profitable')),
                totalNewProfitContribution: newUnitProfit * units
            });
        });

        // Calculate top 10 contributors
        const topContributors = [...affectedProducts]
            .sort((a, b) => b.totalNewProfitContribution - a.totalNewProfitContribution)
            .slice(0, 10);

        const deltaRev = newTotalRev - oldTotalRev;
        const deltaProfit = newTotalProfit - oldTotalProfit;
        const avgNewProfitPerUnit = newTotalProfit / (oldTotalUnits || 1);
        const breakevenVelocity = newTotalProfit > 0 && oldTotalProfit > 0 ? Math.ceil(oldTotalProfit / avgNewProfitPerUnit) : 0;

        return {
            oldTotalRev,
            newTotalRev,
            deltaRev,
            oldTotalProfit,
            newTotalProfit,
            deltaProfit,
            oldLosingCount,
            rescuedCount,
            breakevenVelocity,
            affectedProducts,
            topContributors,
            oldTotalUnits
        };
    }, [simContext.type, simContext.title, inputs.targetPrice, originalInputs, excludedProducts]);


    // --- SCENARIO MANAGEMENT ---
    const [savedScenarios, setSavedScenarios] = useState([]);
    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
    const [isAllProductsModalOpen, setIsAllProductsModalOpen] = useState(false);
    const [scenarioName, setScenarioName] = useState('');

    const toggleExcludeProduct = (id) => {
        setExcludedProducts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const saveScenario = () => {
        if (!scenarioName.trim()) return;
        const newScenario = {
            id: Date.now(),
            name: scenarioName,
            date: new Date().toLocaleDateString('tr-TR'),
            context: simContext,
            inputs: inputs,
            results: results
        };
        setSavedScenarios(prev => [newScenario, ...prev]);
        setScenarioName('');
        setIsScenarioModalOpen(false);
    };

    const loadScenario = (scenario) => {
        setSimContext(scenario.context);
        setInputs(scenario.inputs);
        // Results will re-calc automatically via useEffect
        setIsScenarioModalOpen(false);
    };

    const deleteScenario = (id) => {
        setSavedScenarios(prev => prev.filter(s => s.id !== id));
    };


    // --- RENDER HELPERS ---
    let marginBadgeClass = (results.margin || 0) > 25 ? "bg-emerald-100 text-emerald-700" :
        (results.margin || 0) > 15 ? "bg-blue-100 text-blue-700" :
            (results.margin || 0) > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";

    const totalVal = Math.max((results.calculatedPrice || 0), 1);
    const wCogs = ((results.costs?.cogs || 0) / totalVal) * 100;
    const wFixed = ((results.costs?.fixed || 0) / totalVal) * 100;
    const wVar = ((results.costs?.variable || 0) / totalVal) * 100;
    const wProfit = Math.max(0, ((results.netProfit || 0) / totalVal) * 100);

    return (
        <div id="simulator-interface" className="animate-fade-in relative">
            {/* Scenario Modal */}
            {isScenarioModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsScenarioModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Senaryolarım</h3>
                            <button onClick={() => setIsScenarioModalOpen(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>

                        <div className="p-6 bg-gray-50/50">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mevcut Durumu Kaydet</label>
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={scenarioName}
                                    onChange={(e) => setScenarioName(e.target.value)}
                                    placeholder="Örn: Yüksek Kar Stratejisi"
                                    className="flex-1 rounded-xl border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={saveScenario}
                                    disabled={!scenarioName.trim()}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    Kaydet
                                </button>
                            </div>

                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kaydedilenler ({savedScenarios.length})</label>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {savedScenarios.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm italic">Henüz kaydedilmiş senaryo yok.</div>
                                ) : (
                                    savedScenarios.map(sc => (
                                        <div key={sc.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                                            <div onClick={() => loadScenario(sc)} className="cursor-pointer flex-1">
                                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{sc.name}</h4>
                                                <p className="text-[10px] text-gray-500">{sc.date} • {sc.context.title}</p>
                                            </div>
                                            <button onClick={() => deleteScenario(sc.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fiyat Simülatörü</h1>
                    <p className="text-sm text-gray-500 mt-1">Stratejik "What-If" analizleri ve kârlılık projeksiyonu.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsScenarioModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-indigo-600 transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        Senaryolar
                        {savedScenarios.length > 0 && <span className="ml-1 bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">{savedScenarios.length}</span>}
                    </button>
                    <button onClick={onGoBack} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-indigo-600 transition shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                        Modu Değiştir
                    </button>
                </div>
            </div>

            {/* Context Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-visible z-20">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${simContext.type === 'product' ? 'bg-indigo-500' : simContext.type === 'category' ? 'bg-purple-500' : simContext.type === 'company' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-14 h-14 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {simContext.image ? (
                            <img src={simContext.image} className="w-full h-full object-cover" alt="Subject" />
                        ) : (
                            <span className="text-2xl">
                                {simContext.type === 'category' ? '🏷️' : simContext.type === 'company' ? '🏢' : simContext.type === 'channel' ? '🌐' : '📦'}
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 leading-tight">{simContext.title}</h2>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{simContext.subtitle}</p>
                    </div>
                </div>

                {/* Channel Selector (New Feature) */}
                {simContext.type === 'product' && selectedProductId && (
                    <div className="ml-4 pl-4 border-l border-gray-200">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Satış Kanalı</label>
                        <select
                            value={selectedChannelId || ''}
                            onChange={(e) => {
                                const newChannelId = e.target.value;
                                const product = RAW_PRODUCTS.find(p => p.id === selectedProductId);
                                if (product) {
                                    // RELOAD DATA for new channel
                                    loadProductData(product, null, newChannelId);
                                }
                            }}
                            className="block w-40 text-xs font-bold text-gray-900 border-none bg-gray-50 rounded-lg focus:ring-1 focus:ring-indigo-500 py-1.5"
                        >
                            {RAW_PRODUCTS.find(p => p.id === selectedProductId)?.channels?.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}


                {/* Search for Product Mode */}
                {simContext.type === 'product' && (
                    <div className="flex-1 w-full md:w-auto max-w-xl flex gap-2 relative z-50">
                        <div className="relative flex-1 group" ref={searchRef}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchOpen(true)}
                                placeholder="Başka ürün ara..."
                                className="block w-full rounded-lg border-gray-300 bg-white text-xs py-2.5 pl-9 pr-4 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-shadow focus:shadow-md"
                            />
                            {isSearchOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl max-h-80 overflow-y-auto z-50 animate-fade-in-up">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} onClick={() => { loadProductData(p); setIsSearchOpen(false); setSearchQuery(''); }} className="p-3 hover:bg-gray-50 cursor-pointer flex gap-3 items-center border-b border-gray-50 last:border-0">
                                            <img src={p.image} className="w-8 h-8 rounded border border-gray-100" />
                                            <div><p className="text-xs font-bold text-gray-900">{p.name}</p><p className="text-[10px] text-gray-500">{p.sku}</p></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {simContext.type === 'channel' && (
                    <div className="flex-1 text-center md:text-right">
                        <div className="inline-block bg-orange-50 px-3 py-1 rounded text-orange-800 text-xs font-bold">
                            Temsili Ürün Görünümü
                        </div>
                    </div>
                )}


                <div className="flex items-center gap-3">
                    {simContext.currentPrice > 0 && (
                        <div className="hidden md:block text-right mr-4 border-r border-gray-200 pr-4">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Mevcut Fiyat</p>
                            <p className="text-sm font-bold text-gray-900">₺{simContext.currentPrice.toFixed(2)}</p>
                        </div>
                    )}
                    {simContext.badge && (
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full bg-${simContext.badge.color}-50 text-${simContext.badge.color}-700 border border-${simContext.badge.color}-100 shadow-sm`}>
                            {simContext.badge.text}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT: CONTROL PANEL --- */}
                <div className="lg:col-span-4 space-y-4">

                    {simContext.type === 'channel' ? (
                        // CHANNEL REVENUE MODE SIDEBAR
                        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <svg className="w-32 h-32 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>

                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-6">Finansal Senaryo</h3>

                                <div className="space-y-6">
                                    {/* Total Revenue Input */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase">Aylık Ciro Hedefi</label>
                                            <span className="text-sm font-bold text-gray-900">₺{inputs.revenue?.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            value={inputs.revenue || 0}
                                            onChange={(e) => handleInput({ target: { id: 'revenue', value: parseInt(e.target.value) } })}
                                            min="0" max="5000000" step="10000"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                        />
                                        <div className="relative mt-2">
                                            <input
                                                type="number"
                                                value={inputs.revenue || 0}
                                                onChange={(e) => handleInput({ target: { id: 'revenue', value: parseFloat(e.target.value) } })}
                                                className="block w-full rounded-lg border-gray-300 pl-8 py-2 text-sm font-bold focus:border-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="absolute left-3 top-2 text-gray-400 font-bold text-xs">₺</span>
                                        </div>
                                    </div>

                                    {/* AOV Input */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase">Ortalama Sepet Tutarı</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={inputs.aov || 0}
                                                onChange={(e) => handleInput({ target: { id: 'aov', value: parseFloat(e.target.value) } })}
                                                className="block w-full rounded-lg border-gray-300 pl-8 py-2 text-sm font-bold focus:border-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="absolute left-3 top-2 text-gray-400 font-bold text-xs">₺</span>
                                        </div>
                                    </div>

                                    <div className="h-px bg-orange-50 my-2"></div>

                                    {/* Category Mix */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase">Kategori Dağılımı</label>
                                            <button onClick={addCategory} className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100">+ Kategori Ekle</button>
                                        </div>

                                        {/* Total Share Warning */}
                                        {(() => {
                                            const totalShare = inputs.categories?.reduce((acc, c) => acc + (c.salesShare || 0), 0) || 0;
                                            if (Math.abs(totalShare - 100) > 0.1) {
                                                return <div className="text-[10px] text-red-600 font-bold mb-2">⚠️ Toplam Pay: %{totalShare.toFixed(1)} (100% olmalı)</div>
                                            }
                                        })()}

                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {inputs.categories?.map((cat) => (
                                                <div key={cat.id} className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs">
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            value={cat.name}
                                                            onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                                                            className="flex-1 min-w-0 bg-white border-gray-200 rounded px-2 py-1"
                                                            placeholder="Kategori Adı"
                                                        />
                                                        <button onClick={() => removeCategory(cat.id)} className="text-gray-400 hover:text-red-500">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-[9px] text-gray-500 uppercase mb-0.5">Satış Payı %</label>
                                                            <input
                                                                type="number"
                                                                value={cat.salesShare}
                                                                onChange={(e) => handleCategoryChange(cat.id, 'salesShare', e.target.value)}
                                                                className="w-full bg-white border-gray-200 rounded px-2 py-1 font-bold"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] text-gray-500 uppercase mb-0.5">Komisyon %</label>
                                                            <input
                                                                type="number"
                                                                value={cat.commissionRate}
                                                                onChange={(e) => handleCategoryChange(cat.id, 'commissionRate', e.target.value)}
                                                                className="w-full bg-white border-gray-200 rounded px-2 py-1 font-bold text-orange-600"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-orange-50 my-2"></div>

                                    {/* Global Costs */}
                                    {/* COGS Rate */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase">Ürün Maliyeti (SMM %)</label>
                                            <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">%{inputs.cogsRate}</span>
                                        </div>
                                        <input
                                            type="range"
                                            value={inputs.cogsRate || 0}
                                            onChange={(e) => handleInput({ target: { id: 'cogsRate', value: parseFloat(e.target.value) } })}
                                            min="0" max="90" step="1"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                                        />
                                    </div>

                                    {/* Marketing Rate */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase">Reklam / Pazarlama %</label>
                                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">%{inputs.marketingRate}</span>
                                        </div>
                                        <input
                                            type="range"
                                            value={inputs.marketingRate || 0}
                                            onChange={(e) => handleInput({ target: { id: 'marketingRate', value: parseFloat(e.target.value) } })}
                                            min="0" max="50" step="0.5"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        />
                                    </div>

                                    {/* Shipping & Fixed */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kargo (Sipariş Başı)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={inputs.shippingCost || 0}
                                                    onChange={(e) => handleInput({ target: { id: 'shippingCost', value: parseFloat(e.target.value) } })}
                                                    className="block w-full rounded-lg border-gray-300 pl-6 py-2 text-sm font-bold"
                                                />
                                                <span className="absolute left-2 top-2 text-gray-400 font-bold text-xs">₺</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Sabit Gider (Aylık)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={inputs.costFixed || 0}
                                                    onChange={(e) => handleInput({ target: { id: 'costFixed', value: parseFloat(e.target.value) } })}
                                                    className="block w-full rounded-lg border-gray-300 pl-6 py-2 text-sm font-bold"
                                                />
                                                <span className="absolute left-2 top-2 text-gray-400 font-bold text-xs">₺</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ) : simContext.type === 'category' ? (
                        // CATEGORY MODE SIDEBAR
                        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <svg className="w-32 h-32 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg>
                            </div>

                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">Kategori Stratejisi</h3>
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <div className="text-xs text-purple-600 font-bold bg-purple-50 inline-block px-2 py-1 rounded">
                                        Kanal: {simContext.channelId === 'all' ? 'Tüm Kanallar' : simContext.channelId}
                                    </div>
                                    {simContext.velocityChange !== 0 && (
                                        <div className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-1 rounded border border-blue-100">
                                            Hız Beklentisi: %{simContext.velocityChange > 0 ? '+' : ''}{simContext.velocityChange}
                                        </div>
                                    )}
                                </div>
                                <div className="flex bg-purple-50 rounded-lg p-1 border border-purple-100 mb-6">
                                    <button
                                        onClick={() => setSimMode('price')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${simMode === 'price' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 hover:bg-purple-100'}`}
                                    >
                                        % Fiyat Değişimi
                                    </button>
                                    <button
                                        onClick={() => setSimMode('margin')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${simMode === 'margin' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 hover:bg-purple-100'}`}
                                    >
                                        Hedef Kâr Marjı
                                    </button>
                                </div>

                                {simMode === 'price' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase">Fiyat Değişim Oranı</label>
                                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                                    {(() => {
                                                        const percent = simContext.currentPrice > 0
                                                            ? ((inputs.targetPrice - simContext.currentPrice) / simContext.currentPrice) * 100
                                                            : 0;
                                                        return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
                                                    })()}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="-30"
                                                max="50"
                                                step="0.5"
                                                value={simContext.currentPrice > 0 ? ((inputs.targetPrice - simContext.currentPrice) / simContext.currentPrice) * 100 : 0}
                                                onChange={(e) => {
                                                    const percent = parseFloat(e.target.value);
                                                    const newPrice = simContext.currentPrice * (1 + percent / 100);
                                                    handleInput({ target: { id: 'sim-target-price', value: newPrice } });
                                                }}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                            <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                                                <span>-%30 (İndirim)</span>
                                                <span>0% (Sabit)</span>
                                                <span>+%50 (Zam)</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase">Hedef Kâr Marjı (Min)</label>
                                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                                    %{inputs.targetMargin}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="60"
                                                step="1"
                                                value={inputs.targetMargin}
                                                onChange={(e) => handleInput({ target: { id: 'sim-target-margin', value: e.target.value } })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-purple-50">
                                <div className="space-y-4">
                                    {categorySimMetrics && (
                                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 leading-relaxed text-sm shadow-inner">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">⚖️</span>
                                                <p className="font-extrabold text-purple-900">Başabaş Hacim Uyarısı</p>
                                            </div>
                                            <p className="text-purple-800">
                                                {(inputs.targetPrice || 0) >= (originalInputs?.targetPrice || 0) ? (
                                                    <span>Bu fiyat zammı ile eski kârınızı korumak için satış hacminiz <strong>{categorySimMetrics.oldTotalUnits}</strong> adetten <strong className="text-purple-700">{categorySimMetrics.breakevenVelocity}</strong> adede düşse bile zarar etmezsiniz.</span>
                                                ) : (
                                                    <span>Bu fiyat indirimi ile eski kârınızı korumak için satış hacminizin <strong>{categorySimMetrics.oldTotalUnits}</strong> adetten <strong className="text-purple-700">{categorySimMetrics.breakevenVelocity}</strong> adede çıkması gerekir.</span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-3 text-xs text-purple-800 leading-relaxed mt-4">
                                <span className="font-bold">Bilgi:</span> Bu strateji kategorideki tüm ürünlere uygulanır. İstisnaları yandaki listeden belirleyebilirsiniz.
                            </div>

                            {/* Category - Affected Products Accordion (Moved to Left Panel) */}
                            {categorySimMetrics && categorySimMetrics.affectedProducts.length > 0 && (
                                <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xs font-bold text-gray-900">Etkilenen Ürünler</h3>
                                                <p className="text-[9px] text-gray-500 font-medium">{categorySimMetrics.affectedProducts.length} Ürün</p>
                                            </div>
                                        </div>
                                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>

                                    {isAccordionOpen && (
                                        <div className="border-t border-gray-200 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                            {categorySimMetrics.affectedProducts.map(prod => (
                                                <div key={prod.id} className={`p-3 flex flex-col hover:bg-gray-50 transition-colors gap-2 relative ${prod.isExcluded ? 'opacity-50 grayscale' : ''}`}>
                                                    <div className="flex items-start gap-2 pr-10">
                                                        <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded shrink-0 object-cover border border-gray-200" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className={`text-[11px] font-bold text-gray-900 line-clamp-1 ${prod.isExcluded ? 'line-through' : ''}`}>{prod.name}</p>
                                                            <p className="text-[9px] text-gray-500 font-medium truncate">
                                                                {prod.brand} | Aylık {prod.monthlyVolume} Adet
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-medium text-gray-400 line-through">₺{prod.oldUnitProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                            <span className={`text-[11px] font-bold ${prod.newUnitProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>₺{prod.newUnitProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                        </div>
                                                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${prod.status === 'excluded' ? 'bg-gray-200 text-gray-600' :
                                                            prod.status === 'rescued' ? 'bg-amber-100 text-amber-700' :
                                                                prod.status === 'profitable' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {prod.status === 'excluded' ? 'İstisna' : prod.status === 'rescued' ? 'Kâra Geçti' : prod.status === 'profitable' ? 'Kârlı' : 'Zararda'}
                                                        </span>
                                                    </div>

                                                    {/* Toggle Switch Top Right Absolute */}
                                                    <div className="absolute top-3 right-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleExcludeProduct(prod.id); }}
                                                            className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!prod.isExcluded ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                                            role="switch"
                                                            aria-checked={!prod.isExcluded}
                                                            title={!prod.isExcluded ? "Simülasyondan çıkar" : "Simülasyona dahil et"}
                                                        >
                                                            <span aria-hidden="true" className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!prod.isExcluded ? 'translate-x-3' : 'translate-x-0'}`}></span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    ) : (
                        // PRODUCT MODE SIDEBAR (Existing)
                        <>
                            {/* 1. Target Driver */}
                            <div className="bg-gray-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-300">Simülasyon Hededi</h3>
                                        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                                            <button onClick={() => setSimMode('price')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${simMode === 'price' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Fiyat</button>
                                            <button onClick={() => setSimMode('margin')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${simMode === 'margin' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Kâr Marjı</button>
                                        </div>
                                    </div>

                                    {simMode === 'price' ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <label className="block text-xs font-bold text-gray-400 uppercase">Satış Fiyatı Hedefi</label>
                                                    {simContext.currentPrice > 0 && (
                                                        <span className="text-[10px] text-gray-500">Mevcut: <span className="text-gray-300 font-mono">₺{simContext.currentPrice}</span></span>
                                                    )}
                                                </div>
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300 font-medium text-lg">₺</span>
                                                    <input
                                                        type="number"
                                                        id="sim-target-price"
                                                        value={inputs.targetPrice}
                                                        onChange={handleInput}
                                                        className="block w-full rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white font-bold text-2xl pl-10 py-3 focus:border-indigo-500 focus:ring-0 transition-all text-right pr-4"
                                                    />
                                                </div>
                                            </div>
                                            {/* Slider for Price */}
                                            <input
                                                type="range"
                                                id="sim-target-price"
                                                min={Math.floor((inputs.costProduct + inputs.costFixed + inputs.costVariable) * 1.05)}
                                                max={Math.ceil((simContext.currentPrice || 1000) * 1.5)}
                                                step="1"
                                                value={inputs.targetPrice}
                                                onChange={handleInput}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-gray-400 uppercase">Kâr Marjı Hedefi</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        id="sim-target-margin"
                                                        value={inputs.targetMargin}
                                                        onChange={handleInput}
                                                        className="block w-full rounded-xl border-2 border-gray-700 bg-gray-800/50 text-white font-bold text-2xl pl-4 py-3 focus:border-indigo-500 focus:ring-0 transition-all text-right pr-10"
                                                    />
                                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-300 font-medium text-lg">%</span>
                                                </div>
                                            </div>
                                            {/* Slider for Margin */}
                                            <input
                                                type="range"
                                                id="sim-target-margin"
                                                min="0"
                                                max="80"
                                                step="0.5"
                                                value={inputs.targetMargin}
                                                onChange={handleInput}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                    )}

                                    {/* Break-even Volume Calculation (Aynı Parayı Kazanmak İçin) */}
                                    {(() => {
                                        if (simContext.type !== 'product' || !originalResults || !originalInputs) return null;

                                        const originalDailyProfit = (originalResults.netProfit || 0) * (originalInputs.velocity || 0);
                                        const currentUnitProfit = results.netProfit || 0;

                                        // Only show if daily profit was positive and unit profit has changed
                                        const isProfitChanged = Math.abs(currentUnitProfit - originalResults.netProfit) > 0.5;

                                        if (isProfitChanged && originalDailyProfit > 0) {
                                            return (
                                                <div className="mt-6 p-3 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-300 leading-relaxed animate-fade-in-up">
                                                    {currentUnitProfit <= 0 ? (
                                                        <span className="text-red-400">🚨 Bu fiyatta ürün başına zarar ediyorsunuz. Satış hacmi ne olursa olsun kârlılık sağlanamaz.</span>
                                                    ) : currentUnitProfit < originalResults.netProfit ? (
                                                        <span>💡 <strong>Fiyatı düşürdünüz.</strong> Önceki günlük toplam kârınızı ({originalDailyProfit.toFixed(0)} ₺) korumak için bugün günde {originalInputs.velocity} değil, <strong className="text-white">en az {Math.ceil(originalDailyProfit / currentUnitProfit)} adet</strong> satmalısınız.</span>
                                                    ) : (
                                                        <span>💡 <strong>Fiyatı artırdınız.</strong> Önceki günlük yatırım getirinizi ({originalDailyProfit.toFixed(0)} ₺) korumak için bugün <strong className="text-white">en az {Math.ceil(originalDailyProfit / currentUnitProfit)} adet</strong> satmanız yeterlidir. (Daha az efor, aynı kazanç)</span>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>

                            {/* 2. Costs & Volume */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                    <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">Maliyet ve Hacim</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Volume */}
                                    <div>
                                        <label className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                                            <span>Günlük Satış Hızı</span>
                                            <span className="text-indigo-600">{inputs.velocity * 30}/ay</span>
                                        </label>
                                        <input type="range" id="sim-velocity" min="1" max="100" value={inputs.velocity} onChange={handleInput} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2" />
                                        <input type="number" id="sim-velocity" value={inputs.velocity} onChange={handleInput} className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-bold text-gray-900 py-2.5" />

                                        {/* Historical Context (Bakkal Hesabı) */}
                                        {simContext.type === 'product' && originalInputs && (
                                            <div className="mt-2 text-[11px] text-gray-600 bg-gray-50 border border-gray-100 rounded p-2 leading-relaxed animate-fade-in">
                                                <span className="mr-1">🕒</span> Geçmiş ay bu ürünü ortalama <strong className="text-gray-900">{originalInputs.targetPrice} ₺</strong>'den sattınız ve günde ortalama <strong className="text-gray-900">{originalInputs.velocity} adet</strong> sipariş aldınız.
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Birim Maliyet (COGS)</label>
                                            <div className="relative group mb-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₺</span>
                                                <input type="number" id="sim-cost-product" value={inputs.costProduct} onChange={handleInput} className="block w-full rounded-lg border-gray-300 pl-8 py-2 focus:border-red-500 focus:ring-red-500 sm:text-sm font-bold text-gray-900 transition-colors" />
                                            </div>
                                            <input type="range" id="sim-cost-product" min="0" max={inputs.costProduct * 2 || 1000} value={inputs.costProduct} onChange={handleInput} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
                                        </div>

                                        {/* Dynamic Cost Triggers */}
                                        <div className="space-y-3 mt-4">
                                            <button onClick={() => setActiveDrawer('variable')} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-white border border-gray-200 shadow-sm rounded-lg transition-all group">
                                                <span className="text-xs font-bold text-gray-700 group-hover:text-amber-600 transition-colors">⚙️ Değişken Giderleri Yönet</span>
                                                <span className="text-sm font-extrabold text-amber-600">{(inputs.costVariable || 0).toFixed(2)} ₺ <span className="text-[10px] font-medium text-gray-400">/ Adet</span></span>
                                            </button>
                                            <button onClick={() => setActiveDrawer('fixed')} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-white border border-gray-200 shadow-sm rounded-lg transition-all group">
                                                <span className="flex flex-col text-left">
                                                    <span className="text-xs font-bold text-gray-700 group-hover:text-slate-600 transition-colors">⚙️ Aylık Sabit Giderleri Yönet</span>
                                                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">Aylık Toplam: {detailedFixedCosts.reduce((s, i) => s + (parseFloat(i.value) || 0), 0).toLocaleString()} ₺</span>
                                                </span>
                                                <span className="text-sm font-extrabold text-slate-600">{(inputs.costFixed || 0).toFixed(2)} ₺ <span className="text-[10px] font-medium text-gray-400">/ Adet</span></span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Commission Input (New) */}
                                            <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">Komisyon Oranı (%)</label>
                                                    <span className="text-xs font-mono font-bold text-indigo-600">%{inputs.commissionRate}</span>
                                                </div>
                                                <div className="relative group mb-1">
                                                    <input type="number" id="sim-commission-rate" value={inputs.commissionRate} onChange={handleInput} className="block w-full rounded-lg border-gray-300 pl-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-bold text-gray-900" />
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">%</span></div>
                                                </div>
                                                <input type="range" id="sim-commission-rate" min="0" max="50" step="0.1" value={inputs.commissionRate} onChange={handleInput} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Advanced Inputs removed as requested (managed via Cost Drawers) */}

                </div>

                {/* --- RIGHT: RESULTS PANEL --- */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {simContext.type === 'channel' ? (
                        // CHANNEL P&L RESULTS
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Net Profit */}
                                <div className="bg-white rounded-xl border border-emerald-100 shadow-lg shadow-emerald-500/5 p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-5"><svg className="w-20 h-20 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg></div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Tahmini Toplam Net Kâr</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-3xl font-extrabold tracking-tight ${results.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            ₺{results.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Margin */}
                                <div className="bg-white rounded-xl border border-indigo-100 shadow-lg shadow-indigo-500/5 p-5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-5"><svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" /></svg></div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Ortalama Kâr Marjı</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-extrabold tracking-tight ${results.margin > 20 ? 'text-indigo-600' : results.margin > 10 ? 'text-blue-500' : 'text-orange-500'}`}>
                                            %{results.margin.toFixed(1)}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${marginBadgeClass}`}>
                                            {results.margin > 25 ? 'Mükemmel' : results.margin > 15 ? 'İyi' : results.margin > 0 ? 'Düşük' : 'Zarar'}
                                        </span>
                                    </div>
                                </div>

                                {/* Avg Commission */}
                                <div className="bg-white rounded-xl border border-orange-100 shadow-lg shadow-orange-500/5 p-5 relative overflow-hidden">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Ort. Kanal Komisyonu</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold tracking-tight text-orange-600">
                                            %{results.weightedCommissionRate ? results.weightedCommissionRate.toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Analysis Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                {/* Category Share Pie Chart */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                                    <h3 className="text-sm font-bold text-gray-900 mb-6">Kategori Bazlı Ciro Dağılımı</h3>
                                    <div className="flex-1 min-h-[250px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={inputs.categories || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="salesShare"
                                                >
                                                    {(inputs.categories || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][index % 5]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => `%${value}`} />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="text-center">
                                                <span className="block text-2xl font-bold text-gray-900">
                                                    {inputs.categories?.length || 0}
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Kategori</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cost Breakdown Waterfall/Bar */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                                    <h3 className="text-sm font-bold text-gray-900 mb-6">Toplam Maliyet Dağılımı</h3>
                                    <div className="flex-1 min-h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={[
                                                    { name: 'Ürün (SMM)', value: results.costs?.cogs || 0, fill: '#ef4444' },
                                                    { name: 'Komisyon', value: results.costs?.commission || 0, fill: '#f97316' },
                                                    { name: 'Pazarlama', value: results.costs?.marketing || 0, fill: '#3b82f6' },
                                                    { name: 'Lojistik', value: (results.costs?.shipping || 0) + (results.costs?.returns || 0), fill: '#a855f7' },
                                                    { name: 'Sabit', value: results.costs?.fixed || 0, fill: '#64748b' },
                                                    { name: 'Net Kâr', value: results.netProfit || 0, fill: '#10b981' },
                                                ]}
                                                layout="vertical"
                                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" tickFormatter={(val) => `₺${(val / 1000).toFixed(0)}k`} />
                                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                                                <RechartsTooltip
                                                    formatter={(value) => `₺${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                                    cursor={{ fill: 'transparent' }}
                                                />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                    {
                                                        [
                                                            { fill: '#ef4444' },
                                                            { fill: '#f97316' },
                                                            { fill: '#3b82f6' },
                                                            { fill: '#a855f7' },
                                                            { fill: '#64748b' },
                                                            { fill: '#10b981' },
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                        </>
                    ) : (
                        // EXISTING PRODUCT/CATEGORY RESULT PANELS
                        <>
                            {/* Top Stats Row */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 ${simContext.type !== 'category' ? 'lg:grid-cols-3' : ''} gap-6`}>
                                {/* Net Profit Card */}
                                <div className="bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-500/5 p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-32 h-32 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg></div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                                        {simContext.type === 'category' ? 'Tahmini Toplam Kâr (Ay)' : 'Tahmini Net Kâr (Birim)'}
                                    </h3>
                                    <div className="flex items-baseline gap-1 relative z-10">
                                        <span className={`text-5xl font-extrabold tracking-tight ${results.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {simContext.type === 'category'
                                                ? `₺${results.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                                : `₺${results.netProfit.toFixed(2)}`
                                            }
                                        </span>
                                        <span className="text-gray-400 font-medium text-sm">
                                            {simContext.type === 'category' ? '/ ay' : '/ adet'}
                                        </span>
                                    </div>

                                </div>

                                {/* Margin Card */}
                                <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-500/5 p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5"><svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" /></svg></div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                                        {simContext.type === 'category' ? 'Ortalama Kâr Marjı' : 'Kâr Marjı'}
                                    </h3>
                                    <div className="flex items-baseline gap-1 relative z-10">
                                        <span className={`text-5xl font-extrabold tracking-tight ${results.margin > 20 ? 'text-indigo-600' : results.margin > 10 ? 'text-blue-500' : 'text-orange-500'}`}>
                                            %{results.margin.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-lg border ${marginBadgeClass}`}>
                                            {results.margin > 25 ? 'Mükemmel' : results.margin > 15 ? 'İyi' : results.margin > 0 ? 'Düşük Kâr' : 'Zarar'}
                                        </span>
                                    </div>
                                </div>

                                {/* Monthly Profit Card (Product Mode Only) */}
                                {simContext.type !== 'category' && (
                                    <div className="bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-500/5 p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-32 h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3v18h18M7 16l4-4 4 4 4-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                                            Aylık Tahmini Toplam Kâr
                                        </h3>
                                        <div className="flex items-baseline gap-1 relative z-10">
                                            <span className={`text-5xl font-extrabold tracking-tight ${(results.netProfit * inputs.velocity * 30) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                ₺{((results.netProfit || 0) * (inputs.velocity || 0) * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                            <span className="text-gray-400 font-medium text-sm">
                                                / ay
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Secondary Stats OR Category Delta Cards */}
                            {simContext.type === 'category' && categorySimMetrics ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 p-3 opacity-10"><svg className="w-16 h-16 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg></div>
                                        <p className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-widest mb-1">Yeni Aylık Ciro</p>
                                        <div className="flex flex-col gap-1 relative z-10">
                                            <span className="text-3xl font-extrabold text-indigo-900 tracking-tight">₺{categorySimMetrics.newTotalRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${categorySimMetrics.deltaRev >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {categorySimMetrics.deltaRev >= 0 ? '+' : ''}₺{categorySimMetrics.deltaRev.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })} Fark
                                                </span>
                                                <span className="text-[10px] font-medium text-indigo-600/70">Eski: ₺{categorySimMetrics.oldTotalRev.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 p-3 opacity-10"><svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c...M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg></div>
                                        <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest mb-1">Yeni Aylık Kâr</p>
                                        <div className="flex flex-col gap-1 relative z-10">
                                            <span className="text-3xl font-extrabold text-emerald-900 tracking-tight">₺{categorySimMetrics.newTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${categorySimMetrics.deltaProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {categorySimMetrics.deltaProfit >= 0 ? '+' : ''}₺{categorySimMetrics.deltaProfit.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })} Fark
                                                </span>
                                                <span className="text-[10px] font-medium text-emerald-600/70">Eski: ₺{categorySimMetrics.oldTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 p-3 opacity-10"><svg className="w-16 h-16 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 12c0 1.93-1.57 3.5-3.5 3.5s-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5zm-3.5-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" /></svg></div>
                                        <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest mb-1">Kurtarılan Ürün</p>
                                        <div className="flex items-baseline gap-2 mt-1 relative z-10">
                                            <span className="text-4xl font-extrabold text-amber-900">{categorySimMetrics.rescuedCount}</span>
                                            <span className="text-sm font-bold text-amber-700">/ {categorySimMetrics.oldLosingCount}</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-amber-600/70 mt-2">Zarardaki {categorySimMetrics.oldLosingCount} ürünün kâra geçme oranı</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Buybox Fiyatı</p>
                                        <p className="text-xl font-bold text-gray-900 mt-1">₺{simContext.buyboxPrice?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Mevcut Fiyat</p>
                                        <p className="text-xl font-bold text-gray-900 mt-1">₺{simContext.currentPrice?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 col-span-2 lg:col-span-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Başabaş Satış Fiyatı</p>
                                        <p className="text-xl font-bold text-gray-900 mt-1">₺{results.breakEven.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            )}

                            {/* Category Leaders Chart */}
                            {simContext.type === 'category' && categorySimMetrics?.topContributors?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <span className="text-indigo-600">🏆</span> Kârlılığa En Çok Katkı Sağlayanlar (Top 10)
                                        </h3>
                                        <button
                                            onClick={() => setIsAllProductsModalOpen(true)}
                                            className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                            Tümünü Gör
                                        </button>
                                    </div>
                                    <div className="h-96 w-full mt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={categorySimMetrics.topContributors}
                                                layout="vertical"
                                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                                <XAxis type="number" domain={[0, 'auto']} tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`} textAnchor="end" tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                <YAxis dataKey="name" type="category" width={150} tickFormatter={(val) => val.length > 20 ? val.substring(0, 20) + '...' : val} tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                <RechartsTooltip
                                                    cursor={{ fill: '#F3F4F6' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-gray-900 text-white text-xs rounded shadow-lg p-3 border border-gray-800">
                                                                    <p className="font-bold mb-1 opacity-90">{data.name}</p>
                                                                    <div className="flex justify-between gap-4">
                                                                        <span>Aylık Kâr:</span>
                                                                        <span className="font-mono text-emerald-400">₺{data.totalNewProfitContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                                    </div>
                                                                    <div className="flex justify-between gap-4">
                                                                        <span>Hacim:</span>
                                                                        <span className="font-mono text-indigo-400">{data.monthlyVolume} Adet</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="totalNewProfitContribution" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20}>
                                                    {categorySimMetrics.topContributors.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4338CA' : index === 1 ? '#4F46E5' : '#818CF8'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown Chart */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                                        {simContext.type === 'category' ? 'Tahmini Aylık Maliyet Dağılımı' : 'Maliyet Dağılımı ve Kârlılık'}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                        {simContext.type === 'category' ? 'Kategori Toplamı' : '1 Birim Analizi'}
                                    </span>
                                </div>

                                {/* Visual Bar */}
                                <div className="h-16 w-full bg-gray-100 rounded-xl overflow-hidden flex text-xs font-bold text-white relative shadow-inner mb-8">
                                    <div style={{ width: `${wCogs}%` }} className="h-full bg-slate-400 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                                        {wCogs > 15 && <span className="drop-shadow-sm">Maliyet</span>}
                                        {wCogs > 15 && <span className="opacity-90 font-mono">
                                            ₺{simContext.type === 'category'
                                                ? (results.costs.cogs * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                                                : results.costs.cogs.toFixed(0)}
                                        </span>}
                                    </div>
                                    <div style={{ width: `${wFixed}%` }} className="h-full bg-slate-500 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                                        {wFixed > 15 && <span className="drop-shadow-sm">Sabit</span>}
                                        {wFixed > 15 && <span className="opacity-90 font-mono">
                                            ₺{simContext.type === 'category'
                                                ? (results.costs.fixed * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                                                : results.costs.fixed.toFixed(0)}
                                        </span>}
                                    </div>
                                    <div style={{ width: `${wVar}%` }} className="h-full bg-orange-500 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                                        {wVar > 15 && <span className="drop-shadow-sm">Değişken</span>}
                                        {wVar > 15 && <span className="opacity-90 font-mono">
                                            ₺{simContext.type === 'category'
                                                ? (results.costs.variable * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                                                : results.costs.variable.toFixed(0)}
                                        </span>}
                                    </div>
                                    <div style={{ width: `${wProfit}%` }} className="h-full bg-emerald-500 flex flex-col items-center justify-center transition-all duration-500 relative group text-center px-1">
                                        {wProfit > 15 && <span className="drop-shadow-sm">Kâr</span>}
                                        {wProfit > 15 && <span className="opacity-90 font-mono">
                                            ₺{simContext.type === 'category'
                                                ? results.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0, notation: "compact" })
                                                : results.netProfit.toFixed(1)}
                                        </span>}
                                    </div>
                                </div>

                                {/* Rich Legend / Data Grid - Scalable Solution */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* 1. COGS */}
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0"></div>
                                            <span className="text-xs font-bold text-gray-600 truncate">
                                                {simContext.type === 'category' ? 'Toplam Ürün Maliyeti' : 'Ürün Maliyeti'}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold text-gray-900">
                                                ₺{simContext.type === 'category'
                                                    ? (results.costs.cogs * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                    : results.costs.cogs.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium">({wCogs.toFixed(1)}%)</span>
                                        </div>
                                    </div>

                                    {/* 2. Fixed */}
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-slate-500 shrink-0"></div>
                                            <span className="text-xs font-bold text-gray-600 truncate">
                                                {simContext.type === 'category' ? 'Toplam Sabit Gider' : 'Sabit Gider'}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold text-gray-900">
                                                ₺{simContext.type === 'category'
                                                    ? (results.costs.fixed * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                    : results.costs.fixed.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium">({wFixed.toFixed(1)}%)</span>
                                        </div>
                                    </div>

                                    {/* 3. Variable */}
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></div>
                                            <span className="text-xs font-bold text-gray-600 truncate">
                                                {simContext.type === 'category' ? 'Toplam Değişken Gider' : 'Değişken Gider'}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold text-gray-900">
                                                ₺{simContext.type === 'category'
                                                    ? (results.costs.variable * inputs.velocity * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                    : results.costs.variable.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium">({wVar.toFixed(1)}%)</span>
                                        </div>
                                    </div>

                                    {/* 4. Profit */}
                                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                                            <span className="text-xs font-bold text-emerald-800 truncate">
                                                {simContext.type === 'category' ? 'Toplam Net Kâr' : 'Net Kâr'}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold text-emerald-700">
                                                ₺{simContext.type === 'category'
                                                    ? results.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                    : results.netProfit.toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-emerald-600 font-medium">({wProfit.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price-Volume-Profit Curve Chart */}
                            {simContext.type === 'product' && (
                                <PriceProfitCurve
                                    originalInputs={originalInputs}
                                    currentInputs={inputs}
                                    totalMonthlyFixedCost={detailedFixedCosts.reduce((s, i) => s + (parseFloat(i.value) || 0), 0)}
                                    originalTotalVariableCost={detailedVariableCosts.reduce((s, i) => s + (parseFloat(i.value) || 0), 0)}
                                />
                            )}

                            {/* AI Insight (Rendered for both Product and Category Mode) */}
                            <AIInsightCard
                                currentPrice={simContext.type === 'category' ? (inputs.targetPrice || 0) : (results.calculatedPrice || 0)}
                                buyboxPrice={simContext.type === 'category' ? 0 : (simContext.buyboxPrice || 0)}
                                margin={simContext.type === 'category' ? (categorySimMetrics?.newTotalRev ? (categorySimMetrics.newTotalProfit / categorySimMetrics.newTotalRev) * 100 : 0) : (results.margin || 0)}
                                openChatWithContext={openChatWithContext}
                                productName={simContext?.title || 'Kategori / Ürün'}
                                isSimulated={simContext.type === 'category' ? inputs.targetPrice !== simContext.currentPrice : (originalInputs && JSON.stringify(inputs) !== JSON.stringify(originalInputs))}
                                onApplyScenario={handleApplyScenario}
                                isCategoryMode={simContext.type === 'category'}
                            />

                        </>
                    )}
                </div>
            </div>

            {/* COST DRAWER / MODAL */}
            {
                activeDrawer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 sm:p-0">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {activeDrawer === 'fixed' ? 'Aylık Sabit Giderler' : 'Değişken Giderler (Adet Başı)'}
                                </h2>
                                <button onClick={() => setActiveDrawer(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                                {(activeDrawer === 'fixed' ? detailedFixedCosts : detailedVariableCosts).map((item, index) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const newName = e.target.value;
                                                    if (activeDrawer === 'fixed') {
                                                        setDetailedFixedCosts(prev => prev.map((f, i) => i === index ? { ...f, name: newName } : f));
                                                    } else {
                                                        setDetailedVariableCosts(prev => prev.map((v, i) => i === index ? { ...v, name: newName } : v));
                                                    }
                                                }}
                                                className="block w-full rounded-lg border-gray-300 bg-gray-50 text-sm font-medium text-gray-900 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 py-2.5"
                                                placeholder="Gider Adı"
                                            />
                                        </div>
                                        <div className="w-32 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm font-bold">₺</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={item.value || ''}
                                                onChange={(e) => {
                                                    const newVal = parseFloat(e.target.value) || 0;
                                                    if (activeDrawer === 'fixed') {
                                                        setDetailedFixedCosts(prev => prev.map((f, i) => i === index ? { ...f, value: newVal } : f));
                                                    } else {
                                                        setDetailedVariableCosts(prev => prev.map((v, i) => i === index ? { ...v, value: newVal } : v));
                                                    }
                                                }}
                                                className="block w-full rounded-lg border-gray-300 pl-7 text-sm font-bold text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 py-2.5"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (activeDrawer === 'fixed') {
                                                    setDetailedFixedCosts(prev => prev.filter((_, i) => i !== index));
                                                } else {
                                                    setDetailedVariableCosts(prev => prev.filter((_, i) => i !== index));
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-600 p-2 shrink-0 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => {
                                        const newItem = { id: Date.now().toString(), name: '', value: 0 };
                                        if (activeDrawer === 'fixed') {
                                            setDetailedFixedCosts(prev => [...prev, newItem]);
                                        } else {
                                            setDetailedVariableCosts(prev => [...prev, newItem]);
                                        }
                                    }}
                                    className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Yeni Gider Kalemi Ekle
                                </button>
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-white">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                                            {activeDrawer === 'fixed' ? 'Aylık Toplam' : 'Birim Başı Toplam'}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                                {(activeDrawer === 'fixed' ? detailedFixedCosts : detailedVariableCosts).reduce((s, i) => s + (parseFloat(i.value) || 0), 0).toLocaleString()} <span className="text-base text-gray-400 font-medium">₺</span>
                                            </span>
                                        </div>
                                    </div>
                                    {activeDrawer === 'fixed' && (
                                        <div className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50 shrink-0">
                                            Adet Başı: {(inputs.costFixed || 0).toFixed(2)} ₺
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => setActiveDrawer(null)}
                                        className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm"
                                    >
                                        Kaydet & Simüle Et
                                    </button>

                                    <div className="flex items-center justify-center text-[10px] text-gray-400 font-medium text-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                        <span className="mr-1.5 opacity-70">💡</span> Bu değişiklikler sadece bu simülasyon özelinde geçerlidir, genel ürün ayarlarınızı kalıcı olarak etkilemez.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ALL PRODUCTS RANKING MODAL */}
            {isAllProductsModalOpen && categorySimMetrics && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-fade-in p-4 sm:p-6">
                    <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 shrink-0">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                                    <span className="text-indigo-600">🏆</span> Ürün Kârlılık Sırası (Simülasyon)
                                </h2>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    Simülasyon sonucunda kategorideki tüm ürünlerin kârlılığa sağlayacağı katkı sıralaması.
                                </p>
                            </div>
                            <button onClick={() => setIsAllProductsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 transition-colors p-2 rounded-lg shadow-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto w-full flex-1 p-0">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">Sıra / Ürün</th>
                                        <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right border-b border-gray-100 bg-white">Eski Aylık Kâr</th>
                                        <th className="py-4 px-6 text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest text-right border-b border-gray-100 bg-white">Yeni Aylık Kâr</th>
                                        <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right border-b border-gray-100 bg-white">Fark</th>
                                        <th className="py-4 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center border-b border-gray-100 bg-white">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/60 bg-white">
                                    {[...categorySimMetrics.affectedProducts]
                                        .sort((a, b) => b.totalNewProfitContribution - a.totalNewProfitContribution)
                                        .map((prod, idx) => {
                                            const oldTotalProfit = prod.oldUnitProfit * prod.monthlyVolume;
                                            const newTotalProfit = prod.totalNewProfitContribution;
                                            const diff = newTotalProfit - oldTotalProfit;
                                            return (
                                                <tr key={prod.id} className={`hover:bg-gray-50/50 transition-colors group ${prod.isExcluded ? 'bg-gray-50 opacity-60' : ''}`}>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-xs font-bold text-gray-300 w-5 text-right font-mono">{idx + 1}.</div>
                                                            <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg shrink-0 object-cover border border-gray-200 shadow-sm group-hover:shadow transition-shadow" />
                                                            <div>
                                                                <p className={`text-sm font-bold text-gray-900 ${prod.isExcluded ? 'line-through' : ''}`}>{prod.name}</p>
                                                                <p className="text-[11px] text-gray-500 font-medium">Satış Hızı: {prod.monthlyVolume} Adet / Ay</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className="text-sm font-semibold text-gray-400 font-mono">
                                                            ₺{oldTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className={`text-sm font-extrabold font-mono ${newTotalProfit >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                                                            ₺{newTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <span className={`inline-flex items-center justify-end min-w-[5rem] gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${diff > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : diff < 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                                                            {diff > 0 ? '+' : ''}₺{diff.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded ${prod.status === 'excluded' ? 'bg-gray-200 text-gray-600' :
                                                            prod.status === 'rescued' ? 'bg-amber-100 text-amber-700' :
                                                                prod.status === 'profitable' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {prod.status === 'excluded' ? 'İstisna' : prod.status === 'rescued' ? 'Kâra Geçti' : prod.status === 'profitable' ? 'Kârlı' : 'Zararda'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

