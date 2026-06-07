#!/bin/bash
# BusyBeds Auto-Deploy Script
# Usage: ./deploy.sh
# This script pulls the latest code from GitHub and rebuilds the app

set -e

APP_DIR="/var/www/busybeds"
APP_NAME="busybeds"
BRANCH="main"

echo "============================================"
echo "  BusyBeds Deployment - $(date)"
echo "============================================"

cd $APP_DIR

# Pull latest code
echo "[1/5] Pulling latest code from GitHub..."
git pull origin $BRANCH

# Install dependencies
echo "[2/5] Installing dependencies..."
npm install --production=false

# Generate Prisma client
echo "[3/5] Generating Prisma client..."
npx prisma generate

# Push schema changes (if any)
echo "[4/5] Pushing database schema..."
npx prisma db push

# Build the app
echo "[5/5] Building Next.js app..."
npm run build

# Restart PM2
echo "Restarting application..."
pm2 restart $APP_NAME
pm2 save

echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "  Site: https://busybeds.com"
echo "============================================"
