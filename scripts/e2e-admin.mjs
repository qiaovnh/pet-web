import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL || 'http://localhost:3210';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// 管理密码从环境变量读取。生产模式下（NODE_ENV=production 或 VERCEL=1）
// 后台会拒绝弱默认密码，所以这里必须用实际配置的那个。
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'inaue-admin';
const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--user-data-dir=/tmp/i18n-${Date.now()}`],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 140)));

const setLocale = async (locale) =>
  page.evaluate(async (l) => {
    const r = await fetch('/api/locale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale: l }) });
    return r.status;
  }, locale);

// ---------- i18n ----------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const enHtml = await page.content();
check('english default', enHtml.includes('Tea Is the Moment') && enHtml.includes('lang="en"'));

await setLocale('ja');
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const jaHtml = await page.content();
check('japanese applied', jaHtml.includes('lang="ja"') && /[\u3040-\u30ff]/.test(jaHtml));
await page.screenshot({ path: '/tmp/locale-ja.png' });

await setLocale('ar');
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const arHtml = await page.content();
const dir = await page.evaluate(() => document.documentElement.dir);
check('arabic applied with RTL', arHtml.includes('lang="ar"') && dir === 'rtl', `dir=${dir}`);
await page.screenshot({ path: '/tmp/locale-ar.png' });

await setLocale('zh-TW');
await page.goto(`${BASE}/collections/all`, { waitUntil: 'networkidle2' });
const twText = await page.evaluate(() => document.querySelector('main').innerText);
check('zh-TW collection page', /[\u4e00-\u9fff]/.test(twText), twText.split('\n')[0]);

await setLocale('en');

// ---------- admin auth ----------
const loginStatus = (password) =>
  page.evaluate(async (p) => {
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: p }) });
    return r.status;
  }, password);

check('admin rejects wrong password', (await loginStatus('nope')) === 401);
check('admin accepts correct password', (await loginStatus(ADMIN_PASSWORD)) === 200);

await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2' });
const dash = await page.evaluate(() => document.body.innerText);
check('dashboard renders', dash.includes('仪表盘') && dash.includes('商品'), page.url());

// ---------- image upload ----------
const upload = await page.evaluate(async (B) => {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const fd = new FormData();
  fd.append('file', new File([bytes], 'e2e.png', { type: 'image/png' }));
  const res = await fetch(`${B}/api/admin/upload`, { method: 'POST', body: fd });
  return { status: res.status, body: await res.json() };
}, BASE);
check('上传图片接口', upload.status === 200 && upload.body.ok === true, upload.body.url ?? upload.body.error);

const mediaRes = await page.evaluate(async (B, url) => {
  const res = await fetch(`${B}${url}`);
  return { status: res.status, type: res.headers.get('content-type') };
}, BASE, upload.body.url ?? '/media/none.png');
check('上传后的图片可访问', mediaRes.status === 200 && (mediaRes.type ?? '').includes('image/'), `${mediaRes.status} ${mediaRes.type}`);

const rejected = await page.evaluate(async (B) => {
  const fd = new FormData();
  fd.append('file', new File(['not an image'], 'x.txt', { type: 'text/plain' }));
  const res = await fetch(`${B}/api/admin/upload`, { method: 'POST', body: fd });
  return res.status;
}, BASE);
check('拒绝非图片文件', rejected === 400, String(rejected));

// ---------- product CRUD ----------
const create = await page.evaluate(async (B) => {
  const r = await fetch(`${B}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Test Oolong 99',
      subtitle: 'Organic Oolong Tea',
      notes: 'Creamy | Floral',
      categories: ['oolong'],
      sizes: [{ label: '3 oz loose leaf', price: 21.5 }],
      blurb: 'A temp product created by the e2e suite.',
      origin: 'Anxi',
      caffeine: 'Medium',
      ingredients: 'Organic oolong tea',
      preparation: '195F, 45s',
      story: 'Temporary.',
      image: '/img/p-iron-goddess.jpg',
    }),
  });
  return { status: r.status, body: await r.json() };
}, BASE);
check('admin can create product', create.status === 200 && create.body.ok === true, create.body.error ?? '');

const handle = create.body.product?.handle ?? '';
await page.goto(`${BASE}/products/${handle}`, { waitUntil: 'networkidle2' });
const pdpText = await page.evaluate(() => document.body.innerText);
check('new product visible on storefront', pdpText.includes('Test Oolong 99'), handle);

const update = await page.evaluate(async (B, h) => {
  const r = await fetch(`${B}/api/admin/products/${h}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test Oolong 99', subtitle: 'Organic Oolong Tea', notes: 'Creamy | Floral', categories: ['oolong'], sizes: [{ label: '3 oz loose leaf', price: 33 }], blurb: 'Updated.', origin: 'Anxi', caffeine: 'Medium', ingredients: 'Tea', preparation: '195F', story: 'Temp', image: '/img/p-iron-goddess.jpg' }),
  });
  return r.status;
}, BASE, handle);
await page.goto(`${BASE}/products/${handle}`, { waitUntil: 'networkidle2' });
const updatedText = await page.evaluate(() => document.body.innerText);
check('edit updates price on storefront', update === 200 && updatedText.includes('33.00'), updatedText.match(/\$33\.00/)?.[0] ?? 'no match');

// ---------- gallery reorder ----------
const reorder = await page.evaluate(async (B) => {
  const one = await (await fetch(`${B}/api/admin/products/earl-grey-supreme`)).json();
  const p = one.product;
  const reversed = [...(p.images ?? [p.image])].reverse();
  const res = await fetch(`${B}/api/admin/products/earl-grey-supreme`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...p, images: reversed, image: reversed[0] }),
  });
  return { status: res.status, first: reversed[0] };
}, BASE);
check('保存图集顺序', reorder.status === 200, reorder.first);

await page.goto(`${BASE}/products/earl-grey-supreme`, { waitUntil: 'networkidle2' });
const cover = await page.$eval('[data-gallery-main]', (el) => el.getAttribute('src'));
check('排序后封面随之变化', cover === reorder.first, `${cover} vs ${reorder.first}`);

await page.evaluate(async (B) => {
  const one = await (await fetch(`${B}/api/admin/products/earl-grey-supreme`)).json();
  const p = one.product;
  const back = [...p.images].reverse();
  await fetch(`${B}/api/admin/products/earl-grey-supreme`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...p, images: back, image: back[0] }),
  });
}, BASE);

// ---------- settings ----------
const newAnnouncement = `E2E announcement ${Date.now() % 1000}`;
const settingsStatus = await page.evaluate(async (B, a) => {
  const r = await fetch(`${B}/api/admin/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ announcement: a }) });
  return r.status;
}, BASE, newAnnouncement);
await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const homeText = await page.evaluate(() => document.body.innerText);
check('settings flow to storefront', settingsStatus === 200 && homeText.toUpperCase().includes(newAnnouncement.toUpperCase()));

// ---------- cleanup ----------
const del = await page.evaluate(async (B, h) => {
  const r = await fetch(`${B}/api/admin/products/${h}`, { method: 'DELETE' });
  return r.status;
}, BASE, handle);
await page.goto(`${BASE}/products/${handle}`, { waitUntil: 'networkidle2' });
const goneStatus = await page.evaluate(() => document.title);
check('delete removes product', del === 200 && !goneStatus.includes('Test Oolong'), goneStatus);

// restore announcement
await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle2' });
await page.evaluate(async (B) => {
  await fetch(`${B}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ announcement: 'Free shipping on orders over $75 · 30-day freshness guarantee' }),
  });
}, BASE).catch(() => {});

// ---------- unauthorised ----------
const anon = await browser.createBrowserContext();
const anonPage = await anon.newPage();
await anonPage.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const anonStatus = await anonPage.evaluate(async (B) => (await fetch(`${B}/api/admin/products`)).status, BASE);
check('admin API rejects anonymous', anonStatus === 401, String(anonStatus));

const anonAdminPage = await anon.newPage();
await anonAdminPage.goto(`${BASE}/admin`, { waitUntil: 'networkidle2' });
check('admin page redirects anonymous to login', anonAdminPage.url().includes('/admin/login'), anonAdminPage.url());


check('no page errors', errors.length === 0, errors.join(' | '));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
