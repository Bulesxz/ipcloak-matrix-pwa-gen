/**
 * /install/* 路由专用的极简 service worker
 *
 * 唯一作用: 让 Chrome 把 install 页认成 "可安装的 PWA"
 * (Chrome 安装条件: HTTPS + manifest + 必须注册 sw, 即使 sw 什么都不做)
 *
 * 不缓存、不拦截、不做任何花活, 避免重蹈老 sw.js 的覆辙。
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// fetch handler 必须存在 (Chrome 要求), 但我们什么都不做, 完全 pass through
self.addEventListener('fetch', () => {
  // empty handler — 让浏览器走默认网络请求
});
