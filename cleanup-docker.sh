gi#!/bin/bash
# Cleanup script for Docker networking issues in Codespaces

echo "Cleaning up Docker networks and containers..."

# Stop all containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
docker-compose down --remove-orphans 2>/dev/null || true

# Remove orphaned networks
echo "Removing orphaned networks..."
docker network prune -f

# List remaining networks (for debugging)
echo ""
echo "Remaining Docker networks:"
docker network ls

echo ""
echo "Cleanup complete! You can now run 'make dev' again."

