'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Smartphone, Activity } from 'lucide-react';

type PixelPlatform = 'none' | 'facebook' | 'tiktok' | 'kwai';

interface PixelConfig {
    platform: PixelPlatform;
    pixelId?: string;
    event?: string;
    value?: number;
    currency?: string;
}

interface AppConfig {
    id?: string;
    url: string;
    name: string;
    description: string;
    iconUrl: string;
    backgroundColor: string;
    pixel?: PixelConfig;
}

const PIXEL_PRESETS: Record<Exclude<PixelPlatform, 'none'>, { label: string; events: string[]; placeholder: string; help: string }> = {
    facebook: {
        label: 'Facebook Pixel',
        events: ['CompleteRegistration', 'Lead', 'Subscribe', 'AddToCart', 'Purchase', 'InitiateCheckout', 'ViewContent'],
        placeholder: '15 位数字, 如 123456789012345',
        help: '在 FB Events Manager → Data Sources → 你的 Pixel → 设置 找到 Pixel ID',
    },
    tiktok: {
        label: 'TikTok Pixel',
        events: ['CompleteRegistration', 'CompletePayment', 'SubmitForm', 'AddToCart', 'Purchase', 'ClickButton'],
        placeholder: 'C 开头, 如 CXXXXXXXXXXXXXX',
        help: '在 TikTok Events Manager → Web Events → 你的 Pixel 找到 Pixel ID',
    },
    kwai: {
        label: 'Kwai Pixel',
        events: ['install', 'register', 'purchase', 'addToCart', 'completeOrder', 'click'],
        placeholder: 'Kwai Ads 后台拿到的 Pixel ID',
        help: '在 Kwai for Business → 像素管理 找到 Pixel ID',
    },
};

export default function Editor() {
    const router = useRouter();
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load data from session storage
        const stored = sessionStorage.getItem('scannedApp');
        if (!stored) {
            router.push('/');
            return;
        }
        setConfig(JSON.parse(stored));
    }, [router]);

    if (!config) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;

    const handleChange = (field: keyof AppConfig, value: string) => {
        setConfig(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handlePixelChange = <K extends keyof PixelConfig>(field: K, value: PixelConfig[K]) => {
        setConfig(prev => {
            if (!prev) return null;
            const current: PixelConfig = prev.pixel || { platform: 'none' };
            const next: PixelConfig = { ...current, [field]: value };
            // 换平台时清掉旧 event / 自动选默认 event
            if (field === 'platform' && value !== 'none') {
                next.event = PIXEL_PRESETS[value as Exclude<PixelPlatform, 'none'>].events[0];
            }
            return { ...prev, pixel: next };
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (!res.ok) throw new Error('Failed to save');

            const savedApp = (await res.json()) as { id: string };
            router.push(`/install/${savedApp.id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
            {/* Sidebar / Form */}
            <div className="w-full md:w-1/2 p-6 md:p-10 border-r border-white/10 overflow-y-auto max-h-screen">
                <Button variant="ghost" className="mb-6 text-neutral-400 hover:text-white pl-0" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Button>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Customize Installation Page</h1>
                        <p className="text-neutral-400 mt-2">Edit how your app looks on the installation landing page.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">App Name</Label>
                            <Input
                                id="name"
                                value={config.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={config.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="icon">Icon URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="icon"
                                    value={config.iconUrl}
                                    onChange={(e) => handleChange('iconUrl', e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                                {/* Fallback upload logic could go here later */}
                            </div>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="color">Theme Color</Label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={config.backgroundColor}
                                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                    className="h-10 w-10 rounded border border-white/10 bg-transparent cursor-pointer"
                                />
                                <Input
                                    id="color"
                                    value={config.backgroundColor}
                                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                    className="bg-white/5 border-white/10 text-white flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ⭐ Pixel 配置区 — 安装成功上报到广告平台 */}
                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="w-4 h-4 text-purple-400" />
                                像素跟踪 · 安装成功上报
                            </CardTitle>
                            <p className="text-xs text-neutral-400 mt-1">
                                用户安装 PWA 成功时, 自动触发广告平台的转化事件, 反哺投放算法
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="pixel-platform">广告平台</Label>
                                <Select
                                    id="pixel-platform"
                                    value={config.pixel?.platform || 'none'}
                                    onChange={(e) => handlePixelChange('platform', e.target.value as PixelPlatform)}
                                >
                                    <option value="none">不配置 (跳过像素)</option>
                                    <option value="facebook">Facebook Pixel</option>
                                    <option value="tiktok">TikTok Pixel</option>
                                    <option value="kwai">Kwai Pixel (快手)</option>
                                </Select>
                            </div>

                            {config.pixel?.platform && config.pixel.platform !== 'none' && (
                                <>
                                    <div className="grid w-full gap-1.5">
                                        <Label htmlFor="pixel-id">{PIXEL_PRESETS[config.pixel.platform].label} ID</Label>
                                        <Input
                                            id="pixel-id"
                                            value={config.pixel.pixelId || ''}
                                            onChange={(e) => handlePixelChange('pixelId', e.target.value)}
                                            placeholder={PIXEL_PRESETS[config.pixel.platform].placeholder}
                                            className="font-mono"
                                        />
                                        <p className="text-[11px] text-neutral-500">{PIXEL_PRESETS[config.pixel.platform].help}</p>
                                    </div>

                                    <div className="grid w-full gap-1.5">
                                        <Label htmlFor="pixel-event">安装成功上报的事件名</Label>
                                        <Select
                                            id="pixel-event"
                                            value={config.pixel.event || PIXEL_PRESETS[config.pixel.platform].events[0]}
                                            onChange={(e) => handlePixelChange('event', e.target.value)}
                                        >
                                            {PIXEL_PRESETS[config.pixel.platform].events.map(evt => (
                                                <option key={evt} value={evt}>{evt}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="pixel-value">转化金额 (可选)</Label>
                                            <Input
                                                id="pixel-value"
                                                type="number"
                                                step="0.01"
                                                value={config.pixel.value ?? ''}
                                                onChange={(e) => handlePixelChange('value', e.target.value ? Number(e.target.value) : undefined)}
                                                placeholder="50"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="pixel-currency">货币</Label>
                                            <Input
                                                id="pixel-currency"
                                                value={config.pixel.currency || ''}
                                                onChange={(e) => handlePixelChange('currency', e.target.value)}
                                                placeholder="USD"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-[11px] text-neutral-400 bg-black/20 p-3 rounded border border-white/5">
                                        💡 <strong>触发时机</strong>: <br />
                                        · Android/Chrome: 用户点击安装 → 系统对话框 → 接受时立即上报<br />
                                        · iOS Safari: 用户从主屏幕打开 PWA 时反推上报 (display-mode standalone)<br />
                                        · 同一访问者 + 同一 PWA 只上报一次, 避免重复计费
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Button onClick={handleSave} disabled={loading} className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-black font-semibold">
                        {loading ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Generate Installation Page</>}
                    </Button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="w-full md:w-1/2 bg-neutral-900 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <div className="mb-4 text-neutral-400 font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Live Mobile Preview
                </div>

                {/* Phone Mockup */}
                <div className="relative w-[320px] h-[640px] bg-black rounded-[40px] border-[8px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
                    {/* Status Bar */}
                    <div className="h-6 w-full bg-black flex justify-between px-6 items-center">
                        <div className="text-[10px] text-white font-medium">9:41</div>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full bg-white/20"></div>
                            <div className="w-3 h-3 rounded-full bg-white/20"></div>
                        </div>
                    </div>

                    {/* Content (Simulating the Install Page) */}
                    <div className="flex-1 flex flex-col items-center p-6 text-center" style={{ backgroundColor: config.backgroundColor || '#fff', color: config.backgroundColor === '#000000' || config.backgroundColor === '#000' ? '#fff' : '#000' }}>
                        <div className="mt-12 mb-6 relative w-24 h-24 rounded-[22px] overflow-hidden shadow-xl bg-white">
                            {config.iconUrl && (
                                <img
                                    src={config.iconUrl}
                                    alt="App Icon"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                                />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold mb-2 break-words w-full line-clamp-2">{config.name}</h2>
                        <p className="text-sm opacity-80 mb-8 line-clamp-3">{config.description}</p>

                        <div className="mt-auto w-full space-y-3 pb-8">
                            <div className="w-full py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg">
                                Install App
                            </div>
                            <div className="text-xs opacity-50">
                                Tap share then "Add to Home Screen"
                            </div>
                        </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="h-1 w-32 bg-white/20 rounded-full mx-auto mb-2 absolute bottom-2 left-1/2 -translate-x-1/2"></div>
                </div>
            </div>
        </div>
    );
}
