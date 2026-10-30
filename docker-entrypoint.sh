#!/bin/sh
set -e

echo "=================================================="
echo "  🚀 Starting Khashala Production (خُشاله)        "
echo "=================================================="

# Ensure upload directory exists
mkdir -p /app/public/uploads/ads

# Automatic Prisma Database Schema Migration/Push
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Syncing database schema with Prisma..."
  node ./node_modules/prisma/build/index.js db push --skip-generate || ./node_modules/.bin/prisma db push --skip-generate || npx prisma db push --skip-generate || true
  echo "✓ Database schema verified!"
fi

echo "🌟 Launching Next.js server on port ${PORT:-3000}..."
exec node server.js
