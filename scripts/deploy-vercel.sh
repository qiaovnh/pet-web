#!/usr/bin/env bash
# ============================================================
# INAUE 部署到 Vercel
#
# 关键前置：Vercel 的 Serverless 函数文件系统只读，.data/ 写不进去。
# 必须配 BLOB_READ_WRITE_TOKEN（Vercel Blob），否则后台保存会失败。
# 项目已内置降级：检测到只读会自动转内存模式（能浏览，重启即丢）。
#
# 用法：
#   bash scripts/deploy-vercel.sh            # 交互式首次部署
#   bash scripts/deploy-vercel.sh --prod     # 直接上生产
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

PROD_FLAG=""
[ "${1:-}" = "--prod" ] && PROD_FLAG="--prod"

echo "==> 检查 vercel CLI"
if ! command -v vercel >/dev/null 2>&1; then
  echo "    未安装，正在安装..."
  npm i -g vercel
fi
vercel --version

echo
echo "==> 检查 Vercel 环境变量"
if [ -f .env.local ]; then
  if grep -q "BLOB_READ_WRITE_TOKEN=." .env.local 2>/dev/null; then
    echo "    ✅ .env.local 已配置 BLOB_READ_WRITE_TOKEN"
  else
    echo "    ⚠️  .env.local 里没有 BLOB_READ_WRITE_TOKEN"
    echo "        上线前必须在 Vercel Dashboard → Storage → Blob 连接项目，"
    echo "        并在 Environment Variables 里配好 Blob token 与 STORAGE_DRIVER=blob"
  fi
else
  echo "    ⚠️  没有 .env.local"
fi

echo
echo "==> 确认 next.config.ts 在 Vercel 下不会输出 standalone"
echo "    （已用 process.env.VERCEL 条件判断，Vercel 构建时自动关闭）"

echo
echo "==> 构建检查（Vercel 模式）"
# Vercel 模式必须显式带上 VERCEL=1，否则本地残留的 standalone 产物会误导检查结果
VERCEL=1 npm run build >/dev/null 2>&1 && echo "    ✅ 构建通过"

if [ -d .next/standalone ]; then
  echo "    ⚠️  构建出了 .next/standalone，Vercel 上可能导致全站 404"
  echo "        请检查 next.config.ts 的 process.env.VERCEL 条件判断"
else
  echo "    ✅ 未输出 standalone，Vercel 模式正确"
fi

echo
echo "==> 部署"
if [ -n "$PROD_FLAG" ]; then
  vercel --prod --yes
else
  vercel
fi

echo
echo "部署完成。接下来必做："
echo "  1) Dashboard → Storage → Create Database → Blob → 连接到本项目"
echo "  2) Dashboard → Settings → Environment Variables 配好："
echo "       STORAGE_DRIVER        = blob"
echo "       BLOB_READ_WRITE_TOKEN = 自动注入（不用手填）"
echo "       ADMIN_PASSWORD        = 你的强密码（不能用默认 inaue-admin）"
echo "       ADMIN_SECRET          = 32位以上随机串"
echo "       （Production / Preview / Development 三个环境都要勾）"
echo "  3) 重新部署一次（环境变量改动需要重新构建生效）"
echo "  4) 后台 /admin → GEO 优化 → 把「站点域名」改成你的域名"
echo "  5) 验证：建商品→刷新还在；传图→前台可见；下一单→/admin/orders 有记录"
