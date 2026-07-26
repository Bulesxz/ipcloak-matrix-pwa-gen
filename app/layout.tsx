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
const TITLE = "PWA 安装页生成器 · 把网站装到桌面 + 像素跟踪 | IPCloak.AI";
const DESCRIPTION = "免费 PWA 安装页生成器。输入网站 URL 生成可安装页面，支持添加到主屏幕、独立窗口启动、Facebook / TikTok / Kwai 像素事件和多种页面模板，适合构建可复访的 Web-to-App 体验。";
const KEYWORDS = [
  // 核心产品词 — PWA 系列优先 (用户搜索量最大)
  "PWA", "PWA 生成器", "PWA Generator", "PWA 安装页", "PWA 安装页生成器", "PWA 制作工具", "Progressive Web App",
  "添加到主屏幕", "Add to Home Screen", "桌面快捷方式", "网站装到桌面",
  // 行业别称
  "W2A", "Web to App", "Web2App", "网站转 App", "H5 转 App", "落地页转 App",
  // APK 配套
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
    template: "%s | IPCloak.AI PWA 安装页生成器",
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
        alt: "IPCloak.AI PWA 安装页生成器 — 一键把网站装到桌面",
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

// JSON-LD 结构化数据
// 矩阵 SEO 关键设计:
//   - Organization 集中声明所有 sibling 子站 (sameAs) → 让 Google 把 ipcloak.ai 整个矩阵识别为同一品牌实体
//   - WebSite.isPartOf 指向主站 WebSite → 子站归属关系
//   - SoftwareApplication.publisher 用 @id 引用主站 Organization → 产品所有权
//   - BreadcrumbList: 主站 → 产品矩阵 hub → 本产品
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // ============ 主站 Organization (品牌实体, 所有矩阵子站共享同一 @id) ============
    {
      "@type": ["Organization", "Brand"],
      "@id": "https://ipcloak.ai/#org",
      name: "IPCloak.AI",
      alternateName: ["爱普出海", "IPCloak", "ipcloak.ai"],
      url: "https://ipcloak.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://ipcloak.ai/logo.png",
        width: 512,
        height: 512,
      },
      description: "IPCloak.AI 爱普出海 — 跨境投放与品牌出海基础设施矩阵, 旗下涵盖广告斗篷、PWA 安装页生成器、品牌短链、代码混淆、指纹浏览器等核心工具。",
      slogan: "下一代流量安全与分发基础设施",
      // sameAs: 把矩阵所有子站列出, 让 Google Knowledge Graph 合并实体
      sameAs: [
        "https://ipcloak.ai",
        "https://cloak.ipcloak.ai",
        "https://pwa.ipcloak.ai",
        "https://link.ipcloak.ai",
        "https://armor.ipcloak.ai",
        "https://browser.ipcloak.ai",
        "https://page.ipcloak.ai",
        "https://builder.ipcloak.ai",
      ],
    },

    // ============ 主站 WebSite (本子站 isPartOf 此节点) ============
    {
      "@type": "WebSite",
      "@id": "https://ipcloak.ai/#website",
      url: "https://ipcloak.ai",
      name: "IPCloak.AI · 爱普出海",
      publisher: { "@id": "https://ipcloak.ai/#org" },
      inLanguage: ["zh-CN", "en-US"],
    },

    // ============ 本子站 WebSite (归属于主站 WebSite) ============
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": "https://ipcloak.ai/#org" },
      isPartOf: { "@id": "https://ipcloak.ai/#website" },  // ← 矩阵归属
      inLanguage: ["zh-CN", "en-US"],
    },

    // ============ 本产品 SoftwareApplication ============
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "IPCloak.AI PWA Installer Generator",
      alternateName: ["IPPWA", "爱普PWA", "PWA 安装页生成器", "PWA Generator", "W2A 生成器", "Web-to-App Generator", "APK 下载页生成器"],
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
      // 矩阵归属
      publisher: { "@id": "https://ipcloak.ai/#org" },
      isPartOf: { "@id": "https://ipcloak.ai/#website" },
    },

    // ============ 面包屑: 主站 → 产品矩阵 → 本产品 ============
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
          name: "产品矩阵",
          item: "https://ipcloak.ai/#products",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "PWA 安装页生成器",
          item: SITE_URL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "什么是 PWA 安装页?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "PWA (Progressive Web App) 安装页是一个特殊的网页, 提供「添加到主屏幕」按钮, 用户点击后浏览器会把你的网站图标添加到手机/电脑桌面。用户后续点击桌面图标会以独立窗口启动网站, 不显示浏览器地址栏, 体验接近原生 App。整个过程不需要应用商店审核, 不需要开发原生 App, 也不需要用户输入网址 — 桌面图标本身就是回访入口。",
          },
        },
        {
          "@type": "Question",
          name: "什么是 W2A? 和 PWA 安装页是同一个东西吗?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "W2A 是 Web-to-App 的缩写, 跨境投流/广告圈对这套做法的统称, 涵盖把网站转化为可安装应用的所有技术路径。PWA 安装页是 W2A 最主流、最优雅的实现方式 — 用户点一下按钮就装到桌面, 不下载安装包, 体验最丝滑。所以本工具实质上既是 PWA 安装页生成器, 也是投流圈说的 W2A 工具。",
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
            text: "是的, IPCloak.AI PWA 安装页生成器目前完全免费提供, 无需注册即可使用。",
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
