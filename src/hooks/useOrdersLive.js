import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Globe } from 'lucide-react';
import productCosts from '../data/productCosts.json';
import productImages from '../data/productImages.json';
import realOrdersFallback from '../data/realOrders.json';
import { apiCredentials } from '../config/apiCredentials';

const STATUS_MAP_IKAS = {
    'PAID': { label: 'Ödendi', color: 'bg-green-50 text-green-700 ring-green-600/20' },
    'PENDING': { label: 'Bekliyor', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    'CANCELLED': { label: 'İptal', color: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
    'REFUNDED': { label: 'İade', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    'FULFILLED': { label: 'Tamamlandı', color: 'bg-green-50 text-green-700 ring-green-600/20' }
};

const CHANNEL_COLORS = {
    Trendyol: 'text-orange-500 bg-orange-50',
    Hepsiburada: 'text-amber-500 bg-amber-50',
    Amazon: 'text-yellow-600 bg-yellow-50',
    ikas: 'text-indigo-600 bg-indigo-50'
};

export const getCategoryFromProductName = (productName) => {
    if (!productName) return 'Diğer';
    const name = productName.toLowerCase();

    // YENİ: Hello Kitty (En spesifik olan her zaman üstte olmalı)
    if (name.includes('hello kitty')) {
        return 'Hello Kitty';
    }

    // YENİ: Setler Serisi
    if (name.includes('set') && !name.includes('maske') && !name.includes('krem')) {
        return 'Setler';
    }

    // YENİ: Aksesuarlar
    if (name.includes('aksesuar') || name.includes('fırça') || name.includes('çanta') || name.includes('band') || name.includes('ayna') || name.includes('pamuk') || name.includes('ped') || name.includes('cımbız') || name.includes('makyaj') || name.includes('sünger') || name.includes('kablo')) {
        return 'Aksesuar';
    }

    // Kozmetik Ürünler
    if (name.includes('jel') || name.includes('nemlendirici') || name.includes('krem') || name.includes('serum') || name.includes('maske') || name.includes('koruma') || name.includes('losyon') || name.includes('peeling') || name.includes('tonik') || name.includes('saf su') || name.includes('booster') || name.includes('dolgunlaştırıcı')) {
        return 'Kozmetik Ürünler';
    }

    // Cihazlar Sınıfı
    if (name.includes('cihaz') || name.includes('roller') || name.includes('göz çevresi') || name.includes('energizer') || name.includes('düzeltici') || name.includes('sıkılaştır') || name.includes('siyah nokta') || name.includes('lifter') || name.includes('scrubber') || name.includes('renewer') || name.includes('mikro akım') || name.includes('trimmer') || name.includes('shaver') || name.includes('dermaroller') || name.includes('masaj') || name.includes('temizleyici')) {
        return 'Cihazlar';
    }

    return 'Diğer';
};

export const getFallbackProductImage = (productName) => {
    if (!productName) return '/assets/products/fallback_0.jpg';

    // Doğrudan tam isim eşleşmesi
    if (productImages[productName]) {
        return productImages[productName];
    }

    const lowerName = productName.toLowerCase();
    const keys = Object.keys(productImages);

    // Kısmi eşleşme: Örneğin "Mavi Işık Korumalı Serum" arıyoruz. Keys içinde "Mavi Işık Korumalı Serum | Blue Light Protection Serum" varsa gelsin.
    // Aynı şekilde eğer "Mavi Işık Korumalı Serum | Blue Light Protection Serum GK123..." gelirse, json içindeki key'i kapsar, o zaman da gelsin.
    const match = keys.find(key => {
        const lowerKey = key.toLowerCase();
        return lowerKey.includes(lowerName) || lowerName.includes(lowerKey);
    });

    if (match) {
        return productImages[match];
    }

    // Anahtar kelime tabanlı son çare eşleşmeleri:
    if (lowerName.includes('jel') || lowerName.includes('nemlendirici') || lowerName.includes('serum')) return productImages["Nemlendirici Mikro Akım Jel | Hydrating MicroCurrent Gel"];
    if (lowerName.includes('sıkılaştır') || lowerName.includes('lifter')) return productImages["Mikro Akım, Yaşlanma Karşıtı Titreşimli Yüz ve Vücut Sıkılaştırma Cihazı | MicroCurrent Face Lifter"];
    if (lowerName.includes('siyah nokta') || lowerName.includes('scrubber') || lowerName.includes('temizleyici')) return productImages["Siyah Nokta Temizleme Bakım Cihazı (Titreşimli, Mikro Akım) | MicroCurrent Skin Scrubber & Blackhead Remover"];
    if (lowerName.includes('anti-aging') || lowerName.includes('led terapili') || lowerName.includes('krem') || lowerName.includes('maske') || lowerName.includes('mask')) return productImages["Anti-Aging Cilt Bakım Cihazı ( Led Terapili) | Anti-Aging Skin Renewer"];
    if (lowerName.includes('roller') || lowerName.includes('masaj') || lowerName.includes('düzeltici') || lowerName.includes('hassas') || lowerName.includes('ustura')) return productImages["Roller Yüz Şekillendirici  Masaj Cihazı (Titreşimli)| Sonic Facial Roller"];
    if (lowerName.includes('göz çevresi')) return productImages[" Akıllı Göz Çevresi Masaj Cihazı (Soğutma ve Isıtma Sağlayan Titreşimli) | Warm & Cool Eye Energizer"];

    const hash = productName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const values = Object.values(productImages);
    return values[Math.abs(hash) % Math.max(1, values.length)] || '/assets/products/fallback_0.jpg';
};

export const generateFallbackData = () => {
    let finalData = [];
    const now = new Date();
    const getRandomRecentDate = (index) => {
        const d = new Date(now);
        d.setHours(d.getHours() - ((index * 13) % (30 * 24))); // securely spread over the last 30 days
        return d;
    };

    const fbIkas = (realOrdersFallback.ikas || []).map((order, i) => {
        const item = order.orderLineItems[0];
        const variantObj = item?.variant || {};
        const revenue = order.totalFinalPrice || (item ? item.finalPrice : 0);

        // For mock Ikas fallback, we simulate a 10% discount for UI testing
        const discount = revenue * 0.10;
        const grossRevenue = revenue + discount;

        const sku = variantObj.sku || `SKU-${variantObj.name ? variantObj.name.substring(0, 6) : 'DEFAULT'}`;
        const costInfo = productCosts[sku] || productCosts["DEFAULT"];
        const cogs = costInfo.cogs;
        const shippingCost = costInfo.shipping;
        const commission = Math.round(revenue * 0.025);
        const kdvRate = 0.20;
        const outputVat = revenue - (revenue / (1 + kdvRate));
        const cogsVat = cogs - (cogs / (1 + kdvRate));
        const shippingVat = shippingCost - (shippingCost / (1 + kdvRate));
        const commissionVat = commission - (commission / (1 + kdvRate));
        const tax = Math.max(0, outputVat - cogsVat - shippingVat - commissionVat);
        const totalCosts = cogs + shippingCost + commission + tax;
        const statusKey = order.orderPackageStatus === 'FULFILLED' ? 'FULFILLED' : order.orderPaymentStatus;

        return {
            _uid: `ikas-${order.id}`,
            id: order.orderNumber,
            productId: order.id,
            sku: sku,
            category: getCategoryFromProductName(variantObj.name),
            channel: 'Web Sitesi',
            channelType: 'web',
            dateRaw: getRandomRecentDate(i),
            channelIcon: Globe,
            channelColor: CHANNEL_COLORS.ikas,
            productName: variantObj.name || 'Bilinmeyen Ürün',
            productImage: getFallbackProductImage(variantObj.name),
            revenue,
            cost: totalCosts,
            cogs,
            shipping: shippingCost,
            commission,
            tax,
            costBreakdown: `Cogs: ${cogs}₺ | Kargo: ${shippingCost}₺ | Kom. (%2.5): ${commission}₺ | KDV: ${Math.round(tax)}₺`,
            profit: revenue - totalCosts,
            customerObj: { name: `${order.customer?.firstName || ''} ${order.customer?.lastName?.charAt(0) || ''}.`, city: 'Online' },
            statusObj: STATUS_MAP_IKAS[statusKey] || { label: statusKey || 'İşleniyor', color: 'bg-gray-50 text-gray-700 ring-gray-600/20' }
        };
    });

    const fbTy = (realOrdersFallback.trendyol || []).map((order, i) => {
        const revenue = order.totalPrice;
        // Simulate a 12% discount for UI testing if none provided by fallback JSON
        const discount = order.totalDiscount || (revenue * 0.12);
        const grossRevenue = order.grossAmount || (revenue + discount);
        const sku = order.lines?.[0]?.merchantSku || `SKU-${order.lines?.[0]?.productName ? order.lines[0].productName.substring(0, 6) : 'DEFAULT'}`;
        const costInfo = productCosts[sku] || productCosts["DEFAULT"];
        const cogs = costInfo.cogs;
        const shippingCost = costInfo.shipping;
        const commission = Math.round(revenue * 0.15);
        const kdvRate = 0.20;
        const outputVat = revenue - (revenue / (1 + kdvRate));
        const cogsVat = cogs - (cogs / (1 + kdvRate));
        const shippingVat = shippingCost - (shippingCost / (1 + kdvRate));
        const commissionVat = commission - (commission / (1 + kdvRate));
        const tax = Math.max(0, outputVat - cogsVat - shippingVat - commissionVat);
        const totalCosts = cogs + shippingCost + commission + tax;
        let statusInfo = { label: order.status || 'İşleniyor', color: 'bg-gray-50 text-gray-700 ring-gray-600/20' };
        if (order.status === 'Delivered') statusInfo = { label: 'Teslim Edildi', color: 'bg-green-50 text-green-700 ring-green-600/20' };

        return {
            _uid: `ty-${order.id}`,
            id: order.orderNumber,
            productId: `ty-${order.id}`,
            sku: sku,
            category: getCategoryFromProductName(order.lines?.[0]?.productName || ''),
            channel: 'Trendyol',
            channelType: 'marketplace',
            dateRaw: getRandomRecentDate(i + 50),
            channelIcon: ShoppingBag,
            channelColor: CHANNEL_COLORS.Trendyol,
            productName: order.lines?.[0]?.productName || 'Satış',
            productImage: getFallbackProductImage(order.lines?.[0]?.productName || ''),
            revenue,
            grossRevenue,
            discount,
            cost: totalCosts,
            cogs,
            shipping: shippingCost,
            commission,
            tax,
            costBreakdown: `Cogs: ${cogs}₺ | Kargo: ${shippingCost}₺ | Kom. (%15): ${commission}₺ | KDV: ${Math.round(tax)}₺`,
            profit: revenue - totalCosts,
            customerObj: { name: `${order.customerFirstName || ''} ${order.customerLastName?.charAt(0) || ''}.`, city: order.shipmentAddress?.city || 'Bilinmiyor' },
            statusObj: statusInfo
        };
    });

    finalData = [...fbIkas, ...fbTy];
    return finalData.sort((a, b) => b.dateRaw - a.dateRaw);
};

export function useOrders(products = []) {
    const [rawOrders, setRawOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchAll() {
            setLoading(true);
            setError(null);
            let globalErrors = [];
            try {
                let dbIkasClientId = apiCredentials.ikas.clientId;
                let dbIkasClientSecret = apiCredentials.ikas.clientSecret;

                let dbTySupplierId = apiCredentials.trendyol.supplierId;
                let dbTyApiKey = apiCredentials.trendyol.apiKey;
                let dbTyApiSecret = apiCredentials.trendyol.apiSecret;

                // Fetch Ikas
                const authParams = new URLSearchParams();
                authParams.append('grant_type', 'client_credentials');
                authParams.append('client_id', dbIkasClientId);
                authParams.append('client_secret', dbIkasClientSecret);

                const tokenRes = await fetch('/ikas-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: authParams.toString()
                });

                let tokenData = {};
                try {
                    if (tokenRes.ok) tokenData = await tokenRes.json();
                } catch (e) {
                    console.error('IKAS_AUTH_FAIL', e);
                }

                let ikasData = [];
                let trendyolData = [];
                try {
                    if (tokenRes.ok && tokenData.access_token) {
                        const reqBody = { query: `{ listOrder(pagination: { limit: 100 }, sort: "-orderedAt") { data { id orderNumber orderedAt orderPaymentStatus orderPackageStatus totalPrice totalFinalPrice customer { firstName lastName email } orderLineItems { quantity finalPrice variant { name mainImageId } } } } }` };
                        const res = await fetch('/ikas-api/graphql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenData.access_token}` },
                            body: JSON.stringify(reqBody)
                        });
                        const { data, errors } = await res.json();
                        if (!errors && data?.listOrder?.data) {
                            ikasData = data.listOrder.data.map(order => {
                                const item = order.orderLineItems?.[0];
                                const variantObj = item?.variant || {};
                                const revenue = order.totalFinalPrice || (item ? item.finalPrice : 0);

                                const grossRevenue = order.totalPrice || revenue;
                                const discount = Math.max(0, grossRevenue - revenue);
                                const sku = variantObj.sku || `SKU-${variantObj.name ? variantObj.name.substring(0, 6) : 'DEFAULT'}`;
                                const costInfo = productCosts[sku] || productCosts["DEFAULT"];
                                const cogs = costInfo.cogs;
                                const shippingCost = costInfo.shipping;

                                const commission = Math.round(revenue * 0.025);


                                // 3. Corporate VAT (KDV) Flow Engine
                                const kdvRate = 0.20;
                                const outputVat = revenue - (revenue / (1 + kdvRate));
                                const cogsVat = cogs - (cogs / (1 + kdvRate));
                                const shippingVat = shippingCost - (shippingCost / (1 + kdvRate));
                                const commissionVat = commission - (commission / (1 + kdvRate));
                                // Net KDV Payable to the State (If inputs exceed outputs, payable is 0)
                                const tax = Math.max(0, outputVat - cogsVat - shippingVat - commissionVat);

                                const totalCosts = cogs + shippingCost + commission + tax;

                                const statusKey = order.orderPackageStatus === 'FULFILLED' ? 'FULFILLED' : order.orderPaymentStatus;

                                // Check specific mainImageId directly against Ikas CDN if available
                                const imageId = variantObj.mainImageId || variantObj.images?.[0]?.imageId;
                                const productImage = imageId ? `https://cdn.myikas.com/images/7692629f-ebc8-45a8-bf85-a2c79fd5af60/${imageId}/image_180.webp` : getFallbackProductImage(variantObj.name || '');

                                return {
                                    _uid: order.id,
                                    id: order.orderNumber,
                                    productId: 'ikas-' + order.id,
                                    sku: sku,
                                    quantity: item?.quantity || 1,
                                    category: getCategoryFromProductName(variantObj.name || ''),
                                    channel: 'Web Sitesi (ikas)',
                                    channelType: 'web',
                                    // Keep actual timestamps intact! No random math!
                                    dateRaw: new Date(order.orderedAt),
                                    channelIcon: Globe,
                                    channelColor: CHANNEL_COLORS.ikas,
                                    productName: variantObj.name || 'Ürün Bulunamadı',
                                    productImage: productImage,
                                    revenue,
                                    grossRevenue,
                                    discount,
                                    cost: totalCosts, // the total hard cost of fulfilling this unit
                                    cogs,
                                    shipping: shippingCost,
                                    commission,
                                    tax,
                                    costBreakdown: `Cogs: ${cogs}₺ | Kargo: ${shippingCost}₺ | Kom. (%2.5): ${commission}₺ | KDV: ${Math.round(tax)}₺`,
                                    profit: revenue - totalCosts,
                                    customerObj: { name: `${order.customer?.firstName || ''} ${order.customer?.lastName?.charAt(0) || ''}.`, city: 'Online' },
                                    statusObj: STATUS_MAP_IKAS[statusKey] || { label: statusKey || 'İşleniyor', color: 'bg-gray-50 text-gray-700 ring-gray-600/20' }
                                };
                            });
                        }
                    }
                } catch (e) {
                    console.error("Ikas API error:", e);
                    globalErrors.push('Ikas: ' + e.message);
                }
                try {
                    const supplierId = dbTySupplierId;
                    const authStr = btoa(`${dbTyApiKey}:${dbTyApiSecret}`);

                    // Trendyol API STRICTLY restricts date ranges to a maximum of 15 days per request.
                    // To fetch a full 30-day dashboard, we must dispatch two concurrent 15-day chunk requests.
                    const nowTs = new Date().getTime();
                    const day15Ts = nowTs - (15 * 24 * 60 * 60 * 1000);
                    const day30Ts = day15Ts - (15 * 24 * 60 * 60 * 1000);
                    const day45Ts = day30Ts - (15 * 24 * 60 * 60 * 1000);

                    const fetchChunk = async (start, end) => {
                        const url = `/trendyol-api/sapigw/suppliers/${supplierId}/orders?size=200&startDate=${start}&endDate=${end}&orderByField=CreatedDate&orderByDirection=DESC`;
                        const res = await fetch(url, { headers: { 'Authorization': `Basic ${authStr}` } });
                        const json = await res.json();
                        if (json && json.errors) {
                            console.error('Trendyol Live API rejected the fetchChunk request:', json);
                            globalErrors.push('Ty_Err: ' + JSON.stringify(json.errors));
                            return [];
                        }
                        if (json && !json.content) {
                            globalErrors.push('Ty_Unexpected_JSON: ' + JSON.stringify(json));
                            return [];
                        }
                        return (json && json.content) ? json.content : [];
                    };

                    const [chunk1, chunk2, chunk3] = await Promise.all([
                        fetchChunk(day15Ts, nowTs),
                        fetchChunk(day30Ts, day15Ts),
                        fetchChunk(day45Ts, day30Ts)
                    ]);

                    const allTrendyolOrders = [...chunk1, ...chunk2, ...chunk3];

                    if (allTrendyolOrders.length === 0) {
                        globalErrors.push("Ty_Empty_Array: AuthStrLen=" + authStr.length + " | Supplier=" + supplierId);
                    }

                    if (allTrendyolOrders.length > 0) {
                        trendyolData = allTrendyolOrders.map(order => {
                            // True Net Customer Revenue in Ty is totalPrice + totalTyDiscount.
                            const revenue = order.totalPrice;
                            // Gross amount before discounts
                            const grossRevenue = order.grossAmount || revenue;
                            const discount = order.totalDiscount || 0;

                            let totalQuantity = 0;
                            let mappedLines = [];
                            if (order.lines && Array.isArray(order.lines)) {
                                mappedLines = order.lines.map(l => {
                                    totalQuantity += l.quantity || 1;
                                    return {
                                        name: l.productName || 'Bilinmeyen Ürün',
                                        sku: l.merchantSku || l.sku,
                                        revenue: l.price || 0,
                                    };
                                });
                            }

                            const primarySku = mappedLines[0]?.sku || 'DEFAULT';
                            const costInfo = productCosts[primarySku] || productCosts["DEFAULT"];

                            // Ty KDV & Commission
                            const commissionAmount = order.lines && order.lines[0] && order.lines[0].commissionAmount
                                ? order.lines[0].commissionAmount
                                : (revenue * 0.15); // Fallback

                            const cogs = costInfo.cogs * Math.max(1, totalQuantity);
                            const shippingCost = costInfo.shipping * Math.max(1, totalQuantity);

                            const reqTyKDVRate = 0.20;
                            const outputVat = revenue - (revenue / (1 + reqTyKDVRate));
                            const cogsVat = cogs - (cogs / (1 + 0.20));
                            const shippingVat = shippingCost - (shippingCost / (1 + 0.20));
                            const commissionVat = commissionAmount - (commissionAmount / (1 + 0.20));
                            const tax = Math.max(0, outputVat - cogsVat - shippingVat - commissionVat);

                            const totalCosts = cogs + shippingCost + commissionAmount + tax;

                            let statusInfo = { label: order.status || 'İşleniyor', color: 'bg-gray-50 text-gray-700 ring-gray-600/20' };
                            if (order.status === 'Delivered') statusInfo = { label: 'Teslim Edildi', color: 'bg-green-50 text-green-700 ring-green-600/20' };

                            return {
                                _uid: `ty-${order.id}`,
                                id: order.orderNumber,
                                productId: `ty-${order.id}`,
                                sku: primarySku,
                                quantity: order.lines?.reduce((sum, l) => sum + (l.quantity || 1), 0) || 1,
                                category: getCategoryFromProductName(order.lines?.[0]?.productName || ''),
                                channel: 'Trendyol',
                                channelType: 'marketplace',
                                // Keep actual timestamps from API
                                dateRaw: new Date(order.orderDate),
                                channelIcon: ShoppingBag,
                                channelColor: CHANNEL_COLORS.Trendyol,
                                productName: order.lines?.[0]?.productName || 'Satış',
                                productImage: getFallbackProductImage(order.lines?.[0]?.productName || ''),
                                revenue,
                                grossRevenue,
                                discount,
                                cost: totalCosts,
                                cogs,
                                shipping: shippingCost,
                                commission: commissionAmount,
                                tax,
                                costBreakdown: `Cogs: ${cogs}₺ | Kargo: ${shippingCost}₺ | Kom. (%15): ${commissionAmount}₺ | KDV: ${Math.round(tax)}₺`,
                                profit: revenue - totalCosts,
                                customerObj: { name: `${order.customerFirstName || ''} ${order.customerLastName?.charAt(0) || ''}.`, city: order.shipmentAddress?.city || 'Bilinmiyor' },
                                statusObj: statusInfo
                            };
                        });

                        // NOTE: We REMOVED the random date spreading logic.
                        // Live API timestamps are now strictly matched.
                    }
                } catch (e) {
                    console.error("Trendyol API Error", e);
                    globalErrors.push('Ty: ' + e.message);
                } // Silently handled without breaking Ikas

                if (isMounted) {
                    // Mute fallbacks completely as per User request ("sadece gerçek veri görmek istiyorum")
                    if (ikasData.length === 0) {
                        console.warn('Ikas API returned 0 orders or failed.');
                        globalErrors.push('Ikas_Empty_Array');
                    }
                    if (trendyolData.length === 0) {
                        console.warn('Trendyol API returned 0 orders or failed.');
                    }

                    const liveData = [...ikasData, ...trendyolData].sort((a, b) => b.dateRaw - a.dateRaw);
                    setRawOrders(liveData);
                    setError(globalErrors.length > 0 ? globalErrors.join(' | ') : null);
                }
            } catch (err) {
                console.error("Live fetch completely failed:", err);
                // Also muted fallback here
                setRawOrders([]);
                setError(`Canlı satışlar alınamadı (Hata: ${err.message})`);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();

        return () => { isMounted = false; };
    }, []); // Only fetch once or when explicitly restarted

    const orders = useMemo(() => {
        if (!rawOrders || rawOrders.length === 0) return [];
        return rawOrders;
    }, [rawOrders]);

    return { orders, loading, error };
}
