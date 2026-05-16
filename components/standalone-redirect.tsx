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
 */
export default function StandaloneRedirect({ launchUrl }: { launchUrl?: string }) {
  useEffect(() => {
    if (!launchUrl?.trim()) return;

    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone;

    if (isStandalone) {
      console.log('[standalone-redirect] PWA launched, redirecting to', launchUrl);
      // 立即跳转, 不延迟
      window.location.replace(launchUrl);
    }
  }, [launchUrl]);

  return null;
}
