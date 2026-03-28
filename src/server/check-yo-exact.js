import { chromium } from 'playwright';
import stringSimilarity from 'string-similarity';

// Mock IKAS catalog with the products mentioned
const myProducts = [
  { name: "Pro Yüz Şekillendirme ve Göz Bakım Seti", myPrice: 14999 },
  { name: "Gece - Gündüz Cilt Bakım Seti", myPrice: 5699 },
  { name: "Anti-Aging Cilt Bakım Cihazı ( Led Terapili)", myPrice: 14999 },
  { name: "Mikro Akım Yüz Sıkılaştırıcı Akıllı Kalem (Titreşimli)", myPrice: 2000 },
  { name: "Yüz Temizleyici | Facial Cleanser", myPrice: 500 }
];

const cleanName = (str) => {
    return str.replace(/foreo|faq™|faq|luna™|luna|bear™|bear|ufo™|ufo|issaa™|issa|iris™|iris|kiwi™|kiwi|iyo|fakir/gi, '')
              .replace(/cilt|bakım|cihazı|yüz|seti|masaj|aleti/gi, '')
              .trim();
};

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://inyourorigin.com/urunler/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000); 

        const data = await page.evaluate(async () => {
            const results = [];
            const customCards = Array.from(document.querySelectorAll('.saren--product--wrap, .product, .type-product, [class*="product-card"], .product-tile, .elementor-widget-wrap:has(.woocommerce-Price-amount)'));
            
            for (let card of customCards) {
                const titleNode = card.querySelector('h2, h3, .product-name, .product-title, .woocommerce-loop-product__title');
                const name = titleNode ? titleNode.innerText.trim() : card.innerText.trim().split('\n')[0];
                
                if (!name || name === 'SEPETE EKLE' || name.length < 3) continue;
                
                const img = card.querySelector('img.product-image-front, .wp-post-image, img');
                const imageSrc = img ? (img.getAttribute('src') || img.getAttribute('data-src') || img.src) : null;
                const link = card.tagName.toLowerCase() === 'a' ? card : card.querySelector('a.product--barba--trigger, a');
                const href = link ? link.href : 'none';
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
                            
                            const typeProduct = doc.querySelector('.type-product');
                            if (typeProduct) {
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
                    url: cleanUrl,
                    rawText: description
                });
            }
            return results;
        });
        
        myProducts.forEach(myProduct => {
            const searchName = myProduct.name.toLowerCase();
            const cleanSearchName = cleanName(searchName);
            
            console.log(`\nEvaluating IKAS: [ ${myProduct.name} ] -> Cleaned: [ ${cleanSearchName} ]`);
            
            data.forEach(scrapedItem => {
                const scrapedName = scrapedItem.name.toLowerCase();
                const cleanScrapedName = cleanName(scrapedName);
                const scrapedContext = (scrapedItem.rawText || "").toLowerCase();
                
                const textSim = stringSimilarity.compareTwoStrings(cleanSearchName, cleanScrapedName);
                
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
                
                let priceRatio = 0.5;
                if (myProduct.myPrice > 0 && scrapedItem.price > 0) {
                    priceRatio = Math.min(myProduct.myPrice, scrapedItem.price) / Math.max(myProduct.myPrice, scrapedItem.price);
                    if (myProduct.myPrice > 2000 && scrapedItem.price > 2000) {
                         priceRatio = Math.min(priceRatio + 0.2, 1.0);
                    }
                }
                
                let totalScore = (textSim * 0.55) + (contextSim * 0.30) + (priceRatio * 0.15);
                if (textSim < 0.20 && contextSim < 0.10) {
                    totalScore = 0;
                }
                
                console.log(`  -> vs [ ${scrapedItem.name} ] | Text:${textSim.toFixed(2)} Ctx:${contextSim.toFixed(2)} Prce:${priceRatio.toFixed(2)} ==> TOTAL: ${totalScore.toFixed(3)}`);
            });
        });

        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
