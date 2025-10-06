#!/bin/bash
# Start Backend Server

echo "🚀 Starting Dinmay's Blog Backend..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Warning: MongoDB doesn't appear to be running"
    echo "   Please start MongoDB first:"
    echo "   - macOS: brew services start mongodb-community"
    echo "   - Linux: sudo systemctl start mongod"
    echo "   - Windows: net start MongoDB"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating default..."
    cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=dinmay_blog
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=dinmay-blog-secret-key-change-in-production
ADMIN_PASSWORD=admin123
EOF
    echo "✅ Created default .env file"
fi

echo ""
echo "✨ Backend server starting on http://localhost:8001"
echo "📚 API Docs available at http://localhost:8001/docs"
echo "🔑 Admin password: admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload