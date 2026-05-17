/**
 * /install/[id]/launch — PWA 启动跳板
 *
 * 用途: manifest 的 start_url 指向本路由 (同源).
 *
 * ⚠️ 为什么不能用 302:
 *   Chrome 判定 PWA 可安装时会 fetch start_url. 如果 start_url 返回
 *   302 跨域跳转 (跳到外部 targetUrl), Chrome 判定 start_url 无法被
 *   service worker 控制 (SW 只控制同源资源) → 不满足可安装条件 →
 *   beforeinstallprompt 不触发 → 安装页显示"无法自动安装".
 *
 * ✅ 正确做法:
 *   本路由返回一个真实的 200 同源 HTML 页面 (SW 能控制 → Chrome 认可
 *   可安装). 页面内 JS 立即 location.replace 到真实目标 URL, 用户从
 *   桌面图标启动 PWA 时瞬间被带到目标站, 体验几乎无感.
 *
 * 副 bonus: 这里能记录"PWA 启动"事件 (未来加分析时用)
 */
import { db } from '@/lib/db';

export const runtime = 'edge';

function htmlRedirect(targetUrl: string, label: string): Response {
    // 安全转义, 防止 targetUrl 里有引号/脚本注入
    const safeUrl = targetUrl
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const jsUrl = JSON.stringify(targetUrl); // 给 JS 用的安全字符串

    const html = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>${label}</title>
<style>
  html,body{margin:0;height:100%;background:#0a0a0a;color:#fff;
    font-family:-apple-system,"PingFang SC","Helvetica Neue",sans-serif;
    display:flex;align-items:center;justify-content:center;text-align:center}
  .box{opacity:.85}
  .spinner{width:38px;height:38px;margin:0 auto 18px;border:3px solid rgba(255,255,255,.2);
    border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  a{color:#7dd3fc}
</style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <div>正在打开…</div>
    <noscript><p style="margin-top:14px">请<a href="${safeUrl}">点此继续</a></p></noscript>
  </div>
  <script>
    // 立即跳转 (replace: 不留历史, 返回键不会回到这个空白跳板页)
    location.replace(${jsUrl});
    // 兜底: 1.2s 后还在本页 (极少数浏览器 replace 被拦) 用 href 再试
    setTimeout(function(){ location.href = ${jsUrl}; }, 1200);
  </script>
</body>
</html>`;

    return new Response(html, {
        status: 200,
        headers: {
            'content-type': 'text/html; charset=utf-8',
            // 不缓存: 保证每次启动都拿最新跳转目标
            'cache-control': 'no-store',
        },
    });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const app = await db.getApp(id);

    // App 不存在: 跳首页
    if (!app) {
        return htmlRedirect('https://pwa.ipcloak.ai/', '打开中');
    }

    // 优先级: targetUrl > url > install 页
    const target = app.targetUrl?.trim() || app.url?.trim();
    if (!target) {
        // 都没填: fallback 到 install 页本体
        return htmlRedirect(`https://pwa.ipcloak.ai/install/${id}`, app.name || '打开中');
    }

    // 必须是绝对 URL
    const absUrl = /^https?:\/\//i.test(target) ? target : `https://${target}`;
    return htmlRedirect(absUrl, app.name || '打开中');
}
