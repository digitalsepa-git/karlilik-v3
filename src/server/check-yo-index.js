import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://inyourorigin.com/', { waitUntil: 'domcontentloaded' });
        
        const data = await page.evaluate(() => {
            // Looking for slider cards or homepage elements
            const customCards = Array.from(document.querySelectorAll('.saren--product--wrap, .product, .type-product, [class*="product-card"], .product-tile, .elementor-widget-image-carousel .swiper-slide, .elementor-container .elementor-column:has(img):has(a), .elementor-widget-wrap'));
            
            return customCards.map(c => c.innerText.replace(/\n+/g, ' ').trim()).filter(Boolean);
        });
        
        console.log(JSON.stringify(data, null, 2));
        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
