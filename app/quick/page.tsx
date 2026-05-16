/**
 * 无状态快速 install 页 - URL 参数直接渲染, 不进 KV
 *
 * 用法: /quick?name=My+App&icon=https://...&template=floating&hero=https://...&apk=https://...
 *
 * 适用场景:
 *   - 客户分享 demo 链接 (永久不过期, 不依赖 KV)
 *   - 程序化批量生成 (一行 URL 就是一个安装页)
 *
 * 限制:
 *   - URL 太长 (>2KB) 浏览器可能截断
 *   - 没有专属 manifest (无法被 Chrome 装到主屏幕, 但 APK 模式不受影响)
 *   - Pixel 像素跟踪仍可用 (参数 fb / tt / kwai)
 */
import PixelTracker from '@/components/pixel-tracker';
import ClassicTemplate from '@/components/templates/classic';
import PlaystoreTemplate from '@/components/templates/playstore';
import FloatingTemplate from '@/components/templates/floating';
import type { AppConfig, AppTemplate, AppLanguage, AppDistribution, PixelConfig } from '@/lib/db';

export const runtime = 'edge';

interface SearchParams {
    [key: string]: string | string[] | undefined;
}

function pickStr(v: string | string[] | undefined): string | undefined {
    if (Array.isArray(v)) return v[0];
    return v;
}

function buildConfig(sp: SearchParams): AppConfig {
    const template = (pickStr(sp.template) || pickStr(sp.t)) as AppTemplate;
    const language = (pickStr(sp.lang) || pickStr(sp.l)) as AppLanguage;
    const distribution = (pickStr(sp.distribution) || pickStr(sp.d)) as AppDistribution;

    // Pixel: 从 URL 参数读 fb=xxx / tt=xxx / kwai=xxx + event
    let pixel: PixelConfig | undefined;
    const fb = pickStr(sp.fb);
    const tt = pickStr(sp.tt);
    const kwai = pickStr(sp.kwai);
    const event = pickStr(sp.event);
    if (fb) pixel = { platform: 'facebook', pixelId: fb, event };
    else if (tt) pixel = { platform: 'tiktok', pixelId: tt, event };
    else if (kwai) pixel = { platform: 'kwai', pixelId: kwai, event };

    // 截图: shots=url1,url2,url3 用逗号分隔
    const shots = pickStr(sp.shots);
    const screenshots = shots ? shots.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5) : undefined;

    return {
        id: 'quick-' + Math.random().toString(36).slice(2, 10),  // 临时 ID 给 PixelTracker 用
        url: pickStr(sp.url) || pickStr(sp.u) || 'https://example.com',
        name: pickStr(sp.name) || pickStr(sp.n) || 'My App',
        description: pickStr(sp.desc) || pickStr(sp.description) || '',
        iconUrl: pickStr(sp.icon) || pickStr(sp.i) || '',
        backgroundColor: pickStr(sp.bg) || '#ffffff',
        template: ['classic', 'playstore', 'floating'].includes(template) ? template : 'floating',
        language: ['zh', 'en'].includes(language) ? language : 'zh',
        distribution: ['pwa', 'apk'].includes(distribution) ? distribution : 'pwa',
        installLabel: pickStr(sp.label),
        heroImage: pickStr(sp.hero),
        apkUrl: pickStr(sp.apk),
        reviews: pickStr(sp.rating) || pickStr(sp.downloads) ? {
            rating: pickStr(sp.rating) ? Number(pickStr(sp.rating)) : undefined,
            reviewCount: pickStr(sp.reviews),
            downloads: pickStr(sp.downloads),
        } : undefined,
        screenshots,
        pixel,
    };
}

export default async function QuickPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const sp = await searchParams;
    const app = buildConfig(sp);

    return (
        <>
            <PixelTracker pixel={app.pixel} appId={app.id!} />
            {app.template === 'playstore' && <PlaystoreTemplate app={app} />}
            {app.template === 'floating' && <FloatingTemplate app={app} />}
            {(!app.template || app.template === 'classic') && <ClassicTemplate app={app} />}
        </>
    );
}
