#!/usr/bin/env bash
# ============================================================
# 把 PNG 帧序列拼成 mp4 + 同时压一份兼容性更好的 H.264 baseline
#
# 用法:
#   bash scripts/video/build.sh zh   # 输出 promo-zh.mp4
#   bash scripts/video/build.sh en   # 输出 promo-en.mp4
# ============================================================

set -e

LANG="${1:-zh}"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRAMES_DIR="${SCRIPT_DIR}/dist/frames-${LANG}"
OUT_DIR="${SCRIPT_DIR}/dist"
OUT_FILE="${OUT_DIR}/promo-${LANG}.mp4"

if [ ! -d "$FRAMES_DIR" ]; then
  echo "❌ Frames directory not found: $FRAMES_DIR"
  echo "   Run first: node scripts/video/record.js $LANG"
  exit 1
fi

FRAME_COUNT=$(ls -1 "$FRAMES_DIR" | wc -l | tr -d ' ')
echo "🎞  Building video from $FRAME_COUNT frames..."
echo "   Source: $FRAMES_DIR"
echo "   Output: $OUT_FILE"

# 关键参数说明:
# -framerate 60: 输入帧率 60fps
# -i: 帧序列 pattern
# -c:v libx264: H.264 编码 (各平台通吃)
# -profile:v high -level 4.2: 高画质, 兼容现代手机
# -pix_fmt yuv420p: 像素格式 (必须, 不然某些播放器黑屏)
# -crf 18: 画质 (越低越清晰, 17-20 是高质量区间)
# -preset slow: 编码慢点换更小体积
# -movflags +faststart: 把元数据搬到文件开头, 边下边播
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
  "$OUT_FILE" 2>&1 | tail -15

# 文件大小
SIZE=$(du -h "$OUT_FILE" | cut -f1)
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT_FILE" | awk '{printf "%.1f", $1}')

echo ""
echo "✅ Done!"
echo "   File:     $OUT_FILE"
echo "   Size:     $SIZE"
echo "   Duration: ${DURATION}s"
echo ""
echo "📱 Verify by opening:"
echo "   open '$OUT_FILE'"
