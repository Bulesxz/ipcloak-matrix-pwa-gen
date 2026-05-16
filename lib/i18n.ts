/**
 * 极简 i18n 字典
 * - 安装页 (zh / en) 文案
 * - 官网首页 + 编辑器文案
 *
 * 用法: const t = useT(lang); t('install')
 */

import type { AppLanguage } from '@/lib/db';

export const dict = {
  zh: {
    // -- install page --
    install: '安装到主屏幕',
    installed: '已安装到主屏幕',
    downloadApk: '下载 APK',
    apkUrlMissing: 'APK 下载链接尚未配置',
    iosShare: '点击底部 ⬆️ 分享按钮安装',
    iosStep1: '点击 Safari 底部 分享 按钮',
    iosStep2: '选择 "添加到主屏幕"',
    iosStep3: '点击 "添加" 完成安装',
    unsupportedTitle: '无法自动安装',
    unsupportedHint: '请用 Chrome 浏览器右上角 ⋮ 菜单 → 安装应用，或 Safari 底部 分享 → 添加到主屏幕。',
    detecting: '检测中...',
    openWebsite: '直接访问网站',
    poweredBy: 'Powered by PWA Installer',
    // -- playstore template --
    rating: '评分',
    reviews: '条评论',
    downloads: '下载',
    aboutApp: '应用介绍',
    screenshots: '截图',
    // -- site (home) --
    siteTitle: 'ipcloak.ai · PWA 安装页生成器 + 像素跟踪',
    siteHero: '一键将任何网站<br/>变成可安装的 App',
    siteSub: '输入网站 URL，秒级生成精美 PWA 安装页 + 支持 Facebook / TikTok / Kwai 像素安装跟踪',
    siteCTA: '立即生成',
    siteScanning: '扫描中...',
    siteFeature1: '即时预览',
    siteFeature2: '智能提取',
    siteFeature3: '像素跟踪',
    siteFeature1Desc: '实时预览安装页在移动设备上的效果',
    siteFeature2Desc: '自动爬取 manifest 和 meta 标签提取最佳资源',
    siteFeature3Desc: '安装成功上报 FB / TT / Kwai 广告平台像素',
    // -- editor --
    editorTitle: '自定义安装页',
    editorSub: '编辑 App 信息 / 选模板 / 配像素跟踪',
    editorAppName: 'App 名称',
    editorDesc: 'App 描述',
    editorIcon: '图标 URL',
    editorBg: '背景色',
    editorLanguage: '安装页语言',
    editorTemplate: '模板',
    editorTemplateClassic: '经典 (居中卡片)',
    editorTemplatePlaystore: 'Google Play 风格',
    editorTemplateFloating: '大图 + 悬浮按钮',
    editorReviews: '评分与下载量 (Google Play 模板可选)',
    editorRating: '评分 (0-5)',
    editorReviewCount: '评论数 (展示文案)',
    editorDownloads: '下载量 (展示文案)',
    editorScreenshots: '截图 URL (Google Play 模板可选, 每行一个, 最多 5 张)',
    editorPixel: '像素跟踪 · 安装成功上报',
    editorPixelPlatform: '广告平台',
    editorPixelNone: '不配置 (跳过像素)',
    editorPixelEvent: '安装成功上报的事件名',
    editorPixelValue: '转化金额 (可选)',
    editorPixelCurrency: '货币',
    editorGenerate: '生成安装页',
    editorGenerating: '生成中...',
    editorBack: '返回首页',
    editorLivePreview: '实时预览',
  },
  en: {
    // -- install page --
    install: 'Add to Home Screen',
    installed: 'Installed on Home Screen',
    downloadApk: 'Download APK',
    apkUrlMissing: 'APK download URL not configured',
    iosShare: 'Tap the ⬆️ Share button below',
    iosStep1: 'Tap Safari Share button at the bottom',
    iosStep2: 'Select "Add to Home Screen"',
    iosStep3: 'Tap "Add" to finish installing',
    unsupportedTitle: 'Cannot install automatically',
    unsupportedHint: 'Open Chrome menu (⋮ top-right) → Install App, or Safari Share (bottom) → Add to Home Screen.',
    detecting: 'Detecting...',
    openWebsite: 'Open Website',
    poweredBy: 'Powered by PWA Installer',
    // -- playstore template --
    rating: 'Rating',
    reviews: 'reviews',
    downloads: 'Downloads',
    aboutApp: 'About this app',
    screenshots: 'Screenshots',
    // -- site (home) --
    siteTitle: 'ipcloak.ai · PWA Installer Generator + Pixel Tracking',
    siteHero: 'Turn any website<br/>into an installable App',
    siteSub: 'Enter a URL, generate a beautiful PWA install page in seconds, with Facebook / TikTok / Kwai pixel tracking on install success.',
    siteCTA: 'Generate Now',
    siteScanning: 'Scanning...',
    siteFeature1: 'Live Preview',
    siteFeature2: 'Smart Extract',
    siteFeature3: 'Pixel Tracking',
    siteFeature1Desc: 'See how your install page looks on mobile in real time',
    siteFeature2Desc: 'Auto-crawl manifest and meta tags to pick the best assets',
    siteFeature3Desc: 'Fire FB / TT / Kwai pixel events on successful install',
    // -- editor --
    editorTitle: 'Customize Install Page',
    editorSub: 'Edit info / pick template / configure pixel tracking',
    editorAppName: 'App Name',
    editorDesc: 'Description',
    editorIcon: 'Icon URL',
    editorBg: 'Background Color',
    editorLanguage: 'Install Page Language',
    editorTemplate: 'Template',
    editorTemplateClassic: 'Classic (Centered Card)',
    editorTemplatePlaystore: 'Google Play Style',
    editorTemplateFloating: 'Hero Image + Floating Button',
    editorReviews: 'Rating & Downloads (PlayStore template, optional)',
    editorRating: 'Rating (0-5)',
    editorReviewCount: 'Review Count (display text)',
    editorDownloads: 'Downloads (display text)',
    editorScreenshots: 'Screenshot URLs (PlayStore template optional, one per line, max 5)',
    editorPixel: 'Pixel Tracking · Fire on install',
    editorPixelPlatform: 'Ad Platform',
    editorPixelNone: 'Not configured (skip pixel)',
    editorPixelEvent: 'Event name on install success',
    editorPixelValue: 'Conversion value (optional)',
    editorPixelCurrency: 'Currency',
    editorGenerate: 'Generate Install Page',
    editorGenerating: 'Generating...',
    editorBack: 'Back to Home',
    editorLivePreview: 'Live Preview',
  },
} as const;

// 用 Record<string, string> 而不是 typeof dict.zh 字面量推断, 避免严格类型冲突
export type Dict = Record<keyof typeof dict.zh, string>;
export type DictKey = keyof Dict;

export function t(lang: AppLanguage | undefined, key: DictKey): string {
  const l = lang || 'zh';
  return (dict[l] as Record<string, string>)?.[key] || (dict.zh as Record<string, string>)[key] || key;
}
