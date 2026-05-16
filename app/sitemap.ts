import type { MetadataRoute } from 'next';

const SITE_URL = 'https://pwa.ipcloak.ai';

/**
 * Sitemap — 只索引公开可访问的"产品入口"页, 不索引用户生成的安装页
 * (用户的 install/[id] 是私有内容, 不该出现在搜引擎)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
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
  ];
}
