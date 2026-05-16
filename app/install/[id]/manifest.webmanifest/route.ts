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

    // ⭐ start_url 优先级: targetUrl > url > install 页
    //   targetUrl 是 PWA 装到桌面后点图标真正打开的地址
    //   url 是用来扫站的源, 跟 targetUrl 可不一样
    const startUrl = app.targetUrl?.trim() || app.url?.trim() || `/install/${id}`;

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
        icons: [
            { src: app.iconUrl, sizes: 'any', type: 'image/png', purpose: 'any' },
        ],
    };

    return new Response(JSON.stringify(manifest, null, 2), {
        headers: {
            'content-type': 'application/manifest+json; charset=utf-8',
            'cache-control': 'public, max-age=300',
        },
    });
}
