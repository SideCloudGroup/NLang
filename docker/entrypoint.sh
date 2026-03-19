#!/bin/sh
set -eu

export NLANG_CONFIG="${NLANG_CONFIG:-/app/config.toml}"

python -m uvicorn app.main:app --app-dir /app/backend --host 127.0.0.1 --port 8000 &
UVICORN_PID=$!

cd /app/frontend
PORT=3000 HOSTNAME=127.0.0.1 npm run start -- -p 3000 -H 127.0.0.1 &
NEXT_PID=$!

cd /app
trap 'kill -TERM "$UVICORN_PID" "$NEXT_PID" 2>/dev/null || true' INT TERM

exec caddy run --config /app/Caddyfile --adapter caddyfile

