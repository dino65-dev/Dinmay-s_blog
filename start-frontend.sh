#!/bin/bash
# Start Frontend Server

echo "🚀 Starting Dinmay's Blog Frontend..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating default..."
    cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
EOF
    echo "✅ Created default .env file"
fi

echo ""
echo "✨ Frontend server starting on http://localhost:3000"
echo "🔗 Make sure backend is running on http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Start the server
yarn start