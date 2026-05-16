import { NextResponse } from 'next/server';
import { db, type PixelConfig, type AppReviews, type AppTemplate, type AppLanguage, type AppDistribution } from '@/lib/db';

export const runtime = 'edge';

const ALLOWED_PLATFORMS = new Set(['none', 'facebook', 'tiktok', 'kwai']);
const ALLOWED_TEMPLATES = new Set(['classic', 'playstore', 'floating']);
const ALLOWED_LANGS = new Set(['zh', 'en']);
const ALLOWED_DISTRIBUTIONS = new Set(['pwa', 'apk']);
const ALLOWED_BUTTON_COLORS = new Set(['rainbow', 'blue', 'green', 'orange', 'red', 'black', 'purple', 'custom']);
const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

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

function sanitizeReviews(input: unknown): AppReviews | undefined {
    if (!input || typeof input !== 'object') return undefined;
    const r = input as Record<string, unknown>;
    const out: AppReviews = {};
    if (typeof r.rating === 'number' && isFinite(r.rating) && r.rating >= 0 && r.rating <= 5) out.rating = r.rating;
    if (typeof r.reviewCount === 'string' && r.reviewCount.trim()) out.reviewCount = r.reviewCount.slice(0, 32);
    if (typeof r.downloads === 'string' && r.downloads.trim()) out.downloads = r.downloads.slice(0, 32);
    return Object.keys(out).length ? out : undefined;
}

function sanitizeScreenshots(input: unknown): string[] | undefined {
    if (!Array.isArray(input)) return undefined;
    const arr = input
        .filter((s): s is string => typeof s === 'string' && /^https?:\/\//.test(s))
        .map((s) => s.slice(0, 2000))
        .slice(0, 5);
    return arr.length ? arr : undefined;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Record<string, unknown>;

        if (!body.name || !body.url) {
            return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
        }

        const template: AppTemplate = typeof body.template === 'string' && ALLOWED_TEMPLATES.has(body.template)
            ? (body.template as AppTemplate)
            : 'classic';
        const language: AppLanguage = typeof body.language === 'string' && ALLOWED_LANGS.has(body.language)
            ? (body.language as AppLanguage)
            : 'zh';
        const distribution: AppDistribution = typeof body.distribution === 'string' && ALLOWED_DISTRIBUTIONS.has(body.distribution)
            ? (body.distribution as AppDistribution)
            : 'pwa';

        const savedApp = await db.saveApp({
            id: typeof body.id === 'string' ? body.id : undefined,
            url: String(body.url).slice(0, 2000),
            name: String(body.name).slice(0, 200),
            description: String(body.description || '').slice(0, 1000),
            iconUrl: String(body.iconUrl || '').slice(0, 2000),
            backgroundColor: String(body.backgroundColor || '#ffffff').slice(0, 20),
            pixel: sanitizePixel(body.pixel),
            template,
            language,
            reviews: sanitizeReviews(body.reviews),
            screenshots: sanitizeScreenshots(body.screenshots),
            installLabel: typeof body.installLabel === 'string' ? body.installLabel.slice(0, 32) : undefined,
            heroImage: typeof body.heroImage === 'string' ? body.heroImage.slice(0, 2000) : undefined,
            distribution,
            apkUrl: typeof body.apkUrl === 'string' ? body.apkUrl.slice(0, 2000) : undefined,
            buttonColor: typeof body.buttonColor === 'string' && ALLOWED_BUTTON_COLORS.has(body.buttonColor)
                ? (body.buttonColor as 'rainbow')
                : undefined,
            customButtonColor: typeof body.customButtonColor === 'string' && HEX_RE.test(body.customButtonColor)
                ? body.customButtonColor
                : undefined,
        });

        return NextResponse.json(savedApp);
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
