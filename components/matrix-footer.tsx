/**
 * IPCloak 矩阵 Footer — 跨子产品导航
 *
 * SEO 作用:
 * 1. 给主站 + 所有兄弟子站做反向链接 (link authority distribution)
 * 2. 让 Google 通过爬虫顺着 footer 发现整个矩阵
 * 3. 强化"同一品牌实体"信号 (与 JSON-LD Organization.sameAs 配合)
 *
 * 用户体验作用:
 * - 让用户知道还有其他工具
 * - 跨产品 cross-sell
 *
 * 矩阵数据来源: 业务官网/PRODUCT_DOMAINS.md
 * 注: 标注 (即将上线) 的子产品域名暂未部署, 链接到主站对应 /services/* 路径
 */

import Link from 'next/link';

interface MatrixProduct {
  name: string;
  emoji: string;
  desc: string;
  href: string;
  external?: boolean; // true = 跳到子域, false = 跳主站锚点
  current?: boolean;  // 当前站点
}

const PRODUCTS: MatrixProduct[] = [
  {
    name: 'IPCloak 斗篷',
    emoji: '🛡️',
    desc: '广告 Cloaking 风控',
    href: 'https://ipcloak.ai/services/cloaking',
  },
  {
    name: 'IPPWA · PWA 安装页',
    emoji: '📲',
    desc: '本工具 · 网站秒变 App',
    href: 'https://pwa.ipcloak.ai',
    current: true,
  },
  {
    name: 'IPLink 短链',
    emoji: '🔗',
    desc: '品牌短链 + 追踪',
    href: 'https://ipcloak.ai/services/shortlink',
  },
  {
    name: 'IPArmor 代码混淆',
    emoji: '🔐',
    desc: '前端代码加壳保护',
    href: 'https://ipcloak.ai/services/obfuscator',
  },
  {
    name: 'IPBrowser 指纹浏览器',
    emoji: '🌐',
    desc: '多账号防关联',
    href: 'https://ipcloak.ai/services/fingerprint',
  },
  {
    name: 'IPLanding 落地页',
    emoji: '🎨',
    desc: '快速建站工具',
    href: 'https://ipcloak.ai/services/landingpage',
  },
  {
    name: 'IPSCRM 私域',
    emoji: '💬',
    desc: '社交 CRM',
    href: 'https://ipcloak.ai/services/scrm',
  },
  {
    name: 'IP Tools',
    emoji: '🛠️',
    desc: 'IP 查询检测',
    href: 'https://ipcloak.ai/services/iptool',
  },
];

interface Props {
  lang?: 'zh' | 'en';
}

export default function MatrixFooter({ lang = 'zh' }: Props) {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 矩阵标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-3">
            <span>✨</span>
            {lang === 'zh' ? 'IPCloak.AI · 爱普出海产品矩阵' : 'IPCloak.AI Product Matrix'}
          </div>
          <h2 className="text-lg font-bold text-white">
            {lang === 'zh' ? '同一团队的其他出海工具' : 'Other tools from the same team'}
          </h2>
        </div>

        {/* 8 个产品 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRODUCTS.map(p => {
            const cls = p.current
              ? 'bg-purple-500/10 border-purple-400/30 ring-1 ring-purple-400/20'
              : 'bg-white/3 border-white/8 hover:bg-white/8 hover:border-white/15';
            return (
              <Link
                key={p.href}
                href={p.href}
                rel={p.current ? undefined : 'noopener'}
                className={`group relative ${cls} border rounded-xl p-3 transition-all overflow-hidden`}
              >
                <div className="flex items-start gap-2">
                  <div className="text-2xl flex-shrink-0">{p.emoji}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                      {p.name}
                      {p.current && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/40 text-purple-100 font-medium">
                          {lang === 'zh' ? '当前' : 'Current'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{p.desc}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 底部品牌 + 主站链接 */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>©</span>
            <Link href="https://ipcloak.ai" className="text-purple-300 hover:text-white transition-colors font-semibold">
              IPCloak.AI
            </Link>
            <span className="text-neutral-600">·</span>
            <span>
              {lang === 'zh' ? '下一代流量安全与分发基础设施' : 'Next-gen traffic & distribution infrastructure'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <Link href="https://ipcloak.ai" className="hover:text-white transition-colors">
              {lang === 'zh' ? '主站' : 'Main'}
            </Link>
            <Link href="https://ipcloak.ai/terms" className="hover:text-white transition-colors">
              {lang === 'zh' ? '条款' : 'Terms'}
            </Link>
            <Link href="https://ipcloak.ai/privacy" className="hover:text-white transition-colors">
              {lang === 'zh' ? '隐私' : 'Privacy'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
