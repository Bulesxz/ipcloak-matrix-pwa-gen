/**
 * pwa.ipcloak.ai self-unregister service worker
 *
 * 历史上有老版本 sw.js 注册在用户浏览器里 (出 bug, 拦截 POST/chrome-extension 请求)。
 * 这个新 sw.js 只做一件事: 立即注销自己 + 清掉所有 cache, 恢复原生网络。
 *
 * 用户只要访问 pwa.ipcloak.ai 一次, 浏览器会自动拉新 sw.js 替换老的, 然后这个新 sw 自杀。
 */

self.addEventListener('install', (event) => {
  // 跳过 waiting, 立即激活
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1. 删掉所有 caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));

    // 2. 接管所有页面 (让 unregister 立即生效)
    await self.clients.claim();

    // 3. unregister 自己
    await self.registration.unregister();

    // 4. 通知所有打开的 tab 刷新 (可选, 让用户立刻看到无 sw 的体验)
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => {
      try { client.navigate(client.url); } catch {}
    });
  })());
});

// fetch 一概不拦, 走原生网络
self.addEventListener('fetch', () => {});
