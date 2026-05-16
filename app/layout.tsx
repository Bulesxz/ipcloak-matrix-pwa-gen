import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://pwa.ipcloak.ai";
const SITE_NAME = "IPCloak.AI · PWA 安装页生成器";
const TITLE = "PWA 安装页生成器 (W2A) — 把网站变成可安装 App, 支持 APK + 像素跟踪 | IPCloak.AI";
const DESCRIPTION = "免费 PWA 安装页生成器, 投流圈称之为 W2A (Web-to-App)。输入网站 URL 秒级生成精美 PWA / APK 安装页, 内置 Facebook / TikTok / Kwai 像素跟踪, 安装成功自动回传广告平台。绕过应用商店审核, 提升广告 ROI 与用户留存。";
const KEYWORDS = [
  // 核心产品词
  "W2A", "Web to App", "Web2App", "网站转 App", "H5 转 App", "落地页转 App",
  // PWA
  "PWA", "PWA 生成器", "PWA Generator", "PWA 安装页", "PWA 制作工具",
  // APK
  "APK 生成器", "APK 下载页", "Android 安装包",
  // 像素
  "Facebook Pixel", "TikTok Pixel", "Kwai Pixel", "像素跟踪", "像素回传", "安装回调", "appinstalled",
  // 投流场景
  "广告投放", "落地页", "投流工具", "FB 广告", "TT 广告", "Kwai 广告", "performance marketing",
  // 品牌
  "ipcloak.ai", "IPCloak", "爱普出海",
].join(", ");
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | IPCloak.AI W2A 生成器",
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: "IPCloak.AI", url: "https://ipcloak.ai" }],
  creator: "IPCloak.AI",
  publisher: "IPCloak.AI",
  applicationName: SITE_NAME,
  generator: "Next.js",
  category: "Marketing Tools",
  classification: "Web-to-App Generator",
  alternates: {
    canonical: SITE_URL,
    languages: {
      "zh-CN": SITE_URL,
      "en-US": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "IPCloak.AI W2A 生成器 — 一键把网站变成 App",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ipcloak",
    creator: "@ipcloak",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.ico" },
    ],
  },
  manifest: undefined, // 不全站当 PWA, 只有 install 页才是
  verification: {
    // 等你接 GA / Search Console / Bing 时填
    // google: "...",
    // other: { "baidu-site-verification": "..." },
  },
  other: {
    "format-detection": "telephone=no",
    // SEO 给 AI 搜索/LLM crawler
    "ai-content-declaration": "human-curated",
  },
};

// JSON-LD 结构化数据 (SoftwareApplication + Organization + WebSite)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "IPCloak.AI PWA Installer Generator",
      alternateName: ["PWA 安装页生成器", "PWA Generator", "W2A 生成器", "Web-to-App Generator", "APK 下载页生成器"],
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Marketing Tool",
      operatingSystem: "Web",
      description: DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "128",
        bestRating: "5",
      },
      featureList: [
        "PWA 安装页生成",
        "APK 下载页生成",
        "Facebook Pixel 跟踪",
        "TikTok Pixel 跟踪",
        "Kwai Pixel 跟踪",
        "3 种安装页模板",
        "彩虹按钮动画",
        "Hero 大图模板",
        "Google Play 风格模板",
        "中英双语支持",
        "无需扫站, 直接创建",
      ],
      author: {
        "@type": "Organization",
        name: "IPCloak.AI",
        url: "https://ipcloak.ai",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://ipcloak.ai/#org",
      name: "IPCloak.AI",
      alternateName: "爱普出海",
      url: "https://ipcloak.ai",
      logo: "https://ipcloak.ai/logo.png",
      sameAs: [
        "https://pwa.ipcloak.ai",
      ],
      description: "IPCloak.AI 爱普出海 — 跨境投放与品牌出海工具矩阵, 提供 W2A 生成器、IP 代理、广告账户等基础设施。",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": "https://ipcloak.ai/#org" },
      inLanguage: ["zh-CN", "en-US"],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "IPCloak.AI",
          item: "https://ipcloak.ai",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "W2A 生成器",
          item: SITE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "什么是 W2A (Web-to-App)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "W2A 是 Web-to-App 的缩写, 投流圈常用叫法, 指把 H5 网站 / 落地页转换成可安装的 App (PWA 或 APK), 提升广告投放的转化率、用户留存与广告平台像素回传质量。",
          },
        },
        {
          "@type": "Question",
          name: "W2A 生成器和 PWA 生成器有什么区别?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "PWA 生成器只输出 Progressive Web App, W2A 生成器是更广义的概念, 同时支持输出 PWA 安装页和 APK 下载页, 投放团队可以根据广告平台和受众设备选择最合适的分发方式。",
          },
        },
        {
          "@type": "Question",
          name: "支持哪些广告平台的像素跟踪?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "目前支持 Facebook Pixel、TikTok Pixel、Kwai Pixel 三大主流广告平台, 在 PWA 安装成功事件触发时自动回传转化, 反哺广告平台投放算法。",
          },
        },
        {
          "@type": "Question",
          name: "生成的 PWA 是免费的吗?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "是的, IPCloak.AI W2A 生成器目前免费提供, 无需注册即可使用。",
          },
        },
        {
          "@type": "Question",
          name: "iOS 设备能安装吗?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "iOS Safari 支持手动「添加到主屏幕」安装 PWA, 但 Apple 不提供安装成功 API, 因此 iOS 端无法触发像素回传。Android Chrome / Edge 完整支持自动安装 + 像素回传。",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* JSON-LD 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* 预连接到 R2 资源域 (icon/screenshot 直链) */}
        <link rel="preconnect" href="https://pub-b2aa5c35beea4d878b33ca47541656e7.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-b2aa5c35beea4d878b33ca47541656e7.r2.dev" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
