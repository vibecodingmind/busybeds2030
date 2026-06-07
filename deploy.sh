#!/bin/bash
# BusyBeds Zero-Downtime Deployment Script
# Strategy: Build in staging directory, then atomic swap + quick restart
# Downtime: <3 seconds (only during the directory swap + PM2 restart)

set -e

APP_DIR="/var/www/busybeds"
APP_NAME="busybeds"
BRANCH="main"

echo "============================================"
echo "  BusyBeds Zero-Downtime Deploy - $(date)"
echo "============================================"

cd $APP_DIR

# ============================================================
# PHASE 1: Prepare (old process still serving traffic)
# ============================================================

echo ""
echo "--- Phase 1: Preparation (site stays live) ---"

# Pull latest code
echo "[1/8] Pulling latest code from GitHub..."
git fetch origin $BRANCH
git reset --hard origin/$BRANCH

# Install dependencies
echo "[2/8] Installing dependencies..."
npm install --production=false --prefer-offline 2>&1 | tail -3

# Generate Prisma client
echo "[3/8] Generating Prisma client..."
npx prisma generate

# Push schema changes (if any)
echo "[4/8] Pushing database schema..."
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma db push

# ============================================================
# PHASE 2: Build to staging directory (old process still serving)
# ============================================================

echo ""
echo "--- Phase 2: Building (site stays live) ---"

echo "[5/8] Building Next.js app to staging directory..."
# Remove old staging build if any
rm -rf .next-staging

# Build using BUILD_DIR env variable to output to staging directory
# next.config.ts reads process.env.BUILD_DIR for distDir
BUILD_DIR=./.next-staging npx next build

# Copy static files and prisma into standalone staging
echo "[6/8] Preparing staging standalone..."
cp -r .next-staging/static .next-staging/standalone/.next/ 2>/dev/null || true
cp -r public .next-staging/standalone/ 2>/dev/null || true
cp -r prisma .next-staging/standalone/ 2>/dev/null || true

# Copy .env to staging standalone
cp .env .next-staging/standalone/.env 2>/dev/null || true

# Verify the staging build
if [ ! -f ".next-staging/standalone/server.js" ]; then
    echo "ERROR: Staging build failed! No server.js found."
    echo "Keeping current version running."
    rm -rf .next-staging
    exit 1
fi

echo "Staging build successful!"

# ============================================================
# PHASE 3: Atomic swap (brief downtime ~2-3 seconds)
# ============================================================

echo ""
echo "--- Phase 3: Atomic swap (brief downtime) ---"

echo "[7/8] Swapping build directories..."
# This is the critical moment - swap quickly
# Move current .next to .next-old (backup for rollback)
rm -rf .next-old 2>/dev/null || true
mv .next .next-old 2>/dev/null || true

# Move staging to live
mv .next-staging .next

# Restart PM2 immediately
echo "[8/8] Restarting application..."
pm2 restart $APP_NAME --update-env 2>/dev/null || pm2 start ecosystem.config.js --update-env
pm2 save

# ============================================================
# PHASE 4: Verify and cleanup
# ============================================================

echo ""
echo "--- Phase 4: Verification ---"

# Wait for app to be ready (up to 30 seconds)
echo "Waiting for app to start..."
READY=false
for i in $(seq 1 30); do
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3008 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
        echo "App is ready! HTTP $HTTP_CODE (took ~${i}s)"
        READY=true
        break
    fi
    sleep 1
done

if [ "$READY" = true ]; then
    echo ""
    echo "============================================"
    echo "  Deployment Complete!"
    echo "  Site: https://busybeds.com"
    echo "============================================"
    # Clean up old build after successful deployment
    rm -rf .next-old
else
    echo ""
    echo "============================================"
    echo "  WARNING: App not responding!"
    echo "  Attempting rollback..."
    echo "============================================"
    # Rollback to previous build
    pm2 stop $APP_NAME 2>/dev/null || true
    rm -rf .next
    mv .next-old .next
    pm2 restart $APP_NAME --update-env 2>/dev/null || pm2 start ecosystem.config.js --update-env
    pm2 save
    echo "Rollback attempted. Check: pm2 logs busybeds"
fi

