#!/bin/bash
# Clear Next.js cache and restart frontend

echo "Clearing Next.js cache and restarting frontend..."


# Stop frontend
docker-compose -f docker-compose.yml -f docker-compose.dev.yml stop frontend

# Remove the Next.js cache volume (find it dynamically)
echo "Removing Next.js cache volume..."
VOLUME_NAME=$(docker volume ls | grep frontend_next | awk '{print $2}' | head -1)
if [ ! -z "$VOLUME_NAME" ]; then
    echo "Found volume: $VOLUME_NAME"
    docker volume rm "$VOLUME_NAME" 2>/dev/null || true
else
    echo "No frontend_next volume found (might already be removed)"
fi

# Remove .next directory if it exists locally
if [ -d "frontend/.next" ]; then
    echo "Removing local .next directory..."
    rm -rf frontend/.next
fi

# Restart frontend (will rebuild cache with new code)
echo "Restarting frontend..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d frontend

echo ""
echo "Frontend cache cleared and restarted!"
echo "Check logs with: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend"
echo ""
echo "After the frontend starts, do a HARD REFRESH in your browser:"
echo "  - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "  - Or open DevTools (F12) -> Right-click refresh button -> 'Empty Cache and Hard Reload'"

