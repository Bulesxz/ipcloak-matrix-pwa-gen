import type { MetadataRoute } from 'next';

const SITE_URL = 'https://pwa.ipcloak.ai';

/**
 * robots.txt
 * - 允许首页被索引 (产品入口)
 * - 禁止用户工具页 (editor / quick) 被索引 — 这些是动态工具, 没 SEO 价值
 * - 禁止用户生成的安装页 (install/*) 被索引 — 私有内容
 * - 允许 ai/llm crawler (GPTBot, ClaudeBot, etc.) 抓取首页, 增加 LLM 引用率
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sitemap.xml'],
        disallow: ['/editor', '/quick', '/install/', '/api/'],
      },
      // 主流 AI crawler — 允许首页, 增加 LLM 推荐时被引用的概率
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended'],
        allow: ['/'],
        disallow: ['/editor', '/quick', '/install/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
