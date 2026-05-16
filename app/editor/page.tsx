'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Smartphone, Activity, Star, Image as ImageIcon, Sparkles, Languages, X } from 'lucide-react';
import { dict, type Dict } from '@/lib/i18n';
import UploadButton from '@/components/upload-button';

const STORAGE_KEY = 'pwa-gen-lang';

type PixelPlatform = 'none' | 'facebook' | 'tiktok' | 'kwai';
type Template = 'classic' | 'playstore' | 'floating';
type Language = 'zh' | 'en';

interface PixelConfig {
    platform: PixelPlatform;
    pixelId?: string;
    event?: string;
    value?: number;
    currency?: string;
}

interface Reviews {
    rating?: number;
    reviewCount?: string;
    downloads?: string;
}

interface AppConfig {
    id?: string;
    url: string;
    name: string;
    description: string;
    iconUrl: string;
    backgroundColor: string;
    pixel?: PixelConfig;
    template?: Template;
    language?: Language;
    reviews?: Reviews;
    screenshots?: string[];
    installLabel?: string;
    heroImage?: string;
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
    /** 编辑器 UI 语言: localStorage > 浏览器语言 > zh (跟首页同源) */
    const [uiLang, setUiLang] = useState<Language>('zh');
    const t: Dict = dict[uiLang];

    useEffect(() => {
        // 1. 同步 UI 语言
        const stored = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Language | null;
        let initialLang: Language;
        if (stored === 'zh' || stored === 'en') {
            initialLang = stored;
        } else if (typeof navigator !== 'undefined') {
            initialLang = navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        } else {
            initialLang = 'zh';
        }
        setUiLang(initialLang);

        // 2. 加载扫站数据
        const sessionData = sessionStorage.getItem('scannedApp');
        if (!sessionData) {
            router.push('/');
            return;
        }
        const parsed = JSON.parse(sessionData);
        // 默认 template = classic, language 优先继承 parsed.language (首页扫站时带过来), 否则用 UI 语言
        setConfig({ template: 'classic', language: parsed.language || initialLang, ...parsed });
    }, [router]);

    const toggleUiLang = () => {
        const next: Language = uiLang === 'zh' ? 'en' : 'zh';
        setUiLang(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    };

    if (!config) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;

    const handleChange = (field: keyof AppConfig, value: AppConfig[keyof AppConfig]) => {
        setConfig(prev => prev ? ({ ...prev, [field]: value }) as AppConfig : null);
    };

    const handlePixelChange = <K extends keyof PixelConfig>(field: K, value: PixelConfig[K]) => {
        setConfig(prev => {
            if (!prev) return null;
            const current: PixelConfig = prev.pixel || { platform: 'none' };
            const next: PixelConfig = { ...current, [field]: value };
            if (field === 'platform' && value !== 'none') {
                next.event = PIXEL_PRESETS[value as Exclude<PixelPlatform, 'none'>].events[0];
            }
            return { ...prev, pixel: next };
        });
    };

    const handleReviewsChange = <K extends keyof Reviews>(field: K, value: Reviews[K]) => {
        setConfig(prev => {
            if (!prev) return null;
            return { ...prev, reviews: { ...(prev.reviews || {}), [field]: value } };
        });
    };

    const handleScreenshotsChange = (raw: string) => {
        const arr = raw.split('\n').map((s) => s.trim()).filter(Boolean);
        handleChange('screenshots', arr);
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
            alert('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
            {/* 顶部右上语言切换 (跟首页同源) */}
            <button
                type="button"
                onClick={toggleUiLang}
                className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 text-sm text-neutral-200 backdrop-blur-md transition"
                aria-label="Toggle language"
            >
                <Languages className="w-3.5 h-3.5" />
                {uiLang === 'zh' ? 'EN' : '中文'}
            </button>

            {/* ============ Sidebar / Form ============ */}
            <div className="w-full md:w-1/2 p-6 md:p-10 border-r border-white/10 overflow-y-auto max-h-screen">
                <Button variant="ghost" className="mb-6 text-neutral-400 hover:text-white pl-0" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t.editorBack}
                </Button>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">{t.editorTitle}</h1>
                        <p className="text-neutral-400 mt-2">{t.editorSub}</p>
                    </div>

                    {/* ---- 基础信息 ---- */}
                    <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">{t.editorAppName}</Label>
                            <Input id="name" value={config.name} onChange={(e) => handleChange('name', e.target.value)} />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="description">{t.editorDesc}</Label>
                            <Textarea id="description" value={config.description} onChange={(e) => handleChange('description', e.target.value)} className="min-h-[100px]" />
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="icon">{t.editorIcon}</Label>
                            <div className="flex gap-2 items-start">
                                <Input id="icon" value={config.iconUrl} onChange={(e) => handleChange('iconUrl', e.target.value)} className="flex-1" />
                                <UploadButton onUploaded={(url) => handleChange('iconUrl', url)} iconOnly />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="color">{t.editorBg}</Label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={config.backgroundColor}
                                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                        className="h-10 w-10 rounded border border-white/10 bg-transparent cursor-pointer"
                                    />
                                    <Input value={config.backgroundColor} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="flex-1" />
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="lang">{t.editorLanguage}</Label>
                                <Select id="lang" value={config.language || 'zh'} onChange={(e) => handleChange('language', e.target.value as Language)}>
                                    <option value="zh">中文</option>
                                    <option value="en">English</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="installLabel">{uiLang === 'zh' ? '安装按钮文字 (留空走默认)' : 'Install button label (empty = default)'}</Label>
                            <Input
                                id="installLabel"
                                value={config.installLabel || ''}
                                onChange={(e) => handleChange('installLabel', e.target.value)}
                                placeholder={config.language === 'en' ? 'Add to Home Screen' : '安装到主屏幕'}
                            />
                        </div>
                    </div>

                    {/* ---- 模板选择 ---- */}
                    <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Sparkles className="w-4 h-4 text-pink-400" />
                                {t.editorTemplate}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'classic' as const, label: t.editorTemplateClassic, emoji: '🎴' },
                                    { id: 'playstore' as const, label: t.editorTemplatePlaystore, emoji: '▶️' },
                                    { id: 'floating' as const, label: t.editorTemplateFloating, emoji: '📲' },
                                ].map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() => handleChange('template', tpl.id)}
                                        className={`p-3 rounded-xl border text-xs leading-tight transition-all text-center ${
                                            (config.template || 'classic') === tpl.id
                                                ? 'border-pink-400 bg-pink-500/20 text-white shadow-lg'
                                                : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/30'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{tpl.emoji}</div>
                                        <div>{tpl.label}</div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ---- Floating 模板专属: hero 大图 ---- */}
                    {config.template === 'floating' && (
                        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ImageIcon className="w-4 h-4 text-blue-400" />
                                    {uiLang === 'zh' ? 'Hero 大图 (全屏背景)' : 'Hero Image (full-screen background)'}
                                </CardTitle>
                                <p className="text-xs text-neutral-400 mt-1">
                                    {uiLang === 'zh'
                                        ? '建议尺寸 1080×1920+, 留空时用 icon 模糊背景代替'
                                        : 'Recommended 1080×1920+, falls back to blurred icon if empty'}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {config.heroImage && (
                                    <div className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={config.heroImage} alt="hero" className="w-full h-32 object-cover rounded-lg border border-white/10" />
                                        <button
                                            type="button"
                                            onClick={() => handleChange('heroImage', '')}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2 items-start">
                                    <Input
                                        value={config.heroImage || ''}
                                        onChange={(e) => handleChange('heroImage', e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1"
                                    />
                                    <UploadButton
                                        onUploaded={(url) => handleChange('heroImage', url)}
                                        iconOnly
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ---- PlayStore 模板专属: 评分 + 截图 ---- */}
                    {config.template === 'playstore' && (
                        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Star className="w-4 h-4 text-emerald-400" />
                                    {t.editorReviews}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="rating">{t.editorRating}</Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            value={config.reviews?.rating ?? ''}
                                            onChange={(e) => handleReviewsChange('rating', e.target.value ? Number(e.target.value) : undefined)}
                                            placeholder="4.8"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="rcount">{t.editorReviewCount}</Label>
                                        <Input
                                            id="rcount"
                                            value={config.reviews?.reviewCount || ''}
                                            onChange={(e) => handleReviewsChange('reviewCount', e.target.value)}
                                            placeholder="12.3K reviews"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="dl">{t.editorDownloads}</Label>
                                        <Input
                                            id="dl"
                                            value={config.reviews?.downloads || ''}
                                            onChange={(e) => handleReviewsChange('downloads', e.target.value)}
                                            placeholder="1M+"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="flex items-center gap-1.5">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        {t.editorScreenshots}
                                    </Label>

                                    {/* 缩略图列表 + 删除 */}
                                    {(config.screenshots || []).length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {(config.screenshots || []).map((url, i) => (
                                                <div key={i} className="relative group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={url} alt={`screenshot ${i + 1}`} className="h-20 w-14 object-cover rounded border border-white/10" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleChange('screenshots', (config.screenshots || []).filter((_, idx) => idx !== i))}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 上传按钮 (限 5 张) */}
                                    {(config.screenshots || []).length < 5 && (
                                        <UploadButton
                                            label={uiLang === 'zh' ? '上传截图' : 'Upload screenshot'}
                                            onUploaded={(url) => handleChange('screenshots', [...(config.screenshots || []), url].slice(0, 5))}
                                            className="h-10 w-fit px-3"
                                        />
                                    )}

                                    {/* 也支持手动贴 URL */}
                                    <details className="text-xs text-neutral-500">
                                        <summary className="cursor-pointer hover:text-neutral-300">{uiLang === 'zh' ? '或贴 URL (每行一个, 最多 5 张)' : 'Or paste URLs (one per line, max 5)'}</summary>
                                        <Textarea
                                            value={(config.screenshots || []).join('\n')}
                                            onChange={(e) => handleScreenshotsChange(e.target.value)}
                                            placeholder="https://example.com/screenshot-1.jpg"
                                            className="min-h-[80px] font-mono text-xs mt-2"
                                        />
                                    </details>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ---- 像素配置 ---- */}
                    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="w-4 h-4 text-purple-400" />
                                {t.editorPixel}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="pixel-platform">{t.editorPixelPlatform}</Label>
                                <Select
                                    id="pixel-platform"
                                    value={config.pixel?.platform || 'none'}
                                    onChange={(e) => handlePixelChange('platform', e.target.value as PixelPlatform)}
                                >
                                    <option value="none">{t.editorPixelNone}</option>
                                    <option value="facebook">Facebook Pixel</option>
                                    <option value="tiktok">TikTok Pixel</option>
                                    <option value="kwai">Kwai Pixel</option>
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
                                        <Label htmlFor="pixel-event">{t.editorPixelEvent}</Label>
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
                                            <Label htmlFor="pixel-value">{t.editorPixelValue}</Label>
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
                                            <Label htmlFor="pixel-currency">{t.editorPixelCurrency}</Label>
                                            <Input
                                                id="pixel-currency"
                                                value={config.pixel.currency || ''}
                                                onChange={(e) => handlePixelChange('currency', e.target.value)}
                                                placeholder="USD"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Button onClick={handleSave} disabled={loading} className="w-full h-12 text-lg bg-green-500 hover:bg-green-600 text-black font-semibold">
                        {loading ? t.editorGenerating : <><Save className="w-5 h-5 mr-2" /> {t.editorGenerate}</>}
                    </Button>
                </div>
            </div>

            {/* ============ Preview ============ */}
            <div className="w-full md:w-1/2 bg-neutral-900 p-8 flex flex-col items-center justify-center relative overflow-hidden sticky top-0 max-h-screen">
                <div className="mb-4 text-neutral-400 font-medium flex items-center gap-2 text-sm">
                    <Smartphone className="w-4 h-4" /> {t.editorLivePreview}
                    <span className="text-neutral-600">·</span>
                    <span className="text-purple-300 font-semibold">
                        {config.template === 'playstore' && t.editorTemplatePlaystore}
                        {config.template === 'floating' && t.editorTemplateFloating}
                        {(!config.template || config.template === 'classic') && t.editorTemplateClassic}
                    </span>
                </div>

                {/* Phone mockup */}
                <div className="relative w-[320px] h-[640px] bg-black rounded-[40px] border-[8px] border-neutral-800 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 overflow-auto">
                        <PreviewBody config={config} />
                    </div>
                    <div className="absolute h-1 w-32 bg-white/20 rounded-full mx-auto bottom-2 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}

/** 实时预览 — 跟生产 install/[id] 渲染 100% 一致 */
function PreviewBody({ config }: { config: AppConfig }) {
    const tpl = config.template || 'classic';
    if (tpl === 'playstore') return <PreviewPlaystore config={config} />;
    if (tpl === 'floating') return <PreviewFloating config={config} />;
    return <PreviewClassic config={config} />;
}

function previewInstallLabel(config: AppConfig): string {
    if (config.installLabel?.trim()) return config.installLabel.trim();
    return config.language === 'en' ? 'Add to Home Screen' : '安装到主屏幕';
}

function PreviewClassic({ config }: { config: AppConfig }) {
    const isDark = config.backgroundColor === '#000000' || config.backgroundColor === '#000';
    const textColor = isDark ? 'text-white' : 'text-neutral-900';
    return (
        <div className="min-h-full flex flex-col items-center justify-center p-6" style={{ backgroundColor: config.backgroundColor || '#fff' }}>
            <div className={`text-center max-w-md w-full ${textColor}`}>
                <div className="mx-auto w-24 h-24 rounded-[22px] shadow-2xl overflow-hidden mb-5 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={config.iconUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <h2 className="text-xl font-bold mb-2 line-clamp-2">{config.name}</h2>
                <p className="opacity-70 mb-6 text-sm leading-snug line-clamp-3">{config.description}</p>
                <div className="w-full py-3 bg-blue-600 text-white rounded-full font-bold">
                    {previewInstallLabel(config)}
                </div>
            </div>
        </div>
    );
}

function PreviewPlaystore({ config }: { config: AppConfig }) {
    const lang = config.language || 'zh';
    const rating = config.reviews?.rating;
    const downloads = config.reviews?.downloads;
    const screenshots = config.screenshots || [];
    return (
        <div className="min-h-full bg-white text-neutral-900">
            <div className="sticky top-0 bg-white border-b border-neutral-100 flex items-center justify-between px-3 py-2 text-neutral-700 text-xs">
                <span>←</span><span>⋮</span>
            </div>
            <div className="p-4">
                <div className="flex gap-3 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm bg-neutral-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={config.iconUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-base font-bold leading-tight line-clamp-2">{config.name}</div>
                        <div className="text-xs text-emerald-700 truncate">{tryHost(config.url)}</div>
                    </div>
                </div>
                {(rating !== undefined || downloads) && (
                    <div className="flex border border-neutral-100 rounded-xl mb-3 divide-x divide-neutral-100 text-[10px]">
                        {rating !== undefined && (
                            <div className="flex-1 py-2 text-center">
                                <div className="font-bold text-sm">{rating.toFixed(1)} ★</div>
                                <div className="text-neutral-500">{config.reviews?.reviewCount || (lang === 'en' ? 'reviews' : '评论')}</div>
                            </div>
                        )}
                        {downloads && (
                            <div className="flex-1 py-2 text-center">
                                <div className="font-bold text-sm">{downloads}</div>
                                <div className="text-neutral-500">{lang === 'en' ? 'Downloads' : '下载'}</div>
                            </div>
                        )}
                        <div className="flex-1 py-2 text-center">
                            <div className="inline-flex items-center justify-center w-4 h-4 rounded border border-neutral-400 text-[8px] font-bold">3+</div>
                            <div className="text-neutral-500">Rated</div>
                        </div>
                    </div>
                )}
                <div className="w-full h-9 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center mb-4">
                    {previewInstallLabel(config)}
                </div>
                {screenshots.length > 0 && (
                    <div className="-mx-4 mb-4 overflow-x-auto px-4">
                        <div className="flex gap-2" style={{ width: 'max-content' }}>
                            {screenshots.slice(0, 5).map((src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={i} src={src} alt="" className="h-32 rounded-md object-cover bg-neutral-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ))}
                        </div>
                    </div>
                )}
                <div className="text-xs font-semibold mb-1">{lang === 'en' ? 'About this app' : '应用介绍'}</div>
                <p className="text-[11px] text-neutral-700 leading-snug line-clamp-5">{config.description}</p>
            </div>
        </div>
    );
}

function PreviewFloating({ config }: { config: AppConfig }) {
    const isDark = config.backgroundColor === '#000000' || config.backgroundColor === '#000';
    const textColor = isDark ? 'text-white' : 'text-neutral-900';
    const hero = config.heroImage?.trim();
    return (
        <div className="min-h-full relative flex flex-col" style={{ backgroundColor: config.backgroundColor || '#fff' }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {hero ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={hero} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="absolute inset-0" style={{ background: isDark ? `linear-gradient(180deg, transparent 40%, ${config.backgroundColor}cc 85%, ${config.backgroundColor} 100%)` : `linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.85) 85%, ${config.backgroundColor || '#fff'} 100%)` }} />
                    </>
                ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={config.iconUrl} alt="" className="w-full h-full object-cover opacity-30 blur-2xl scale-150" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
            </div>
            <div className={`relative z-10 flex-1 flex flex-col items-center justify-end px-6 pb-32 pt-6 ${textColor}`}>
                <div className="w-20 h-20 rounded-[18px] shadow-2xl overflow-hidden mb-4 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={config.iconUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <h2 className="text-lg font-bold mb-2 text-center line-clamp-2 drop-shadow-sm">{config.name}</h2>
                <p className="opacity-80 mb-3 text-xs leading-snug text-center line-clamp-3 drop-shadow-sm">{config.description}</p>
            </div>
            <div className="absolute bottom-3 left-3 right-3 z-20">
                <div className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold text-center shadow-lg">
                    {previewInstallLabel(config)}
                </div>
            </div>
        </div>
    );
}

function tryHost(url: string): string {
    try { return new URL(url).hostname; } catch { return url; }
}
