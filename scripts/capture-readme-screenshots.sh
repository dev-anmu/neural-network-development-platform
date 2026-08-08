#!/usr/bin/env bash
# Optional helper: capture home.png and projects.png for docs/images/
# (requires dev server at http://localhost:4200)
#
# Usage: bash scripts/capture-readme-screenshots.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/images"
BASE_URL="${BASE_URL:-http://localhost:4200}"
PLAYWRIGHT_VERSION="${PLAYWRIGHT_VERSION:-1.50.1}"
VIEWPORT="${VIEWPORT:-1440,900}"

mkdir -p "$OUT"

capture() {
  local path="$1"
  local file="$2"
  npx -p "playwright@${PLAYWRIGHT_VERSION}" playwright screenshot \
    --viewport-size="$VIEWPORT" \
    "${BASE_URL}${path}" \
    "${OUT}/${file}"
  echo "Saved ${file}"
}

capture /home home.png
capture /projects projects.png
