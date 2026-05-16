'use client';

import { useEffect } from 'react';

/**
 * 客户端检测: 如果 install 页是被 PWA 从桌面以 standalone 模式打开的,
 * 立即跳到 targetUrl, 不让用户卡在安装页 "已安装" 状态。
 *
 * 背景: Chrome/Edge 桌面安装 PWA 时, 第一次启动会用 install 页本身作为入口
 *       (不是 manifest 的 start_url). 这是浏览器设计.
 *       所以即便 manifest start_url=/install/[id]/launch, 第一次开还是会
 *       打开 /install/[id] 本体. 需要客户端检测后跳转.
 *
 * 普通 tab 打开本页 (没装) → 不跳转, 显示安装按钮.
 *
 * ⚠️ Chrome 桌面 PWA 第一次启动的 timing bug:
 *    matchMedia('(display-mode: standalone)').matches 在 useEffect 第一帧可能返回 false,
 *    100-500ms 后才变 true. 直接 useEffect 里检测一次会漏判 → 用户卡在 install 页.
 *    第二次启动正常因为 Chrome 缓存了 display-mode.
 *
 *    修复策略 (多重保险):
 *    1. 立即检测一次
 *    2. 监听 matchMedia.addEventListener('change') 等 standalone 变 true
 *    3. 轮询: 0ms / 100ms / 300ms / 800ms / 1500ms 各检测一次
 *    4. 监听 'visibilitychange' (PWA 切换前后台时刷新一次)
 */
export default function StandaloneRedirect({ launchUrl }: { launchUrl?: string }) {
  useEffect(() => {
    const url = launchUrl?.trim();
    if (!url) return;

    let redirected = false;

    const checkAndRedirect = (source: string): boolean => {
      if (redirected) return true;

      const mql = window.matchMedia?.('(display-mode: standalone)');
      const isStandalone =
        (mql?.matches) ||
        (navigator as Navigator & { standalone?: boolean }).standalone ||
        // 也兼容 Chrome 桌面有时把 PWA 装到 minimal-ui 模式
        window.matchMedia?.('(display-mode: minimal-ui)').matches ||
        window.matchMedia?.('(display-mode: window-controls-overlay)').matches;

      if (isStandalone) {
        redirected = true;
        console.log(`[standalone-redirect] PWA launched (via ${source}), redirecting to`, url);
        // location.replace 让回退键不会回到安装页
        window.location.replace(url);
        return true;
      }
      return false;
    };

    // 1. 立即检测一次 (覆盖已经缓存好 display-mode 的二次启动)
    if (checkAndRedirect('immediate')) return;

    // 2. 监听 matchMedia 状态变化 (Chrome 决定 display-mode 后会触发)
    const mql = window.matchMedia('(display-mode: standalone)');
    const onChange = () => checkAndRedirect('matchMedia change');
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else if ((mql as MediaQueryList & { addListener?: (cb: () => void) => void }).addListener) {
      // 老 Safari 兼容
      (mql as MediaQueryList & { addListener?: (cb: () => void) => void }).addListener?.(onChange);
    }

    // 3. 多次轮询补刀 (覆盖 Chrome 桌面 PWA 首次启动的 timing race)
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => checkAndRedirect('100ms poll'), 100),
      setTimeout(() => checkAndRedirect('300ms poll'), 300),
      setTimeout(() => checkAndRedirect('800ms poll'), 800),
      setTimeout(() => checkAndRedirect('1500ms poll'), 1500),
    ];

    // 4. visibility/focus 事件 (PWA 切回前台时再检测一次)
    const onVisible = () => checkAndRedirect('visibilitychange');
    const onFocus = () => checkAndRedirect('focus');
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      timers.forEach(clearTimeout);
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else if ((mql as MediaQueryList & { removeListener?: (cb: () => void) => void }).removeListener) {
        (mql as MediaQueryList & { removeListener?: (cb: () => void) => void }).removeListener?.(onChange);
      }
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [launchUrl]);

  return null;
}
