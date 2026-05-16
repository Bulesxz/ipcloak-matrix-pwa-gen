const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { window.__puppeteerControlled = true; });
  const url = `file://${path.join(__dirname, 'promo.html')}#zh`;
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 300));

  const checkpoints = [
    { t: 1.0, scene: 'scene-1', desc: '痛点 80%' },
    { t: 3.5, scene: 'scene-2', desc: 'W2A 标题' },
    { t: 7.0, scene: 'scene-3', desc: '手机模板演示' },
    { t: 11.0, scene: 'scene-4', desc: 'PWA + APK' },
    { t: 15.0, scene: 'scene-5', desc: '像素 logo' },
    { t: 19.0, scene: 'scene-6', desc: '3000+' },
    { t: 23.0, scene: 'scene-7', desc: 'CTA' },
  ];

  const outDir = '/tmp/smoke-frames';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const cp of checkpoints) {
    const idx = Math.floor(cp.t * 60);
    const info = await page.evaluate(i => window.__setFrame(i), idx);
    await new Promise(r => setTimeout(r, 50));
    const f = `${outDir}/checkpoint-${cp.t.toFixed(1)}s-${cp.scene}.png`;
    await page.screenshot({ path: f, type: 'png' });
    console.log(`✅ t=${cp.t}s scene=${info.scene} → ${cp.desc} → ${f}`);
  }
  await browser.close();
})();
