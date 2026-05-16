import type { Metadata } from 'next';
import Link from 'next/link';
import { CASES } from '@/lib/cases';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: '行业案例 · PWA 安装页生成器',
  description:
    '5 大行业 PWA 安装页实战案例: 短剧、iGaming、社交婚恋、跨境电商、金融工具。看看同行如何用 PWA 安装页提升留存、降低 CPI、绕开商店审核 (投流圈也称 W2A)。',
  alternates: {
    canonical: 'https://pwa.ipcloak.ai/cases',
  },
  openGraph: {
    title: '行业案例 · IPCloak.AI PWA 安装页生成器',
    description: '短剧 / iGaming / 社交 / 电商 / 金融 — 5 大行业 PWA 安装页投流实战拆解',
    url: 'https://pwa.ipcloak.ai/cases',
  },
};

// JSON-LD: ItemList of case studies (each as a CreativeWork)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'PWA 安装页 — 行业案例',
  description: '5 大行业的 PWA 安装页投流实战案例 (W2A 解决方案)',
  itemListElement: CASES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Article',
      headline: `${c.industry.zh} — ${c.tagline.zh}`,
      url: `https://pwa.ipcloak.ai/cases/${c.slug}`,
      about: c.industry.zh,
    },
  })),
};

export default function CasesIndexPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 背景光晕 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-pink-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* 返回首页 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* 标题 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-200 mb-6 backdrop-blur-md">
            <span>📚 行业案例</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
            5 大行业 PWA 安装页实战
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
            看看同行如何用 PWA 安装页 + 像素跟踪, 把广告 ROI 翻倍
            <br />
            <span className="text-sm text-neutral-500">投流圈也称之为 W2A (Web-to-App)</span>
          </p>
        </div>

        {/* 案例卡片网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CASES.map(c => (
            <Link
              key={c.slug}
              href={`/cases/${c.slug}`}
              className="group relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 hover:ring-2 hover:ring-purple-400/30 transition-all shadow-xl overflow-hidden"
            >
              {/* 顶部装饰渐变条 */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.accentColor} opacity-70`} />

              <div className="text-5xl mb-4">{c.emoji}</div>

              <div className="text-xs text-purple-300 font-medium mb-2 uppercase tracking-wider">
                {c.industry.zh}
              </div>
              <h2 className="text-xl font-bold text-white mb-3 leading-snug min-h-[56px]">
                {c.tagline.zh}
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-6">
                {c.painPoint.zh}
              </p>

              {/* 顶部数据指标 */}
              <div className="grid grid-cols-3 gap-2 mb-5 py-3 border-y border-white/5">
                {c.metrics.slice(0, 3).map((m, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-base font-bold bg-clip-text text-transparent bg-gradient-to-r ${c.accentColor}`}>
                      {m.delta.zh}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 truncate">
                      {m.label.zh}
                    </div>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 group-hover:text-white">
                查看完整案例
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* 底部 CTA */}
        <div className="mt-20 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-3xl p-10 md:p-14">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            还没找到你的行业?
          </h3>
          <p className="text-neutral-400 mb-8">
            5 分钟自己试一下 — 任何 URL, 任何模板, 任何像素
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-full font-semibold shadow-2xl shadow-purple-500/30 transition-all"
          >
            免费开始制作
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* 底部小字 */}
        <p className="text-center text-xs text-neutral-600 mt-12 max-w-2xl mx-auto leading-relaxed">
          * 数据为行业典型水平的合理预估, 用于演示 PWA 安装页 + 像素跟踪对投流的影响。实际效果以你的产品、创意和投放策略为准。
        </p>
      </div>
    </main>
  );
}
