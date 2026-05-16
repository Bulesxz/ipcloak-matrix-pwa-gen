'use client';

/**
 * APK 下载按钮 (替代 InstallPrompt 在 distribution=apk 模式下使用)
 *
 * 行为:
 *   - 点击 → window.location 跳转 APK URL 触发浏览器下载
 *   - 同时触发 __pwaPixelFire() 上报"安装意向"事件 (跟 H5 install 行为对齐)
 *   - 没有 APK URL 时显示禁用态 + 提示
 *
 * 不依赖 PWA / sw / appinstalled, 任何浏览器都能用。
 */
import { Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { AppLanguage } from '@/lib/db';

export interface ApkButtonProps {
    apkUrl?: string;
    lang?: AppLanguage;
    /** 自定义按钮文字 (留空走 i18n 默认 "下载 APK") */
    customLabel?: string;
    /** 自定义 className (各模板覆盖 width / 颜色 / 圆角) */
    buttonClassName?: string;
    /** 自定义 inline style (主要给 custom hex 颜色用) */
    buttonStyle?: React.CSSProperties;
}

export default function ApkButton({ apkUrl, lang = 'zh', customLabel, buttonClassName, buttonStyle }: ApkButtonProps) {
    const label = customLabel?.trim() || t(lang, 'downloadApk');

    if (!apkUrl?.trim()) {
        // 没配 URL: 黄色提示
        return (
            <div className="w-full py-4 px-4 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{t(lang, 'apkUrlMissing')}</span>
            </div>
        );
    }

    const handleClick = () => {
        // 触发 Pixel (跟 H5 install 一样的 __pwaPixelFire)
        try {
            window.__pwaPixelFire?.();
            console.log('[apk-button] download clicked, pixel fired');
        } catch (e) {
            console.warn('[apk-button] pixel fire failed:', e);
        }
        // 跳转下载
        window.location.href = apkUrl;
    };

    return (
        <Button
            onClick={handleClick}
            style={buttonStyle}
            className={buttonClassName || 'w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full'}
        >
            <Download className="w-5 h-5 mr-2" />
            {label}
        </Button>
    );
}
