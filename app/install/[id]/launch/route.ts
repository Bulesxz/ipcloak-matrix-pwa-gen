/**
 * /install/[id]/launch — PWA 启动跳板
 *
 * 用途: manifest 的 start_url 必须是同源 URL (Chrome 严格要求),
 * 不能直接指向外部 targetUrl。 解决方案: start_url 用本路由 (同源),
 * 本路由收到请求后 302 跳到真正的目标 URL。
 *
 * 副 bonus: 这里能记录"PWA 启动"事件 (未来加分析时用)
 */
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await db.getApp(id);

    // App 不存在: 跳到首页
    if (!app) {
        return Response.redirect('https://pwa.ipcloak.ai/', 302);
    }

    // 优先级: targetUrl > url > install 页
    const target = app.targetUrl?.trim() || app.url?.trim();
    if (!target) {
        // 都没填: fallback 到 install 页
        return Response.redirect(`https://pwa.ipcloak.ai/install/${id}`, 302);
    }

    // 必须是绝对 URL (http:// 或 https://)
    const absUrl = /^https?:\/\//i.test(target) ? target : `https://${target}`;
    return Response.redirect(absUrl, 302);
}
