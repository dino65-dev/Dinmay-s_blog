@echo off
REM Start Frontend Server for Windows

echo 🚀 Starting Dinmay's Blog Frontend...
echo.

cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call yarn install
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found. Creating default...
    (
        echo REACT_APP_BACKEND_URL=http://localhost:8001
        echo WDS_SOCKET_PORT=3000
    ) > .env
    echo ✅ Created default .env file
)

echo.
echo ✨ Frontend server starting on http://localhost:3000
echo 🔗 Make sure backend is running on http://localhost:8001
echo.
echo Press Ctrl+C to stop the server
echo ================================
echo.

REM Start the server
call yarn start

pause