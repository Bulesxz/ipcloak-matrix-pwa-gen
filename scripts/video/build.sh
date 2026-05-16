#!/usr/bin/env bash
# ============================================================
# 把 PNG 帧序列拼成 mp4 (静音版 + 含旁白音轨版)
#
# 输出:
#   promo-{lang}.mp4         无旁白 (备用)
#   promo-{lang}-voice.mp4   含中/英旁白 (主交付物)
#
# 用法:
#   bash scripts/video/build.sh zh   # 输出 promo-zh.mp4 + promo-zh-voice.mp4
#   bash scripts/video/build.sh en   # 输出 promo-en.mp4 + promo-en-voice.mp4
# ============================================================

set -e

LANG="${1:-zh}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRAMES_DIR="${SCRIPT_DIR}/dist/frames-${LANG}"
OUT_DIR="${SCRIPT_DIR}/dist"
SILENT_MP4="${OUT_DIR}/promo-${LANG}.mp4"
VOICE_MP4="${OUT_DIR}/promo-${LANG}-voice.mp4"
VOICE_MP3="${OUT_DIR}/promo-${LANG}.mp3"

if [ ! -d "$FRAMES_DIR" ]; then
  echo "❌ Frames directory not found: $FRAMES_DIR"
  echo "   Run first: node scripts/video/record.js $LANG"
  exit 1
fi

FRAME_COUNT=$(ls -1 "$FRAMES_DIR" | wc -l | tr -d ' ')
echo "🎞  Building video from $FRAME_COUNT frames..."
echo "   Source: $FRAMES_DIR"

# ---------- 1. 帧序列 → 静音 mp4 ----------
echo ""
echo "▶ Step 1/2: PNG sequence → silent mp4"
echo "   Output: $SILENT_MP4"
ffmpeg -y \
  -framerate 60 \
  -i "${FRAMES_DIR}/frame-%05d.png" \
  -c:v libx264 \
  -profile:v high \
  -level 4.2 \
  -pix_fmt yuv420p \
  -crf 18 \
  -preset slow \
  -movflags +faststart \
  -r 60 \
  "$SILENT_MP4" 2>&1 | tail -3

SILENT_SIZE=$(du -h "$SILENT_MP4" | cut -f1)
SILENT_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$SILENT_MP4" | awk '{printf "%.1f", $1}')
echo "   ✅ Silent: $SILENT_SIZE, ${SILENT_DURATION}s"

# ---------- 2. 静音 mp4 + 旁白 mp3 → 含音 mp4 ----------
echo ""
echo "▶ Step 2/2: merge voiceover"
if [ ! -f "$VOICE_MP3" ]; then
  echo "   ⚠️  Voiceover not found: $VOICE_MP3"
  echo "      Generate with: python3 scripts/video/tts.py $LANG"
  echo "      Skipping voice merge — only silent mp4 produced."
  exit 0
fi

# -c:v copy: 视频流不重编码 (省时间)
# -c:a aac:  音频用 aac (mp4 兼容性最佳)
# -b:a 128k: 音频码率
# -shortest: 视频和音频取短的为准 (理论上等长)
ffmpeg -y \
  -i "$SILENT_MP4" \
  -i "$VOICE_MP3" \
  -c:v copy \
  -c:a aac \
  -b:a 128k \
  -shortest \
  -movflags +faststart \
  "$VOICE_MP4" 2>&1 | tail -3

VOICE_SIZE=$(du -h "$VOICE_MP4" | cut -f1)
VOICE_DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VOICE_MP4" | awk '{printf "%.1f", $1}')

echo ""
echo "✅ All done!"
echo ""
echo "   Silent: $SILENT_MP4 ($SILENT_SIZE, ${SILENT_DURATION}s)"
echo "   Voice:  $VOICE_MP4 ($VOICE_SIZE, ${VOICE_DURATION}s)"
echo ""
echo "📱 Open:"
echo "   open '$VOICE_MP4'"
