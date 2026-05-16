/**
 * pwa.ipcloak.ai self-unregister service worker (v3)
 *
 * 唯一作用: 立即注销自己 + 清掉所有 cache.
 *
 * 防御性: 每一步都包 try/catch, 避免任何抛错 (即使 zombie 老 sw 还在跑也不影响新 sw 安装).
 * 不带 fetch handler / 不主动 navigate.
 */

// 版本戳 - 改这个字符串能强制浏览器把本文件视为新版本 → 触发 sw update
const SW_VERSION = 'v3-2026-05-16-noop-safe';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting().catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 每一步都独立 try, 任何一步失败不影响下一步
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name).catch(() => false)));
    } catch (_) {}

    try {
      await self.clients.claim();
    } catch (_) {}

    try {
      await self.registration.unregister();
    } catch (_) {}
  })());
});

// 故意不注册 'message' 'fetch' 'push' 等任何 listener
// 让 Chrome 完全把这个 sw 当 "纯 cleanup, 啥都不做" 处理
console.log('[sw] loaded', SW_VERSION);
