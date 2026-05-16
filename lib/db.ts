/**
 * PWA 配置存储
 *
 * 生产环境 (CF Pages): Cloudflare KV namespace "PWA_APPS"
 * 本地 dev: 进程内 Map (重启清空, 仅作开发用)
 *
 * 依赖: @cloudflare/next-on-pages 在 edge runtime 下注入 ctx
 */

export interface PixelConfig {
  /** 一个 PWA 只配一个平台像素 */
  platform: 'facebook' | 'tiktok' | 'kwai' | 'none';
  /** Pixel ID — FB / TT / Kwai 后台拿到的标识 */
  pixelId?: string;
  /**
   * 安装成功上报的事件名。
   * - FB: CompleteRegistration / Lead / Subscribe / Purchase / AddToCart / 自定义
   * - TT: CompleteRegistration / CompletePayment / SubmitForm / 自定义
   * - Kwai: install / register / purchase / 自定义
   */
  event?: string;
  /** 选填: 转化金额 + 货币 (Purchase / Subscribe 类事件用) */
  value?: number;
  currency?: string;
}

export type AppTemplate = 'classic' | 'playstore' | 'floating';
export type AppLanguage = 'zh' | 'en';

export interface AppReviews {
  /** 平均评分 (0-5), 可选填 */
  rating?: number;
  /** 评价总数 (1234 / 1234567 / 10000+ 等任意展示文案) */
  reviewCount?: string;
  /** 下载量展示 (50K+ / 1M+ / 100,000+ 等任意展示文案) */
  downloads?: string;
}

export interface AppConfig {
  id?: string;
  url: string;
  name: string;
  description: string;
  iconUrl: string;
  backgroundColor: string;
  /** ⭐ 像素跟踪配置 */
  pixel?: PixelConfig;
  /** ⭐ 模板选择 (classic / playstore / floating) */
  template?: AppTemplate;
  /** ⭐ 安装页文案语言 (zh / en) */
  language?: AppLanguage;
  /** ⭐ 评分 / 下载量 (PlayStore 模板专用, 可选填) */
  reviews?: AppReviews;
  /** ⭐ 截图 URL 数组 (PlayStore 模板可选, max 5 张) */
  screenshots?: string[];
  /** ⭐ 安装按钮自定义文字 (留空走 i18n 默认 "安装到主屏幕" / "Add to Home Screen") */
  installLabel?: string;
  /** ⭐ Floating 模板的 hero 大图 URL (留空时 fallback 到 icon 模糊背景) */
  heroImage?: string;
  /** 创建时间 (ISO string, 跟旧版本兼容) */
  createdAt?: string;
}

const KV_BINDING_NAME = 'PWA_APPS';

// ---- 本地 dev fallback (内存 Map) ----
const memStore = new Map<string, AppConfig>();

/**
 * 拿 KV namespace.
 * 生产: 从 next-on-pages 注入的 env 拿
 * dev: undefined → 走 memory
 */
async function getKV(): Promise<KVNamespace | null> {
  try {
    const { getOptionalRequestContext } = await import('@cloudflare/next-on-pages');
    const ctx = getOptionalRequestContext();
    if (!ctx) return null;
    const env = ctx.env as Record<string, unknown>;
    const kv = env[KV_BINDING_NAME];
    return (kv as KVNamespace) || null;
  } catch {
    return null;
  }
}

/** 生成 UUID v4 (edge 兼容, 用 crypto.randomUUID) */
function newId(): string {
  return crypto.randomUUID();
}

export const db = {
  async getApp(id: string): Promise<AppConfig | null> {
    const kv = await getKV();
    if (kv) {
      const raw = await kv.get(id);
      return raw ? (JSON.parse(raw) as AppConfig) : null;
    }
    return memStore.get(id) || null;
  },

  async saveApp(input: AppConfig): Promise<AppConfig> {
    const id = input.id || newId();
    const saved: AppConfig = {
      ...input,
      id,
      createdAt: input.createdAt || new Date().toISOString(),
    };
    const kv = await getKV();
    if (kv) {
      await kv.put(id, JSON.stringify(saved));
    } else {
      memStore.set(id, saved);
    }
    return saved;
  },

  async deleteApp(id: string): Promise<void> {
    const kv = await getKV();
    if (kv) {
      await kv.delete(id);
    } else {
      memStore.delete(id);
    }
  },
};
