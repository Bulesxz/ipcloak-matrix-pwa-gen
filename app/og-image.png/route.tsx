import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

/**
 * 动态生成 OG image (1200x630) — 让分享卡片好看
 * 路由: /og-image.png  (layout.tsx 里 og.images 引用的就是这个)
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0033 0%, #0a0a0a 50%, #001a33 100%)',
          position: 'relative',
          padding: '80px',
          fontFamily: 'system-ui',
        }}
      >
        {/* 装饰光晕 */}
        <div
          style={{
            position: 'absolute',
            top: -150,
            left: -150,
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* 顶部 brand chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 24px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            color: '#d8b4fe',
            fontSize: 24,
            marginBottom: 50,
          }}
        >
          <span style={{ fontSize: 28 }}>✨</span>
          ipcloak.ai · W2A Generator
        </div>

        {/* 主标题 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            W2A 一键生成
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #60a5fa 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            把网站变成可安装的 App
          </div>
        </div>

        {/* 副标 */}
        <div
          style={{
            display: 'flex',
            marginTop: 40,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 28,
            textAlign: 'center',
          }}
        >
          PWA + APK · Facebook / TikTok / Kwai 像素跟踪
        </div>

        {/* 底部 URL */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 60,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 26,
            letterSpacing: '0.05em',
          }}
        >
          pwa.ipcloak.ai
        </div>
      </div>
    ),
    { ...size }
  );
}
