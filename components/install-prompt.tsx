'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';

/**
 * PWA 安装按钮 + appinstalled 回调
 *
 * 流程:
 * 1. 监听 beforeinstallprompt → 拿到 deferred prompt (Chrome/Edge/Android)
 * 2. 用户点击 "安装" 按钮 → 调 deferred.prompt() → 弹出系统安装对话框
 * 3. 用户接受 → window appinstalled 触发 → 调 window.__pwaPixelFire() 上报转化
 * 4. iOS: 没有 prompt 事件, 显示手动指引 (Safari 分享 → 添加到主屏幕)
 *
 * iOS 安装成功的判定由 pixel-tracker 在 PWA 二次打开时通过 display-mode 反推。
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // iOS 检测
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      // ⭐ 安装成功的回调 — 触发 Pixel 上报
      window.__pwaPixelFire?.();
      console.log('[install-prompt] PWA installed, pixel fired');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);

    // 已经安装过 (display-mode standalone) → 标记已安装但不再上报
    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      // appinstalled 事件会立刻触发, 这里不重复上报
      console.log('[install-prompt] user accepted prompt');
    }
    setDeferred(null);
  };

  if (installed) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-4 bg-green-500/20 text-green-300 rounded-full font-semibold border border-green-500/30">
        <Check className="w-5 h-5" />
        已安装到主屏幕
      </div>
    );
  }

  // iOS: 没有 beforeinstallprompt, 显示手动指引
  if (isIOS) {
    return (
      <div className="space-y-3">
        <div className="w-full py-3 px-4 bg-blue-600 text-white rounded-full font-bold shadow-lg text-center">
          点击底部 <span className="inline-block mx-1">↑</span> 分享按钮
        </div>
        <div className="text-xs opacity-70 leading-relaxed">
          1. 点击 Safari 底部 <strong>分享</strong> 按钮<br />
          2. 选择 <strong>"添加到主屏幕"</strong><br />
          3. 点击 <strong>"添加"</strong> 完成安装
        </div>
      </div>
    );
  }

  // Android/Chrome: 有 prompt
  if (deferred) {
    return (
      <Button onClick={handleInstall} className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full">
        <Download className="w-5 h-5 mr-2" />
        安装到主屏幕
      </Button>
    );
  }

  // 兜底: 浏览器不支持 PWA 安装
  return (
    <div className="w-full py-3 bg-neutral-500/20 text-neutral-300 rounded-full text-center text-sm border border-neutral-500/30">
      请用 Chrome 或 Safari 浏览器访问
    </div>
  );
}
