#!/usr/bin/env bash
# ============================================================
# INAUE 一键打包：生成可直接丢到服务器运行的最小部署包
#
# 产物：dist/inaue-deploy-<时间戳>.tar.gz
#   - .next/standalone  精简后的 Node 服务（自带依赖，约 45MB）
#   - .next/static      前端静态资源
#   - public            图片与字体
#   - .data             数据与上传目录
#   - .env.production   生产环境变量（需自行改密码）
#   - start.sh          启动脚本
#   - nginx.conf        Nginx 反代配置模板
#
# 相比完整项目包（400MB+ node_modules），这个包约 50MB。
# 服务器上无需 npm install / npm run build。
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

STAMP=$(date +%Y%m%d-%H%M)
OUT_DIR="${1:-dist}"
PKG_NAME="inaue-deploy-${STAMP}"
STAGE="${OUT_DIR}/${PKG_NAME}"

echo "==> 1/5 构建 standalone"
# 必须清掉 VERCEL 变量：next.config.ts 用它区分构建目标，
# 若继承了 VERCEL=1 就会跳过 standalone，产出无法独立运行的残包。
env -u VERCEL npm run build

if [ ! -f .next/standalone/server.js ]; then
  echo "❌ 构建失败：.next/standalone/server.js 不存在" >&2
  echo "   请检查 next.config.ts 是否正确配置 output: 'standalone'" >&2
  exit 1
fi

echo "==> 2/5 组装部署目录"
rm -rf "$STAGE"
mkdir -p "$STAGE"

# standalone 目录内部已经带有一套 .next/（运行时必需的 manifests），
# 不要整个删掉——只需把 static 资源合并进去。
cp -r .next/standalone/. "$STAGE/"
mkdir -p "$STAGE/.next/static"
cp -r .next/static/. "$STAGE/.next/static/"
cp -r public "$STAGE/public"

# 数据：standalone 会把构建时的 .data 一起复制进来，先清掉再放干净的，
# 避免残留 carts.json 或旧数据混进去。
rm -rf "$STAGE/.data"
mkdir -p "$STAGE/.data/uploads"
for f in products orders settings geo content; do
  [ -f ".data/${f}.json" ] && cp ".data/${f}.json" "$STAGE/.data/" || true
done
if [ -d .data/uploads ]; then
  cp -r .data/uploads/. "$STAGE/.data/uploads/" 2>/dev/null || true
fi

echo "==> 3/5 生成生产环境变量"
if [ ! -f .env.production ]; then
  cat > "$STAGE/.env.production" <<EOF
# 生产环境变量 —— 上线前请修改 ADMIN_PASSWORD 与 ADMIN_SECRET
STORAGE_DRIVER=local
ADMIN_PASSWORD=请改成你的强密码
ADMIN_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
COMMERCE_PROVIDER=mock
EOF
else
  cp .env.production "$STAGE/.env.production"
  echo "    （沿用现有 .env.production）"
fi

echo "==> 4/5 生成启动脚本与 Nginx 配置"
cat > "$STAGE/start.sh" <<'EOF'
#!/usr/bin/env bash
# 启动 INAUE。环境变量从同目录 .env.production 读取。
set -euo pipefail
cd "$(dirname "$0")"

set -a
. ./.env.production
set +a

export PORT="${PORT:-3210}"
# 注意：不要用 ${HOSTNAME:-0.0.0.0}。HOSTNAME 在 Linux/macOS 上默认就是机器名，
# 兜底永远不生效，会导致服务只监听主机名，用 IP 访问连不上。这里固定绑定 0.0.0.0。
export HOSTNAME="0.0.0.0"
export NODE_ENV=production

exec node server.js
EOF
chmod +x "$STAGE/start.sh"

cat > "$STAGE/nginx.conf" <<'EOF'
# Nginx 反向代理配置模板
# 1) cp nginx.conf /etc/nginx/conf.d/inaue.conf
# 2) 把 server_name 改成你的域名
# 3) sudo nginx -t && sudo systemctl reload nginx

server {
    listen 80;
    server_name your-domain.com;

    # 后台上传图片最大 8MB，这里留余量
    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }

    # 静态资源直接由 Nginx 托管，减轻 Node 压力
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3210;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
    location /img/ {
        proxy_pass http://127.0.0.1:3210;
        expires 30d;
    }
}
EOF

echo "==> 5/5 打包"
mkdir -p "$OUT_DIR"
tar -czf "${OUT_DIR}/${PKG_NAME}.tar.gz" -C "$OUT_DIR" "$PKG_NAME"
SIZE=$(du -h "${OUT_DIR}/${PKG_NAME}.tar.gz" | cut -f1)
rm -rf "$STAGE"

echo
echo "完成"
echo "  ${OUT_DIR}/${PKG_NAME}.tar.gz   ${SIZE}"
echo
echo "部署步骤"
echo "  1) scp ${OUT_DIR}/${PKG_NAME}.tar.gz user@服务器:/var/www/"
echo "  2) ssh user@服务器"
echo "  3) cd /var/www && tar -xzf ${PKG_NAME}.tar.gz && cd ${PKG_NAME}"
echo "  4) vi .env.production            # 改 ADMIN_PASSWORD 和 ADMIN_SECRET"
echo "  5) chmod +x start.sh && ./start.sh   # 先前台跑一次验证"
echo "  6) pm2 start start.sh --name inaue && pm2 save && pm2 startup"
echo "  7) cp nginx.conf /etc/nginx/conf.d/ && sudo nginx -t && sudo systemctl reload nginx"
echo
echo "上线后必做：后台 /admin → GEO 设置 → 把「站点域名」改成你的域名"
echo "否则 sitemap.xml / llms.txt 里的链接还是默认的 https://inaue.co"
