import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--user-data-dir=/tmp/ic-${Date.now()}`]});
for (const p of ['/', '/collections/all/', '/products/earl-grey-supreme/']) {
  const page = await browser.newPage();
  const bad = [];
  page.on('response', r => { if (r.status() >= 400) bad.push(r.status()+' '+r.url().slice(0,100)); });
  await page.goto('http://localhost:3210'+p, {waitUntil:'networkidle0', timeout:45000});
  await page.evaluate(async () => { for (let y=0; y<document.body.scrollHeight; y+=700){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,90)); } });
  await new Promise(r=>setTimeout(r,1800));
  const broken = await page.evaluate(() => [...document.images].filter(i=>i.naturalWidth===0).map(i=>i.currentSrc.split('/').pop()));
  console.log(p, '| http>=400:', bad.length? bad.slice(0,4): 'none', '| broken:', broken.length? broken: 0);
  await page.close();
}
await browser.close();
