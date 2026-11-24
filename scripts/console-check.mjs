import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--user-data-dir=/tmp/cc-${Date.now()}`]});
for (const path of ['/', '/collections/all/', '/products/earl-grey-supreme/']) {
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,160)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0,160)));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url().slice(0,120)));
  await page.goto('http://localhost:3210'+path, {waitUntil:'networkidle0', timeout:45000});
  const m = await page.evaluate(() => ({h: document.body.scrollHeight, imgs: [...document.images].filter(i=>!i.complete||i.naturalWidth===0).length, total: document.images.length}));
  console.log(path, '| height', m.h, '| brokenImgs', m.imgs+'/'+m.total, '| errors', errs.length ? errs.slice(0,3) : 'none');
  await page.close();
}
await browser.close();
