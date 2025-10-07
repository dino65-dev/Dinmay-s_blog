#!/bin/bash

# Deployment script for Appwrite
# This script builds your React app and creates a tarball for manual deployment

echo "🚀 Deploying Dinmay's Blog to Appwrite"
echo "========================================"
echo ""

# Step 1: Navigate to frontend directory
echo "📁 Navigating to frontend directory..."
cd frontend || exit

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Step 3: Build the React app
echo "🔨 Building React app..."
yarn build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build successful!"
    echo ""
    
    # Step 4: Create tarball for manual deployment
    echo "📦 Creating deployment archive..."
    cd build
    tar -czf ../dinmay-blog-deployment.tar.gz *
    cd ..
    
    echo "✅ Deployment archive created: dinmay-blog-deployment.tar.gz"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to https://cloud.appwrite.io"
    echo "2. Navigate to Sites → Create site → Manual deployment"
    echo "3. Upload the file: frontend/dinmay-blog-deployment.tar.gz"
    echo "4. Check 'Activate deployment after build'"
    echo "5. Click 'Create deployment'"
    echo ""
    echo "🎉 Your site will be live in a few minutes!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
