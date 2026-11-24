import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = process.argv[2];
const out = process.argv[3];
const width = Number(process.argv[4] || 1440);
fs.mkdirSync('/tmp', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-breakpad', '--disable-dev-shm-usage', `--user-data-dir=/tmp/pptr-${Date.now()}`],
});
const page = await browser.newPage();
await page.setViewport({ width, height: 1000 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
await new Promise((r) => setTimeout(r, 1200));
await page.click('button[aria-label="Cart"]');
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: out });
console.log('saved', out);
await browser.close();
