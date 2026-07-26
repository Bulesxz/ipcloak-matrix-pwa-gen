import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const layout = fs.readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8');
const footer = fs.readFileSync(path.join(ROOT, 'components/matrix-footer.tsx'), 'utf8');

test('PWA metadata is policy-safe and links back to the exact main product page', () => {
  assert.doesNotMatch(layout, /绕过应用商店审核/);
  assert.doesNotMatch(layout, /aggregateRating/);
  assert.match(footer, /href:\s*'https:\/\/ipcloak\.ai\/services\/pwa\/'/);
  assert.match(footer, /PWA 产品详情/);
});
