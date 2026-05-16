'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, AlertCircle } from 'lucide-react';

/**
 * PWA 安装按钮 + appinstalled 回调
 *
 * 流程:
 * 1. 挂载时注册 /install-sw.js (限制 scope=/install/), 让 Chrome 认这是可安装的 PWA
 * 2. 监听 beforeinstallprompt → 拿到 deferred prompt (Chrome/Edge/Android)
 * 3. 用户点 "安装" → deferred.prompt() → 系统对话框
 * 4. 用户接受 → window appinstalled 触发 → __pwaPixelFire() 上报转化
 * 5. iOS: 没 prompt 事件, 显示 Safari 分享菜单引导
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Status = 'pending' | 'ready' | 'installed' | 'ios' | 'unsupported';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<Status>('pending');

  useEffect(() => {
    // 1. 检测平台
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone;

    // 已安装 (standalone 模式打开) → 直接显示已安装
    if (isStandalone) {
      setStatus('installed');
      return;
    }

    if (isIOS) {
      // iOS Safari 不支持 beforeinstallprompt, 走手动引导
      setStatus('ios');
      // iOS 不需要 sw 也能 add to home screen, 跳过 sw 注册
    } else {
      // 2. 注册 install-sw.js (scope=/install/), 让 Chrome 触发 beforeinstallprompt
      //    必须在 install 页路径下注册, 且 scope 不超出当前路径
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/install-sw.js', { scope: '/install/' })
          .catch((err) => {
            console.warn('[install-prompt] SW register failed:', err);
          });
      }

      // 3. 暂时假定支持, 等 beforeinstallprompt 5 秒, 没拿到才标 unsupported
      const timeout = setTimeout(() => {
        if (!deferred) setStatus('unsupported');
      }, 5000);

      const onBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferred(e as BeforeInstallPromptEvent);
        setStatus('ready');
        clearTimeout(timeout);
      };

      const onAppInstalled = () => {
        setStatus('installed');
        // ⭐ Pixel 上报
        window.__pwaPixelFire?.();
        console.log('[install-prompt] PWA installed, pixel fired');
      };

      window.addEventListener('beforeinstallprompt', onBeforeInstall);
      window.addEventListener('appinstalled', onAppInstalled);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
        window.removeEventListener('appinstalled', onAppInstalled);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    console.log(`[install-prompt] user choice: ${choice.outcome}`);
    setDeferred(null);
  };

  // ---- UI ----
  if (status === 'installed') {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-4 bg-green-500/20 text-green-700 rounded-full font-semibold border border-green-500/30">
        <Check className="w-5 h-5" />
        已安装到主屏幕
      </div>
    );
  }

  if (status === 'ios') {
    return (
      <div className="space-y-3">
        <div className="w-full py-4 px-4 bg-blue-600 text-white rounded-full font-bold shadow-lg text-center">
          点击底部 <span className="inline-block mx-1">⬆️</span> 分享按钮安装
        </div>
        <div className="text-xs opacity-70 leading-relaxed text-left bg-white/50 rounded-lg p-3 space-y-1">
          <div>1. 点击 Safari 底部 <strong>分享</strong> 按钮</div>
          <div>2. 选择 <strong>"添加到主屏幕"</strong></div>
          <div>3. 点击 <strong>"添加"</strong> 完成安装</div>
        </div>
      </div>
    );
  }

  if (status === 'ready' && deferred) {
    return (
      <Button onClick={handleInstall} className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full">
        <Download className="w-5 h-5 mr-2" />
        安装到主屏幕
      </Button>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="space-y-3">
        <div className="w-full py-4 px-4 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-left">
            <div className="font-semibold mb-1">无法自动安装</div>
            <div className="text-xs opacity-90 leading-relaxed">
              请用 Chrome 浏览器右上角 <strong>⋮ 菜单 → 安装应用</strong>，
              或 Safari 底部 <strong>分享 → 添加到主屏幕</strong>。
            </div>
          </div>
        </div>
      </div>
    );
  }

  // pending: 还在等 sw 注册和 beforeinstallprompt
  return (
    <div className="w-full py-4 bg-neutral-200 text-neutral-500 rounded-full text-center text-sm">
      检测中...
    </div>
  );
}
