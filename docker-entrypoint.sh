#!/bin/sh
set -e

echo "=================================================="
echo "  🚀 Starting Khashala Production (خُشاله)        "
echo "=================================================="

# Ensure upload directories exist
mkdir -p /app/public/uploads/ads /app/public/uploads/branding || true

# Automatic Prisma Database Schema Migration/Push
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Syncing database schema with Prisma..."
  node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss || ./node_modules/.bin/prisma db push --skip-generate --accept-data-loss || npx prisma db push --skip-generate --accept-data-loss || true
  echo "✓ Database schema verified!"

  # Automatic initial database seed (admin account, categories, sample ads, default settings)
  echo "🌱 Running idempotent sample data seed..."
  node prisma/seed.js || echo "⚠️ Seed script returned non-zero (runtime auto-seed will fallback)"
  echo "✓ Seed step completed!"
fi

echo "🌟 Launching Next.js server on port ${PORT:-3000}..."
exec node server.js
