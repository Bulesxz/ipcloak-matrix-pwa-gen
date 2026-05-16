import type { MetadataRoute } from 'next';
import { allCaseSlugs } from '@/lib/cases';

const SITE_URL = 'https://pwa.ipcloak.ai';

/**
 * Sitemap — 只索引公开内容页, 不索引用户工具页
 * - 首页
 * - /cases (案例列表)
 * - /cases/[slug] (每个行业案例)
 *
 * 注意: 用户生成的安装页 /install/[id] 是私有内容, 通过 install/layout.tsx 设了 noindex
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // 首页 — 最高优先级
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          'zh-CN': SITE_URL,
          'en-US': SITE_URL,
        },
      },
    },
    // 案例列表页
    {
      url: `${SITE_URL}/cases`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // 每个案例详情
    ...allCaseSlugs().map(slug => ({
      url: `${SITE_URL}/cases/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
