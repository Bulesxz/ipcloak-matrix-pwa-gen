/**
 * Classic 模板 (现状, 居中卡片)
 */
import InstallPrompt from '@/components/install-prompt';
import ApkButton from '@/components/apk-button';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import { buttonStyle } from '@/lib/button-style';
import type { AppConfig } from '@/lib/db';

export default function ClassicTemplate({ app }: { app: AppConfig }) {
    const lang = app.language || 'zh';
    const isDark = app.backgroundColor === '#000000' || app.backgroundColor === '#000';
    const textColor = isDark ? 'text-white' : 'text-neutral-900';
    const bs = buttonStyle(app.buttonColor, app.customButtonColor);
    const btnCls = `${bs.className} w-full h-14 text-lg rounded-full font-bold flex items-center justify-center gap-2`;

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{ backgroundColor: app.backgroundColor }}
        >
            <div className={`text-center max-w-md w-full relative z-10 ${textColor}`}>
                <div className="mx-auto w-32 h-32 rounded-[28px] shadow-2xl overflow-hidden mb-6 bg-white animate-in zoom-in duration-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">{app.name}</h1>
                <p className="opacity-80 mb-10 text-lg leading-relaxed">{app.description}</p>
                <div className="space-y-4">
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
                        />
                    )}
                    <Link href={app.url} target="_blank" className="block">
                        <div className="text-sm opacity-60 hover:opacity-100 flex items-center justify-center gap-1 mt-4 transition-opacity">
                            {t(lang, 'openWebsite')} <ArrowUpRight className="w-3 h-3" />
                        </div>
                    </Link>
                </div>
            </div>
            <div className={`absolute bottom-6 text-xs opacity-30 ${textColor}`}>{t(lang, 'poweredBy')}</div>
        </div>
    );
}
