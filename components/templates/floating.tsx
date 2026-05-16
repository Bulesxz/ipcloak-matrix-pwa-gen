/**
 * Floating 模板 - 大图全屏背景 + 底部悬浮安装按钮
 *
 * 视觉:
 *   - 优先使用 app.heroImage 当全屏背景大图 (无模糊, object-cover 撑满)
 *   - 没有 heroImage 时 fallback 到 icon 放大模糊
 *   - 中部: icon + name + description (居中)
 *   - 底部 fixed: 大宽度悬浮安装按钮 (留 safe-area-inset)
 */
import InstallPrompt from '@/components/install-prompt';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import type { AppConfig } from '@/lib/db';

export default function FloatingTemplate({ app }: { app: AppConfig }) {
    const lang = app.language || 'zh';
    const isDark = app.backgroundColor === '#000000' || app.backgroundColor === '#000';
    const textColor = isDark ? 'text-white' : 'text-neutral-900';
    const buttonShadowText = isDark ? 'text-black' : 'text-white';
    const heroImage = app.heroImage?.trim();

    return (
        <div
            className="min-h-screen relative overflow-hidden flex flex-col"
            style={{ backgroundColor: app.backgroundColor }}
        >
            {/* 背景: 优先 heroImage, 没传就用 icon 模糊 fallback */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {heroImage ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={heroImage}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        {/* 底部渐变 让按钮区文字可读 */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: isDark
                                    ? `linear-gradient(180deg, transparent 0%, transparent 40%, ${app.backgroundColor}cc 85%, ${app.backgroundColor} 100%)`
                                    : `linear-gradient(180deg, transparent 0%, transparent 40%, rgba(255,255,255,0.85) 85%, ${app.backgroundColor} 100%)`,
                            }}
                        />
                    </>
                ) : (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={app.iconUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-30 blur-3xl scale-150"
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: isDark
                                    ? `linear-gradient(180deg, transparent 0%, ${app.backgroundColor}cc 60%, ${app.backgroundColor} 100%)`
                                    : `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 60%, ${app.backgroundColor} 100%)`,
                            }}
                        />
                    </>
                )}
            </div>

            {/* 主内容 */}
            <div className={`relative z-10 flex-1 flex flex-col items-center justify-end px-6 pb-44 pt-12 ${textColor}`}>
                <div className="w-32 h-32 rounded-[28px] shadow-2xl overflow-hidden mb-6 bg-white animate-in zoom-in duration-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-bold mb-3 tracking-tight text-center max-w-md line-clamp-2 drop-shadow-sm">{app.name}</h1>
                <p className="opacity-90 text-base leading-relaxed text-center max-w-md line-clamp-4 drop-shadow-sm">{app.description}</p>

                <Link href={app.url} target="_blank" className="mt-6">
                    <div className="text-sm opacity-70 hover:opacity-100 flex items-center gap-1 transition-opacity">
                        {t(lang, 'openWebsite')} <ArrowUpRight className="w-3 h-3" />
                    </div>
                </Link>
            </div>

            {/* 悬浮安装按钮 */}
            <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md bg-black/10">
                <div className="max-w-md mx-auto">
                    <InstallPrompt
                        lang={lang}
                        customLabel={app.installLabel}
                        buttonClassName={`w-full h-14 text-lg rounded-2xl font-bold shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-blue-600 hover:bg-blue-700 ${buttonShadowText} flex items-center justify-center gap-2`}
                        installedClassName="w-full h-14 rounded-2xl bg-green-500/30 text-green-100 font-bold flex items-center justify-center gap-2 backdrop-blur-sm"
                    />
                </div>
            </div>

            <div className={`absolute bottom-1 left-0 right-0 text-center text-[10px] opacity-30 z-30 ${textColor}`}>
                {t(lang, 'poweredBy')}
            </div>
        </div>
    );
}
