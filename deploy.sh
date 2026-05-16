#!/usr/bin/env bash
# ============================================================================
# pwa-gen 部署脚本 - Cloudflare Pages
# ============================================================================
# 使用:
#   ./deploy.sh             # 部署 production (绑 pwa.ipcloak.ai)
#   ./deploy.sh --preview   # 部署 preview branch
#
# 凭据存放: ./.deploy.env (gitignored, 永不进 git)
#   首次使用: cp .deploy.env.example .deploy.env, 填入 token
# KV namespace PWA_APPS 已创建, id 见 wrangler.toml
# ============================================================================

set -euo pipefail

cd "$(dirname "$0")"

# ----- 加载本地凭据 -----
if [[ ! -f ".deploy.env" ]]; then
  echo "❌ 缺少 .deploy.env"
  echo "   cp .deploy.env.example .deploy.env"
  echo "   编辑 .deploy.env 填入 CLOUDFLARE_API_TOKEN"
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .deploy.env
set +a

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" || -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "❌ .deploy.env 必须包含 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID"
  exit 1
fi

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
