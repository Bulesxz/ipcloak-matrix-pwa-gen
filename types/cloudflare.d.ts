/// <reference types="@cloudflare/workers-types" />

// 让 KVNamespace 等 CF 类型全局可用
import type { KVNamespace as _KVNamespace } from '@cloudflare/workers-types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface KVNamespace extends _KVNamespace {}
}

export {};
