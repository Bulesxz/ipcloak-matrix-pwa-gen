import { db } from '@/lib/db';
import InstallPrompt from '@/components/install-prompt';
import PixelTracker from '@/components/pixel-tracker';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const runtime = 'edge';

interface Props {
    // Next 15+ params is a Promise
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const app = await db.getApp(id);
    if (!app) return { title: 'App not found' };

    return {
        title: `Install ${app.name}`,
        description: app.description,
        // ⭐ 让 Chrome 把这个页认成可安装 PWA: manifest + theme-color + apple-touch-icon
        manifest: `/install/${id}/manifest.webmanifest`,
        themeColor: app.backgroundColor || '#ffffff',
        appleWebApp: {
            capable: true,
            title: app.name,
            statusBarStyle: 'default',
        },
        icons: {
            icon: app.iconUrl,
            apple: app.iconUrl,
        },
        openGraph: {
            title: app.name,
            description: app.description,
            images: [app.iconUrl],
        },
    };
}

export default async function InstallPage({ params }: Props) {
    const { id } = await params;
    const app = await db.getApp(id);

    if (!app) {
        notFound();
    }

    // Determine text color based on background (simple heuristic)
    const isDark = app.backgroundColor === '#000000' || app.backgroundColor === '#000';
    const textColor = isDark ? 'text-white' : 'text-neutral-900';

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{ backgroundColor: app.backgroundColor }}
        >
            {/* 像素跟踪 — 安装成功时通过 window.__pwaPixelFire() 上报 */}
            <PixelTracker pixel={app.pixel} appId={app.id!} />
            <div className={`text-center max-w-md w-full relative z-10 ${textColor}`}>

                {/* App Icon */}
                <div className="mx-auto w-32 h-32 rounded-[28px] shadow-2xl overflow-hidden mb-6 bg-white animate-in zoom-in duration-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={app.iconUrl}
                        alt={app.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <h1 className="text-3xl font-bold mb-2 tracking-tight">{app.name}</h1>
                <p className="opacity-80 mb-10 text-lg leading-relaxed">{app.description}</p>

                <div className="space-y-4">
                    <InstallPrompt />

                    <Link href={app.url} target="_blank" className="block">
                        <div className={`text-sm opacity-60 hover:opacity-100 flex items-center justify-center gap-1 mt-4 transition-opacity`}>
                            Open Website Directly <ArrowUpRight className="w-3 h-3" />
                        </div>
                    </Link>
                </div>

            </div>

            {/* Dynamic footer branding */}
            <div className={`absolute bottom-6 text-xs opacity-30 ${textColor}`}>
                Powered by PWA Installer
            </div>
        </div>
    );
}
