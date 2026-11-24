import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required',`--user-data-dir=/tmp/vc-${Date.now()}`]});
const p = await b.newPage();
await p.setViewport({width:1440,height:900});
await p.goto('http://localhost:3220/',{waitUntil:'networkidle2'});
await new Promise(r=>setTimeout(r,2500));
const info = await p.evaluate(() => {
  const v = document.querySelector('video');
  if (!v) return { found: false };
  return { found: true, src: v.currentSrc.split('/').pop(), paused: v.paused, t: v.currentTime, w: v.videoWidth, h: v.videoHeight, ready: v.readyState, loop: v.loop, muted: v.muted };
});
console.log(JSON.stringify(info));
await p.screenshot({path:'/tmp/video-hero.png'});
await b.close();
