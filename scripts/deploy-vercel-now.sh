#!/bin/bash
# Vercel 生产部署 —— 自动处理本机网络环境对 api.vercel.com 的拦截问题
#
# 背景：本机到 api.vercel.com 的连接约 75% 概率超时（本地代理策略），
#      但 api-us.vercel.com 稳定可达。CLI 支持通过全局 config.json 的
#      "api" 字段或 --api 参数切换 API 域名。
#
# 用法：
#   VERCEL_TOKEN=xxx ./scripts/deploy-vercel-now.sh
# 或先把 token 存好：
#   vercel login --token xxx  # 之后直接跑本脚本

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

VERCEL_BIN="${VERCEL_BIN:-vercel}"
API_ORIGIN="${VERCEL_API_ORIGIN:-https://api-us.vercel.com}"

# 本地代理会拦 api.vercel.com，强制走可达的备用域名
export VERCEL_API_ORIGIN="$API_ORIGIN"

echo "== 1/4 检查环境 =="
command -v "$VERCEL_BIN" >/dev/null 2>&1 || {
  echo "✗ 未找到 vercel CLI，执行： npm install -g vercel"; exit 1;
}
echo "  CLI: $(command -v $VERCEL_BIN)"

TOKEN="${VERCEL_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  # 从 CLI 的 auth.json 读（vercel login --token 会写这里）
  AUTH_FILE="$HOME/Library/Application Support/com.vercel.cli/auth.json"
  [ -f "$AUTH_FILE" ] && TOKEN=$(python3 -c "import json;print(json.load(open('$AUTH_FILE')).get('token',''))" 2>/dev/null || true)
fi
if [ -z "$TOKEN" ]; then
  echo "  ✗ 未找到 Vercel token"
  echo ""
  echo "获取方式："
  echo "  1. 打开 https://vercel.com/account/tokens"
  echo "  2. 点 Create Token，生成一个 token"
  echo "  3. 执行： vercel login --token <你的token>"
  echo "     或： VERCEL_TOKEN=<你的token> ./scripts/deploy-vercel-now.sh"
  exit 1
fi
echo "  ✓ Token 已就绪"

echo "== 2/4 验证 Token =="
for i in 1 2 3 4 5; do
  OUT=$("$VERCEL_BIN" api /v2/user --token "$TOKEN" --api "$API_ORIGIN" 2>&1)
  if echo "$OUT" | grep -q '"username"'; then
    echo "  ✓ 认证成功: $(echo "$OUT" | python3 -c "import json,sys;print(json.load(sys.stdin).get('username',''))" 2>/dev/null)"
    break
  fi
  if [ "$i" = "5" ]; then
    echo "  ✗ 认证失败: $(echo "$OUT" | head -2)"
    exit 1
  fi
  sleep 2
done

echo "== 3/4 关联 GitHub 仓库 =="
# 用 CLI 的 link 机制把项目关联到 qiaovnh/my-web
if [ ! -f .vercel/project.json ]; then
  # 通过 API 直接创建项目
  PROJECT_NAME="inaue"
  echo "  创建项目 $PROJECT_NAME ..."
  CREATE=$("$VERCEL_BIN" api "/v10/projects?skipAutoDetection=1" --token "$TOKEN" --api "$API_ORIGIN" --method POST \
    --body "{\"name\":\"$PROJECT_NAME\",\"framework\":\"nextjs\"}" 2>&1)
  if echo "$CREATE" | grep -q '"id"'; then
    PROJ_ID=$(echo "$CREATE" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('id',''))" 2>/dev/null)
    echo "  ✓ 项目已创建 (id=$PROJ_ID)"
    mkdir -p .vercel
    cat > .vercel/project.json << EOF
{
  "projectId": "$PROJ_ID",
  "orgId": "team_$(echo "$PROJ_ID" | cut -c1-8)",
  "projectName": "$PROJECT_NAME"
}
EOF
  else
    echo "  创建响应: $(echo "$CREATE" | head -3)"
  fi
else
  echo "  ✓ 已关联项目: $(python3 -c "import json;print(json.load(open('.vercel/project.json')).get('projectName',''))" 2>/dev/null)"
fi

echo "== 4/4 部署 =="
"$VERCEL_BIN" deploy --prod --token "$TOKEN" --api "$API_ORIGIN" --yes 2>&1

echo ""
echo "✓ 部署完成"
