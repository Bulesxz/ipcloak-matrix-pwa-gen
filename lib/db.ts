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
export type AppDistribution = 'pwa' | 'apk';
/**
 * 安装按钮配色 (classic + floating 模板生效, playstore 永远是 Google Play 深绿不可改)
 * - rainbow: 7 色渐变动画 (默认)
 * - blue/green/orange/red/black/purple: 纯色预设
 * - custom: 用户自填 hex (读 customButtonColor 字段)
 */
export type ButtonColor = 'rainbow' | 'blue' | 'green' | 'orange' | 'red' | 'black' | 'purple' | 'custom';

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
  /** 扫站源 URL: 用来抓 manifest/icon/meta. 也是兜底 start_url (targetUrl 留空时) */
  url: string;
  /** ⭐ PWA 启动后实际打开的目标 URL. 留空时 fallback 到 url.
   *  适用: 扫 https://meto.asia 拿素材, 但 PWA 装好后打开 https://meto.asia/lp/promo?utm_source=pwa */
  targetUrl?: string;
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
  /** ⭐ 分发方式: pwa = H5 安装到主屏幕 (默认), apk = 下载 APK 文件 */
  distribution?: AppDistribution;
  /** ⭐ APK 下载 URL (distribution=apk 时必填) */
  apkUrl?: string;
  /** ⭐ 按钮颜色 (classic + floating + apk-button 通用, playstore 不受影响) */
  buttonColor?: ButtonColor;
  /** ⭐ 自定义按钮 hex (buttonColor=custom 时生效, 如 #ff6b6b) */
  customButtonColor?: string;
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
