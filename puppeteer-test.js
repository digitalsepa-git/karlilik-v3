import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const server = spawn('npm', ['run', 'dev'], { detached: true });

setTimeout(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        page.on('console', msg => {
            if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
        });
        page.on('pageerror', error => {
            console.log('PAGE EXCEPTION:', error.message);
        });
        await page.goto('http://localhost:5173/product', { waitUntil: 'networkidle2' });
        await browser.close();
    } catch(e) {
        console.error(e);
    }
    process.kill(-server.pid);
    process.exit(0);
}, 3000);
