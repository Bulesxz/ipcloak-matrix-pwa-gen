/**
 * 动态生成 PWA manifest — 让每个 install 页对应一个独立可安装的 PWA
 * URL: /install/[id]/manifest.webmanifest
 */
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await db.getApp(id);
    if (!app) {
        return new Response('Not Found', { status: 404 });
    }

    // ⭐ start_url 必须同源 (Chrome 严格要求, 跨域会被拒绝):
    //   start_url 指向同源的 /install/[id]/launch route,
    //   该 route 服务端 302 跳到真正的 targetUrl (可外部).
    //   targetUrl 为空时, launch route 会用 url 兜底.
    const startUrl = `/install/${id}/launch`;

    // ⭐ 图标声明 — Chrome 可安装性硬要求:
    //   Chrome 判定 PWA 可安装需要 manifest 至少声明一个 192px + 一个 512px 图标
    //   (或单个 sizes:"any" 的 SVG). 旧版只写 { sizes:"any", type:"image/png" } —
    //   Chrome 不接受 "PNG + any"(any 仅对 SVG 有效), 因此判定无合格图标,
    //   beforeinstallprompt 不触发 → 安装页显示"无法自动安装".
    //   修复: 同一图标 URL 用多个明确尺寸声明 (Chrome 信任 manifest 声明的 sizes,
    //   普通 purpose:any 不会回查真实像素), 覆盖 192/256/384/512 + 一个 maskable.
    const isSvg = /\.svg(\?|$)/i.test(app.iconUrl || '');
    const icons = isSvg
        ? [{ src: app.iconUrl, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
        : [
            { src: app.iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: app.iconUrl, sizes: '256x256', type: 'image/png', purpose: 'any' },
            { src: app.iconUrl, sizes: '384x384', type: 'image/png', purpose: 'any' },
            { src: app.iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: app.iconUrl, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ];

    const manifest = {
        name: app.name,
        short_name: app.name.slice(0, 12),
        description: app.description,
        start_url: startUrl,
        // scope 留在 install 路径下让 sw 注册兼容
        scope: `/install/${id}`,
        display: 'standalone',
        background_color: app.backgroundColor || '#ffffff',
        theme_color: app.backgroundColor || '#ffffff',
        icons,
    };

    return new Response(JSON.stringify(manifest, null, 2), {
        headers: {
            'content-type': 'application/manifest+json; charset=utf-8',
            'cache-control': 'public, max-age=300',
        },
    });
}
