import { chromium } from 'playwright';

(async () => {
    try {
        const url = 'https://inyourorigin.com/urun/yogun-lifting-paketi/';
        const res = await fetch(url);
        const html = await res.text();
        
        const { DOMParser } = await import('xmldom');
        // Wait, standard fetch in node doesn't have DOMParser natively, so I'll just regex it or use Cheerio (it's not installed, maybe use jsdom or regex).
        // Actually since we are inside `page.evaluate` in the real scraper, we DO have DOMParser.
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
