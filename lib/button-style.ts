/**
 * 安装按钮颜色 → className / inline-style 辅助
 *
 * 注: PlayStore 模板不调用这个 (永远深绿 Google Play 色)
 *     Classic / Floating / APK Button 都用这个
 */
import type { ButtonColor } from '@/lib/db';

export interface ButtonStyle {
  /** 追加到 className (rainbow-button 类 / 各色预设 tailwind) */
  className: string;
  /** inline style (仅 custom 用) */
  style?: React.CSSProperties;
}

const PRESETS: Record<Exclude<ButtonColor, 'rainbow' | 'custom'>, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700 text-white',
  green: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  orange: 'bg-orange-500 hover:bg-orange-600 text-white',
  red: 'bg-red-600 hover:bg-red-700 text-white',
  black: 'bg-neutral-900 hover:bg-neutral-800 text-white',
  purple: 'bg-purple-600 hover:bg-purple-700 text-white',
};

export function buttonStyle(color: ButtonColor | undefined, customHex?: string): ButtonStyle {
  const c = color || 'rainbow';
  if (c === 'rainbow') return { className: 'rainbow-button text-white' };
  if (c === 'custom' && customHex) {
    return {
      className: 'text-white hover:opacity-90 transition-opacity',
      style: { backgroundColor: customHex },
    };
  }
  if (c in PRESETS) return { className: PRESETS[c as keyof typeof PRESETS] };
  // 兜底: 蓝色
  return { className: PRESETS.blue };
}

/** 预设清单 (给 editor color picker 用) */
export const BUTTON_COLOR_OPTIONS: Array<{ id: ButtonColor; label: { zh: string; en: string }; swatch: string }> = [
  { id: 'rainbow', label: { zh: '彩虹动', en: 'Rainbow' }, swatch: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1, #5f27cd, #ee5a6f)' },
  { id: 'blue',    label: { zh: '蓝',     en: 'Blue'   }, swatch: '#2563eb' },
  { id: 'green',   label: { zh: '绿',     en: 'Green'  }, swatch: '#059669' },
  { id: 'orange',  label: { zh: '橙',     en: 'Orange' }, swatch: '#f97316' },
  { id: 'red',     label: { zh: '红',     en: 'Red'    }, swatch: '#dc2626' },
  { id: 'black',   label: { zh: '黑',     en: 'Black'  }, swatch: '#171717' },
  { id: 'purple',  label: { zh: '紫',     en: 'Purple' }, swatch: '#9333ea' },
  { id: 'custom',  label: { zh: '自定义', en: 'Custom' }, swatch: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' },
];
