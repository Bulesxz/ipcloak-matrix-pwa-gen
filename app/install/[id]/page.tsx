import { db } from '@/lib/db';
import PixelTracker from '@/components/pixel-tracker';
import ClassicTemplate from '@/components/templates/classic';
import PlaystoreTemplate from '@/components/templates/playstore';
import FloatingTemplate from '@/components/templates/floating';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const app = await db.getApp(id);
    if (!app) return { title: 'App not found' };

    return {
        title: `${app.language === 'en' ? 'Install' : '安装'} ${app.name}`,
        description: app.description,
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
    if (!app) notFound();

    return (
        <>
            {/* 像素跟踪 — 安装成功时通过 window.__pwaPixelFire() 上报 */}
            <PixelTracker pixel={app.pixel} appId={app.id!} />

            {/* 模板分发 */}
            {app.template === 'playstore' && <PlaystoreTemplate app={app} />}
            {app.template === 'floating' && <FloatingTemplate app={app} />}
            {(!app.template || app.template === 'classic') && <ClassicTemplate app={app} />}
        </>
    );
}
