#!/usr/bin/env bash
# Run a command with the Node.js version from .nvmrc (Angular 22 compatible).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "${ROOT}/.nvmrc")"

if [[ $# -eq 0 ]]; then
  echo "Usage: node-run.sh <command> [args...]" >&2
  exit 1
fi

run_with_nvm() {
  export NVM_DIR="${HOME}/.nvm"
  export NVM_SILENT=1
  # shellcheck source=/dev/null
  . "${NVM_DIR}/nvm.sh"

  if ! nvm version "${VERSION}" 2>/dev/null | grep -q "^v"; then
    echo "Installing Node.js ${VERSION}..."
    nvm install "${VERSION}" --no-progress
  fi

  nvm use "${VERSION}" >/dev/null 2>&1
  exec "$@"
}

run_with_fnm() {
  eval "$(fnm env)"
  fnm install "${VERSION}" --silent-if-installed 2>/dev/null || fnm install "${VERSION}"
  fnm use "${VERSION}" >/dev/null 2>&1
  exec "$@"
}

if [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
  run_with_nvm "$@"
fi

if command -v fnm >/dev/null 2>&1; then
  run_with_fnm "$@"
fi

current="$(node -v)"
major="${current#v}"
major="${major%%.*}"
rest="${current#v}"
rest="${rest#*.}"
minor="${rest%%.*}"
patch="${rest#*.}"

supported=false
if [[ "$major" == "22" && ( "$minor" -gt 22 || ( "$minor" == "22" && "$patch" -ge 3 ) ) ]]; then
  supported=true
elif [[ "$major" == "24" && "$minor" -ge 15 ]]; then
  supported=true
elif [[ "$major" -ge 26 ]]; then
  supported=true
fi

if [[ "$supported" == "true" ]]; then
  exec "$@"
fi

cat <<EOF >&2
Unsupported Node.js version: ${current}

Angular 22 requires Node.js 22.22.3+, 24.15.0+, or 26+.
Install nvm or fnm, then run: task dev
EOF
exit 1
