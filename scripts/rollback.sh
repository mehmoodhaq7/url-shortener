#!/bin/bash
set -euo pipefail

UPSTREAM_FILE="./nginx/conf.d/upstream.conf"
NGINX_CONTAINER="urlshortener_nginx"
STATE_FILE=".current_env"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Blue-Green Rollback"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "$STATE_FILE" ]; then
  echo "  ❌ No state file found — run switch.sh first"
  exit 1
fi

CURRENT=$(cat "$STATE_FILE")
if [ "$CURRENT" == "blue" ]; then
  ROLLBACK_TO="green"
else
  ROLLBACK_TO="blue"
fi

echo "  Current:         $CURRENT"
echo "  Rolling back to: $ROLLBACK_TO"
echo ""

# Get IPs from blue_net
BACKEND_IP=$(docker inspect --format='{{(index .NetworkSettings.Networks "url-shortener_blue_net").IPAddress}}' "urlshortener_${ROLLBACK_TO}_backend")
FRONTEND_IP=$(docker inspect --format='{{(index .NetworkSettings.Networks "url-shortener_blue_net").IPAddress}}' "urlshortener_${ROLLBACK_TO}_frontend")

cat > "$UPSTREAM_FILE" << EOF
upstream backend {
    server ${BACKEND_IP}:3000;
}

upstream frontend {
    server ${FRONTEND_IP}:80;
}
EOF

if docker exec "$NGINX_CONTAINER" nginx -t 2>/dev/null; then
  docker exec "$NGINX_CONTAINER" nginx -s reload
  echo "$ROLLBACK_TO" > "$STATE_FILE"
  echo "  ✅ Rollback complete!"
  echo "  🟢 Active: $ROLLBACK_TO"
else
  echo "  ❌ Nginx config invalid"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""