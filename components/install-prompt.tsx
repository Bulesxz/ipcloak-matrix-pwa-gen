'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, AlertCircle } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { AppLanguage } from '@/lib/db';

/**
 * PWA 安装按钮 + appinstalled 回调
 *
 * 接收 lang prop 决定文案语言, 与用户在编辑器选的安装页语言一致。
 *
 * 可选 className 让父组件传入样式 (悬浮按钮模板用 fixed bottom-0 等)。
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Status = 'pending' | 'ready' | 'installed' | 'ios' | 'unsupported';

export interface InstallPromptProps {
  lang?: AppLanguage;
  /** 自定义按钮 className (悬浮模板会覆盖 width / 边距 / 阴影) */
  buttonClassName?: string;
  /** 自定义已安装态 className */
  installedClassName?: string;
  /** 自定义安装按钮文字 (留空走 i18n 默认) */
  customLabel?: string;
  /** 自定义按钮 inline style (主要给 custom hex 颜色用) */
  buttonStyle?: React.CSSProperties;
}

export default function InstallPrompt({ lang = 'zh', buttonClassName, installedClassName, customLabel, buttonStyle }: InstallPromptProps) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<Status>('pending');

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone;

    if (isStandalone) { setStatus('installed'); return; }

    if (isIOS) {
      setStatus('ios');
    } else {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/install-sw.js', { scope: '/install/' })
          .catch((err) => console.warn('[install-prompt] SW register failed:', err));
      }

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
    await deferred.userChoice;
    setDeferred(null);
  };

  if (status === 'installed') {
    return (
      <div className={installedClassName || 'flex items-center justify-center gap-2 w-full py-4 bg-green-500/20 text-green-700 rounded-full font-semibold border border-green-500/30'}>
        <Check className="w-5 h-5" />
        {t(lang, 'installed')}
      </div>
    );
  }

  const installLabel = customLabel?.trim() || t(lang, 'install');

  if (status === 'ios') {
    return (
      <div className="space-y-3">
        <div className={buttonClassName || 'w-full py-4 px-4 bg-blue-600 text-white rounded-full font-bold shadow-lg text-center'}>
          {customLabel?.trim() || t(lang, 'iosShare')}
        </div>
        <div className="text-xs opacity-70 leading-relaxed text-left bg-white/50 rounded-lg p-3 space-y-1">
          <div>1. {t(lang, 'iosStep1')}</div>
          <div>2. {t(lang, 'iosStep2')}</div>
          <div>3. {t(lang, 'iosStep3')}</div>
        </div>
      </div>
    );
  }

  if (status === 'ready' && deferred) {
    return (
      <Button
        onClick={handleInstall}
        style={buttonStyle}
        className={buttonClassName || 'w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full'}
      >
        <Download className="w-5 h-5 mr-2" />
        {installLabel}
      </Button>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="w-full py-4 px-4 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-left">
          <div className="font-semibold mb-1">{t(lang, 'unsupportedTitle')}</div>
          <div className="text-xs opacity-90 leading-relaxed">{t(lang, 'unsupportedHint')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4 bg-neutral-200 text-neutral-500 rounded-full text-center text-sm">
      {t(lang, 'detecting')}
    </div>
  );
}
