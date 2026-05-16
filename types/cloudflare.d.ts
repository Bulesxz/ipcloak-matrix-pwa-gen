/// <reference types="@cloudflare/workers-types" />

import type { KVNamespace as _KVNamespace, R2Bucket as _R2Bucket } from '@cloudflare/workers-types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface KVNamespace extends _KVNamespace {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface R2Bucket extends _R2Bucket {}
}

export {};
