#!/bin/bash
# ─────────────────────────────────────────────
# health-check.sh
# Checks if a given environment (blue/green) is healthy
# Usage: ./scripts/health-check.sh <blue|green> [retries] [delay]
# ─────────────────────────────────────────────

set -euo pipefail

ENV=${1:-blue}
MAX_RETRIES=${2:-10}
DELAY=${3:-5}

# Port mapping
if [ "$ENV" == "blue" ]; then
  BACKEND_CONTAINER="urlshortener_blue_backend"
else
  BACKEND_CONTAINER="urlshortener_green_backend"
fi

echo "🔍 Health checking $ENV environment..."
echo "   Container: $BACKEND_CONTAINER"
echo "   Max retries: $MAX_RETRIES, Delay: ${DELAY}s"
echo ""

attempt=1
while [ $attempt -le $MAX_RETRIES ]; do
  echo "   Attempt $attempt/$MAX_RETRIES..."

  # Check if container is running
  STATUS=$(docker inspect --format='{{.State.Status}}' "$BACKEND_CONTAINER" 2>/dev/null || echo "not_found")

  if [ "$STATUS" != "running" ]; then
    echo "   ❌ Container $BACKEND_CONTAINER is not running (status: $STATUS)"
    attempt=$((attempt + 1))
    sleep "$DELAY"
    continue
  fi

  # Hit /health endpoint inside the container
  RESPONSE=$(docker exec "$BACKEND_CONTAINER" \
    wget -qO- http://localhost:3000/health 2>/dev/null || echo "")

  if echo "$RESPONSE" | grep -q '"status":"healthy"'; then
    echo ""
    echo "   ✅ $ENV environment is healthy!"
    echo "   Response: $RESPONSE"
    exit 0
  else
    echo "   ⚠️  Not healthy yet. Response: ${RESPONSE:-empty}"
  fi

  attempt=$((attempt + 1))
  sleep "$DELAY"
done

echo ""
echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1