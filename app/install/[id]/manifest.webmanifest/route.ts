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
