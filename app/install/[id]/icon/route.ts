/**
 * /install/[id]/icon — 同源图标代理
 *
 * ⚠️ 为什么需要这个:
 *   用户的 iconUrl 常指向外部第三方域名 (如 meto.asia). PWA 安装时
 *   Chrome 会在用户设备上下载 manifest 里的 icon. 如果那个外部域名在
 *   用户网络下被墙/污染/超时, Chrome 图标下载失败 → 可安装性检查失败
 *   → "无法自动安装". 这是不可控的外部依赖.
 *
 * ✅ 解决:
 *   manifest 的 icon src 指向本路由 (同源 pwa.ipcloak.ai). 本路由
 *   服务端 fetch 外部图标并回传, 加长缓存头让 Cloudflare 边缘缓存住.
 *   全球用户都从 CF 边缘拿图标, 不再依赖外部域名可达性. 同源也让
 *   Chrome 最信任 (跟 manifest/SW 同域).
 *
 * 失败兜底: 外部图取不到时返回一个内置的 512x512 SVG 占位图标
 *   (保证 manifest 永远有一个能下载成功的 icon, 不阻断安装).
 */
import { db } from '@/lib/db';

export const runtime = 'edge';

// 512x512 深色渐变占位图标 (外部图取不到时用, 保证 PWA 始终可安装)
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
<rect width="512" height="512" rx="96" fill="url(#g)"/>
<text x="256" y="330" font-size="240" font-family="-apple-system,sans-serif" font-weight="800"
 fill="#fff" text-anchor="middle">A</text></svg>`;

function fallback(): Response {
    return new Response(FALLBACK_SVG, {
        status: 200,
        headers: {
            'content-type': 'image/svg+xml; charset=utf-8',
            'cache-control': 'public, max-age=300',
        },
    });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await db.getApp(id);
    if (!app?.iconUrl?.trim()) return fallback();

    const src = app.iconUrl.trim();
    // 只代理 http(s) 外链; 已是同源/相对路径的直接交给静态服务 (不该走这里, 兜底跳过)
    if (!/^https?:\/\//i.test(src)) return fallback();

    try {
        const upstream = await fetch(src, {
            // 不带 referer, 模拟干净请求; 给个常见 UA 避免被某些站拦
            headers: { 'user-agent': 'Mozilla/5.0 (compatible; PWAInstaller/1.0)' },
            // CF edge 缓存上游响应
            cf: { cacheTtl: 86400, cacheEverything: true } as RequestInitCfProperties,
        });

        if (!upstream.ok) return fallback();

        const ct = upstream.headers.get('content-type') || '';
        // 必须是图片; 不是图片(被墙返回 HTML/JSON 等)走兜底
        if (!ct.startsWith('image/')) return fallback();

        const body = await upstream.arrayBuffer();
        // 空响应也兜底
        if (!body || body.byteLength === 0) return fallback();

        return new Response(body, {
            status: 200,
            headers: {
                'content-type': ct,
                // 边缘 + 浏览器都长缓存 (图标基本不变); 30 天
                'cache-control': 'public, max-age=2592000, immutable',
                'access-control-allow-origin': '*',
            },
        });
    } catch {
        return fallback();
    }
}
