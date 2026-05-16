import { NextResponse } from 'next/server';
import { db, type PixelConfig } from '@/lib/db';

export const runtime = 'edge';

const ALLOWED_PLATFORMS = new Set(['none', 'facebook', 'tiktok', 'kwai']);

function sanitizePixel(input: unknown): PixelConfig | undefined {
    if (!input || typeof input !== 'object') return undefined;
    const p = input as Record<string, unknown>;
    const platform = typeof p.platform === 'string' && ALLOWED_PLATFORMS.has(p.platform)
        ? (p.platform as PixelConfig['platform'])
        : 'none';
    if (platform === 'none') return { platform: 'none' };

    return {
        platform,
        pixelId: typeof p.pixelId === 'string' ? p.pixelId.slice(0, 64).replace(/[^A-Za-z0-9_-]/g, '') : undefined,
        event: typeof p.event === 'string' ? p.event.slice(0, 64).replace(/[^A-Za-z0-9_]/g, '') : undefined,
        value: typeof p.value === 'number' && isFinite(p.value) && p.value >= 0 ? p.value : undefined,
        currency: typeof p.currency === 'string' ? p.currency.slice(0, 8).replace(/[^A-Za-z]/g, '').toUpperCase() : undefined,
    };
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Record<string, unknown>;

        if (!body.name || !body.url) {
            return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
        }

        const savedApp = await db.saveApp({
            id: typeof body.id === 'string' ? body.id : undefined,
            url: String(body.url).slice(0, 2000),
            name: String(body.name).slice(0, 200),
            description: String(body.description || '').slice(0, 1000),
            iconUrl: String(body.iconUrl || '').slice(0, 2000),
            backgroundColor: String(body.backgroundColor || '#ffffff').slice(0, 20),
            pixel: sanitizePixel(body.pixel),
        });

        return NextResponse.json(savedApp);
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
