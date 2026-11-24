import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL || 'http://localhost:3220';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'INAUE-ADMIN';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--user-data-dir=/tmp/paw-${Date.now()}`],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

// store
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
check('首页渲染', (await page.title()).includes('INAUE'));
const homeText = await page.evaluate(() => document.body.innerText);
check('英雄区文案', homeText.includes('Never Lose Them Again'));

await page.goto(`${BASE}/collections/all`, { waitUntil: 'networkidle2' });
const plp = await page.evaluate(() => document.querySelector('main').innerText);
check('商品列表', plp.includes('DOG 6 Tracker') && plp.includes('CAT 6 Tracker'));

await page.goto(`${BASE}/collections/all?caffeine=cat`, { waitUntil: 'networkidle2' });
const cats = await page.evaluate(() => document.querySelector('main').innerText);
check('按宠物筛选', cats.includes('CAT 6') && !cats.includes('DOG 6 Tracker'), cats.match(/\d+\s*PRODUCTS/i)?.[0]);

// pdp + cart
await page.goto(`${BASE}/products/dog-6-tracker`, { waitUntil: 'networkidle2' });
const thumbs = await page.$$eval('[aria-label^="查看第"]', (els) => els.length);
check('图集缩略图', thumbs >= 3, String(thumbs));
const pdpHtml = await page.content();
check('Product 结构化数据', pdpHtml.includes('"@type":"Product"'));

for (const b of await page.$$('button')) {
  const t = await page.evaluate((el) => el.textContent, b);
  if (t && t.includes('Add to Cart')) { await b.click(); break; }
}
await new Promise((r) => setTimeout(r, 1200));
const drawer = (await page.evaluate(() => document.body.innerText)).toUpperCase();
check('加购并打开抽屉', drawer.includes('DOG 6 TRACKER') && drawer.includes('SUBTOTAL'));

// checkout
await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle2' });
await page.type('#email', 'demo@inaue.com');
await page.type('#name', 'Ada Lovelace');
await page.type('#address', '12 Garden Row');
await page.type('#city', 'Portland');
await page.type('#postalCode', '97209');
await page.click('button[type="submit"]');
await page.waitForFunction(() => location.pathname.includes('/checkout/success'), { timeout: 20000 }).catch(() => {});
check('下单成功页', page.url().includes('/checkout/success'), page.url());

// currency + locale
await page.evaluate(async () => {
  await fetch('/api/currency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'EUR' }) });
});
await page.goto(`${BASE}/products/cat-6-tracker`, { waitUntil: 'networkidle2' });
check('切换欧元', (await page.evaluate(() => document.body.innerText)).includes('€'));
await page.evaluate(async () => {
  await fetch('/api/currency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'USD' }) });
  await fetch('/api/locale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale: 'zh-TW' }) });
});
await page.goto(`${BASE}/collections/all`, { waitUntil: 'networkidle2' });
const tw = await page.evaluate(() => document.querySelector('main').innerText);
check('繁体中文生效', /[\u4e00-\u9fff]/.test(tw), tw.split('\n')[0]);
await page.evaluate(async () => {
  await fetch('/api/locale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale: 'ar' }) });
});
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
check('阿拉伯语 RTL', (await page.evaluate(() => document.documentElement.dir)) === 'rtl');
await page.evaluate(async () => {
  await fetch('/api/locale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale: 'en' }) });
});

// geo
const llms = await (await fetch(`${BASE}/llms.txt`)).text();
check('llms.txt', llms.includes('INAUE') && llms.includes('DOG 6 Tracker'));
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
check('sitemap', sitemap.includes('/products/dog-6-tracker'));
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
check('robots 允许 AI', /GPTBot/.test(robots));

// admin
await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle2' });
await page.type('#password', ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForFunction(() => location.pathname === '/admin', { timeout: 15000 }).catch(() => {});
const dash = await page.evaluate(() => document.body.innerText);
check('后台登录（中文）', dash.includes('仪表盘'));

const created = await page.evaluate(async (B) => {
  const res = await fetch(`${B}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Mini Tracker Test', handle: 'mini-tracker-test', subtitle: 'Test', notes: 't',
      categories: ['cats'], images: ['/img/p-cat6mini.jpg'],
      sizes: [{ label: 'Device only', price: 29.99 }],
      blurb: 't', origin: 't', caffeine: 'Cat', ingredients: 't', preparation: 't', story: 't',
    }),
  });
  return { status: res.status, body: await res.json() };
}, BASE);
check('后台新建商品', created.status === 200 && created.body.ok === true, created.body.error ?? '');

await page.goto(`${BASE}/products/mini-tracker-test`, { waitUntil: 'networkidle2' });
check('新商品前台可见', (await page.evaluate(() => document.body.innerText)).includes('Mini Tracker Test'));

const del = await page.evaluate(async (B) => (await fetch(`${B}/api/admin/products/mini-tracker-test`, { method: 'DELETE' })).status, BASE);
check('删除商品', del === 200);

// upload
const upload = await page.evaluate(async (B) => {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const fd = new FormData();
  fd.append('file', new File([bytes], 'x.png', { type: 'image/png' }));
  const res = await fetch(`${B}/api/admin/upload`, { method: 'POST', body: fd });
  return { status: res.status, body: await res.json() };
}, BASE);
check('图片上传', upload.status === 200 && upload.body.ok === true, upload.body.url ?? '');

check('无页面报错', errors.length === 0, errors.join(' | '));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
