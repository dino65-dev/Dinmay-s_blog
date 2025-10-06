@echo off
REM Start Backend Server for Windows

echo 🚀 Starting Dinmay's Blog Backend...
echo.

cd /d "%~dp0backend"

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt --quiet

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found. Creating default...
    (
        echo MONGO_URL=mongodb://localhost:27017
        echo DB_NAME=dinmay_blog
        echo CORS_ORIGINS=http://localhost:3000
        echo SECRET_KEY=dinmay-blog-secret-key-change-in-production
        echo ADMIN_PASSWORD=admin123
    ) > .env
    echo ✅ Created default .env file
)

echo.
echo ✨ Backend server starting on http://localhost:8001
echo 📚 API Docs available at http://localhost:8001/docs
echo 🔑 Admin password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ================================
echo.

REM Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

pause