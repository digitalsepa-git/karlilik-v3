import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';
import stringSimilarity from 'string-similarity';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'competitors.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/scrape-and-match', async (req, res) => {
    const { targetUrls, myProducts, channel } = req.body;
    
    if (!targetUrls || !Array.isArray(targetUrls) || targetUrls.length === 0 || !myProducts) {
        return res.status(400).json({ error: 'targetUrls array and myProducts are required' });
    }

    let browser = null;
    let allScrapedProducts = [];

    try {
        console.log(`Starting scraper for ${targetUrls.length} URLs (Channel: ${channel})`);
        
        // Launch a headless browser
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            locale: 'tr-TR',
            extraHTTPHeaders: {
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        
        const page = await context.newPage();

        for (const url of targetUrls) {
            // MOCK TEST HELPER
            if (url.includes('demo-rakip.com')) {
                console.log("Mock target detected! Returning dummy successful matches for UI testing.");
                const mockMatches = myProducts.slice(0, 5).map(p => ({
                    id: p.id,
                    myImage: p.img || p.image || 'https://via.placeholder.com/150',
                    myName: p.name,
                    mySku: p.sku || 'TEST-SKU',
                    myPrice: p.price || p.myPrice || 500,
                    compName: p.name + " (Demo Rakip)",
                    compPrice: Math.floor((p.price || p.myPrice || 500) * (0.85 + Math.random() * 0.3)), // Random price +- 15%
                    compSeller: "demo-rakip.com", 
                    matchConfidence: 98,
                    compImage: p.img || p.image || 'https://via.placeholder.com/150',
                    compUrl: "https://www.demo-rakip.com/urun-detay",
                    selected: true
                }));
                if (browser) await browser.close();
                return res.json({ success: true, totalScraped: 145, matches: mockMatches });
            }

            try {
                let finalUrl = url;
                if (!finalUrl.startsWith('http')) {
                    finalUrl = 'https://' + finalUrl;
                }
                
                if (finalUrl === 'https://www.foreo.com/tr' || finalUrl === 'https://www.foreo.com/tr/') {
                    finalUrl = 'https://www.foreo.com/tr/shop-all';
                    console.log(`Auto-redirecting root domain to shop catalog: ${finalUrl}`);
                }
                
                if (finalUrl === 'https://inyourorigin.com' || finalUrl === 'https://inyourorigin.com/' || finalUrl === 'https://www.inyourorigin.com' || finalUrl === 'https://www.inyourorigin.com/') {
                    finalUrl = 'https://inyourorigin.com/urunler/';
                    console.log(`Auto-redirecting root domain to shop catalog: ${finalUrl}`);
                }

                console.log(`Scraping: ${finalUrl}`);
                await page.goto(finalUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                
                // Optional: scroll down to trigger lazy loading
                await page.evaluate(async () => {
                    await new Promise((resolve) => {
                        let totalHeight = 0;
                        let distance = 300;
                        let timer = setInterval(() => {
                            let scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;
                            if(totalHeight >= scrollHeight || totalHeight > 5000){
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    });
                });
                
                await page.waitForTimeout(2000);

                let isForeoUrl = finalUrl.includes('foreo.com');
                let isInYourOriginUrl = finalUrl.includes('inyourorigin.com');

                if (isInYourOriginUrl) {
                    await page.waitForTimeout(3000);
                }

                const scrapedProducts = await page.evaluate(async ({ channel, targetUrl, isForeoUrl, isInYourOriginUrl }) => {
                    const results = [];
                    
                    if (isInYourOriginUrl) {
                        // --- IN YOUR ORIGIN SPECIFIC LOGIC ---
                        
                        // Check if we are on a single product page
                        const h1 = document.querySelector('h1.product_title, h1.elementor-heading-title');
                        if (h1 && h1.innerText.trim().length > 3) {
                            const singlePrice = document.querySelector('.woocommerce-Price-amount, .price');
                            const singleImg = document.querySelector('.wp-post-image, .woocommerce-product-gallery__image img');
                            
                            let priceText = singlePrice ? singlePrice.innerText : document.body.innerText;
                            let priceMatch = priceText.match(/([0-9.,]+)\s*(TL|₺)/i) || priceText.match(/(₺|TL)\s*([0-9.,]+)/i);
                            
                            let numericPrice = 0;
                            if (priceMatch) {
                                let rawStr = priceMatch[1] === '₺' || priceMatch[1].toUpperCase() === 'TL' ? priceMatch[2] : priceMatch[1];
                                numericPrice = parseFloat(rawStr.replace(/\./g, '').replace(',', '.'));
                            }
                            
                            results.push({
                                name: h1.innerText.trim(),
                                price: isNaN(numericPrice) ? 0 : numericPrice,
                                image: singleImg ? singleImg.src : null,
                                url: targetUrl.split('?')[0],
                                rawText: document.body.innerText.substring(0, 500)
                            });
                            return results;
                        }

                        // Otherwise, process as a product grid / List Page
                        const customCards = Array.from(document.querySelectorAll('.saren--product--wrap, .product, .type-product, [class*="product-card"], .product-tile, .elementor-widget-wrap:has(.woocommerce-Price-amount)'));
                        
                        for (let card of customCards) {
                            const titleNode = card.querySelector('h2, h3, .product-name, .product-title, .woocommerce-loop-product__title');
                            const name = titleNode ? titleNode.innerText.trim() : card.innerText.trim().split('\n')[0];
                            
                            if (!name || name === 'SEPETE EKLE' || name.length < 3) continue;
                            
                            const img = card.querySelector('img.product-image-front, .wp-post-image, img');
                            const imageSrc = img ? (img.getAttribute('src') || img.getAttribute('data-src') || img.src) : null;
                            const link = card.tagName.toLowerCase() === 'a' ? card : card.querySelector('a.product--barba--trigger, a');
                            const href = link ? link.href : targetUrl;
                            const cleanUrl = href.split('?')[0];
                            
                            const priceNode = card.querySelector('.price, .woocommerce-Price-amount');
                            let priceText = priceNode ? priceNode.innerText : card.innerText;
                            let priceMatch = priceText.match(/([0-9.,]+)\s*(TL|₺)/i) || priceText.match(/(₺|TL)\s*([0-9.,]+)/i);
                            
                            let numericPrice = 0;
                            if (priceMatch) {
                                let rawStr = priceMatch[1] === '₺' || priceMatch[1].toUpperCase() === 'TL' ? priceMatch[2] : priceMatch[1];
                                numericPrice = parseFloat(rawStr.replace(/\./g, '').replace(',', '.'));
                            }
                            
                            // Deep Fetch Descriptions for AI String Similarity
                            let description = card.innerText;
                            if (cleanUrl.includes('inyourorigin.com')) {
                                try {
                                    const res = await fetch(cleanUrl);
                                    if (res.ok) {
                                        const html = await res.text();
                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(html, 'text/html');
                                        
                                        // Use .type-product wrapper to strip global Login/Newsletter widgets
                                        const typeProduct = doc.querySelector('.type-product');
                                        if (typeProduct) {
                                            // Extract textual nodes specifically
                                            const paragraphs = Array.from(typeProduct.querySelectorAll('p, h2, h3, .woocommerce-product-details__short-description, .elementor-heading-title, .elementor-text-editor'));
                                            const foundDesc = paragraphs.map(p => p.innerText.trim()).filter(t => t.length > 5).join(' ');
                                            if (foundDesc.length > 10) description += ' ' + foundDesc.substring(0, 1500);
                                        }
                                    }
                                } catch(e) {}
                            }

                            results.push({
                                name: name,
                                price: isNaN(numericPrice) ? 0 : numericPrice,
                                image: imageSrc,
                                url: cleanUrl,
                                rawText: description
                            });
                        }
                        return results;
                    }
                    
                    // --- EXISTING FOREO/TRENDYOL LOGIC ---
                    let cards = [];
                    if (channel === 'Trendyol') {
                        cards = Array.from(document.querySelectorAll('.p-card-wrppr, .prdct-cntnr-wrppr'));
                    }
                    
                    // Universal e-commerce card selectors + specific '.cpv'/'cpp' Foreo grids
                    if (cards.length === 0) {
                        cards = Array.from(document.querySelectorAll('article, [class*="product-card"], [class*="product-item"], [class*="ProductCard"], .product-tile, .product, .cpv, .cpp'));
                    }

                    if (cards.length === 0) {
                        const links = Array.from(document.querySelectorAll('a'));
                        cards = links.filter(link => link.querySelector('img') && link.innerText.trim().length > 5);
                    }

                    // Single product page fallback: If no cards found, extract main title and price of the active page
                    if (cards.length === 0) {
                        // Prevent category pages (which might have failed card extraction) from being treated as 1 single product
                        if (targetUrl.includes('shop') || targetUrl.includes('category') || targetUrl.includes('filter=')) {
                            return results;
                        }

                        const h1 = document.querySelector('h1') ? document.querySelector('h1').innerText : document.title;
                        const firstImage = document.querySelector('img') ? document.querySelector('img').src : null;
                        
                        // Extract meta description and some surrounding context text
                        let description = '';
                        const metaDesc = document.querySelector('meta[name="description"]');
                        if (metaDesc) description += metaDesc.content + ' ';
                        
                        const pTags = Array.from(document.querySelectorAll('p')).slice(0, 3).map(p => p.innerText).join(' ');
                        description += pTags;

                        // Try to find a global price on screen
                        const bodyText = document.body.innerText;
                        let priceMatch = bodyText.match(/([0-9.,]+)\s*(TL|₺)/i) || bodyText.match(/(₺|TL)\s*([0-9.,]+)/i);
                        const numericPrice = priceMatch ? parseFloat((priceMatch[1] || priceMatch[2]).replace(/\./g, '').replace(',', '.')) : 0;
                        
                        if (h1 && h1.length > 3) {
                            results.push({
                                name: h1.trim(),
                                price: isNaN(numericPrice) ? 0 : numericPrice,
                                image: firstImage,
                                url: targetUrl.split('?')[0], // Always strip query parameters
                                rawText: description || bodyText.slice(0, 500)
                            });
                            return results;
                        }
                    }

                    cards.forEach(card => {
                        const text = card.innerText.replace(/\n+/g, ' ').trim();
                        if (!text) return;
                        
                        const img = card.querySelector('img');
                        let imageSrc = img ? (img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original')) : null;
                        
                        if (img && !imageSrc && img.getAttribute('srcset')) {
                            imageSrc = img.getAttribute('srcset').split(' ')[0];
                        }

                        const link = card.tagName.toLowerCase() === 'a' ? card : card.querySelector('a');
                        let href = link ? link.getAttribute('href') : null;
                        if (href && !href.startsWith('http')) {
                            try {
                                const baseUrl = new URL(targetUrl).origin;
                                href = href.startsWith('/') ? baseUrl + href : baseUrl + '/' + href;
                            } catch(e) { }
                        }

                        let priceMatch = text.match(/([0-9.,]+)\s*(TL|₺)/i);
                        if (!priceMatch) {
                            priceMatch = text.match(/(₺|TL)\s*([0-9.,]+)/i);
                        }
                        
                        const priceStr = priceMatch ? priceMatch[0] : null;
                        const numericPrice = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
                        
                        let name = text;
                        let specificTitleEl = card.querySelector('.cpv__title, .cpp__title, .product-title, .product-name, .ecom__info-title, .prdct-desc-cntnr-name');
                        
                        if (specificTitleEl) {
                            let titleText = specificTitleEl.innerText.trim();
                            let titleLines = titleText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                            name = titleLines[titleLines.length - 1] || titleText;
                        } else {
                            // Fallback if no specific title node exists
                            const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                            let nameIndex = 0;
                            if (rawLines[0] && rawLines[0].match(/YENİ|YENİ̇|ÇOK SATANLAR|PAKETLE TASARRUF EDİN|TÜKENDİ|KAZANÇ/i) && rawLines.length > 1) {
                                nameIndex = 1;
                            }
                            name = rawLines[nameIndex] || text;
                            if (priceStr) {
                                name = name.replace(priceStr, '').trim();
                            }
                        }

                        // Hard strip generic noise just in case it's on the same line
                        name = name.replace(/PAKETLE TASARRUF EDİN/gi, '')
                                   .replace(/ÇOK SATANLAR/gi, '')
                                   .replace(/YENİ̇?/gi, '')
                                   .replace(/TÜKENDİ̇?/gi, '')
                                   .trim();
                        
                        if (channel === 'Trendyol') {
                            const brandSpan = card.querySelector('.prdct-desc-cntnr-ttl');
                            const nameSpan = card.querySelector('.prdct-desc-cntnr-name');
                            if (brandSpan && nameSpan) {
                                name = `${brandSpan.innerText} ${nameSpan.innerText}`.trim();
                            }
                        }
                        
                        if (name.length > 5 && name.length < 200) {
                            let cleanUrl = href ? href.split('?')[0] : targetUrl.split('?')[0];
                            results.push({
                                name: name,
                                price: isNaN(numericPrice) ? 0 : numericPrice,
                                image: imageSrc,
                                url: cleanUrl, 
                                rawText: text
                            });
                        }
                    });
                    
                    return results;
                }, { channel, targetUrl: finalUrl, isForeoUrl, isInYourOriginUrl });
                
                allScrapedProducts = [...allScrapedProducts, ...scrapedProducts];

            } catch (pageErr) {
                console.warn(`Failed scraping ${url}:`, pageErr.message);
            }
        }
        
        await browser.close();
        
        console.log(`Scraped total ${allScrapedProducts.length} potential products from provided URLs`);

        // Helper to strip generic brand and category noise for sharper functional matching
        const cleanName = (str) => {
            return str.replace(/foreo|faq™|faq|luna™|luna|bear™|bear|ufo™|ufo|issaa™|issa|iris™|iris|kiwi™|kiwi|iyo|fakir/gi, '')
                      .replace(/cilt|bakım|cihazı|yüz|seti|masaj|aleti/gi, '')
                      .trim();
        };

        // MATCHING ALGORITHM (Multi-Dimensional Weighted Scoring + Unique Ownership)
        // Weighting: 55% Title Similarity, 25% Context, 20% Price Proximity
        const matchedOutput = [];
        const usedScrapedUrls = new Set(); // To ensure 1-to-1 mapping
        
        // We evaluate every IKAS product and find its absolute best scraped counterpart
        myProducts.forEach(myProduct => {
            const searchName = myProduct.name.toLowerCase();
            const cleanSearchName = cleanName(searchName);
            
            let bestScore = 0;
            let bestScrapedItem = null;
            const safeMyPrice = myProduct.price || myProduct.myPrice || 0;
            
            allScrapedProducts.forEach(scrapedItem => {
                // Skip if this specific competitor item url was already claimed by another IKAS product 
                // (except if it's just the root domain fallback)
                const isRootDomain = scrapedItem.url === 'https://www.foreo.com/tr' || scrapedItem.url === 'https://www.foreo.com/tr/';
                if (!isRootDomain && usedScrapedUrls.has(scrapedItem.url)) {
                    return;
                }

                const scrapedName = scrapedItem.name.toLowerCase();
                const cleanScrapedName = cleanName(scrapedName);
                const scrapedContext = (scrapedItem.rawText || "").toLowerCase();
                
                // 1. Name exact/partial similarity on CLEANED names
                const textSim = stringSimilarity.compareTwoStrings(cleanSearchName, cleanScrapedName);
                
                // 2. Contextual similarity
                let contextSim = 0;
                if (scrapedContext.includes(cleanSearchName) && cleanSearchName.length > 5) {
                    contextSim = 1.0; 
                } else {
                    const stopWords = ['ve','ile','için','olan','seti','cihazı','bakım','cilt','yüz','masaj','aleti','(titreşimli)','(',')',',','|','-'];
                    const searchWords = cleanSearchName.split(' ').filter(w => w.length > 2 && !stopWords.includes(w));
                    let matchedWords = 0;
                    searchWords.forEach(w => {
                        if (scrapedContext.includes(w)) matchedWords++;
                    });
                    contextSim = searchWords.length > 0 ? (matchedWords / searchWords.length) : 0;
                }
                
                // 3. Fiyat benzerliği hesabı algoritmadan çıkarıldı
                
                // Final Weighted Total (Bağlam ağırlığı artırıldı)
                // Weights: 40% Name Similarity, 60% Context Similarity
                let totalScore = (textSim * 0.40) + (contextSim * 0.60);
                
                // VETO RULE: If the products share virtually zero semantic or contextual similarity
                if (textSim < 0.10 && contextSim < 0.10) {
                    totalScore = 0;
                }
                
                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestScrapedItem = scrapedItem;
                }
            });
            
            console.log(`[FINAL_EVAL] IKAS Product '${cleanSearchName}' -> Best found: '${bestScrapedItem ? bestScrapedItem.name : 'None'}', Score: ${bestScore}`);
            
            // If we found a sensible match for THIS Ikas product
            // Threshold dropped to 0.14 to accommodate completely abstract competitor naming
            if (bestScore > 0.14 && bestScrapedItem) {
                let hostname = "site";
                try { hostname = new URL(bestScrapedItem.url).hostname; } catch(e){}

                // Lock this scraped URL so no other IKAS item can steal it
                const isRootDomain = bestScrapedItem.url === 'https://www.foreo.com/tr' || bestScrapedItem.url === 'https://www.foreo.com/tr/';
                if (!isRootDomain) {
                    usedScrapedUrls.add(bestScrapedItem.url);
                }

                matchedOutput.push({
                    id: myProduct.id,
                    myImage: myProduct.img || myProduct.image,
                    myName: myProduct.name,
                    mySku: myProduct.sku,
                    myPrice: safeMyPrice,
                    compName: bestScrapedItem.name,
                    compPrice: bestScrapedItem.price || (safeMyPrice * 1.05),
                    compSeller: hostname, 
                    matchConfidence: Math.round(bestScore * 100),
                    compImage: bestScrapedItem.image,
                    compUrl: bestScrapedItem.url,
                    selected: true
                });
            }
        });
        
        res.json({
            success: true,
            totalScraped: allScrapedProducts.length,
            matches: matchedOutput
        });

    } catch (error) {
        if (browser) await browser.close();
        console.error("Scraping error:", error);
        res.status(500).json({ error: 'Failed to scrape the target URL', details: error.message });
    }
});


// GET all saved competitors
app.get('/api/competitors', async (req, res) => {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(dbPath, '[]');
            res.json([]);
        } else {
            console.error("Database read error:", error);
            res.status(500).json({ error: 'Failed to read competitors database' });
        }
    }
});

// POST to save new competitors (Appends)
app.post('/api/competitors', async (req, res) => {
    try {
        const newCompetitors = req.body;
        if (!Array.isArray(newCompetitors)) {
            return res.status(400).json({ error: 'Expected an array of competitors' });
        }

        let existing = [];
        try {
            const data = await fs.readFile(dbPath, 'utf8');
            existing = JSON.parse(data);
        } catch (e) {
            // Ignore if file doesn't exist
        }

        // Merge existing with new (if they don't already exist by ID)
        const updated = [...existing];
        newCompetitors.forEach(nc => {
            if (!updated.find(c => c.id === nc.id)) {
                updated.push(nc);
            }
        });

        await fs.writeFile(dbPath, JSON.stringify(updated, null, 2));
        res.json({ success: true, total: updated.length });
    } catch (error) {
        console.error("Database write error:", error);
        res.status(500).json({ error: 'Failed to save competitors' });
    }
});

// NEW: PUT to strictly overwrite all competitors (Syncs drops/edits/toggles)
app.put('/api/competitors', async (req, res) => {
    try {
        const fullCompetitorsList = req.body;
        if (!Array.isArray(fullCompetitorsList)) {
            return res.status(400).json({ error: 'Expected an array of competitors to sync' });
        }

        // Fully overwrite the JSON database
        await fs.writeFile(dbPath, JSON.stringify(fullCompetitorsList, null, 2));
        res.json({ success: true, total: fullCompetitorsList.length, sync: true });
    } catch (error) {
        console.error("Database sync/overwrite error:", error);
        res.status(500).json({ error: 'Failed to sync entire competitor list' });
    }
});

// GET all saved integrations
app.get('/api/integrations', async (req, res) => {
    try {
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        const data = await fs.readFile(integrationsDbPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(path.join(__dirname, 'integrations.json'), '{}');
            res.json({});
        } else {
            console.error("Integrations Database read error:", error);
            res.status(500).json({ error: 'Failed to read integrations database' });
        }
    }
});

// PUT to strict-sync/overwrite integrations
app.put('/api/integrations', async (req, res) => {
    try {
        const payloadDict = req.body;
        if (typeof payloadDict !== 'object') {
            return res.status(400).json({ error: 'Expected an object of integrations' });
        }
        
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        let existing = {};
        try {
            const data = await fs.readFile(integrationsDbPath, 'utf8');
            existing = JSON.parse(data);
        } catch (e) {
            // Ignore if file doesn't exist
        }

        // Merge existing integrations with the new override values (so we don't accidentally wipe inactive ones)
        const updated = { ...existing, ...payloadDict };

        await fs.writeFile(integrationsDbPath, JSON.stringify(updated, null, 2));
        res.json({ success: true, updated: Object.keys(payloadDict) });
    } catch (error) {
        console.error("Database sync error for integrations:", error);
        res.status(500).json({ error: 'Failed to sync integrations map' });
    }
});

// NEW: Helper proxy to relay requests natively out from UI
app.post('/api/proxy/ikas/token', async (req, res) => {
    // A little proxy route for ikas token to avoid CORS issues if they happen later
});

// GET all saved bulk targets
app.get('/api/targets', async (req, res) => {
    try {
        const targetDbPath = path.join(__dirname, 'targets.json');
        const data = await fs.readFile(targetDbPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(path.join(__dirname, 'targets.json'), '{"channel":"Web","targets":""}');
            res.json({ channel: 'Web', targets: '' });
        } else {
            console.error("Targets Database read error:", error);
            res.status(500).json({ error: 'Failed to read targets database' });
        }
    }
});

// PUT to sync/overwrite targets
app.put('/api/targets', async (req, res) => {
    try {
        const payloadDict = req.body;
        if (typeof payloadDict !== 'object') {
            return res.status(400).json({ error: 'Expected an object' });
        }
        const targetDbPath = path.join(__dirname, 'targets.json');
        await fs.writeFile(targetDbPath, JSON.stringify(payloadDict, null, 2));
        res.json({ success: true, updated: true });
    } catch (error) {
        console.error("Database sync error for targets:", error);
        res.status(500).json({ error: 'Failed to sync targets' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Scraper Server running on http://localhost:${PORT}`);
});
