/**
 * 极简 JSON 文件存储 (单机部署够用, 多实例请换 KV/Postgres)
 * 数据存在 ./data/apps.json
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

export interface AppConfig {
  id?: string;
  url: string;
  name: string;
  description: string;
  iconUrl: string;
  backgroundColor: string;
  /** ⭐ 新: 像素跟踪配置 */
  pixel?: PixelConfig;
  /** 创建时间 (ms) */
  createdAt?: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'apps.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}', 'utf-8');
}

function readAll(): Record<string, AppConfig> {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, AppConfig>) {
  ensure();
  fs.writeFileSync(DATA_FILE, JSON.stringify(map, null, 2), 'utf-8');
}

export const db = {
  getApp(id: string): AppConfig | null {
    return readAll()[id] || null;
  },
  saveApp(input: AppConfig): AppConfig {
    const map = readAll();
    const id = input.id || crypto.randomBytes(6).toString('hex');
    const saved: AppConfig = { ...input, id, createdAt: input.createdAt || Date.now() };
    map[id] = saved;
    writeAll(map);
    return saved;
  },
  listApps(): AppConfig[] {
    return Object.values(readAll()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },
  deleteApp(id: string) {
    const map = readAll();
    delete map[id];
    writeAll(map);
  },
};
