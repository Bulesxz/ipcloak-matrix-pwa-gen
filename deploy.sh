#!/usr/bin/env bash
# ============================================================================
# pwa-gen 部署脚本 - Cloudflare Pages
# ============================================================================
# 使用:
#   ./deploy.sh             # 部署 production (绑 pwa.ipcloak.ai)
#   ./deploy.sh --preview   # 部署 preview branch
#
# 前置条件:
#   1. wrangler login    (已登录就跳过)
#   2. KV namespace 已创建 + wrangler.toml 里 id 已填
#      首次执行: wrangler kv namespace create PWA_APPS
# ============================================================================

set -euo pipefail

cd "$(dirname "$0")"

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
