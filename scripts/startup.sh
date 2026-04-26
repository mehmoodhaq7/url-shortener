#!/bin/bash
# ─────────────────────────────────────────────
# startup.sh
# Run on server boot to reconnect containers to networks
# Usage: ./scripts/startup.sh
# Or via crontab: @reboot /path/to/scripts/startup.sh
# ─────────────────────────────────────────────

set -euo pipefail

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Blue-Green Network Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for Docker to be ready
sleep 5

# Connect green containers to blue_net
echo "  Connecting containers to blue_net..."

for container in \
  urlshortener_green_backend \
  urlshortener_green_frontend \
  urlshortener_mongodb; do

  docker network connect url-shortener_blue_net "$container" 2>/dev/null \
    && echo "  ✅ $container connected" \
    || echo "  ⚪ $container already connected or not running"
done

# Force recreate nginx so it picks up correct upstream
echo ""
echo "  Restarting Nginx..."
docker compose -f /home/mehmood777/Desktop/url-shortener/docker-compose.blue.yml \
  up -d --force-recreate nginx 2>/dev/null || true
echo "  ✅ Nginx restarted"

echo ""
echo "  ✅ Startup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""