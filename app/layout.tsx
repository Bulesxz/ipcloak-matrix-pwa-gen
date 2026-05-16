import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "IPPWA · PWA 安装页生成器 + 像素跟踪 | ipcloak.ai",
  description: "一键将任何网站转换为可安装的 PWA, 支持 Facebook / TikTok / Kwai 像素跟踪 — 安装成功自动上报广告平台, 反哺投放算法。绕过应用商店审核, 快速分发。",
  keywords: "PWA, PWA Generator, IPPWA, ipcloak.ai, 爱普PWA, Facebook Pixel, TikTok Pixel, Kwai Pixel, 像素跟踪, PWA 安装跟踪, 安装回调, FP, JF, FN",
  openGraph: {
    title: "IPPWA · PWA 安装页生成器 + 像素跟踪 | ipcloak.ai",
    description: "一键将网站转换为 PWA 应用, 安装成功上报广告平台像素事件。",
    url: "https://pwa.ipcloak.ai",
    siteName: "ipcloak.ai",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
