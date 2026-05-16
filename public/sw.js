/**
 * pwa.ipcloak.ai self-unregister service worker
 *
 * 唯一作用: 立即注销自己 + 清掉所有 cache, 让历史上注册的老 sw 失效。
 * 不带 fetch handler (避免 Chrome no-op 警告 + 避免拦截请求)。
 * 不主动 navigate clients (Chrome 新版禁止, 会抛 TypeError)。
 *   - 用户下次刷新自然就没 sw 了, 不需要我们手动 reload。
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      // 1. 删掉所有 caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // 2. 接管所有页面 (让 unregister 立即生效)
      await self.clients.claim();

      // 3. unregister 自己
      await self.registration.unregister();
    } catch (err) {
      console.warn('[sw] cleanup failed:', err);
    }
  })());
});
