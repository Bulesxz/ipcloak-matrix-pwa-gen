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

    const manifest = {
        name: app.name,
        short_name: app.name.slice(0, 12),
        description: app.description,
        start_url: `/install/${id}`,
        scope: `/install/${id}`,
        display: 'standalone',
        background_color: app.backgroundColor || '#ffffff',
        theme_color: app.backgroundColor || '#ffffff',
        // Chrome 安装条件: 至少一个 icon, sizes 包含 192 / 512 / "any"
        // 用 sizes="any" 让 Chrome 不去校验真实像素 (因为我们不知道用户网站的真实尺寸)
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
