#!/bin/bash
# 检测 GitHub 认证方式并推送当前分支到 origin/main
# 优先级：SSH 公钥 → 环境变量 GITHUB_TOKEN → 钥匙串 osxkeychain
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

REMOTE_SSH="ssh://git@github.com/qiaovnh/my-web.git"
REMOTE_HTTPS="https://github.com/qiaovnh/my-web.git"

echo "== 1/3 检查 SSH 公钥认证 =="
if ssh -o BatchMode=yes -o ConnectTimeout=15 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  echo "   ✓ SSH 可用"
  git remote set-url origin "$REMOTE_SSH"
  echo "== 3/3 推送 =="
  git push -u origin main
  exit 0
fi
echo "   ✗ SSH 未生效"

echo "== 2/3 检查 Token =="
TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -n "${GH_TOKEN:-}" ]; then
  TOKEN="$GH_TOKEN"
fi
if [ -z "$TOKEN" ]; then
  # 从 macOS 钥匙串取（osxkeychain 会存 PAT）
  TOKEN="$(printf 'protocol=https\nhost=github.com\n\n' | git credential-osxkeychain get 2>/dev/null | sed -n 's/^password=//p')" || true
fi
if [ -z "$TOKEN" ]; then
  echo "   ✗ 未找到可用 Token"
  echo ""
  echo "请任选一种方式后重新执行本脚本："
  echo "  [A] 添加 SSH 公钥（最快）"
  echo "      1. 打开 https://github.com/settings/keys/new"
  echo "      2. Title 填 workbuddy-mac，Key 粘贴以下公钥后保存："
  echo "      $(cat ~/.ssh/id_ed25519.pub)"
  echo "  [B] 使用 PAT"
  echo "      1. 打开 https://github.com/settings/tokens/new?scopes=repo"
  echo "      2. 勾选 repo 权限生成 token"
  echo "      3. 执行： GITHUB_TOKEN=ghp_xxx ./scripts/push-now.sh"
  exit 1
fi
echo "   ✓ 找到 Token"

# Token 只通过临时 header 传递，不写入 git config、不落盘
AUTH_USER="x-access-token"
if echo "$TOKEN" | grep -qE '^ghp_|^github_pat_'; then
  AUTH_USER="x-access-token"
fi
B64="$(printf '%s:%s' "$AUTH_USER" "$TOKEN" | base64)"

echo "== 3/3 推送 =="
git remote set-url origin "$REMOTE_HTTPS"
git -c http.extraheader="Authorization: Basic $B64" push -u origin main

echo ""
echo "✓ 推送完成"
