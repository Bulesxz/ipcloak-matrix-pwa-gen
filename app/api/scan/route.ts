import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Ensure URL has protocol
        let targetUrl = url;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        console.log(`Scanning URL: ${targetUrl}`);

        // Fetch the HTML page
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PWAInstallGenerator/1.0; +http://localhost:3000)',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Find Manifest URL
        let manifestUrl = $('link[rel="manifest"]').attr('href');
        let manifestData: any = {};

        if (manifestUrl) {
            // Resolve relative URL
            manifestUrl = new URL(manifestUrl, targetUrl).href;
            console.log(`Found manifest at: ${manifestUrl}`);

            try {
                const manifestRes = await fetch(manifestUrl);
                if (manifestRes.ok) {
                    manifestData = await manifestRes.json();
                }
            } catch (e) {
                console.error('Error fetching manifest:', e);
            }
        }

        // 2. Extract Data (Manifest > Meta Tags > Fallback)
        const name = manifestData.name || manifestData.short_name || $('meta[property="og:site_name"]').attr('content') || $('title').text() || 'My PWA';
        const description = manifestData.description || $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

        // Icon sourcing
        let iconUrl = '';
        if (manifestData.icons && Array.isArray(manifestData.icons) && manifestData.icons.length > 0) {
            // Prefer largest PNG or any
            // Simple logic: check for 192 or 512, else first
            const icon = manifestData.icons.find((i: any) => i.sizes?.includes('512') || i.sizes?.includes('192')) || manifestData.icons[0];
            iconUrl = icon.src;
        }

        if (!iconUrl) {
            // Fallback to apple-touch-icon or og:image
            iconUrl = $('link[rel="apple-touch-icon"]').attr('href') || $('meta[property="og:image"]').attr('content') || '';
        }

        // Resolve icon URL if relative
        if (iconUrl && !/^https?:\/\//i.test(iconUrl)) {
            iconUrl = new URL(iconUrl, targetUrl).href;
        }

        const backgroundColor = manifestData.background_color || manifestData.theme_color || $('meta[name="theme-color"]').attr('content') || '#ffffff';

        const result = {
            url: targetUrl,
            name,
            description,
            iconUrl,
            backgroundColor,
            manifest: manifestData
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Scan error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
