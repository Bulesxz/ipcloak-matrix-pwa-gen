#!/usr/bin/env node
/**
 * Puppeteer 录制脚本 — 把 promo.html 逐帧截图
 *
 * 用法:
 *   node scripts/video/record.js zh   # 录中文版
 *   node scripts/video/record.js en   # 录英文版
 *
 * 输出: scripts/video/dist/frames-{lang}/frame-00000.png ... frame-01499.png
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const LANG = process.argv[2] === 'en' ? 'en' : 'zh';
const HTML_PATH = path.join(__dirname, 'promo.html');
const FRAMES_DIR = path.join(__dirname, 'dist', `frames-${LANG}`);

const WIDTH = 1080;
const HEIGHT = 1920;
// FPS / DURATION 由 promo.html 通过 window.__fps / window.__totalSeconds 决定 (HTML 是唯一真相)
// 此处仅作 fallback
const DEFAULT_FPS = 60;
const DEFAULT_DURATION = 30.0;

async function main() {
  console.log(`🎬 Recording ${LANG.toUpperCase()} version`);
  console.log(`   ${WIDTH}x${HEIGHT}`);

  // 清空旧帧
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--enable-font-antialiasing',
      // 关键: 禁止使用真实时间, 否则 CSS animation 截图会随系统时间漂
      '--disable-features=PaintHolding',
    ],
  });

  const page = await browser.newPage();

  // 注入"puppeteer 模式"标记 — 让 HTML 内的自动播放不要启动
  await page.evaluateOnNewDocument(() => {
    window.__puppeteerControlled = true;
  });

  // 加载 HTML
  const url = `file://${HTML_PATH}#${LANG}`;
  console.log(`📄 Loading: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle0' });

  // 等字体 + DOM ready
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 500));

  // 检查 __setFrame 是否存在 + 从 HTML 取 FPS / TotalFrames
  const meta = await page.evaluate(() => {
    if (typeof window.__setFrame !== 'function') return null;
    return {
      fps: window.__fps || 60,
      totalSeconds: window.__totalSeconds || 30,
      totalFrames: window.__totalFrames || Math.ceil((window.__totalSeconds || 30) * (window.__fps || 60)),
    };
  });
  if (!meta) {
    throw new Error('window.__setFrame not exposed — check promo.html script tag');
  }
  const FPS = meta.fps;
  const TOTAL_FRAMES = meta.totalFrames;
  console.log(`   ${TOTAL_FRAMES} frames @ ${FPS}fps = ${meta.totalSeconds}s (from HTML)`);

  console.log(`📸 Capturing frames...`);
  const t0 = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    // 驱动 HTML 到帧 i
    await page.evaluate(idx => window.__setFrame(idx), i);

    // 等一帧让 DOM 应用 (CSS transition 需要时间, 但我们已经把所有过渡改成手动 lerp, 所以这个等待主要是给浏览器一个 paint 机会)
    await new Promise(r => setTimeout(r, 8));

    const filename = path.join(FRAMES_DIR, `frame-${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: filename, omitBackground: false, type: 'png' });

    // 进度
    if (i % 60 === 0 || i === TOTAL_FRAMES - 1) {
      const pct = ((i + 1) / TOTAL_FRAMES * 100).toFixed(1);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const eta = (((Date.now() - t0) / (i + 1)) * (TOTAL_FRAMES - i - 1) / 1000).toFixed(0);
      process.stdout.write(`\r  frame ${String(i + 1).padStart(4)}/${TOTAL_FRAMES}  ${pct}%  elapsed: ${elapsed}s  ETA: ${eta}s    `);
    }
  }

  console.log('');
  console.log(`✅ Captured ${TOTAL_FRAMES} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`   → ${FRAMES_DIR}`);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
