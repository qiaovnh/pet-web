import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = process.argv[2];
const outDir = process.argv[3] || '/tmp/shots';
const width = Number(process.argv[4] || 1440);
const mode = process.argv[5] || 'sections';

fs.mkdirSync(outDir, { recursive: true });

const BLOCK = [
  'convertexperiments.com', 'truevaultcdn.com', 'google-analytics.com', 'googletagmanager.com',
  'klaviyo.com', 'gorgias', 'facebook.net', 'doubleclick.net', 'hotjar', 'clarity.ms',
  'bat.bing.com', 'tiktok', 'pinterest', 'attentive', 'postscript', 'criteo.com', 'snapchat',
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  protocolTimeout: 90000,
  args: [
    '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-breakpad',
    '--disable-crash-reporter', '--disable-dev-shm-usage', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', '--force-device-scale-factor=1',
    `--user-data-dir=/tmp/pptr-${Date.now()}`,
  ],
});

const page = await browser.newPage();
await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (BLOCK.some((b) => req.url().includes(b))) return req.abort().catch(() => {});
  req.continue().catch(() => {});
});
page.on('dialog', (d) => d.dismiss().catch(() => {}));

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
} catch (e) {
  console.error('goto:', e.message);
}
await new Promise((r) => setTimeout(r, 5000));

await page
  .evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 800) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 800));
  })
  .catch(() => {});

await page
  .evaluate(() => {
    document.querySelectorAll('[class*="cart-drawer"],[class*="drawer"],[class*="overlay"],[class*="backdrop"],[class*="modal"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 280 || r.height > 280) el.style.setProperty('display', 'none', 'important');
    });
    document.documentElement.style.overflow = 'auto';
  })
  .catch(() => {});
await new Promise((r) => setTimeout(r, 600));

const sections = await page.evaluate(() =>
  Array.from(document.querySelectorAll('div[id^="shopify-section-"]')).map((el, i) => {
    const r = el.getBoundingClientRect();
    return {
      i,
      id: el.id,
      short: el.id.replace(/^shopify-section-template--\d+__?/, '').slice(0, 40),
      top: Math.round(r.top + window.scrollY),
      h: Math.round(r.height),
      w: Math.round(r.width),
    };
  }),
);
fs.writeFileSync(`${outDir}/sections.json`, JSON.stringify(sections, null, 2));

if (mode === 'slices') {
  const total = await page.evaluate(() => document.body.scrollHeight);
  const step = 1150;
  for (let y = 0, i = 0; y < total; y += step, i++) {
    await page.screenshot({
      path: `${outDir}/slice-${String(i).padStart(2, '0')}.png`,
      clip: { x: 0, y, width, height: Math.min(step, total - y) },
    });
  }
  console.log('slices:', Math.ceil(total / step), 'height:', total);
} else if (mode === 'full') {
  await page.screenshot({ path: `${outDir}/full.png`, fullPage: true, captureBeyondViewport: true });
} else {
  const handles = await page.$$('div[id^="shopify-section-"]');
  for (let i = 0; i < handles.length; i++) {
    const s = sections[i];
    if (!s || s.h < 20) continue;
    try {
      await handles[i].screenshot({ path: `${outDir}/${String(i).padStart(2, '0')}-${s.short.replace(/[^a-zA-Z0-9_-]/g, '')}.png` });
    } catch (e) {
      console.error(`sec ${i} fail:`, e.message);
    }
  }
}

console.log(JSON.stringify(sections.map((s) => `${s.i} ${s.h}px ${s.short}`), null, 1));
await browser.close();
