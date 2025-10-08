#!/bin/bash

echo "=========================================="
echo "🔧 Deploying Backend Health Check Fix"
echo "=========================================="
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

echo "📝 What's being fixed:"
echo ""
echo "Issue: UptimeRobot getting 405 Method Not Allowed"
echo "Cause: /api/ endpoint didn't support HEAD requests"
echo ""
echo "Fix:"
echo "  ✅ Added HEAD method support to /api/"
echo "  ✅ Added /api/health endpoint (GET + HEAD)"
echo "  ✅ Both endpoints return 200 OK now"
echo ""

# Show changes
echo "📋 Files changed:"
git status --short
echo ""

read -p "Deploy this fix? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Add and commit
echo "✓ Committing changes..."
git add backend/server.py
git commit -m "Fix: Add HEAD method support for health check endpoints

- Added HEAD method support to /api/ endpoint
- Created dedicated /api/health endpoint with GET + HEAD
- Fixes 405 Method Not Allowed error from UptimeRobot
- Both endpoints now return 200 OK for monitoring services

This resolves UptimeRobot monitoring 'Down' status."

# Push
echo "✓ Pushing to GitHub..."
git push origin main

echo ""
echo "=========================================="
echo "✅ Success! Backend Fix Deployed"
echo "=========================================="
echo ""
echo "📡 Next Steps:"
echo ""
echo "1️⃣  Wait for Render to deploy (2-4 minutes)"
echo "   👉 https://dashboard.render.com/"
echo "   Check: Backend service shows 'Live'"
echo ""
echo "2️⃣  Update UptimeRobot monitor URL:"
echo ""
echo "   Option A (Recommended): Use /health endpoint"
echo "   New URL: https://dinmay-blog-backend.onrender.com/api/health"
echo ""
echo "   Option B: Keep /api/ endpoint (now works!)"
echo "   URL: https://dinmay-blog-backend.onrender.com/api/"
echo ""
echo "3️⃣  Verify in UptimeRobot:"
echo "   - Go to monitor settings"
echo "   - Update URL if using Option A"
echo "   - Monitor should show 'Up' status"
echo ""
echo "=========================================="
echo ""
