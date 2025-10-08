#!/bin/bash

# Script to commit and push the SPA routing fix to Git

echo "=================================================="
echo "🚀 Deploying SPA Routing Fix to Render"
echo "=================================================="
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Show what files changed
echo "📝 Files that will be committed:"
echo ""
git status --short
echo ""

# Confirm with user
read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Add all changes
echo "✓ Adding files..."
git add .

# Commit
echo "✓ Committing changes..."
git commit -m "Fix: Add SPA routing support for Render deployment

- Added 404.html fallback page for SPA routing
- Enhanced index.html with redirect handler
- Added netlify.toml for additional host compatibility  
- Verified _redirects file is correct
- Updated page title to 'Dinmay's Blog'

This fixes 404 errors when accessing routes like /admin, /about, 
/all-posts directly or when refreshing the page on Render."

# Push to main branch
echo "✓ Pushing to main branch..."
git push origin main

echo ""
echo "=================================================="
echo "✅ Success! Changes pushed to GitHub"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Render will auto-deploy (if enabled) in 3-5 minutes"
echo "2. OR manually deploy from Render dashboard"
echo "3. Test: https://dinmaysblog.onrender.com/admin"
echo ""
echo "See QUICK_FIX_GUIDE.md for more details"
echo ""
