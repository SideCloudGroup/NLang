#!/bin/sh
set -e
if [ -n "$NLANG_API_URL" ]; then
  esc=$(echo "$NLANG_API_URL" | sed 's/|/\\|/g; s/&/\\&/g')
  sed "s|__NLANG_API_URL_VALUE__|$esc|g" /usr/share/nginx/html/index.html > /tmp/index.html
  mv /tmp/index.html /usr/share/nginx/html/index.html
fi
cd /app
./nlang serve &
exec nginx -g "daemon off;"
