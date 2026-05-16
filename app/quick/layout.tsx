import type { Metadata } from 'next';

/**
 * Quick 是无状态分享链接, 内容由 URL 参数决定 — 不该被搜引擎索引
 */
export const metadata: Metadata = {
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

export default function QuickLayout({ children }: { children: React.ReactNode }) {
  return children;
}
