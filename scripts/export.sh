#!/usr/bin/env bash
# 导出可部署的站点包 + 数据快照
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP=$(date +%Y%m%d-%H%M)
OUT_DIR="${1:-dist}"
PKG_NAME="inaue-site-${STAMP}"
STAGE="${OUT_DIR}/${PKG_NAME}"

mkdir -p "$OUT_DIR"

echo "==> 1/3 收集文件"
rm -rf "$STAGE"
mkdir -p "$STAGE"

tar -cf - \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./out' \
  --exclude='./.npm-cache' \
  --exclude='./.dreamina-state' \
  --exclude='./dist' \
  --exclude='./preview' \
  --exclude='./.git' \
  --exclude='./.data/carts.json' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  . 2>/dev/null | tar -xf - -C "$STAGE"

echo "==> 2/3 打包"
tar -czf "${OUT_DIR}/${PKG_NAME}.tar.gz" -C "$OUT_DIR" "$PKG_NAME"
SIZE=$(du -h "${OUT_DIR}/${PKG_NAME}.tar.gz" | cut -f1)
FILES=$(find "$STAGE" -type f | wc -l | tr -d ' ')
rm -rf "$STAGE"

echo "==> 3/3 导出数据快照"
node -e '
const fs = require("fs");
const path = require("path");
const dir = ".data";
const files = ["products.json", "orders.json", "settings.json", "geo.json", "content.json"];
const out = { exportedAt: new Date().toISOString(), data: {}, uploads: [] };
for (const f of files) {
  const key = f.replace(".json", "");
  try { out.data[key] = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); }
  catch { out.data[key] = null; }
}
try {
  out.uploads = fs.readdirSync(path.join(dir, "uploads")).map((name) => ({
    name,
    bytes: fs.statSync(path.join(dir, "uploads", name)).size,
    url: "/media/" + name,
  }));
} catch {}
fs.writeFileSync(process.argv[1], JSON.stringify(out, null, 2));
' "${OUT_DIR}/inaue-data-${STAMP}.json"

echo
echo "完成："
echo "  ${OUT_DIR}/${PKG_NAME}.tar.gz   ${SIZE}   ${FILES} 个文件"
echo "  ${OUT_DIR}/inaue-data-${STAMP}.json"
echo
echo "部署："
echo "  scp ${OUT_DIR}/${PKG_NAME}.tar.gz user@server:/var/www/"
echo "  ssh user@server"
echo "    cd /var/www && tar -xzf ${PKG_NAME}.tar.gz && cd ${PKG_NAME}"
echo "    cp .env.example .env && vi .env      # 改 ADMIN_PASSWORD / ADMIN_SECRET"
echo "    npm ci && npm run build && PORT=3210 npm start"
