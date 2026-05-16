/**
 * Floating 模板 - 纯大图 + 底部悬浮安装按钮
 *
 * 极简版:
 *   - hero 大图全屏铺满 (object-cover)
 *   - 底部 fixed 悬浮安装按钮
 *   - 不显示 icon / name / description (在 hero 图里自带就够了)
 *
 * 没传 hero 时 fallback: 用 icon 模糊放大当背景 (避免空白)
 */
import InstallPrompt from '@/components/install-prompt';
import ApkButton from '@/components/apk-button';
import { buttonStyle } from '@/lib/button-style';
import type { AppConfig } from '@/lib/db';

export default function FloatingTemplate({ app }: { app: AppConfig }) {
    const lang = app.language || 'zh';
    const bg = app.backgroundColor || '#ffffff';
    const isDark = bg === '#000000' || bg === '#000' || bg.toLowerCase() === '#0a0a0a';
    const heroImage = app.heroImage?.trim();
    const bs = buttonStyle(app.buttonColor, app.customButtonColor);
    const btnCls = `${bs.className} w-full h-14 text-lg rounded-2xl font-bold shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2`;

    return (
        <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: bg }}>
            {/* ============ 全屏大图 ============ */}
            <div className="absolute inset-0">
                {heroImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={heroImage}
                        alt={app.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    // 没传 hero: 用 icon 模糊放大当背景
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={app.iconUrl}
                            alt={app.name}
                            className="w-full h-full object-cover opacity-30 blur-3xl scale-150"
                        />
                        {/* 还在中间放一个清晰 icon 让没传 hero 也有视觉中心 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 rounded-[32px] shadow-2xl overflow-hidden bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ============ 底部 fixed 悬浮安装按钮 ============ */}
            <div
                className="fixed bottom-0 left-0 right-0 z-20 px-5 pt-12 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none"
                style={{
                    background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.7) 100%)`,
                }}
            >
                <div className="max-w-md mx-auto pointer-events-auto">
                    {app.distribution === 'apk' ? (
                        <ApkButton
                            apkUrl={app.apkUrl}
                            lang={lang}
                            customLabel={app.installLabel}
                            buttonClassName={btnCls}
                            buttonStyle={bs.style}
                        />
                    ) : (
                        <InstallPrompt
                            lang={lang}
                            customLabel={app.installLabel}
                            buttonClassName={btnCls}
                            buttonStyle={bs.style}
                            installedClassName="w-full h-14 rounded-2xl bg-green-500/30 text-green-100 font-bold flex items-center justify-center gap-2 backdrop-blur-sm border border-green-400/30"
                            launchUrl={app.targetUrl?.trim() || app.url}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
