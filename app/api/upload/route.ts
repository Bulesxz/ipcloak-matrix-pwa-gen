/**
 * POST /api/upload
 *   multipart/form-data, field name "file"
 *   max 5MB, 仅图片 (png/jpg/jpeg/webp/gif/svg)
 *
 * 写入 R2 binding ASSETS, 命名 {uuid}-{timestamp}.{ext} (跟老版本兼容)
 * 返回 { url, key, size }
 */
import { NextResponse } from 'next/server';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

const R2_PUBLIC_BASE = 'https://pub-b2aa5c35beea4d878b33ca47541656e7.r2.dev';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);
const EXT_BY_TYPE: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
};

export async function POST(request: Request) {
    try {
        // 1. 拿 R2 binding
        const ctx = getOptionalRequestContext();
        if (!ctx) {
            return NextResponse.json(
                { error: 'Upload only available in deployed env (R2 binding required)' },
                { status: 503 }
            );
        }
        const env = ctx.env as Record<string, unknown>;
        const bucket = env.UPLOADS as R2Bucket | undefined;
        if (!bucket) {
            return NextResponse.json({ error: 'R2 binding UPLOADS not configured' }, { status: 500 });
        }

        // 2. 解析 multipart
        const formData = await request.formData();
        const file = formData.get('file');
        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Missing file field' }, { status: 400 });
        }

        // 3. 校验
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` },
                { status: 413 }
            );
        }
        const contentType = file.type || 'application/octet-stream';
        if (!ALLOWED_TYPES.has(contentType)) {
            return NextResponse.json(
                { error: `Unsupported type ${contentType}. Allowed: png/jpg/webp/gif/svg` },
                { status: 415 }
            );
        }

        // 4. 命名: {uuid}-{timestamp}.{ext}  (跟老 pwa-gen 一致)
        const ext = EXT_BY_TYPE[contentType] || 'bin';
        const key = `${crypto.randomUUID()}-${Date.now()}.${ext}`;

        // 5. 写 R2
        await bucket.put(key, file.stream(), {
            httpMetadata: { contentType },
        });

        return NextResponse.json({
            url: `${R2_PUBLIC_BASE}/${key}`,
            key,
            size: file.size,
        });
    } catch (err) {
        console.error('[upload] failed:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
