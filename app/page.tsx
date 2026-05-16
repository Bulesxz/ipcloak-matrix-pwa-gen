'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Smartphone, Sparkles, Loader2, Activity, Languages, PlusCircle } from 'lucide-react';
import { dict, type Dict } from '@/lib/i18n';

type SiteLang = 'zh' | 'en';

const STORAGE_KEY = 'pwa-gen-lang';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<SiteLang>('zh');
  const router = useRouter();

  // 1. 加载默认语言: localStorage > 浏览器语言 > zh
  useEffect(() => {
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as SiteLang | null;
    if (stored === 'zh' || stored === 'en') {
      setLang(stored);
    } else if (typeof navigator !== 'undefined') {
      const n = navigator.language?.toLowerCase() || '';
      setLang(n.startsWith('zh') ? 'zh' : 'en');
    }
  }, []);

  const t: Dict = dict[lang];

  const toggleLang = () => {
    const next: SiteLang = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error('Failed to scan');

      const data = (await res.json()) as Record<string, unknown>;
      // 带上默认 language = 当前 UI 语言, 便于编辑器自动选
      sessionStorage.setItem('scannedApp', JSON.stringify({ ...data, language: lang }));
      router.push('/editor');
    } catch (error) {
      console.error(error);
      alert(lang === 'zh' ? '扫描失败, 请检查 URL 后重试' : 'Scan failed, please check URL and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white overflow-hidden relative selection:bg-purple-500/30">
      {/* 顶部右上语言切换 */}
      <button
        type="button"
        onClick={toggleLang}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-neutral-300 backdrop-blur-md transition"
        aria-label="Toggle language"
      >
        <Languages className="w-3.5 h-3.5" />
        {lang === 'zh' ? 'EN' : '中文'}
      </button>

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-200 mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>ipcloak.ai · PWA Installer Generator</span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm"
            dangerouslySetInnerHTML={{ __html: t.siteHero }}
          />

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {t.siteSub}
          </p>

          <Card className="max-w-xl mx-auto mt-10 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
            <CardContent className="p-2">
              <form onSubmit={handleScan} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-transparent border-transparent text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-lg"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 px-6 bg-white text-black hover:bg-neutral-200 transition-all font-semibold rounded-lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.siteCTA}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* "直接创建" 第二个 CTA — 不扫站, 全部素材自己填 */}
          <div className="flex items-center justify-center gap-3 text-neutral-500 text-sm mt-4">
            <div className="h-px w-12 bg-white/10" />
            {lang === 'zh' ? '或' : 'or'}
            <div className="h-px w-12 bg-white/10" />
          </div>
          <button
            type="button"
            onClick={() => {
              // 直接给一个空 stub 进 editor (扫站结果模拟)
              sessionStorage.setItem('scannedApp', JSON.stringify({
                url: '',
                name: '',
                description: '',
                iconUrl: '',
                backgroundColor: '#ffffff',
                language: lang,
              }));
              router.push('/editor');
            }}
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            {lang === 'zh' ? '直接创建 (不扫站, 自己上传素材)' : 'Create from scratch (skip scan, upload your own)'}
          </button>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-80">
            <div className="flex flex-col gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">{t.siteFeature1}</h3>
              <p className="text-sm text-neutral-400">{t.siteFeature1Desc}</p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">{t.siteFeature2}</h3>
              <p className="text-sm text-neutral-400">{t.siteFeature2Desc}</p>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white">{t.siteFeature3}</h3>
              <p className="text-sm text-neutral-400">{t.siteFeature3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
