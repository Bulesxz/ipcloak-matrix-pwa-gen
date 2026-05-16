/**
 * PlayStore 模板 - 高度还原 Google Play (移动端) 详情页
 *
 * 视觉对照: 真实 Google Play 移动端
 *   顶部: 彩色 Google Play logo + 搜索/帮助/头像
 *   App 区: icon 左 + name + 绿色 dev + "包含广告 · 应用内购"
 *   3 列统计: 评分/评价数 | 年龄分级 | 下载量
 *   深绿色 "安装" 大按钮 (圆角 8px, 不是 full)
 *   "分享 / 添加到心愿单" 灰色文字按钮 (左右两个)
 *   "在您的设备上可以使用此应用" 灰条
 *   截图: 1:1.8 大卡片横向轮播
 *   "游戏简介 / About this app" 标题 + 简介
 *   底部 tab bar: 游戏 / 应用 / 图书 / 儿童
 */
import InstallPrompt from '@/components/install-prompt';
import { Star, Search, HelpCircle, Share2, Bookmark, Smartphone, ChevronRight, Gamepad2, Grid3x3, BookOpen, Baby } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { AppConfig } from '@/lib/db';

export default function PlaystoreTemplate({ app }: { app: AppConfig }) {
    const lang = app.language || 'zh';
    const rating = app.reviews?.rating;
    const reviewCount = app.reviews?.reviewCount;
    const downloads = app.reviews?.downloads;
    const screenshots = app.screenshots || [];
    const dev = tryHostname(app.url);
    const isZh = lang === 'zh';

    return (
        <div className="min-h-screen bg-white text-neutral-900 pb-20">
            {/* ============ 顶部 bar: Google Play logo + 图标按钮 ============ */}
            <div className="sticky top-0 z-50 bg-white border-b border-neutral-100 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <GooglePlayLogo />
                    <span className="text-lg font-medium text-neutral-700">Google Play</span>
                </div>
                <div className="flex items-center gap-4">
                    <Search className="w-5 h-5 text-neutral-700" strokeWidth={2.2} />
                    <HelpCircle className="w-5 h-5 text-neutral-700" strokeWidth={2.2} />
                    <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
                        I
                    </div>
                </div>
            </div>

            <div className="px-5 max-w-2xl mx-auto">
                {/* ============ App 头部 ============ */}
                <div className="flex gap-4 items-start pt-5 mb-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm bg-neutral-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[22px] font-medium leading-tight mb-1 line-clamp-2 text-neutral-900">{app.name}</h1>
                        <div className="text-sm text-emerald-700 font-medium truncate">{dev}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                            {isZh ? '包含广告 · 应用内购商品' : 'Contains ads · In-app purchases'}
                        </div>
                    </div>
                </div>

                {/* ============ 3 列统计 ============ */}
                <div className="flex items-stretch mb-5">
                    {/* 评分 */}
                    <div className="flex-1 py-2 text-center border-r border-neutral-100">
                        <div className="flex items-center justify-center gap-1 font-medium text-[15px] text-neutral-900">
                            {rating !== undefined ? rating.toFixed(1) : '—'}
                            <Star className="w-3.5 h-3.5 fill-neutral-700 text-neutral-700" />
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5 truncate px-1">
                            {reviewCount || (isZh ? '暂无评价' : 'No reviews')}
                        </div>
                    </div>

                    {/* 年龄分级 */}
                    <div className="flex-1 py-2 text-center border-r border-neutral-100">
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded border-[1.5px] border-neutral-400 text-[11px] font-bold text-neutral-700">
                            3+
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5 truncate px-1">
                            {isZh ? '3 岁以上' : 'Rated 3+'}
                        </div>
                    </div>

                    {/* 下载量 */}
                    <div className="flex-1 py-2 text-center">
                        <div className="font-medium text-[15px] text-neutral-900">{downloads || '—'}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5 truncate px-1">
                            {isZh ? '次下载' : 'Downloads'}
                        </div>
                    </div>
                </div>

                {/* ============ 安装按钮 (深绿 + 圆角 8px) ============ */}
                <div className="mb-3">
                    <InstallPrompt
                        lang={lang}
                        customLabel={app.installLabel}
                        buttonClassName="rainbow-button w-full h-11 rounded-lg font-medium text-[15px] flex items-center justify-center"
                        installedClassName="w-full h-11 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-[15px] flex items-center justify-center gap-2 border border-emerald-200"
                    />
                </div>

                {/* ============ 分享 + 心愿单 ============ */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <button type="button" className="h-10 flex items-center justify-center gap-2 text-emerald-700 text-sm font-medium hover:bg-neutral-50 rounded">
                        <Share2 className="w-4 h-4" strokeWidth={2} />
                        {isZh ? '分享' : 'Share'}
                    </button>
                    <button type="button" className="h-10 flex items-center justify-center gap-2 text-emerald-700 text-sm font-medium hover:bg-neutral-50 rounded">
                        <Bookmark className="w-4 h-4" strokeWidth={2} />
                        {isZh ? '添加到心愿单' : 'Add to wishlist'}
                    </button>
                </div>

                {/* ============ "在您的设备上可以使用此应用" ============ */}
                <div className="flex items-center gap-3 py-3 mb-4 text-[13px] text-neutral-600 border-b border-neutral-100">
                    <Smartphone className="w-4 h-4 text-neutral-500" strokeWidth={1.8} />
                    {isZh ? '在您的设备上可以使用此应用' : 'This app is available for your device'}
                </div>

                {/* ============ 截图 (1:1.8 大卡片横向轮播) ============ */}
                {screenshots.length > 0 && (
                    <div className="mb-6 -mx-5">
                        <div className="overflow-x-auto pb-3 px-5 scrollbar-hide">
                            <div className="flex gap-3" style={{ width: 'max-content' }}>
                                {screenshots.map((src, i) => (
                                    <div key={i} className="w-44 h-[316px] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm flex-shrink-0 border border-neutral-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={src}
                                            alt={`screenshot ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ 游戏简介 / About this app ============ */}
                <div className="mb-6">
                    <button type="button" className="w-full flex items-center justify-between mb-3">
                        <h2 className="text-base font-medium text-neutral-900">
                            {isZh ? '游戏简介' : 'About this app'}
                        </h2>
                        <ChevronRight className="w-5 h-5 text-neutral-500" />
                    </button>
                    <p className="text-[14px] text-neutral-700 leading-relaxed whitespace-pre-line">
                        {app.description}
                    </p>
                </div>

                <div className="text-center text-[10px] text-neutral-300 pt-4">
                    {t(lang, 'poweredBy')}
                </div>
            </div>

            {/* ============ 底部 tab bar (游戏 / 应用 / 图书 / 儿童) ============ */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100 grid grid-cols-4 max-w-2xl mx-auto">
                {[
                    { icon: Gamepad2, label: isZh ? '游戏' : 'Games' },
                    { icon: Grid3x3, label: isZh ? '应用' : 'Apps', active: true },
                    { icon: BookOpen, label: isZh ? '图书' : 'Books' },
                    { icon: Baby, label: isZh ? '儿童' : 'Kids' },
                ].map(({ icon: Icon, label, active }, i) => (
                    <div key={i} className="flex flex-col items-center justify-center py-2 gap-0.5">
                        <div className={active ? 'h-8 w-14 rounded-full bg-emerald-50 flex items-center justify-center' : 'flex items-center justify-center'}>
                            <Icon className={`w-5 h-5 ${active ? 'fill-emerald-700 text-emerald-700' : 'text-neutral-500'}`} strokeWidth={1.8} />
                        </div>
                        <div className={`text-[11px] ${active ? 'text-emerald-700 font-medium' : 'text-neutral-500'}`}>{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Google Play 4 色三角形 logo */
function GooglePlayLogo() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22">
            <defs>
                <linearGradient id="play-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C6FF" />
                    <stop offset="100%" stopColor="#0072FF" />
                </linearGradient>
            </defs>
            {/* 4 个三角 */}
            <path d="M3 2.5v19l8.5-9.5L3 2.5z" fill="url(#play-blue)" />
            <path d="M3 2.5l8.5 9.5 4-4.5L3 2.5z" fill="#FF3D44" transform="translate(0 0)" />
            <path d="M3 21.5l8.5-9.5 4 4.5L3 21.5z" fill="#FFCE00" />
            <path d="M11.5 12l4-4.5 5 4.5-5 4.5-4-4.5z" fill="#00D873" />
        </svg>
    );
}

function tryHostname(url: string): string {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
