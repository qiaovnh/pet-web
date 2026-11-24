#!/usr/bin/env bash
set -uo pipefail
export PATH="$HOME/.local/bin:$PATH"
export DREAMINA_CANVAS_STATE_DIR="/Volumes/AI/网站/.dreamina-state"
cd /Volumes/AI/网站/inaue || exit 1
mkdir -p public/img
SPEC="${1:-/tmp/paw-spec.tsv}"
RESULTS=/tmp/paw-results.tsv
: > "$RESULTS"

jget() { python3 -c 'import sys,json;d=json.load(sys.stdin);print(eval(sys.argv[1],{"d":d}) or "")' "$1" 2>/dev/null; }

P=$(dreamina-canvas canvas create 'INAUE 素材' --use --non-interactive --format json 2>/dev/null | jget 'd.get("data",{}).get("project",{}).get("projectId")')
if [ -z "$P" ]; then echo "CANVAS_FAIL"; exit 1; fi
echo "canvas=$P"

echo "=== SUBMIT ==="
while IFS='|' read -r slug ratio prompt; do
  [ -z "${slug:-}" ] && continue
  out=$(dreamina-canvas node create image --project-id "$P" --mode t2i --model seedream_5.5 \
    --ratio "$ratio" --resolution 2K --count 1 --title "$slug" --prompt "$prompt" \
    --run --non-interactive --format json 2>&1)
  sid=$(printf '%s' "$out" | jget 'd.get("data",{}).get("submission",{}).get("submitId")')
  if [ -z "$sid" ]; then echo "FAIL_SUBMIT $slug :: $(printf '%s' "$out" | tail -c 200)"; continue; fi
  printf '%s\t%s\n' "$slug" "$sid" >> "$RESULTS"
  echo "OK $slug"
done < "$SPEC"

echo "=== WAIT + DOWNLOAD ==="
while IFS=$'\t' read -r slug sid; do
  [ -z "${slug:-}" ] && continue
  w=$(dreamina-canvas operation wait "$sid" --project-id "$P" --format json 2>&1)
  rid=$(printf '%s' "$w" | jget 'd.get("data",{}).get("resources",[{}])[0].get("resourceId")')
  if [ -z "$rid" ]; then echo "FAIL_WAIT $slug"; continue; fi
  dreamina-canvas resource download "$rid" --project-id "$P" --output "public/img/$slug.png" --format json >/dev/null 2>&1
  echo "DONE $slug"
done < "$RESULTS"
echo "=== ALL DONE ==="
ls public/img | wc -l
