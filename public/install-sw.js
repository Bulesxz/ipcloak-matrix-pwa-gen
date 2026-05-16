/**
 * /install/* 路由专用的极简 service worker
 *
 * 唯一作用: 让 Chrome 把 install 页认成 "可安装的 PWA"
 * (Chrome 安装条件: HTTPS + manifest + 必须有 fetch handler 真正处理请求)
 *
 * 实现策略: pass-through cache (网络优先, 失败 fallback 缓存)
 * 这样既满足 Chrome 检查 (不是 no-op), 又不会阻挡任何请求。
 */

const CACHE_NAME = 'pwa-install-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 仅处理 GET, 其他请求 (POST/PUT/DELETE/...) 完全放行不拦
  if (event.request.method !== 'GET') return;
  // 仅同源, 跨域不处理
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // 不处理 chrome-extension / data: / blob: 等非 http(s)
  if (!url.protocol.startsWith('http')) return;

  // 网络优先, 网络失败时 fallback 缓存 (但我们不主动缓存, 所以等于纯 pass-through)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((r) => r || Response.error()))
  );
});
