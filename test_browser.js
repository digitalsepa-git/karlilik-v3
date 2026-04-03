import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        let logs = [];
        page.on('console', msg => {
            logs.push(`[${msg.type()}] ${msg.text()}`);
        });
        
        console.log("Navigating to http://localhost:8888...");
        await page.goto('http://localhost:8888', { waitUntil: 'networkidle2', timeout: 15000 });
        
        // Wait another 3s just to be sure
        await new Promise(r => setTimeout(r, 3000));
        
        console.log("--- BROWSER CONSOLE LOGS ---");
        logs.forEach(l => console.log(l));
        console.log("----------------------------");
        
        await browser.close();
    } catch (e) {
        console.error("Puppeteer error:", e.message);
    }
})();
