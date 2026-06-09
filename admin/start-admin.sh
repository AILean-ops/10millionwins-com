#!/bin/bash
set -euo pipefail

cd /Users/aileansolutions/10millionwins-site

if [ -f admin/.admin-session ]; then
  set -a
  # shellcheck disable=SC1091
  source admin/.admin-session
  set +a
fi

export TEN_MILLION_WINS_ADMIN_HOST="${TEN_MILLION_WINS_ADMIN_HOST:-127.0.0.1}"
export TEN_MILLION_WINS_ADMIN_PORT="${TEN_MILLION_WINS_ADMIN_PORT:-8791}"
export TEN_MILLION_WINS_API_BASE="${TEN_MILLION_WINS_API_BASE:-https://10millionwins.com}"
export TEN_MILLION_WINS_ALLOWED_CLIENTS="${TEN_MILLION_WINS_ALLOWED_CLIENTS:-127.0.0.1,::1}"

exec /opt/homebrew/opt/node@22/bin/node admin/server.mjs
