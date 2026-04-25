#!/bin/bash
# ─────────────────────────────────────────────
# switch.sh
# Switches Nginx traffic between blue and green
# Usage: ./scripts/switch.sh <blue|green>
# ─────────────────────────────────────────────

set -euo pipefail

TARGET=${1:-""}
UPSTREAM_FILE="./nginx/conf.d/upstream.conf"
NGINX_CONTAINER="urlshortener_nginx"

# ── Validate input ────────────────────────────
if [ "$TARGET" != "blue" ] && [ "$TARGET" != "green" ]; then
  echo "❌ Usage: ./scripts/switch.sh <blue|green>"
  exit 1
fi

# ── Determine current active ──────────────────
if [ -f ".current_env" ]; then
  CURRENT=$(cat .current_env)
else
  # Fallback
  if grep -q "blue_backend" "$UPSTREAM_FILE" 2>/dev/null; then
    CURRENT="blue"
  else
    CURRENT="green"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Blue-Green Switch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Current: $CURRENT"
echo "  Target:  $TARGET"
echo ""

# ── Step 1: Health check target ───────────────
echo "  Step 1/3: Health checking $TARGET..."
if ! ./scripts/health-check.sh "$TARGET" 10 5; then
  echo ""
  echo "  ❌ $TARGET is not healthy — aborting switch"
  echo "  ✅ $CURRENT remains active"
  exit 1
fi

# ── Step 2: Update nginx upstream ────────────
echo ""
echo "  Step 2/3: Updating Nginx upstream..."
cp "$UPSTREAM_FILE" "${UPSTREAM_FILE}.bak"

# Get actual IP of target containers
BACKEND_IP=$(docker inspect --format='{{(index .NetworkSettings.Networks "url-shortener_blue_net").IPAddress}}' "urlshortener_${TARGET}_backend")
FRONTEND_IP=$(docker inspect --format='{{(index .NetworkSettings.Networks "url-shortener_blue_net").IPAddress}}' "urlshortener_${TARGET}_frontend")

cat > "$UPSTREAM_FILE" << EOF
upstream backend {
    server ${BACKEND_IP}:3000;
}

upstream frontend {
    server ${FRONTEND_IP}:80;
}
EOF

echo "  Upstream updated:"
echo "    backend  → $TARGET ($BACKEND_IP:3000)"
echo "    frontend → $TARGET ($FRONTEND_IP:80)"

# ── Step 3: Reload nginx ──────────────────────
echo ""
echo "  Step 3/3: Reloading Nginx (zero downtime)..."

if docker exec "$NGINX_CONTAINER" nginx -t 2>/dev/null; then
  docker exec "$NGINX_CONTAINER" nginx -s reload
  echo "$TARGET" > .current_env
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ✅ Switch complete!"
  echo "  🟢 Active: $TARGET"
  echo "  ⚪ Standby: $CURRENT"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
else
  echo "  ❌ Nginx config test failed — rolling back"
  cp "${UPSTREAM_FILE}.bak" "$UPSTREAM_FILE"
  exit 1
fi