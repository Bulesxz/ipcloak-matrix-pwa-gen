/**
 * Floating 模板 - 上方 hero 大图区 + 下方 app 介绍 + 底部悬浮安装按钮
 *
 * 布局 (从上到下):
 *   1. Hero 大图占上 50vh (object-cover 不变形, 居中裁切)
 *      - 没传 hero 时退化: 给上半屏一个柔和渐变背景, 不显示空白
 *   2. icon (-margin-top 让它叠在 hero 下沿, 类似 Twitter 头像贴 banner)
 *   3. name + description (居中)
 *   4. 直接访问网站链接
 *   5. 底部 fixed 悬浮安装按钮 (safe-area-inset)
 */
import InstallPrompt from '@/components/install-prompt';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import type { AppConfig } from '@/lib/db';

export default function FloatingTemplate({ app }: { app: AppConfig }) {
    const lang = app.language || 'zh';
    const bg = app.backgroundColor || '#ffffff';
    const isDark = bg === '#000000' || bg === '#000' || bg.toLowerCase() === '#0a0a0a';
    const textColor = isDark ? 'text-white' : 'text-neutral-900';
    const buttonShadowText = isDark ? 'text-black' : 'text-white';
    const heroImage = app.heroImage?.trim();

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg }}>
            {/* ============ Hero 大图区 (上 50vh, object-cover 不变形) ============ */}
            <div className="relative w-full h-[50vh] min-h-[280px] overflow-hidden flex-shrink-0">
                {heroImage ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={heroImage}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        {/* 底部羽化让 hero 平滑过渡到 bg, 避免硬边 */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                            style={{ background: `linear-gradient(180deg, transparent 0%, ${bg} 100%)` }}
                        />
                    </>
                ) : (
                    // 没传 hero: 用渐变 + icon 模糊填充, 不留空白
                    <div className="w-full h-full relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={app.iconUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-20 blur-2xl scale-150"
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: isDark
                                    ? `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, ${bg} 100%)`
                                    : `linear-gradient(180deg, rgba(0,0,0,0.04) 0%, ${bg} 100%)`,
                            }}
                        />
                    </div>
                )}
            </div>

            {/* ============ App 介绍区 (hero 下方, icon 浮起叠在 hero 下沿) ============ */}
            <div className={`flex-1 flex flex-col items-center px-6 pb-44 -mt-12 relative z-10 ${textColor}`}>
                {/* icon - 用 -mt-12 让它向上叠在 hero 下沿 */}
                <div className="w-24 h-24 rounded-[22px] shadow-2xl overflow-hidden bg-white ring-4 ring-white/80 dark:ring-neutral-900/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                </div>

                <h1 className="text-2xl font-bold mt-4 mb-2 tracking-tight text-center max-w-md line-clamp-2">{app.name}</h1>
                <p className="opacity-75 text-sm leading-relaxed text-center max-w-md line-clamp-5 px-2">{app.description}</p>

                <Link href={app.url} target="_blank" className="mt-5">
                    <div className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity">
                        {t(lang, 'openWebsite')} <ArrowUpRight className="w-3 h-3" />
                    </div>
                </Link>
            </div>

            {/* ============ 底部 fixed 悬浮安装按钮 ============ */}
            <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                 style={{
                     background: isDark
                         ? `linear-gradient(180deg, transparent 0%, ${bg}f0 30%, ${bg} 100%)`
                         : `linear-gradient(180deg, transparent 0%, ${bg}f0 30%, ${bg} 100%)`,
                 }}
            >
                <div className="max-w-md mx-auto">
                    <InstallPrompt
                        lang={lang}
                        customLabel={app.installLabel}
                        buttonClassName={`w-full h-14 text-lg rounded-2xl font-bold shadow-[0_8px_30px_rgba(59,130,246,0.4)] bg-blue-600 hover:bg-blue-700 ${buttonShadowText} flex items-center justify-center gap-2`}
                        installedClassName="w-full h-14 rounded-2xl bg-green-500/20 text-green-700 font-bold flex items-center justify-center gap-2 border border-green-500/30"
                    />
                </div>
            </div>

            {/* 底部 powered by 文字 (悬浮按钮上方一点) */}
            <div className={`fixed bottom-[max(0.25rem,env(safe-area-inset-bottom))] left-0 right-0 text-center text-[10px] opacity-25 z-30 ${textColor} pointer-events-none`}>
                {t(lang, 'poweredBy')}
            </div>
        </div>
    );
}
