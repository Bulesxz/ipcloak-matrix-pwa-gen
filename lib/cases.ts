/**
 * 行业案例数据 — SEO + 销售双重用途
 *
 * - slug: URL 路径 /cases/[slug], 同时是 i18n key
 * - emoji + accentColor: 卡片视觉锚点
 * - 痛点 / 方案 / 数据 / 配置: 详情页核心内容
 * - demoParams: 一键预填到编辑器 / quick 路由的参数
 *
 * 注意: 数据为行业典型水平的合理预估, 用于演示工具能力
 * 实际效果以客户投放/产品/创意为准
 */

export interface CaseStudy {
  slug: string;
  emoji: string;
  accentColor: string; // tailwind from-X-500 to-X-500
  industry: { zh: string; en: string };
  tagline: { zh: string; en: string };

  // ============ 详情页内容 ============
  painPoint: { zh: string; en: string };
  solution: { zh: string; en: string };
  metrics: Array<{
    label: { zh: string; en: string };
    before: string;
    after: string;
    delta: { zh: string; en: string };
  }>;
  recommendedConfig: {
    template: 'classic' | 'playstore' | 'floating';
    buttonColor: 'rainbow' | 'blue' | 'green' | 'orange' | 'red' | 'black' | 'purple';
    distribution: 'pwa' | 'apk';
    note: { zh: string; en: string };
  };
  // 详情页可点击的"用这个配置创建"的预填参数
  demoParams: Record<string, string>;
}

export const CASES: CaseStudy[] = [
  // ============ 1. 短剧 ============
  {
    slug: 'short-drama',
    emoji: '📺',
    accentColor: 'from-rose-500 to-orange-500',
    industry: { zh: '短剧 / 微短剧', en: 'Short Drama' },
    tagline: {
      zh: '把买量从"看一集就走"变成"装到桌面追完整季"',
      en: 'Turn one-episode bounces into install-and-binge users',
    },
    painPoint: {
      zh: '短剧用户首集留存高但跨集流失严重 — 用户在浏览器看完 1 集就关 tab, CPI 高、LTV 低, 钱花在拉新而非复看上。',
      en: 'Short drama users binge episode 1 then bounce — sky-high CPI with no return path back to your series catalog.',
    },
    solution: {
      zh: 'PWA 安装页把短剧站打包成可安装应用, 用户"装到桌面"后, 桌面图标=直接回看入口。配合 FB / Kwai 像素跟踪安装事件, 算法快速识别高价值用户, 二次曝光转化率翻倍。',
      en: 'Wrap your short-drama site as a PWA. Once users add the icon to home screen, the icon becomes their re-entry path. Pixel-tracked install events let FB/Kwai retarget the highest-LTV audiences automatically.',
    },
    metrics: [
      {
        label: { zh: '次日留存', en: 'D1 Retention' },
        before: '12%', after: '38%',
        delta: { zh: '+216%', en: '+216%' },
      },
      {
        label: { zh: '单用户观看集数', en: 'Episodes per user' },
        before: '1.4', after: '4.2',
        delta: { zh: '+200%', en: '+200%' },
      },
      {
        label: { zh: '回访 CPM 成本', en: 'Retargeting CPM' },
        before: '$8.5', after: '$2.1',
        delta: { zh: '-75%', en: '-75%' },
      },
    ],
    recommendedConfig: {
      template: 'floating',
      buttonColor: 'rainbow',
      distribution: 'pwa',
      note: {
        zh: '推荐"大图悬浮按钮"模板 — Hero 大图用主剧海报, 视觉冲击最强, 转化率最高',
        en: '"Hero + Floating Button" template — full-screen poster art drives highest install conversion',
      },
    },
    demoParams: { template: 'floating', btncolor: 'rainbow' },
  },

  // ============ 2. iGaming ============
  {
    slug: 'igaming',
    emoji: '🎰',
    accentColor: 'from-emerald-500 to-yellow-500',
    industry: { zh: 'iGaming / 博彩', en: 'iGaming / Betting' },
    tagline: {
      zh: '绕开应用商店审核, 24h 上线全球落地页',
      en: 'Skip app store reviews, ship global landing pages in 24h',
    },
    painPoint: {
      zh: 'iGaming 产品被 Google Play / App Store 全面封禁, 只能走 H5 落地页或 APK 分发。H5 流量留不住, APK 受 Android 安装提示劝退, 跨境合规风险高。',
      en: 'iGaming verticals are banned from Google Play and App Store. H5 traffic doesn\'t stick; raw APK distribution scares users with "unknown sources" warnings. Compliance risk is sky-high.',
    },
    solution: {
      zh: '双分发组合: PWA 安装页提供"无安装包"的桌面快捷方式(绕过 Android 安全警告), APK 模式提供原生下载页面(Google Play 风格模板降低用户警惕)。一份配置自动判断设备, 自动选择最优分发路径。',
      en: 'Dual distribution: PWA for icon-only desktop install (bypasses Android security warnings), APK with Google Play-styled download page (lowers user friction). One config auto-detects device and picks the optimal path.',
    },
    metrics: [
      {
        label: { zh: '安装转化率', en: 'Install Conversion' },
        before: '3.2%', after: '11.8%',
        delta: { zh: '+269%', en: '+269%' },
      },
      {
        label: { zh: '首日入金率', en: 'D1 Deposit Rate' },
        before: '2.1%', after: '5.4%',
        delta: { zh: '+157%', en: '+157%' },
      },
      {
        label: { zh: 'Pixel 像素覆盖率', en: 'Pixel Match Rate' },
        before: '0%', after: '94%',
        delta: { zh: '完整算法回流', en: 'Full attribution' },
      },
    ],
    recommendedConfig: {
      template: 'playstore',
      buttonColor: 'green',
      distribution: 'apk',
      note: {
        zh: 'Google Play 风格 + 深绿"安装"按钮 + APK 直链下载, 用户心智=正规商店应用',
        en: 'Google Play styling + classic green install button + APK direct download — looks legit, feels safe',
      },
    },
    demoParams: { template: 'playstore', btncolor: 'green', distribution: 'apk' },
  },

  // ============ 3. 社交 / 婚恋 ============
  {
    slug: 'social-dating',
    emoji: '💬',
    accentColor: 'from-pink-500 to-purple-500',
    industry: { zh: '社交 / 婚恋', en: 'Social / Dating' },
    tagline: {
      zh: '把"匿名访问"变成"实名常驻", 信任度直接拉满',
      en: 'Turn anonymous visitors into resident users with trust signals',
    },
    painPoint: {
      zh: '社交/婚恋类产品需要"用户长期回访"才有变现机会, 但浏览器访问留不下用户。原生 App 开发周期 3-6 个月, 还要面对 18+ 内容审核问题。',
      en: 'Dating apps need long-term retention to monetize, but browsers leak users. Native app builds take 3-6 months and still face 18+ content moderation.',
    },
    solution: {
      zh: 'PWA 安装页 = 用 1 天替代 App 项目。用户「添加到主屏幕」后, 桌面图标=随时回访入口, 独立窗口启动看不到浏览器地址栏, 体验接近原生 App。配合像素跟踪, FB 算法在受众池里精准筛选"安装且活跃"的高质量用户, 而不是只优化点击。',
      en: 'Replace a 6-month App project with a 1-day PWA installer. Once users "Add to Home Screen", the icon becomes their re-entry path — standalone window with no browser chrome, UX close to native. Pixel tracking lets FB optimize for "install + active" instead of just clicks.',
    },
    metrics: [
      {
        label: { zh: '7 日留存', en: 'D7 Retention' },
        before: '8%', after: '34%',
        delta: { zh: '+325%', en: '+325%' },
      },
      {
        label: { zh: '日均回访次数', en: 'Daily Re-opens' },
        before: '0.4', after: '2.6',
        delta: { zh: '+550%', en: '+550%' },
      },
      {
        label: { zh: '付费转化 LTV', en: 'Pay LTV' },
        before: '$1.8', after: '$11.2',
        delta: { zh: '+522%', en: '+522%' },
      },
    ],
    recommendedConfig: {
      template: 'classic',
      buttonColor: 'rainbow',
      distribution: 'pwa',
      note: {
        zh: '经典居中卡片 + 彩虹按钮, 突出"温暖、有趣、值得加好友"的品牌情绪',
        en: 'Classic centered card + rainbow button — warm, fun, "worth adding" emotional positioning',
      },
    },
    demoParams: { template: 'classic', btncolor: 'rainbow' },
  },

  // ============ 4. 跨境电商 / 仿牌 ============
  {
    slug: 'ecommerce-dtc',
    emoji: '🛒',
    accentColor: 'from-blue-500 to-cyan-500',
    industry: { zh: '跨境电商 / DTC', en: 'Cross-border E-commerce / DTC' },
    tagline: {
      zh: '把独立站变 App, 复购率翻 3 倍',
      en: 'Turn your Shopify store into an app, 3x repeat purchase rate',
    },
    painPoint: {
      zh: '独立站(Shopify / WooCommerce)的复购率长期低位 — 用户买一次就消失, 找不到入口。原生 App 投入大、ROI 难算, 还要解决 App Store 跨境支付审核问题。',
      en: 'DTC sites struggle with repeat purchase — first-time buyers never return because there\'s no app icon to remind them. Native apps are capital-heavy with murky ROI.',
    },
    solution: {
      zh: 'PWA 安装页一键把 Shopify 店铺打包成可安装应用, 用户首单后引导"添加到主屏幕" → 桌面图标=随时复购入口, 用户不用再记网址、不用搜邮件、不用翻浏览器收藏夹, 直接打开。配合像素跟踪, FB 算法识别"已安装的高 LTV 用户", 后续广告优先投给这类受众。',
      en: 'One-click wrap your Shopify store as a PWA. After first purchase, prompt "Add to Home Screen" → the icon is now your repeat-purchase channel. No more "search inbox for the order email" or "lost bookmark" friction. Pixel tracking lets FB optimize for "installed high-LTV users" in lookalike audiences.',
    },
    metrics: [
      {
        label: { zh: '60 日复购率', en: '60-day Repeat Rate' },
        before: '8%', after: '27%',
        delta: { zh: '+238%', en: '+238%' },
      },
      {
        label: { zh: '桌面图标回访率', en: 'Icon-to-Visit Rate' },
        before: '0%', after: '38%',
        delta: { zh: '新增回访通道', en: 'New channel' },
      },
      {
        label: { zh: '客户 LTV / CAC', en: 'LTV / CAC ratio' },
        before: '1.4×', after: '4.1×',
        delta: { zh: '+193%', en: '+193%' },
      },
    ],
    recommendedConfig: {
      template: 'playstore',
      buttonColor: 'blue',
      distribution: 'pwa',
      note: {
        zh: '电商场景推荐 Google Play 风格 — 评分/下载量营造"被验证过"的信任感, 蓝色按钮稳重可靠',
        en: 'PlayStore styling builds trust through "verified" social proof — blue button reads reliable and professional',
      },
    },
    demoParams: { template: 'playstore', btncolor: 'blue' },
  },

  // ============ 5. 金融 / 工具 ============
  {
    slug: 'fintech-tools',
    emoji: '📈',
    accentColor: 'from-violet-500 to-indigo-500',
    industry: { zh: '金融工具 / Crypto', en: 'Fintech / Crypto Tools' },
    tagline: {
      zh: '高净值用户 = 桌面常驻, 一键回访不丢失',
      en: 'High-value users live on the home screen, not in tabs',
    },
    painPoint: {
      zh: '金融/Crypto 工具用户每天打开 5-10 次, 但浏览器书签转化率低。原生 App 上架审核 2-4 周, 政策风险大, 美区 / 欧区合规要求严苛。',
      en: 'Fintech users check tools 5-10× daily, but bookmarks don\'t convert. Native apps face 2-4 week reviews and tightening US/EU compliance.',
    },
    solution: {
      zh: 'PWA 安装页让金融工具站"零延迟"上线 — 桌面图标常驻, 用户每天点击图标进入独立窗口启动, 无需打开浏览器再找网址, 也无地址栏干扰决策。无需提交审核, 全球秒级上线。Pixel 跟踪安装事件, 反哺 Google Ads / FB 的"高价值用户"受众。',
      en: 'PWA installer ships a fintech tool to the home screen instantly — daily users tap the icon to open in a standalone window, no browser, no URL bar, no distraction. Zero review delay. Pixel-tracked installs feed Google Ads / FB high-value audience optimization in real time.',
    },
    metrics: [
      {
        label: { zh: 'DAU / MAU', en: 'DAU / MAU' },
        before: '8%', after: '31%',
        delta: { zh: '+288%', en: '+288%' },
      },
      {
        label: { zh: '桌面图标日均启动', en: 'Daily Icon Opens' },
        before: '0', after: '5.2',
        delta: { zh: '新增高频入口', en: 'New entry channel' },
      },
      {
        label: { zh: 'App 上线周期', en: 'Time to launch' },
        before: '3-4 周', after: '10 分钟',
        delta: { zh: '-99%', en: '-99%' },
      },
    ],
    recommendedConfig: {
      template: 'classic',
      buttonColor: 'black',
      distribution: 'pwa',
      note: {
        zh: '经典居中模板 + 黑色按钮 — 极简、专业、值得信任(金融科技黄金搭配)',
        en: 'Classic centered + black button — minimal, professional, trustworthy (fintech\'s winning combo)',
      },
    },
    demoParams: { template: 'classic', btncolor: 'black' },
  },
];

/** 通过 slug 查找案例 */
export function getCase(slug: string): CaseStudy | undefined {
  return CASES.find(c => c.slug === slug);
}

/** 全部 slug 列表(给 generateStaticParams / sitemap 用) */
export function allCaseSlugs(): string[] {
  return CASES.map(c => c.slug);
}
