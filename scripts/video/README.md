# IPCloak.AI W2A — Promo Video Pipeline

零依赖的 HTML → MP4 流水线。改文案/视觉只动 `promo.html`, 一行命令出新视频。

## 输出规格
- **分辨率**: 1080 × 1920 (9:16 竖屏, 适配抖音/视频号/小红书/Reels)
- **时长**: 25 秒
- **帧率**: 60 fps (1500 帧)
- **编码**: H.264 High Profile, CRF 18, faststart
- **平均体积**: ~15-25 MB

## 一键生成

```bash
# 中文版
npm run video:zh

# 英文版
npm run video:en

# 中英双语都生成
npm run video

# 浏览器预览(自动循环播放)
npm run video:preview
```

输出在 `scripts/video/dist/`:
- `promo-zh.mp4` — 中文版
- `promo-en.mp4` — 英文版
- `frames-zh/`, `frames-en/` — 临时帧目录 (gitignored)

## 文件结构

```
scripts/video/
├── promo.html      # 视觉 + 时间轴 (改这里)
├── record.js       # Puppeteer 逐帧截图驱动
├── build.sh        # ffmpeg PNG → MP4
├── smoke.js        # 7 关键帧快速验证 (改完 promo.html 跑这个先)
└── dist/           # 输出 (gitignored)
```

## 7 个场景时间线 (`promo.html` 顶部 `TIMELINE`)

| # | 时段 | 内容 | 动画 |
|---|------|------|------|
| 1 | 0.0 - 2.5s | 痛点 数字滚动到 80% | `lerp(0, 80, easeOut)` |
| 2 | 2.6 - 5.0s | W2A 一键生成 App | display 切换 |
| 3 | 5.1 - 9.0s | 3 套模板手机演示 | 1.3s/张轮播 |
| 4 | 9.1 - 13s | PWA + APK 双分发 | 卡片显示 |
| 5 | 13s - 17s | FB/TT/Kwai 像素 logo + 波纹 | scale 弹簧 + ping 扩散 |
| 6 | 17s - 21s | 3000+ 投流人使用 | 数字滚动 + badge |
| 7 | 21s - 25s | pwa.ipcloak.ai CTA | 渐变按钮流动 |

## 改动指南

### 改文案
直接编辑 `promo.html` 里的 `data-zh="..." data-en="..."` 属性, 然后:
```bash
npm run video       # 重新出双语版
```

### 改时长 / 节奏
1. 顶部 `const TOTAL = 25.0;` 改总时长
2. 修改 `TIMELINE` 数组的 `start` / `end`
3. `record.js` 里 `DURATION` 同步改
4. 重跑 `npm run video`

### 改视觉(色彩/字号/布局)
直接改 `promo.html` 的 CSS, 跑:
```bash
node scripts/video/smoke.js   # 7 关键帧快速验证
open /tmp/smoke-frames/       # 肉眼审
```
没问题后再 `npm run video` 出正式版。

## 为什么不用 CSS Animation / Transition?

Puppeteer 同步截图时, CSS animation/transition 的状态由系统时钟驱动, 与帧序号没有强绑定 — 截到的状态不可重现。所有动画都改用 **JS lerp** 计算, 由 `__setFrame(idx)` 同步设置 DOM 属性, 实现帧精确控制。

## 平台发布建议

| 平台 | 用哪个 | 备注 |
|------|--------|------|
| 抖音 / 视频号 / 小红书 | `promo-zh.mp4` | 原生 9:16, 直接传 |
| Instagram Reels / TikTok 海外 | `promo-en.mp4` | 加封面文字效果更好 |
| YouTube Shorts | 任选, 但建议手动加字幕 | 9:16 直传, 标题用 W2A 关键词 |
| LinkedIn | 不推荐 | LinkedIn 偏好横屏, 后续做个 16:9 版本 |
| 微信公众号文章 | 任选, 嵌入即可 | |

## 依赖

- Node 18+
- ffmpeg (`brew install ffmpeg`)
- Puppeteer (npm install 自动装 Chromium)
