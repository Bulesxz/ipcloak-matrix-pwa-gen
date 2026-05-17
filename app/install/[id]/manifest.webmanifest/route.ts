/**
 * 动态生成 PWA manifest — 让每个 install 页对应一个独立可安装的 PWA
 * URL: /install/[id]/manifest.webmanifest
 */
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await db.getApp(id);
    if (!app) {
        return new Response('Not Found', { status: 404 });
    }

    // 同源 origin (用于拼绝对 URL 的 icon 代理)
    const origin = new URL(req.url).origin;

    // ⭐ start_url 必须同源且返回 200 同源资源 (Chrome 可安装性硬要求):
    //   start_url 指向同源的 /install/[id]/launch route. 该 route 返回
    //   200 HTML (内含 JS 跳转到真实 targetUrl) — 不能用 302 跨域跳转,
    //   否则 Chrome 判定 start_url 不可被 SW 控制 → 不可安装.
    const startUrl = `/install/${id}/launch`;

    // ⭐ 图标声明 — Chrome 可安装性硬要求 + 同源代理:
    //   1) Chrome 判定可安装需要至少一个 192px + 一个 512px 图标声明
    //      (sizes:"any" 仅对 SVG 有效, PNG 必须明确尺寸).
    //   2) 更关键: 用户 iconUrl 常是外部站 (如 meto.asia), Chrome 在用户
    //      设备上下载该图; 外部域名被墙/超时则下载失败 → 不可安装. 因此
    //      icon src 一律指向同源代理 /install/[id]/icon (CF 边缘抓取+缓存
    //      外部图, 取不到时回退内置 SVG), 彻底消除外部依赖.
    //   src 用绝对同源 URL (manifest 规范: 相对路径相对 manifest URL 解析,
    //   绝对同源最稳, Chrome 最信任).
    const iconProxy = `${origin}/install/${id}/icon`;
    const icons = [
        { src: iconProxy, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: iconProxy, sizes: '256x256', type: 'image/png', purpose: 'any' },
        { src: iconProxy, sizes: '384x384', type: 'image/png', purpose: 'any' },
        { src: iconProxy, sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: iconProxy, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
            // 短缓存: manifest 很小, 用户改了配置(图标/名称)应尽快生效, 不值得缓存太久
            'cache-control': 'public, max-age=60',
        },
    });
}
