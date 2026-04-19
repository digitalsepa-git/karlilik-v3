import express from 'express';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { chromium } from 'playwright';
import stringSimilarity from 'string-similarity';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get integrations config
router.get('/integrations', async (req, res) => {
    try {
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        const fileData = await fs.readFile(integrationsDbPath, 'utf8');
        res.json(JSON.parse(fileData));
    } catch(e) {
        res.json({});
    }
});

// Save integrations config
router.put('/integrations', async (req, res) => {
    try {
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        let dbData = {};
        try {
            dbData = JSON.parse(await fs.readFile(integrationsDbPath, 'utf8'));
        } catch(e) {}
        
        Object.assign(dbData, req.body);
        await fs.writeFile(integrationsDbPath, JSON.stringify(dbData, null, 2));
        res.json({ success: true, data: dbData });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/data', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Fetch dynamic credentials from integrations.json
        const integrationsDbPath = path.join(__dirname, 'integrations.json');
        let dbData = {};
        try {
            const fileData = await fs.readFile(integrationsDbPath, 'utf8');
            dbData = JSON.parse(fileData);
        } catch(e) { /* ignore if not exist */ }
        
        const gaCreds = dbData.googleads || {}; // Assuming we save it under the generic 'googleads' ID in Integrations
        const propertyId = gaCreds.propertyId || '506933695';
        
        let analyticsDataClient;
        if (gaCreds.clientEmail && gaCreds.privateKey) {
            analyticsDataClient = new BetaAnalyticsDataClient({
                credentials: {
                    client_email: gaCreds.clientEmail,
                    private_key: gaCreds.privateKey.replace(/\\n/g, '\n'),
                }
            });
        } else {
            // Fallback to local file if no dynamic ones found safely
            analyticsDataClient = new BetaAnalyticsDataClient({
                keyFilename: path.resolve(__dirname, '../../analytics-key.json')
            });
        }

        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: startDate || '30daysAgo',
                    endDate: endDate || 'today',
                },
            ],
            dimensions: [
                { name: 'sessionSourceMedium' },
            ],
            metrics: [
                { name: 'sessions' },
                { name: 'conversions' },
                { name: 'totalRevenue' },
                { name: 'advertiserAdCost' }
            ],
        });

        // Parse and format data
        const formattedData = (response?.rows || []).map(row => {
            const sessions = row.metricValues?.[0] ? parseInt(row.metricValues[0].value, 10) : 0;
            return {
                source: row.dimensionValues?.[0] ? row.dimensionValues[0].value : 'Unknown',
                sessions: sessions,
                conversions: row.metricValues?.[1] ? parseInt(row.metricValues[1].value, 10) : 0,
                revenue: row.metricValues?.[2] ? parseFloat(row.metricValues[2].value) : 0,
                cost: row.metricValues?.[3] ? parseFloat(row.metricValues[3].value) : 0 
            };
        });

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching Google Analytics data:', error);
        res.status(500).json({ error: 'Failed to fetch Analytics Data', details: error.message });
    }
});

// Bulk Scan API for Web Scraping and Product Auto-Matching
router.post('/scan', async (req, res) => {
    try {
        const { url, ikasProductNames } = req.body;
        if (!url || !url.startsWith('http')) {
            return res.status(400).json({ error: 'Valid URL is required' });
        }

        console.log(`[Scan API] Headless browser connecting to: ${url}`);
        const isTrendyolStore = url.includes('trendyol.com/magaza') || url.includes('trendyol.com/tum--urunler') || url.includes('trendyol.com/sr') || url.includes('/profil/');
        const isBeymenStore = url.includes('beymen.com');
        const isBulkScan = isTrendyolStore || isBeymenStore || url.includes('sephora') || url.includes('watsons');

        const browser = await chromium.launch({ 
            headless: false, // Görünür tarayıcı kullanmak bot korumalarını (Cloudflare/PerimeterX) aşmaya yardımcı olur
            args: ['--disable-blink-features=AutomationControlled']
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'tr-TR',
            timezoneId: 'Europe/Istanbul'
        });
        // Tarayıcı parmak izlerini gizle (Stealth Module)
        await context.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en-US', 'en'] });
            window.chrome = { runtime: {} };
        });
        
        const page = await context.newPage();
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(e => console.warn('Scraping goto soft-timeout:', e.message));
        await page.waitForTimeout(3500); 

        let results = [];

        if (isBulkScan) {
            console.log(`[Scan API] Parsing URL as Bulk Store/Catalog (Trendyol/Beymen/Generic)...`);
            
            // Trigger lazy loading for images and prices
            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => window.scrollBy(0, 1500));
                await page.waitForTimeout(1000);
            }

            const scrapedStoreProducts = await page.evaluate((storeType) => {
                let cards = [];
                if (storeType === 'trendyol') {
                    cards = document.querySelectorAll('.p-card-wrppr, .product-card');
                } else if (storeType === 'beymen') {
                    cards = document.querySelectorAll('.o-productList__item, .m-productCard, .b-product-card');
                } else {
                    cards = document.querySelectorAll('.product-card, .product-item, .card, article');
                }

                let items = [];
                cards.forEach(card => {
                    let titleEl, brandEl, priceEl, imgEl;
                    
                    if (storeType === 'beymen') {
                        titleEl = card.querySelector('.m-productCard__desc') || card.querySelector('.m-productCard__title') || card.querySelector('h3');
                        brandEl = card.querySelector('.m-productCard__brand');
                        priceEl = card.querySelector('.m-productCard__newPrice') || card.querySelector('.m-productPrice__salePrice') || card.querySelector('.m-productCard__newPrice span');
                        imgEl = card.querySelector('img');
                    } else {
                        titleEl = card.querySelector('.prdct-desc-cntnr-name') || card.querySelector('.prdct-desc-cntnr-ttl') || card.querySelector('.product-name') || card.querySelector('h3');
                        brandEl = card.querySelector('.prdct-desc-cntnr-ttl') || card.querySelector('.brand-name');
                        priceEl = card.querySelector('.prc-box-dscntd') || card.querySelector('.prc-box-sllng') || card.querySelector('.discounted-price') || card.querySelector('.price-value') || card.querySelector('.price');
                        imgEl = card.querySelector('.p-card-img') || card.querySelector('img');
                    }

                    const linkEl = card.tagName.toUpperCase() === 'A' ? card : card.querySelector('a');

                    const brandVal = brandEl && brandEl !== titleEl ? brandEl.innerText.trim() + " " : "";
                    const title = (brandVal + (titleEl ? titleEl.innerText.trim() : '')).trim();
                    const priceText = priceEl ? priceEl.innerText : '0';
                    const image = imgEl ? imgEl.src : '';
                    let itemUrl = linkEl ? linkEl.getAttribute('href') : '';
                    
                    if (itemUrl && !itemUrl.startsWith('http')) {
                        const host = storeType === 'beymen' ? 'https://www.beymen.com' : (storeType === 'trendyol' ? 'https://www.trendyol.com' : '');
                        if (host) itemUrl = host + itemUrl;
                    }

                    if (title && priceText && priceText !== '0') {
                        let sourceLabel = storeType === 'beymen' ? 'Beymen' : (storeType === 'trendyol' ? 'Trendyol' : 'Rakip Katalog');
                        items.push({ title, priceText, image, source: sourceLabel, url: itemUrl || window.location.href });
                    }
                });
                return items;
            }, isBeymenStore ? 'beymen' : (isTrendyolStore ? 'trendyol' : 'generic'));
            
            results = scrapedStoreProducts;
            console.log(`[Scan API] Successfully scraped ${results.length} products from store.`);
        } else {
            const scraped = await page.evaluate(() => {
                const extractMeta = (propName) => {
                    const el = document.querySelector(`meta[property="${propName}"], meta[name="${propName}"]`);
                    return el ? el.getAttribute('content') : '';
                };

                let title = '';
                const h1 = document.querySelector('h1');
                if (h1 && h1.innerText && h1.innerText.trim().length > 3) {
                    title = h1.innerText.trim();
                } else {
                    title = extractMeta('og:title') || document.title || '';
                }

                if (title.includes(' - ')) title = title.split(' - ')[0]; 
                if (title.includes(' | ')) title = title.split(' | ')[0];
                title = title.trim();
                
                const getPriceText = () => {
                    const selectors = ['.prc-dsc', '.product-price-container .price', '[data-test-id="price-current-price"]', '.price-val', '#sp-price-discountPrice', '.product-price', '.price', '[itemprop="price"]', '.current-price', '.sales-price', '.discountPrice'];
                    for(const sel of selectors) {
                        const el = document.querySelector(sel);
                        if(el) return el.innerText;
                    }
                    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                    for(const s of scripts) {
                        try {
                            const j = JSON.parse(s.innerText);
                            if(j && j.offers && j.offers.price) return j.offers.price.toString();
                            if(Array.isArray(j)) {
                                const prod = j.find(x => x['@type'] === 'Product' || x['@type'] === 'ItemPage');
                                if(prod && prod.offers && prod.offers.price) return prod.offers.price.toString();
                            }
                        } catch(e) {}
                    }
                    return '0';
                };

                let priceText = extractMeta('product:price:amount') || getPriceText() || '';
                let image = extractMeta('og:image');

                let source = 'Rakip Site';
                if (window.location.host.includes('trendyol')) source = 'Trendyol';
                else if (window.location.host.includes('hepsiburada')) source = 'Hepsiburada';
                else if (window.location.host.includes('amazon')) source = 'Amazon';

                const merchantEl = document.querySelector('.merchant-text');
                if(merchantEl) source = merchantEl.innerText.trim();

                return { title, priceText, image, source, url: window.location.href };
            });
            results = [scraped];
        }

        await browser.close();

        let finalMatchedResults = [];

        for (const scraped of results) {
            let matchedPrice = 0;
            if (scraped.priceText) {
                 const clean = scraped.priceText.replace(/[^0-9,.]/g, ''); 
                 const partsByComma = clean.split(',');
                 if (partsByComma.length > 1) {
                     const wholeNumber = partsByComma[0].replace(/\./g, '');
                     matchedPrice = parseFloat(wholeNumber + '.' + partsByComma[1]) || 0;
                 } else {
                     matchedPrice = parseFloat(clean.replace(/\./g, '')) || 0;
                 }
            }

            let bestMatchName = null;
            let bestMatchScore = 0;
            let sourceTitleForAI = (scraped.title || '').toLowerCase();

            if (!isBulkScan) {
                try {
                    let urlObjToParse;
                    try { urlObjToParse = new URL(url); } catch(e) { urlObjToParse = new URL(scraped.url); }
                    const pathParts = urlObjToParse.pathname.split('/').filter(Boolean);
                    const slug = pathParts.length > 0 ? pathParts[pathParts.length - 1] : '';
                    const slugWords = slug.replace(/[-_]/g, ' ').replace(/\.html?$/gi, '').trim().toLowerCase();
                    if (scraped.title.length < 25 && slugWords.length > 3) {
                        sourceTitleForAI = slugWords;               
                        scraped.title = slugWords.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    } else {
                        sourceTitleForAI += (" " + slugWords);
                    }
                } catch (e) {}
            }

            if (ikasProductNames && Array.isArray(ikasProductNames) && ikasProductNames.length > 0 && sourceTitleForAI) {
                 const safeTargets = ikasProductNames.map(n => typeof n === 'string' ? n.toLowerCase() : '');
                 const matchResult = stringSimilarity.findBestMatch(sourceTitleForAI, safeTargets);
                 bestMatchScore = matchResult.bestMatch.rating;
                 
                 // Strictly require > 50% for matches.
                 if (bestMatchScore > 0.50) {
                     bestMatchName = ikasProductNames[matchResult.bestMatchIndex];
                 } else {
                     bestMatchName = null;
                 }
            }

            // Exclude unconfident hits ONLY for bulk store crawls (to prevent polluting the UI). 
            // Allow loose hits or missing hits for single-URL scans because the user explicitly pasted them.
            if (!isBulkScan || (isBulkScan && bestMatchName !== null)) {
                 finalMatchedResults.push({
                     scrapedTitle: scraped.title,
                     scrapedPrice: matchedPrice || 0,
                     scrapedImage: scraped.image,
                     source: scraped.source,
                     url: scraped.url,
                     bestMatch: {
                         name: bestMatchName,
                         score: bestMatchScore,
                         confidencePct: Math.round(bestMatchScore * 100)
                     }
                 });
            }
        }

        res.json({
            success: true,
            data: isBulkScan ? finalMatchedResults : (finalMatchedResults[0] || null)
        });

    } catch (e) {
        console.error("API Scan Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// GET all saved competitors
router.get('/competitors', async (req, res) => {
    try {
        const competitorsDbPath = path.join(__dirname, 'competitors.json');
        try {
            const data = await fs.readFile(competitorsDbPath, 'utf8');
            res.json(JSON.parse(data));
        } catch (e) {
            // Return empty array if file doesn't exist
            res.json([]);
        }
    } catch (e) {
         res.status(500).json({ error: 'Failed to read competitors database' });
    }
});

// PUT precisely syncs all competitors (Handles additions, edits, deletions)
router.put('/competitors', async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: 'Expected validation array' });
        }
        const competitorsDbPath = path.join(__dirname, 'competitors.json');
        await fs.writeFile(competitorsDbPath, JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true, count: req.body.length });
    } catch (e) {
        console.error("Failed to sync competitors:", e);
        res.status(500).json({ error: 'Failed to sync competitors database' });
    }
});

export default router;
