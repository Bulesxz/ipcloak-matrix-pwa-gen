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

    // ⭐ start_url = 用户真正想让 PWA 打开的目标网站 (app.url)
    //   留空时 fallback 到 install 页本身 (至少能打开, 不报错)
    const startUrl = app.url?.trim() || `/install/${id}`;

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
