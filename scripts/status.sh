#!/bin/bash
# ─────────────────────────────────────────────
# status.sh
# Shows current blue-green deployment status
# Usage: ./scripts/status.sh
# ─────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Blue-Green Deployment Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Current active environment from nginx upstream
UPSTREAM_FILE="./nginx/conf.d/upstream.conf"

STATE_FILE=".current_env"
if [ -f "$STATE_FILE" ]; then
  ACTIVE=$(cat "$STATE_FILE")
elif [ -f "$UPSTREAM_FILE" ]; then
  if grep -q "blue_backend" "$UPSTREAM_FILE"; then
    ACTIVE="blue"
  else
    ACTIVE="green"
  fi
else
  ACTIVE="unknown"
fi

if [ "$ACTIVE" == "blue" ]; then
  STANDBY="green"
elif [ "$ACTIVE" == "green" ]; then
  STANDBY="blue"
else
  STANDBY="unknown"
fi

echo "  🟢 Active:  $ACTIVE"
echo "  ⚪ Standby: $STANDBY"

echo ""
echo "  Container Status:"
echo "  ─────────────────"

# Check all relevant containers
for container in \
  urlshortener_nginx \
  urlshortener_blue_backend \
  urlshortener_blue_frontend \
  urlshortener_green_backend \
  urlshortener_green_frontend \
  urlshortener_mongodb \
  urlshortener_redis_blue \
  urlshortener_redis_green; do

  STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not running")
  HEALTH=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' "$container" 2>/dev/null || echo "N/A")

  # Color coding
  if [ "$STATUS" == "running" ] && [ "$HEALTH" == "healthy" ]; then
    ICON="✅"
  elif [ "$STATUS" == "running" ]; then
    ICON="🟡"
  else
    ICON="❌"
  fi

  printf "  %s  %-45s %s (%s)\n" "$ICON" "$container" "$STATUS" "$HEALTH"
done

echo ""
echo "  Nginx Upstream:"
echo "  ───────────────"
if [ -f "$UPSTREAM_FILE" ]; then
  grep "server " "$UPSTREAM_FILE" | sed 's/^/  /'
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""