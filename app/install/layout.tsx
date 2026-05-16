import type { Metadata } from 'next';

/**
 * 用户生成的安装页是私有内容 (用户自己的 App, 自己的像素, 自己的目标 URL)
 * → 全部 noindex, 不进搜引擎, 不被索引为站点低质页
 *
 * 单个安装页本身的 generateMetadata 仍会输出 title/description/og (供分享时用),
 * 这里只控制 robots 行为
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

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
