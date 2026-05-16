'use client';

/**
 * Pixel 跟踪组件
 * - 加载对应平台的 Pixel SDK
 * - 暴露 window.__pwaPixelFire(eventName) 给 install-prompt 在安装成功回调时调用
 *
 * 安装成功的判定条件 (优先级):
 *   1. window.addEventListener('appinstalled')  ← Chrome/Edge/Android, 99% 准
 *   2. iOS: 用户从主屏幕打开 PWA 时 display-mode: standalone, 二次访问触发
 *
 * 浏览器端 Pixel only (不做 CAPI), 客户在 FB/TT/Kwai 后台能看到 ad-attributed conversion。
 */

import { useEffect } from 'react';
import Script from 'next/script';
import type { PixelConfig } from '@/lib/db';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; push?: unknown; loaded?: boolean; version?: string };
    _fbq?: unknown;
    ttq?: { load: (id: string) => void; page: () => void; track: (event: string, params?: Record<string, unknown>) => void };
    kwaiq?: { load: (id: string) => void; track: (event: string, params?: Record<string, unknown>) => void; push?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
    __pwaPixelFire?: (event?: string) => void;
  }
}

export interface PixelTrackerProps {
  pixel?: PixelConfig;
  appId: string;
}

/** 各平台 Pixel SDK 的 bootstrap 脚本 (字符串形式, 由 next/script 注入) */
function fbBootstrap(pixelId: string) {
  return `
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${pixelId}');
    fbq('track','PageView');
  `;
}

function ttBootstrap(pixelId: string) {
  return `
    !function(w,d,t){
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
        var s=document.createElement("script");s.type="text/javascript";s.async=!0;s.src=r+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};
      ttq.load('${pixelId}');ttq.page();
    }(window,document,'ttq');
  `;
}

function kwaiBootstrap(pixelId: string) {
  return `
    !function(f,b,e,v,n,t,s){
      if(f.kwaiq)return;n=f.kwaiq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      n.queue=[];n.loaded=!0;n.version='1.0';
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://s1.kwai.net/kos/s101/nlav11187/pixel/events.js');
    kwaiq('load','${pixelId}');
    kwaiq('track','PageView');
  `;
}

export default function PixelTracker({ pixel, appId }: PixelTrackerProps) {
  const enabled = pixel && pixel.platform !== 'none' && !!pixel.pixelId;

  useEffect(() => {
    if (!enabled || !pixel) return;
    const event = pixel.event || defaultEventFor(pixel.platform);
    const params: Record<string, unknown> = { content_id: appId, content_type: 'pwa_install' };
    if (typeof pixel.value === 'number') params.value = pixel.value;
    if (pixel.currency) params.currency = pixel.currency;

    // 暴露统一上报函数 → install-prompt 在 appinstalled 时调用
    window.__pwaPixelFire = (overrideEvent?: string) => {
      const evt = overrideEvent || event;
      try {
        switch (pixel.platform) {
          case 'facebook':
            window.fbq?.('track', evt, params);
            break;
          case 'tiktok':
            window.ttq?.track(evt, params);
            break;
          case 'kwai':
            window.kwaiq?.track(evt, params);
            break;
        }
        console.log(`[pixel] ${pixel.platform} fired event "${evt}"`, params);
      } catch (err) {
        console.error('[pixel] fire failed:', err);
      }
    };

    // iOS standalone 检测: 用户从主屏幕打开 PWA 时也算一次成功安装
    if (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone) {
      const flag = `pwa_install_reported_${appId}`;
      if (!sessionStorage.getItem(flag)) {
        sessionStorage.setItem(flag, '1');
        setTimeout(() => window.__pwaPixelFire?.(), 1500);
      }
    }
  }, [enabled, pixel, appId]);

  if (!enabled || !pixel) return null;

  let script: string | null = null;
  switch (pixel.platform) {
    case 'facebook': script = fbBootstrap(pixel.pixelId!); break;
    case 'tiktok':   script = ttBootstrap(pixel.pixelId!); break;
    case 'kwai':     script = kwaiBootstrap(pixel.pixelId!); break;
  }
  if (!script) return null;

  return (
    <Script id={`pixel-${pixel.platform}-${pixel.pixelId}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: script }} />
  );
}

function defaultEventFor(platform: PixelConfig['platform']): string {
  switch (platform) {
    case 'facebook': return 'CompleteRegistration';
    case 'tiktok':   return 'CompleteRegistration';
    case 'kwai':     return 'install';
    default:         return 'CompleteRegistration';
  }
}
