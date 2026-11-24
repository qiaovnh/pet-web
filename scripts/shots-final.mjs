import puppeteer from 'puppeteer-core';
const BASE = 'http://localhost:3210';
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--user-data-dir=/tmp/sf-${Date.now()}`] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

const setLocale = (l) => page.evaluate(async (x) => fetch('/api/locale', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ locale: x }) }), l);

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
await setLocale('ar');
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: '/tmp/final-ar.png' });

await setLocale('ja');
await page.goto(`${BASE}/products/jade-cloud`, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: '/tmp/final-ja-pdp.png' });

await setLocale('en');
await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle2' });
await page.type('#password', 'inaue-admin');
await page.click('button[type="submit"]');
await page.waitForFunction(() => location.pathname === '/admin', { timeout: 15000 }).catch(()=>{});
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: '/tmp/final-admin.png' });

await page.goto(`${BASE}/admin/products`, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: '/tmp/final-admin-products.png' });

await page.goto(`${BASE}/admin/products/earl-grey-supreme`, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: '/tmp/final-admin-edit.png', fullPage: false });

console.log('shots done');
await browser.close();
