import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CASES, getCase } from '@/lib/cases';
import { ArrowLeft, ArrowRight, CheckCircle2, TrendingUp, Lightbulb, Layers } from 'lucide-react';

export const runtime = 'edge';

interface Props {
  params: Promise<{ slug: string }>;
}

// 注意: edge runtime 不支持 generateStaticParams, 5 个 case 运行时渲染开销极小, 不影响性能

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return { title: '案例未找到' };

  const title = `${c.industry.zh} W2A 案例 — ${c.tagline.zh} | PWA 安装页生成器`;
  const description = c.painPoint.zh + ' — ' + c.solution.zh.slice(0, 60) + '...';

  return {
    title,
    description,
    alternates: {
      canonical: `https://pwa.ipcloak.ai/cases/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://pwa.ipcloak.ai/cases/${slug}`,
      type: 'article',
    },
  };
}

export default async function CaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  // 当前案例在数组中的位置, 用来算 prev/next
  const idx = CASES.findIndex(x => x.slug === slug);
  const prev = idx > 0 ? CASES[idx - 1] : null;
  const next = idx < CASES.length - 1 ? CASES[idx + 1] : null;

  // JSON-LD: Article + ItemList of metrics (for SEO rich results)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${c.industry.zh} W2A 案例 — ${c.tagline.zh}`,
    description: c.painPoint.zh,
    author: { '@type': 'Organization', name: 'IPCloak.AI', url: 'https://ipcloak.ai' },
    publisher: { '@type': 'Organization', name: 'IPCloak.AI', url: 'https://ipcloak.ai' },
    about: {
      '@type': 'Thing',
      name: c.industry.zh,
      description: c.tagline.zh,
    },
    mainEntityOfPage: `https://pwa.ipcloak.ai/cases/${slug}`,
  };

  // 把 demoParams 转成 /quick?... URL
  const demoQs = new URLSearchParams(c.demoParams).toString();

  return (
    <main className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 背景 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className={`absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-gradient-to-br ${c.accentColor} opacity-10 blur-[120px] rounded-full`} />
        <div className="absolute top-[60%] -right-[10%] w-[50vw] h-[50vw] bg-pink-600/10 blur-[120px] rounded-full" />
      </div>

      <article className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* 面包屑 */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <Link href="/" className="hover:text-white">首页</Link>
          <span>/</span>
          <Link href="/cases" className="hover:text-white">行业案例</Link>
          <span>/</span>
          <span className="text-neutral-300">{c.industry.zh}</span>
        </nav>

        {/* 标题区 */}
        <header className="mb-12">
          <div className="text-7xl mb-6">{c.emoji}</div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-gradient-to-r ${c.accentColor} bg-clip-text text-transparent border border-white/10`}>
            <span className="text-white">{c.industry.zh}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            {c.tagline.zh}
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed max-w-3xl">
            {c.industry.en} · W2A 投流案例拆解
          </p>
        </header>

        {/* 数据指标条 */}
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {c.metrics.map((m, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-3">
                {m.label.zh}
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm text-neutral-500 line-through">{m.before}</span>
                <ArrowRight className="w-3 h-3 text-neutral-600" />
                <span className="text-2xl font-bold text-white">{m.after}</span>
              </div>
              <div className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${c.accentColor}`}>
                {m.delta.zh}
              </div>
            </div>
          ))}
        </div>

        {/* 痛点 */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
              <TrendingUp className="w-5 h-5 -rotate-45" />
            </div>
            <h2 className="text-2xl font-bold text-white">行业痛点</h2>
          </div>
          <p className="text-base text-neutral-300 leading-relaxed pl-13">
            {c.painPoint.zh}
          </p>
        </section>

        {/* 方案 */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">W2A 解决方案</h2>
          </div>
          <p className="text-base text-neutral-300 leading-relaxed">
            {c.solution.zh}
          </p>
        </section>

        {/* 推荐配置 */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">推荐配置</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <ConfigChip label="模板" value={templateLabel(c.recommendedConfig.template)} />
              <ConfigChip label="按钮颜色" value={buttonColorLabel(c.recommendedConfig.buttonColor)} />
              <ConfigChip label="分发方式" value={c.recommendedConfig.distribution === 'apk' ? 'APK 下载' : 'PWA 安装'} />
            </div>
            <div className="flex items-start gap-2 text-sm text-neutral-400 leading-relaxed pt-4 border-t border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{c.recommendedConfig.note.zh}</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={`bg-gradient-to-br ${c.accentColor} bg-opacity-10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden`}>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              用这套配置开始制作
            </h3>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              点击下方按钮, 直接预填本案例的推荐配置进入编辑器
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/quick?${demoQs}&name=${encodeURIComponent(c.industry.zh + ' Demo')}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-neutral-900 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform"
              >
                查看预览效果
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black/30 border border-white/30 text-white rounded-full font-bold backdrop-blur-md hover:bg-black/50 transition-colors"
              >
                从我自己的 URL 开始
              </Link>
            </div>
          </div>
        </section>

        {/* 上一篇 / 下一篇 */}
        <nav className="mt-16 grid md:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/cases/${prev.slug}`}
              className="flex items-center gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-neutral-500 mb-1">上一个案例</div>
                <div className="text-sm font-medium text-white truncate">
                  {prev.emoji} {prev.industry.zh}
                </div>
              </div>
            </Link>
          ) : <div />}

          {next ? (
            <Link
              href={`/cases/${next.slug}`}
              className="flex items-center justify-end gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 transition-colors group text-right"
            >
              <div className="min-w-0">
                <div className="text-xs text-neutral-500 mb-1">下一个案例</div>
                <div className="text-sm font-medium text-white truncate">
                  {next.industry.zh} {next.emoji}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
            </Link>
          ) : <div />}
        </nav>

        {/* 返回所有案例 */}
        <div className="mt-10 text-center">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            查看全部 5 个案例
          </Link>
        </div>

        {/* 免责小字 */}
        <p className="text-center text-xs text-neutral-600 mt-12 max-w-2xl mx-auto leading-relaxed">
          * 数据为行业典型水平的合理预估, 用于演示 W2A 安装页 + 像素跟踪对投流的影响。实际效果以你的产品、创意和投放策略为准。
        </p>
      </article>
    </main>
  );
}

function ConfigChip({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );
}

function templateLabel(t: string): string {
  switch (t) {
    case 'classic': return '经典居中卡片';
    case 'playstore': return 'Google Play 风格';
    case 'floating': return '大图悬浮按钮';
    default: return t;
  }
}

function buttonColorLabel(c: string): string {
  const map: Record<string, string> = {
    rainbow: '🌈 彩虹渐变',
    blue: '🔵 经典蓝',
    green: '🟢 深绿色',
    orange: '🟠 活力橙',
    red: '🔴 警示红',
    black: '⚫ 极简黑',
    purple: '🟣 神秘紫',
  };
  return map[c] || c;
}
