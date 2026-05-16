import type { Metadata } from 'next';

/**
 * Editor 是用户的"工作台"页, 不是面向搜引擎的内容页
 * → 显式 noindex, 避免占用 crawl budget, 也避免被索引为低质页面
 */
export const metadata: Metadata = {
  title: '编辑器 · 自定义安装页',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
