import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL || 'http://localhost:3210';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// 同 e2e-admin.mjs：生产模式下必须用实际配置的管理密码
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'inaue-admin';
const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' :: ' + detail : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--user-data-dir=/tmp/geo-${Date.now()}`],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

// ---------- GEO surfaces ----------
const llms = await (await fetch(`${BASE}/llms.txt`)).text();
check('llms.txt 生成', llms.includes('# INAUE') && llms.includes('关键事实') && llms.includes('Earl Grey Supreme'));

const llmsFull = await (await fetch(`${BASE}/llms-full.txt`)).text();
check('llms-full.txt 生成', llmsFull.includes('商品目录') && llmsFull.includes('/products/earl-grey-supreme'));

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
check('sitemap 含商品与集合', sitemap.includes('/products/earl-grey-supreme') && sitemap.includes('/collections/all'));

const robots = await (await fetch(`${BASE}/robots.txt`)).text();
check('robots 允许 AI 爬虫', /GPTBot/.test(robots) && /Sitemap:/.test(robots));

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const homeHtml = await page.content();
check('首页输出 FAQPage 结构化数据', homeHtml.includes('FAQPage') && homeHtml.includes('application/ld+json'));
check('首页输出 Organization', homeHtml.includes('Organization'));

await page.goto(`${BASE}/products/earl-grey-supreme`, { waitUntil: 'networkidle2' });
const pdpHtml = await page.content();
check('商品页输出 Product 结构化数据', pdpHtml.includes('"@type":"Product"') && pdpHtml.includes('priceCurrency'));

// ---------- admin login ----------
await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle2' });
const loginText = await page.evaluate(() => document.body.innerText);
check('后台登录页为简体中文', loginText.includes('管理密码') && loginText.includes('登录'));

await page.evaluate(async (B, P) => {
  await fetch(`${B}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: P }) });
}, BASE, ADMIN_PASSWORD);

// ---------- 页面管理 ----------
await page.goto(`${BASE}/admin/pages`, { waitUntil: 'networkidle2' });
const pagesText = await page.evaluate(() => document.body.innerText);
check('页面管理页渲染', pagesText.includes('首页 Banner') && pagesText.includes('导航条'));

const contentRes = await page.evaluate(async (B) => {
  const current = await (await fetch(`${B}/api/admin/content`)).json();
  const banners = current.content.banners.map((b) =>
    b.placement === 'home-hero' ? { ...b, title: 'E2E 测试标题', ctaLabel: '点我' } : b,
  );
  const nav = [
    ...current.content.nav,
    { id: 'nav-e2e', label: '测试菜单', href: '/search', visible: true, order: 99, children: [] },
  ];
  const r = await fetch(`${B}/api/admin/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ banners, nav }),
  });
  return { status: r.status, ok: (await r.json()).ok };
}, BASE);
check('保存 Banner 与导航', contentRes.status === 200 && contentRes.ok === true);

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const homeText = await page.evaluate(() => document.body.innerText);
check('前台主视觉读取 Banner', homeText.includes('E2E 测试标题') && homeText.includes('点我'));
check('前台导航读取新增菜单', homeText.includes('测试菜单'));

// ---------- GEO 编辑 ----------
await page.goto(`${BASE}/admin/geo`, { waitUntil: 'networkidle2' });
const geoText = await page.evaluate(() => document.body.innerText);
check('GEO 页渲染检查清单', geoText.includes('检查清单') && geoText.includes('llms.txt'));

const geoRes = await page.evaluate(async (B) => {
  const current = await (await fetch(`${B}/api/admin/geo`)).json();
  const geo = current.geo;
  const r = await fetch(`${B}/api/admin/geo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...geo,
      faqs: [...geo.faqs, { id: 'faq-e2e', question: 'E2E 问题：怎么保存茶叶？', answer: '密封、避光、阴凉处保存。' }],
    }),
  });
  return { status: r.status, ok: (await r.json()).ok };
}, BASE);
check('保存 GEO 设置', geoRes.status === 200 && geoRes.ok === true);

const llms2 = await (await fetch(`${BASE}/llms.txt`)).text();
check('llms.txt 反映新 FAQ', llms2.includes('E2E 问题：怎么保存茶叶？'));

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
const home2 = await page.content();
check('首页 FAQPage 反映新问答', home2.includes('E2E 问题'));

// ---------- reset ----------
await page.evaluate(async (B) => {
  const current = await (await fetch(`${B}/api/admin/content`)).json();
  const banners = current.content.banners.map((b) =>
    b.placement === 'home-hero'
      ? { ...b, title: 'Tea Is the Moment', ctaLabel: 'Shop Holiday' }
      : b,
  );
  const nav = current.content.nav.filter((g) => g.id !== 'nav-e2e');
  await fetch(`${B}/api/admin/content`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ banners, nav }) });

  const g = await (await fetch(`${B}/api/admin/geo`)).json();
  await fetch(`${B}/api/admin/geo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...g.geo, faqs: g.geo.faqs.filter((f) => f.id !== 'faq-e2e') }),
  });
}, BASE);

check('无页面报错', errors.length === 0, errors.join(' | '));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
