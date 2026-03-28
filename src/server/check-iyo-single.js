import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('https://inyourorigin.com/urun/mine-care-hair-dryer', { waitUntil: 'domcontentloaded' });
        
        const data = await page.evaluate(() => {
            const h1 = document.querySelector('h1, .product_title');
            const price = document.querySelector('.woocommerce-Price-amount, .price');
            const img = document.querySelector('.wp-post-image, .woocommerce-product-gallery__image img');
            return {
                h1: h1 ? h1.innerText : 'none',
                h1Classes: h1 ? h1.className : 'none',
                price: price ? price.innerText : 'none',
                img: img ? img.src : 'none'
            };
        });
        
        console.log(JSON.stringify(data, null, 2));
        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
