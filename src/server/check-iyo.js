import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://inyourorigin.com/urunler', { waitUntil: 'domcontentloaded' });
        
        const data = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.product, .type-product, [class*="product-card"]')).slice(0, 2);
            return cards.map(c => {
                const titleNode = c.querySelector('h2, h3, .product-title, .woocommerce-loop-product__title');
                const priceNode = c.querySelector('.woocommerce-Price-amount, .price');
                return {
                    titleHtml: titleNode ? titleNode.outerHTML : 'none',
                    titleText: titleNode ? titleNode.innerText : 'none',
                    price: priceNode ? priceNode.innerText : 'none'
                };
            });
        });
        
        console.log(JSON.stringify(data, null, 2));
        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
