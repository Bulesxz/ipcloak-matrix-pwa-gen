/**
 * PlayStore 模板 - 仿 Google Play Store 详情页
 *
 * 结构 (从上到下):
 *   顶部白色 bar (返回箭头 + 三点)
 *   App header (icon 左, name + dev + 评分)
 *   绿色 Install 按钮 (大块)
 *   评分 / 下载量 / 年龄分级 (3 列)
 *   截图轮播 (横向滚动, 可选)
 *   "About this app" 描述
 *   底部 powered by
 */
import InstallPrompt from '@/components/install-prompt';
import { Star, MoreVertical, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import type { AppConfig } from '@/lib/db';

export default function PlaystoreTemplate({ app }: { app: AppConfig }) {
    const lang = app.language || 'zh';
    const rating = app.reviews?.rating;
    const reviewCount = app.reviews?.reviewCount;
    const downloads = app.reviews?.downloads;
    const screenshots = app.screenshots || [];

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            {/* Top bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-neutral-100 flex items-center justify-between px-4 py-3">
                <Link href={app.url} className="text-neutral-700">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <MoreVertical className="w-6 h-6 text-neutral-500" />
            </div>

            <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
                {/* App header */}
                <div className="flex gap-4 items-start mb-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm bg-neutral-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold leading-tight mb-1 line-clamp-2">{app.name}</h1>
                        <div className="text-sm text-emerald-700 font-medium truncate">
                            {new URL(app.url).hostname}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">In-app purchases</div>
                    </div>
                </div>

                {/* Stats row (rating / downloads / age) */}
                {(rating || downloads) && (
                    <div className="flex items-stretch border border-neutral-100 rounded-2xl mb-6 divide-x divide-neutral-100">
                        {rating !== undefined && (
                            <div className="flex-1 py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-1 font-bold text-base">
                                    {rating.toFixed(1)}
                                    <Star className="w-3.5 h-3.5 fill-neutral-700 text-neutral-700" />
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-0.5">
                                    {reviewCount || `${t(lang, 'reviews')}`}
                                </div>
                            </div>
                        )}
                        {downloads && (
                            <div className="flex-1 py-3 px-2 text-center">
                                <div className="font-bold text-base">{downloads}</div>
                                <div className="text-[11px] text-neutral-500 mt-0.5">{t(lang, 'downloads')}</div>
                            </div>
                        )}
                        <div className="flex-1 py-3 px-2 text-center">
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded border border-neutral-400 text-[10px] font-bold">3+</div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">Rated for 3+</div>
                        </div>
                    </div>
                )}

                {/* Install button (绿色, 大块) */}
                <div className="mb-6">
                    <InstallPrompt
                        lang={lang}
                        customLabel={app.installLabel}
                        buttonClassName="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base"
                        installedClassName="w-full h-12 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-base flex items-center justify-center gap-2"
                    />
                </div>

                {/* Screenshots (横向滚动) */}
                {screenshots.length > 0 && (
                    <div className="mb-8 -mx-5">
                        <div className="overflow-x-auto pb-2 px-5">
                            <div className="flex gap-3" style={{ width: 'max-content' }}>
                                {screenshots.map((src, i) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        key={i}
                                        src={src}
                                        alt={`screenshot ${i + 1}`}
                                        className="h-72 rounded-xl object-cover bg-neutral-100 shadow-sm"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* About this app */}
                <div className="mb-6">
                    <h2 className="font-semibold text-base mb-2">{t(lang, 'aboutApp')}</h2>
                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{app.description}</p>
                </div>

                <div className="text-center text-xs text-neutral-400 pt-4 border-t border-neutral-100">
                    {t(lang, 'poweredBy')}
                </div>
            </div>
        </div>
    );
}
