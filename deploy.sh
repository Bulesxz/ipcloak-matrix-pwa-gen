#!/usr/bin/env bash
# ============================================================================
# pwa-gen 部署脚本 - Cloudflare Pages
# ============================================================================
# 使用:
#   ./deploy.sh             # 部署 production (绑 pwa.ipcloak.ai)
#   ./deploy.sh --preview   # 部署 preview branch
#
# Token 直接写死在本文件里 (此仓库为私有, 不会泄漏)
# KV namespace PWA_APPS 已创建, id 见 wrangler.toml
# ============================================================================

set -euo pipefail

cd "$(dirname "$0")"

# ----- Cloudflare 凭据 (写死) -----
export CLOUDFLARE_ACCOUNT_ID="1384d3a46efbbe6ebe76f099ea8ef159"
export CLOUDFLARE_API_TOKEN="cfut_xTWMbg0r8cEhBZ54PgQH12i3kwXhUbI8f6l3jSZN8b4ae4a7"

BRANCH="main"
if [[ "${1:-}" == "--preview" ]]; then
  BRANCH="preview"
fi

# 解除代理 (CF API fetch 不要走 clash)
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy

echo "📦 [1/3] 构建 (Next.js + next-on-pages)..."
npm run build:cf

echo
echo "🚀 [2/3] 部署到 Cloudflare Pages..."
# --commit-message 必须用英文 (CF API 不接受非 UTF-8 中文)
wrangler pages deploy .vercel/output/static \
  --project-name="pwa-gen" \
  --branch="${BRANCH}" \
  --commit-message="deploy pwa-gen with pixel tracking" \
  --commit-dirty=true

echo
echo "✅ [3/3] 部署完成"
echo "   生产域名: https://pwa.ipcloak.ai"
echo "   预览域名: https://pwa-gen.pages.dev"
