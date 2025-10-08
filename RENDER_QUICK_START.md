# ⚡ Render Quick Start Guide

Get your blog deployed in 10 minutes!

---

## 🎯 Quick Deployment Steps

### Step 1: Push to GitHub (2 min)

```bash
cd /app
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Account (1 min)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### Step 3: Deploy Using Blueprint (5 min)

#### 3a. Create Blueprint

1. Click **"New +"** → **"Blueprint"**
2. Connect your repository
3. Render detects `render.yaml` ✅
4. Click **"Apply"**

#### 3b. Set Environment Variables

Render will prompt for these variables. Copy-paste from below:

**Backend Service Environment Variables:**

```
MONGO_URL
mongodb+srv://DinmayBrahma:Tapuhero%40123@dinmaysblog.global.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000

DB_NAME
dinmay_blog

SECRET_KEY
dinmay-blog-secret-key-a0653cca3e9430b74338a567811ce7f3

ADMIN_PASSWORD
tapuhero@123

CORS_ORIGINS
*
```

**Frontend Service Environment Variable:**

```
REACT_APP_BACKEND_URL
https://dinmay-blog-backend.onrender.com
```

*Note: Update with actual backend URL after it deploys*

#### 3c. Click "Apply" to Deploy

Render will:
- ✅ Build backend (3-5 min)
- ✅ Build frontend (2-3 min)
- ✅ Deploy both services
- ✅ Provide live URLs

### Step 4: Update Frontend Backend URL (2 min)

After backend deploys, you'll get a URL like:
`https://dinmay-blog-backend.onrender.com`

1. Go to **Frontend Service** → **Environment**
2. Update `REACT_APP_BACKEND_URL` with actual backend URL
3. **Trigger Redeploy**: Settings → Manual Deploy

### Step 5: Update CORS (1 min)

After frontend deploys, you'll get a URL like:
`https://dinmay-blog-frontend.onrender.com`

1. Go to **Backend Service** → **Environment**
2. Update `CORS_ORIGINS` with frontend URL
3. Service auto-restarts

---

## ✅ Test Your Deployment

### Quick Tests

1. **Backend API Test**
   ```bash
   curl https://dinmay-blog-backend.onrender.com/api/
   ```
   Should return: `{"message": "Dinmay's Blog API"}`

2. **Frontend Test**
   - Visit: `https://dinmay-blog-frontend.onrender.com`
   - Should see your blog homepage

3. **Full Flow Test**
   - View blog posts ✅
   - Open individual post ✅
   - Login as admin (password: tapuhero@123) ✅
   - Create new post ✅
   - Add comment ✅
   - Toggle dark mode ✅

---

## 🎉 You're Live!

Your blog is now deployed on Render with Azure Cosmos DB!

**URLs:**
- Frontend: `https://dinmay-blog-frontend.onrender.com`
- Backend: `https://dinmay-blog-backend.onrender.com`
- Database: Azure Cosmos DB

---

## 🚨 Troubleshooting

### Backend not starting?
- Check logs: Backend Service → Logs
- Verify all environment variables are set
- Ensure MONGO_URL is correct

### Frontend showing errors?
- Check `REACT_APP_BACKEND_URL` points to backend
- Clear build cache: Settings → Clear Build Cache
- Rebuild: Settings → Manual Deploy

### CORS errors?
- Update `CORS_ORIGINS` with frontend URL
- Wait 1-2 minutes for backend to restart
- Clear browser cache

---

## 📚 Full Documentation

For detailed instructions, see: `/app/RENDER_DEPLOYMENT_GUIDE.md`

---

## 💡 Pro Tips

1. **First Request Slow?** - Free tier services sleep after 15 min inactivity. First request wakes them up (30-60 sec).

2. **Custom Domain?** - Add in Render: Frontend Service → Custom Domain

3. **Monitoring?** - Enable email alerts: Service → Settings → Notifications

4. **Auto-Deploy?** - Already enabled! Push to GitHub = Auto-deploy ✅

---

**Need help?** Check the full guide or Render docs at [render.com/docs](https://render.com/docs)