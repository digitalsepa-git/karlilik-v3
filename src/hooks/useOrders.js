import { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Globe } from 'lucide-react';
import productCosts from '../data/productCosts.json';
import productImages from '../data/productImages.json';
import realOrdersFallback from '../data/realOrders.json';

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
    const fbIkas = (realOrdersFallback.ikas || []).map(order => {
        const item = order.orderLineItems[0];
        const variantObj = item?.variant || {};
        const revenue = order.totalFinalPrice || (item ? item.finalPrice : 0);
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
            dateRaw: new Date(order.orderedAt),
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

    const fbTy = (realOrdersFallback.trendyol || []).map(order => {
        const revenue = order.totalPrice;
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
            dateRaw: new Date(order.orderDate),
            channelIcon: ShoppingBag,
            channelColor: CHANNEL_COLORS.Trendyol,
            productName: order.lines?.[0]?.productName || 'Satış',
            productImage: getFallbackProductImage(order.lines?.[0]?.productName || ''),
            revenue,
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
            try {
                // Fetch dynamic config from backend
                let dbIkasClientId = import.meta.env.VITE_IKAS_CLIENT_ID || '204cf972-0bba-4374-aad9-b94aee79a8c8';
                let dbIkasClientSecret = import.meta.env.VITE_IKAS_CLIENT_SECRET || '';

                let dbTySupplierId = import.meta.env.VITE_TRENDYOL_SUPPLIER_ID || '931428';
                let dbTyApiKey = import.meta.env.VITE_TRENDYOL_API_KEY || '';
                let dbTyApiSecret = import.meta.env.VITE_TRENDYOL_API_SECRET || '';

                try {
                    const dbRes = await fetch('/api/integrations');
                    if (dbRes.ok) {
                        const dbData = await dbRes.json();
                        if (dbData.ikas?.clientId) dbIkasClientId = dbData.ikas.clientId;
                        if (dbData.ikas?.clientSecret) dbIkasClientSecret = dbData.ikas.clientSecret;

                        if (dbData.ty?.apiKey) dbTyApiKey = dbData.ty.apiKey;
                        if (dbData.ty?.apiSecret) dbTyApiSecret = dbData.ty.apiSecret;
                    }
                } catch (e) {
                    // silently fallback
                }

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
                    // This throws SyntaxError if Vercel returned HTML 404!
                    tokenData = await tokenRes.json();
                } catch (e) {
                    throw new Error('IKAS_AUTH_FAIL'); // Throw immediately to jump to outer catch block for fallback data!
                }

                let ikasData = [];
                if (tokenRes.ok && tokenData.access_token) {
                    const reqBody = { query: `{ listOrder(pagination: { limit: 100 }, sort: "-orderedAt") { data { id orderNumber orderedAt orderPaymentStatus orderPackageStatus totalFinalPrice customer { firstName lastName email } orderLineItems { quantity finalPrice variant { name mainImageId } } } } }` };
                    const res = await fetch('/ikas-api/graphql', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenData.access_token}` },
                        body: JSON.stringify(reqBody)
                    });
                    const { data, errors } = await res.json();
                    if (!errors && data?.listOrder?.data) {
                        ikasData = data.listOrder.data.map(order => {
                            const item = order.orderLineItems[0];
                            const variantObj = item?.variant || {};
                            const revenue = order.totalFinalPrice || (item ? item.finalPrice : 0);

                            // 1. Costs from JSON Dictionary based on SKU
                            const sku = variantObj.sku || `SKU-${variantObj.name ? variantObj.name.substring(0, 6) : 'DEFAULT'}`;
                            const costInfo = productCosts[sku] || productCosts["DEFAULT"];
                            const cogs = costInfo.cogs;
                            const shippingCost = costInfo.shipping;

                            // 2. Ikas specific commission (e.g. 2.5% Iyzico)
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

                // Fetch Trendyol
                let trendyolData = [];
                try {
                    const supplierId = dbTySupplierId;
                    const authStr = btoa(`${dbTyApiKey}:${dbTyApiSecret}`);
                    const tyRes = await fetch(`/trendyol-api/sapigw/suppliers/${supplierId}/orders?size=100`, { headers: { 'Authorization': `Basic ${authStr}` } });
                    const tyJson = await tyRes.json();

                    if (!tyJson.errors && tyJson.content) {
                        trendyolData = tyJson.content.map(order => {
                            const revenue = order.totalPrice;

                            // 1. Costs from JSON Dictionary based on SKU
                            const sku = order.lines?.[0]?.merchantSku || `SKU-${order.lines?.[0]?.productName ? order.lines[0].productName.substring(0, 6) : 'DEFAULT'}`;
                            const costInfo = productCosts[sku] || productCosts["DEFAULT"];
                            const cogs = costInfo.cogs;
                            const shippingCost = costInfo.shipping;

                            // 2. Trendyol specific commission (typically 15% to 20% in beauty)
                            const commission = Math.round(revenue * 0.15); // Could be dynamically parsed if available in payload

                            // 3. Corporate VAT (KDV) Flow Engine
                            const kdvRate = 0.20;
                            const outputVat = revenue - (revenue / (1 + kdvRate));
                            const cogsVat = cogs - (cogs / (1 + kdvRate));
                            const shippingVat = shippingCost - (shippingCost / (1 + kdvRate));
                            const commissionVat = commission - (commission / (1 + kdvRate));
                            // Net KDV Payable to the State
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
                                // Keep actual timestamps from API
                                dateRaw: new Date(order.orderDate),
                                channelIcon: ShoppingBag,
                                channelColor: CHANNEL_COLORS.Trendyol,
                                productName: order.lines?.[0]?.productName || 'Satış',
                                productImage: getFallbackProductImage(order.lines?.[0]?.productName || ''),
                                revenue,
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

                        // NOTE: We REMOVED the random date spreading logic.
                        // Live API timestamps are now strictly matched.
                    }
                } catch (e) { console.error("Trendyol API Error", e); } // Silently handled without breaking Ikas

                if (isMounted) {
                    let finalData = [...ikasData, ...trendyolData];

                    // VERCEL / DEMO FALLBACK: If live API fails or proxy blocking CORS, load the mock dataset
                    if (finalData.length === 0) {
                        finalData = generateFallbackData();
                    }

                    setRawOrders(finalData.sort((a, b) => b.dateRaw - a.dateRaw));
                }
            } catch (err) {
                console.warn("Caught fatal fetch wrapper error on edge, defaulting to payload", err);
                if (isMounted) {
                    setRawOrders(generateFallbackData());
                }
            } finally {
                if (isMounted) setLoading(false);
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
