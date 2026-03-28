import { useState, useEffect } from 'react';
import { getCategoryFromProductName, getFallbackProductImage } from './useOrdersLive';
import fallbackProductsData from '../data/realProducts.json';

export function useIkasProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refetch = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        let isMounted = true;

        async function fetchProducts() {
            setLoading(true);
            setError(null);

            try {
                // Fetch dynamic config from backend
                let dbIkasClientId = import.meta.env.VITE_IKAS_CLIENT_ID || '204cf972-0bba-4374-aad9-b94aee79a8c8';
                let dbIkasClientSecret = import.meta.env.VITE_IKAS_CLIENT_SECRET || '';

                try {
                    const dbRes = await fetch('/api/integrations');
                    if (dbRes.ok) {
                        const dbData = await dbRes.json();
                        if (dbData.ikas && dbData.ikas.clientId && dbData.ikas.clientSecret) {
                            dbIkasClientId = dbData.ikas.clientId;
                            dbIkasClientSecret = dbData.ikas.clientSecret;
                        }
                    }
                } catch (e) {
                    // silently fallback to .env
                }

                // Fetch Ikas Token
                const authParams = new URLSearchParams();
                authParams.append('grant_type', 'client_credentials');
                authParams.append('client_id', dbIkasClientId);
                authParams.append('client_secret', dbIkasClientSecret);

                const tokenRes = await fetch('/ikas-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: authParams.toString()
                });

                const tokenData = await tokenRes.json();

                if (!tokenRes.ok || !tokenData.access_token) {
                    throw new Error("Ikas Token hatası.");
                }

                // Load custom Trendyol link mappings
                let trendyolLinkMap = [];
                try {
                    const tyMapModule = await import('../data/trendyolLinks.json');
                    trendyolLinkMap = tyMapModule.default || [];
                } catch (e) {
                    // ignore
                }

                const query = `
                    query {
                        listCategory {
                            id
                            name
                            parentId
                        }
                        listProduct(pagination: { limit: 100 }) {
                            data {
                                id
                                name
                                description
                                shortDescription
                                createdAt
                                brand { name }
                                metaData {
                                    pageTitle
                                    description
                                    slug
                                }
                                variants { 
                                    prices { sellPrice }
                                    stocks { 
                                        stockCount 
                                    }
                                    sku 
                                    images {
                                        imageId
                                        isMain
                                    }
                                }
                                categoryIds
                            }
                        }
                    }
                `;

                const res = await fetch('/ikas-api/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenData.access_token}`
                    },
                    body: JSON.stringify({ query })
                });

                const { data, errors } = await res.json();

                if (errors) {
                    throw new Error(errors[0].message);
                }

                if (data && data.listCategory && isMounted) {
                    setCategories(data.listCategory);
                }

                if (data && data.listProduct && data.listProduct.data && isMounted) {

                    const catMap = new Map();
                    if (data.listCategory) {
                        data.listCategory.forEach(c => catMap.set(c.id, c));
                    }

                    const getRootCategoryName = (categoryIds) => {
                        if (!categoryIds || categoryIds.length === 0) return 'Diğer';
                        // Sadece ilk kategori ID'sinden yola çıkarak parent'a tırman (Hepsi aynı root'a çıkar)
                        let currentCat = catMap.get(categoryIds[0]);
                        if (!currentCat) return 'Diğer';

                        while (currentCat.parentId) {
                            const parent = catMap.get(currentCat.parentId);
                            if (!parent) break;
                            currentCat = parent;
                        }
                        return currentCat.name;
                    };
                    const mapIkasProduct = (product, trendyolLinkMap) => {
                        const variant = product.variants && product.variants.length > 0 ? product.variants[0] : {};

                        let price = 0;
                        if (variant.prices && variant.prices.length > 0) {
                            price = variant.prices[0].sellPrice || 0;
                        }

                        let stock = 0;
                        let available = 0;
                        let reserved = 0;

                        if (variant.stocks && variant.stocks.length > 0) {
                            stock = variant.stocks.reduce((sum, s) => sum + (s.stockCount || 0), 0);

                            // Deterministic 8% reserved for testing
                            reserved = Math.floor(stock * 0.08);
                            available = Math.max(0, stock - reserved);
                        }

                        const sku = variant.sku || `SKU-${product.id.substring(0, 6)}`;
                        const brand = product.brand?.name || 'Geske';
                        const categoryName = getRootCategoryName(product.categoryIds);

                        // Prioritize real Ikas CDN images, fallback to deterministic local cache if imageId is missing.
                        const mainImg = variant.images?.find(img => img.isMain) || variant.images?.[0];
                        const img = mainImg ? `https://cdn.myikas.com/images/7692629f-ebc8-45a8-bf85-a2c79fd5af60/${mainImg.imageId}/image_1080.webp` : getFallbackProductImage(product.name);

                        const ikasSlug = product.metaData?.slug || '';
                        const customTyLink = trendyolLinkMap.find(m => m.sku === sku);

                        const channels = [
                            { name: 'Web Sitesi (ikas)', category: categoryName, brand: brand, sku: sku, stock: stock, price: price, ikasSlug: ikasSlug },
                            { name: 'Trendyol', category: categoryName, brand: brand, sku: sku, stock: stock, price: price, customUrl: customTyLink ? customTyLink.url : null }
                        ];

                        const productCreatedAt = product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor';

                        return {
                            id: product.id,
                            name: product.name,
                            description: product.description || product.shortDescription || 'Ürün açıklaması girilmemiş.',
                            createdAt: productCreatedAt,
                            metaData: {
                                title: product.metaData?.pageTitle || `${product.name} | ${brand}`,
                                description: product.metaData?.description || `${brand} ${product.name} en uygun fiyatlarla.`,
                                slug: ikasSlug
                            },
                            sku: sku,
                            ikasSlug: ikasSlug,
                            category: categoryName,
                            brand: brand,
                            stock: stock,
                            available: available,
                            reserved: reserved,
                            price: price,
                            img: img,
                            margin: 0,
                            history: [],
                            channels: channels
                        };
                    };

                    const fetchedProductsArray = data.listProduct.data.map(p => mapIkasProduct(p, trendyolLinkMap));
                    setProducts(fetchedProductsArray);
                }
            } catch (err) {
                console.warn("Vercel Proxy Error in Products, Falling Back to 140+ realProducts DB", err);
                if (isMounted) {
                    let trendyolLinkMap = [];
                    try {
                        const tyMapModule = await import('../data/trendyolLinks.json');
                        trendyolLinkMap = tyMapModule.default || [];
                    } catch (e) { }

                    if (fallbackProductsData && fallbackProductsData.length > 0) {
                        const fbParsed = fallbackProductsData.map(p => mapIkasProduct(p, trendyolLinkMap));
                        setProducts(fbParsed);
                    } else {
                        setError(err.message || 'Ürünler alınırken bir hata oluştu');
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchProducts();

        return () => { isMounted = false; };
    }, [refreshTrigger]);

    return { products, categories, loading, error, refetch };
}
