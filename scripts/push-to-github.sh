#!/usr/bin/env bash
# ============================================================
# 推送 INAUE 到 GitHub
#
# 用法：
#   bash scripts/push-to-github.sh              # 交互式选认证方式
#   bash scripts/push-to-github.sh pat          # 用 Personal Access Token
#   bash scripts/push-to-github.sh ssh          # 用 SSH 密钥
#
# 生成 PAT：https://github.com/settings/tokens
#   勾选 repo 权限，生成后复制一次（GitHub 只显示一次）
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="qiaovnh/my-web"
REMOTE_URL="https://github.com/${REPO}.git"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "❌ 不是 git 仓库" >&2
  exit 1
fi

echo "═══════════════════════════════════════════"
echo "  推送到 GitHub: ${REPO}"
echo "═══════════════════════════════════════════"
echo
echo "本地待推送提交："
git log --oneline origin/main..main 2>/dev/null | sed 's/^/  /' || echo "  (无)"
echo
echo "将推送文件数：$(git diff --name-only origin/main..main 2>/dev/null | wc -l | tr -d ' ')"
echo

MODE="${1:-}"

# SSH 已授权则直接走，无需交互
if [ -z "$MODE" ] && [ -f ~/.ssh/id_ed25519 ]; then
  if ssh -o BatchMode=yes -o ConnectTimeout=8 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    MODE="ssh-auto"
  fi
fi

if [ -z "$MODE" ]; then
  echo "选择认证方式："
  echo "  1) Personal Access Token（一次配置长期有效）"
  echo "  2) SSH 密钥（推荐：自动生成并复制公钥）"
  echo
  read -r -p "选 1 或 2（直接回车=2）：" CHOICE
  [ "$CHOICE" = "1" ] && MODE="pat" || MODE="ssh-setup"
fi

case "$MODE" in
  ssh-auto|ssh)
    if [ ! -f ~/.ssh/id_ed25519 ]; then
      echo "❌ 未找到 SSH 密钥" >&2
      exit 1
    fi
    if ! ssh -o BatchMode=yes -o ConnectTimeout=8 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
      echo "❌ SSH 密钥尚未被 GitHub 接受" >&2
      echo "   请把公钥添加到 https://github.com/settings/ssh/new" >&2
      echo "   公钥内容：$(cat ~/.ssh/id_ed25519.pub)" >&2
      exit 1
    fi
    git remote set-url origin "git@github.com:${REPO}.git"
    echo "→ 使用 SSH 推送"
    git push -u origin main
    echo
    echo "✅ 推送成功"
    echo "   仓库地址：https://github.com/${REPO}"
    ;;

  pat)
    echo
    echo "请到 https://github.com/settings/tokens 生成 PAT："
    echo "  1) Generate new token (classic)"
    echo "  2) 勾选 repo 权限"
    echo "  3) Generate token 后复制（只显示一次）"
    echo
    read -r -s -p "粘贴 PAT（输入不回显）：" TOKEN
    echo
    if [ -z "$TOKEN" ]; then
      echo "❌ 未输入 token" >&2
      exit 1
    fi

    # 用临时 header 配置认证，不写入 git config（避免 token 留在磁盘）
    AUTH=$(printf 'x-access-token:%s' "$TOKEN" | base64)
    git -c http.extraHeader="Authorization: Basic ${AUTH}" push -u origin main

    echo
    echo "✅ 推送成功"
    echo "   仓库地址：https://github.com/${REPO}"
    ;;

  ssh-setup)
    echo
    echo "=== 生成 SSH 密钥 ==="
    if [ ! -f ~/.ssh/id_ed25519 ]; then
      read -r -p "邮箱（用于密钥注释）：" EMAIL
      ssh-keygen -t ed25519 -C "$EMAIL" -f ~/.ssh/id_ed25519
    else
      echo "已存在 ~/.ssh/id_ed25519，跳过生成"
    fi

    echo
    echo "=== 复制公钥 ==="
    pbcopy < ~/.ssh/id_ed25519.pub
    echo "公钥已复制到剪贴板。"
    echo
    echo "请到 https://github.com/settings/ssh/new 添加："
    echo "  Title: 随便填，如 'MacBook'"
    echo "  Key:   直接粘贴（剪贴板里已是）"
    echo
    read -r -p "添加完成后按回车继续："

    git remote set-url origin "git@github.com:${REPO}.git"
    echo "远程地址已切换为 SSH：git@github.com:${REPO}.git"
    git push -u origin main

    echo
    echo "✅ 推送成功"
    echo "   仓库地址：https://github.com/${REPO}"
    ;;

  *)
    echo "❌ 未知的认证方式：$MODE" >&2
    exit 1
    ;;
esac

echo
echo "═══════════════════════════════════════════"
echo "  下一步：部署到 Vercel"
echo "═══════════════════════════════════════════"
echo "  1) 打开 https://vercel.com/new → 导入 ${REPO}"
echo "  2) Storage → Create Database → Blob → 连接项目"
echo "  3) Settings → Environment Variables 配："
echo "       STORAGE_DRIVER=blob"
echo "       ADMIN_PASSWORD=你的强密码"
echo "       ADMIN_SECRET=32位以上随机串"
echo "  4) 重新部署"
echo "  5) 后台 /admin → GEO 优化 → 改「站点域名」"
echo
echo "  详细步骤见 GITHUB-VERCEL-CHECKLIST.md"
