#!/bin/bash

# Comprehensive deployment script for all Render fixes

echo "=========================================="
echo "🚀 Deploying All Render Fixes"
echo "=========================================="
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📝 Changes to be deployed:"
echo ""
echo "1️⃣  SPA Routing Fix:"
echo "   ✅ _redirects file for all routes"
echo "   ✅ 404.html fallback page"
echo "   ✅ index.html redirect handler"
echo "   ✅ Updated page title to 'Dinmay's Blog'"
echo ""
echo "2️⃣  Cold Start Optimization:"
echo "   ✅ Enhanced API with retry logic"
echo "   ✅ Backend wake-up UI component"
echo "   ✅ Status tracking hook"
echo "   ✅ GitHub Actions keep-alive workflow"
echo ""

# Show git status
echo "📋 Files changed:"
git status --short
echo ""

# Confirm with user
read -p "Deploy these changes? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Add all changes
echo "✓ Adding files..."
git add .

# Commit with detailed message
echo "✓ Committing changes..."
git commit -m "Fix: Render deployment optimizations

1. SPA Routing Fix:
   - Added 404.html fallback for client-side routing
   - Enhanced index.html with redirect handler
   - Added netlify.toml for compatibility
   - Updated page title to 'Dinmay's Blog'
   - Fixed 404 errors on direct route access

2. Cold Start Optimization:
   - Enhanced API layer with automatic retry logic
   - Added 3 retry attempts with 60s timeout
   - Created BackendWakeUp loading component
   - Added useBackendStatus hook for wake tracking
   - Detects and handles 502/503 errors gracefully

3. Keep-Alive Solutions:
   - GitHub Actions workflow for auto-ping (every 10 min)
   - Comprehensive documentation for UptimeRobot setup
   - Multiple free options to keep backend awake 24/7

Documentation:
- RENDER_DEPLOYMENT_FIX.md (SPA routing guide)
- RENDER_KEEP_ALIVE_SOLUTIONS.md (full cold start guide)
- QUICK_COLD_START_FIX.md (quick reference)
- setup-uptime-monitor.md (UptimeRobot setup)

This resolves:
- /admin and other routes returning 404
- 30-60 second cold start delays
- Poor UX for first visitors after inactivity" || {
    echo "⚠️  Nothing to commit (changes might already be committed)"
}

# Push to main branch
echo "✓ Pushing to GitHub..."
git push origin main

echo ""
echo "=========================================="
echo "✅ Success! Changes Deployed to GitHub"
echo "=========================================="
echo ""
echo "📡 Render Status:"
echo "   - Backend: Auto-deploying (if enabled)"
echo "   - Frontend: Auto-deploying (if enabled)"
echo "   - Wait: 3-5 minutes for build completion"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1️⃣  Wait for Render deployment:"
echo "   👉 https://dashboard.render.com/"
echo "   Check: Both services show 'Live' status"
echo ""
echo "2️⃣  Set up UptimeRobot (5 minutes, FREE):"
echo "   👉 https://uptimerobot.com"
echo "   📖 Guide: setup-uptime-monitor.md"
echo "   This keeps backend awake 24/7!"
echo ""
echo "3️⃣  Test your site:"
echo "   ✅ https://dinmaysblog.onrender.com/"
echo "   ✅ https://dinmaysblog.onrender.com/admin"
echo "   ✅ https://dinmaysblog.onrender.com/about"
echo "   All routes should work instantly!"
echo ""
echo "4️⃣  (Optional) Enable GitHub Actions:"
echo "   Go to: GitHub repo → Actions tab"
echo "   Enable workflows for auto-ping"
echo ""
echo "=========================================="
echo "📚 Documentation Available:"
echo "=========================================="
echo ""
echo "Quick Guides:"
echo "  - QUICK_FIX_GUIDE.md (SPA routing)"
echo "  - QUICK_COLD_START_FIX.md (wake-up)"
echo "  - setup-uptime-monitor.md (UptimeRobot)"
echo ""
echo "Detailed Guides:"
echo "  - RENDER_DEPLOYMENT_FIX.md (routing)"
echo "  - RENDER_KEEP_ALIVE_SOLUTIONS.md (cold start)"
echo ""
echo "🎉 Happy Blogging! ✨"
echo ""
