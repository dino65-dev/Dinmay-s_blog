# 🚀 Render Deployment Guide - Dinmay's Blog

Complete guide to deploy both FastAPI backend and React frontend on Render.

---

## 📋 Prerequisites

1. **Render Account** - Sign up at [render.com](https://render.com) (free)
2. **GitHub Account** - Your code should be in a GitHub repository
3. **Azure Cosmos DB** - Already configured ✅
4. **Environment Variables** - Documented below

---

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Render Platform                                │
│                                                 │
│  ┌──────────────────┐    ┌──────────────────┐  │
│  │                  │    │                  │  │
│  │  FastAPI Backend │◄───┤  React Frontend  │  │
│  │  (Web Service)   │    │  (Static Site)   │  │
│  │  Port: 8001      │    │                  │  │
│  │                  │    │                  │  │
│  └────────┬─────────┘    └──────────────────┘  │
│           │                                     │
└───────────┼─────────────────────────────────────┘
            │
            ▼
   ┌─────────────────┐
   │  Azure Cosmos   │
   │  DB (MongoDB)   │
   └─────────────────┘
```

---

## 🚀 Deployment Steps

### **Method 1: Using render.yaml (Infrastructure as Code) - RECOMMENDED**

This deploys both services automatically!

#### Step 1: Push to GitHub

```bash
cd /app
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

#### Step 2: Connect to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

#### Step 3: Configure Environment Variables

Render will prompt you to set these environment variables:

**Backend Service:**
- `MONGO_URL`: `mongodb+srv://DinmayBrahma:Tapuhero%40123@dinmaysblog.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`
- `DB_NAME`: `dinmay_blog`
- `SECRET_KEY`: `dinmay-blog-secret-key-a0653cca3e9430b74338a567811ce7f3`
- `ADMIN_PASSWORD`: `tapuhero@123`
- `CORS_ORIGINS`: `*` (or your specific frontend URL after deployment)

**Frontend Service:**
- `REACT_APP_BACKEND_URL`: (Will be provided after backend deploys, format: `https://dinmay-blog-backend.onrender.com`)

#### Step 4: Deploy!

Render will automatically:
- ✅ Build backend service
- ✅ Build frontend static site
- ✅ Deploy both services
- ✅ Provide URLs for both

---

### **Method 2: Manual Deployment (Alternative)**

#### Deploy Backend First

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repo
   - Configure:

   ```
   Name: dinmay-blog-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

2. **Add Environment Variables** (same as above)

3. **Deploy** - Click "Create Web Service"

4. **Note Your Backend URL** - Example: `https://dinmay-blog-backend.onrender.com`

#### Deploy Frontend

1. **Create Static Site**
   - Click **"New +"** → **"Static Site"**
   - Connect your GitHub repo
   - Configure:

   ```
   Name: dinmay-blog-frontend
   Region: Oregon (US West)
   Branch: main
   Root Directory: frontend
   Build Command: yarn install && yarn build
   Publish Directory: build
   Plan: Free
   ```

2. **Add Environment Variable:**
   - `REACT_APP_BACKEND_URL`: `https://dinmay-blog-backend.onrender.com`

3. **Deploy** - Click "Create Static Site"

#### Update CORS

After frontend deploys, update backend CORS:
1. Go to backend service settings
2. Update `CORS_ORIGINS` environment variable
3. Set to your frontend URL: `https://dinmay-blog-frontend.onrender.com`
4. Restart backend service

---

## 🔧 Environment Variables Reference

### Backend (.env)

```bash
# Database
MONGO_URL="mongodb+srv://DinmayBrahma:Tapuhero%40123@dinmaysblog.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"
DB_NAME="dinmay_blog"

# Security
SECRET_KEY="dinmay-blog-secret-key-a0653cca3e9430b74338a567811ce7f3"
ADMIN_PASSWORD="tapuhero@123"

# CORS - Update after frontend deployment
CORS_ORIGINS="https://dinmay-blog-frontend.onrender.com,https://your-custom-domain.com"
```

### Frontend (.env)

```bash
# Backend API URL - Update with your Render backend URL
REACT_APP_BACKEND_URL="https://dinmay-blog-backend.onrender.com"
```

---

## ✅ Post-Deployment Checklist

After both services deploy:

### 1. Test Backend API
```bash
curl https://dinmay-blog-backend.onrender.com/api/
# Should return: {"message": "Dinmay's Blog API"}
```

### 2. Test Frontend
- Visit: `https://dinmay-blog-frontend.onrender.com`
- Should see your blog homepage

### 3. Test Full Flow
- [ ] Homepage loads blog posts
- [ ] Can view individual blog post
- [ ] Admin login works (password: tapuhero@123)
- [ ] Can create new blog post
- [ ] Can delete blog post
- [ ] Comments work
- [ ] Dark/light mode toggle
- [ ] All posts page works

### 4. Update CORS (Important!)

Update backend `CORS_ORIGINS` to include your frontend URL:
```
CORS_ORIGINS="https://dinmay-blog-frontend.onrender.com"
```

### 5. Monitor Logs

- Backend: Check logs in Render dashboard → Backend Service → Logs
- Frontend: Check build logs for any errors

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Go to frontend service settings
2. Click **"Custom Domain"**
3. Add your domain: `blog.yourdomain.com`
4. Update DNS records as shown by Render
5. Wait for SSL certificate (automatic)

### Update Backend CORS

After adding custom domain:
```
CORS_ORIGINS="https://blog.yourdomain.com,https://dinmay-blog-frontend.onrender.com"
```

---

## 🔍 Troubleshooting

### Backend Won't Start

**Error: "Application failed to start"**
- Check logs for Python errors
- Verify all environment variables are set
- Ensure MONGO_URL is correct
- Check Azure Cosmos DB firewall allows Render IPs

**Error: "Module not found"**
- Verify requirements.txt includes all dependencies
- Check build logs for pip install errors

### Frontend Build Fails

**Error: "yarn build failed"**
- Check Node.js version (should be 18+)
- Verify package.json is correct
- Check build logs for specific errors

**Error: "Cannot find module"**
- Ensure all dependencies in package.json
- Try clearing cache: Settings → Clear Build Cache

### CORS Errors

**Error: "CORS policy blocked"**
- Update backend `CORS_ORIGINS` with frontend URL
- Restart backend service after updating
- Clear browser cache

### Database Connection Issues

**Error: "Connection timeout"**
- Verify Azure Cosmos DB firewall settings
- Add Render IP ranges to Azure allowed IPs
- Check MONGO_URL format is correct

---

## 📊 Render Free Tier Limits

### Web Service (Backend)
- ✅ 750 hours/month free
- ✅ Spins down after 15 min inactivity
- ✅ 512 MB RAM
- ✅ Shared CPU

### Static Site (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited builds
- ✅ Global CDN
- ✅ Free SSL

**Note:** Backend may take 30-60 seconds to wake up from sleep on first request.

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit .env files to Git
- ✅ Use Render's environment variable management
- ✅ Rotate SECRET_KEY periodically
- ✅ Use strong ADMIN_PASSWORD

### 2. CORS Configuration
- ✅ Set specific origins (avoid `*` in production)
- ✅ Update after frontend deployment
- ✅ Include custom domain if using one

### 3. Database Security
- ✅ Azure Cosmos DB uses SSL/TLS encryption
- ✅ Configure firewall rules
- ✅ Monitor access logs
- ✅ Use strong database passwords

### 4. API Security
- ✅ JWT tokens for authentication
- ✅ HTTPS enabled by default
- ✅ Rate limiting (consider adding)
- ✅ Input validation on all endpoints

---

## 🚀 Continuous Deployment

Render automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update blog feature"
git push origin main

# Render automatically:
# 1. Detects changes
# 2. Builds both services
# 3. Runs tests (if configured)
# 4. Deploys new version
```

---

## 📈 Monitoring & Logs

### View Logs
1. Go to Render Dashboard
2. Select service (backend or frontend)
3. Click **"Logs"** tab
4. View real-time logs

### Set Up Alerts
1. Service Settings → Notifications
2. Add email for deploy failures
3. Configure health check alerts

---

## 🆘 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Status Page**: https://status.render.com

---

## ✨ Next Steps After Deployment

1. ✅ Test all functionality
2. ✅ Add custom domain (optional)
3. ✅ Set up monitoring
4. ✅ Configure backups for database
5. ✅ Add Google Analytics (optional)
6. ✅ Set up CDN for images (optional)
7. ✅ Configure email notifications (optional)

---

**🎉 Your blog is now live on Render with Azure Cosmos DB backend!**

Frontend: `https://dinmay-blog-frontend.onrender.com`
Backend: `https://dinmay-blog-backend.onrender.com`