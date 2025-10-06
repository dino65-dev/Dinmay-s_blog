# Dinmay's Blog - Setup Guide

This guide will help you set up and run the blog application on your local machine or server.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Yarn** package manager - Install with: `npm install -g yarn`

## Project Structure

```
/app/
├── backend/         # FastAPI backend (Python)
├── frontend/        # React frontend
├── tests/          # Test files
└── README.md
```

## Installation Steps

### 1. Clone or Download the Project

```bash
# If using git
git clone <your-repo-url>
cd app

# Or simply extract the downloaded zip file and navigate to the app folder
cd path/to/app
```

### 2. Setup MongoDB

**Option A: Local MongoDB Installation**

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # On macOS (using Homebrew)
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```
3. Verify MongoDB is running:
   ```bash
   mongosh
   # You should see MongoDB shell connected to localhost:27017
   ```

**Option B: MongoDB Atlas (Cloud)**

1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update the `MONGO_URL` in backend/.env file

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Verify .env file exists and configure it
# Create backend/.env if it doesn't exist
```

**Backend .env Configuration:**

Create or edit `backend/.env` file:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=dinmay_blog
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key-change-this-in-production
ADMIN_PASSWORD=admin123
```

**Important Environment Variables:**
- `MONGO_URL`: Your MongoDB connection string
- `DB_NAME`: Database name (default: dinmay_blog)
- `CORS_ORIGINS`: Frontend URL (for local dev: http://localhost:3000)
- `SECRET_KEY`: Secret key for JWT tokens (change in production!)
- `ADMIN_PASSWORD`: Admin panel password (default: admin123)

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies using Yarn
yarn install

# Create frontend/.env file if it doesn't exist
```

**Frontend .env Configuration:**

Create or edit `frontend/.env` file:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
```

**Important Environment Variables:**
- `REACT_APP_BACKEND_URL`: Backend API URL (default: http://localhost:8001)
- `WDS_SOCKET_PORT`: Webpack dev server port

## Running the Application

You'll need to run both backend and frontend servers simultaneously. Use two terminal windows/tabs:

### Terminal 1: Start Backend Server

```bash
cd backend

# Activate virtual environment (if not already activated)
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Start the FastAPI server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will be running at: **http://localhost:8001**

You can test the API at: **http://localhost:8001/docs** (FastAPI Swagger UI)

### Terminal 2: Start Frontend Server

```bash
cd frontend

# Start the React development server
yarn start
```

The frontend will be running at: **http://localhost:3000**

Your browser should automatically open to http://localhost:3000

## Accessing the Application

Once both servers are running:

- **Homepage**: http://localhost:3000
- **All Posts**: http://localhost:3000/all-posts
- **About Page**: http://localhost:3000/about
- **Admin Panel**: http://localhost:3000/admin
- **Backend API**: http://localhost:8001/api
- **API Documentation**: http://localhost:8001/docs

## Admin Access

To access the admin panel and create blog posts:

1. Go to http://localhost:3000/admin
2. Enter password: `admin123` (or the password you set in backend/.env)
3. You can now create, edit, and delete blog posts

**Three ways to create posts:**
- **HTML Editor**: Write HTML or Markdown directly
- **Markdown Editor**: Write with live preview
- **Quick Upload**: Paste pre-written content

## Troubleshooting

### MongoDB Connection Issues

**Error**: `pymongo.errors.ServerSelectionTimeoutError`

**Solutions**:
- Verify MongoDB is running: `mongosh` or check service status
- Check MONGO_URL in backend/.env is correct
- For MongoDB Atlas, ensure your IP is whitelisted in Atlas dashboard

### Backend Won't Start

**Error**: `ModuleNotFoundError` or `ImportError`

**Solutions**:
```bash
cd backend
pip install -r requirements.txt --upgrade
```

### Frontend Won't Start

**Error**: `Module not found` or `Cannot find module`

**Solutions**:
```bash
cd frontend
rm -rf node_modules yarn.lock
yarn install
```

### CORS Errors

**Error**: `Access-Control-Allow-Origin` error in browser console

**Solutions**:
- Ensure CORS_ORIGINS in backend/.env includes your frontend URL
- Restart backend server after changing .env
- Clear browser cache

### Port Already in Use

**Error**: `Address already in use` or `Port 8001/3000 is already in use`

**Solutions**:
```bash
# Find and kill the process using the port
# On macOS/Linux:
lsof -ti:8001 | xargs kill -9  # For backend
lsof -ti:3000 | xargs kill -9  # For frontend

# On Windows:
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

Or change the port in the startup commands.

## Production Deployment

For production deployment, consider:

1. **Change Security Settings**:
   - Update `SECRET_KEY` in backend/.env to a strong random key
   - Change `ADMIN_PASSWORD` to a secure password
   - Update `CORS_ORIGINS` to your production frontend URL

2. **Use Production MongoDB**:
   - Use MongoDB Atlas or your own MongoDB server
   - Update `MONGO_URL` accordingly

3. **Build Frontend**:
   ```bash
   cd frontend
   yarn build
   ```
   This creates an optimized production build in `frontend/build/`

4. **Run Backend with Production Server**:
   ```bash
   cd backend
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```

5. **Serve Frontend**:
   - Use a web server like Nginx or Apache to serve the `frontend/build/` folder
   - Or deploy to platforms like Vercel, Netlify, or AWS S3

## Testing the APIs

You can test the backend APIs using the built-in Swagger documentation:

1. Start the backend server
2. Go to http://localhost:8001/docs
3. Try out the endpoints:
   - POST /api/auth/login - Login with admin password
   - GET /api/posts - Get all blog posts
   - POST /api/posts - Create a new post (requires auth)
   - DELETE /api/posts/{id} - Delete a post (requires auth)

## Default Credentials

- **Admin Password**: `admin123`

**⚠️ IMPORTANT**: Change this password in production by updating the `ADMIN_PASSWORD` in `backend/.env`

## Tech Stack

- **Frontend**: React, TailwindCSS, React Router, Axios
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Markdown Rendering**: react-markdown, KaTeX (for math), Prism.js (for code)

## Additional Features

- Markdown and HTML support for blog posts
- Math equations rendering with KaTeX
- Code syntax highlighting with Prism.js
- Responsive design
- Admin authentication with JWT
- Blog post CRUD operations
- Featured images for posts

## Need Help?

If you encounter any issues not covered in this guide, please:
1. Check the logs in both terminal windows for error messages
2. Verify all prerequisites are installed correctly
3. Ensure MongoDB is running
4. Check that all environment variables are set correctly

## Development Tips

- Backend has hot-reload enabled - changes to Python files will auto-restart the server
- Frontend has hot-reload enabled - changes to React files will auto-refresh the browser
- Use the `/docs` endpoint to test backend APIs during development
- Check browser console for frontend errors
- Check terminal output for backend errors

---

Happy blogging! 🎉
