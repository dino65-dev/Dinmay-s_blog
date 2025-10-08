# 🚀 Deploy Dinmay's Blog to Appwrite

This guide will help you deploy your blog application to Appwrite. Since your app has a React frontend, FastAPI backend, and MongoDB database, we'll use a **hybrid deployment approach**.

---

## 📋 Deployment Architecture

| Component | Deployment Location |
|-----------|-------------------|
| **Frontend (React)** | Appwrite Sites (Static Hosting) |
| **Backend (FastAPI)** | Emergent/Render/Railway/Your VPS |
| **Database (MongoDB)** | MongoDB Atlas/Your MongoDB server |

---

## 🎯 Option 1: Deploy Frontend to Appwrite (Recommended)

### **Prerequisites**
1. Appwrite Cloud account (https://cloud.appwrite.io)
2. GitHub account
3. Your backend deployed and accessible via public URL

---

### **Step 1: Prepare Your Backend**

First, ensure your backend is accessible from the internet:

**Option A: Deploy backend on Emergent**
```bash
# Your backend is already running on Emergent
# Current URL: https://cosmos-blog-connect.preview.emergentagent.com
# This URL should be your production backend URL
```

**Option B: Deploy backend elsewhere** (Render, Railway, etc.)
- Deploy your FastAPI backend to any cloud service
- Note down the public URL (e.g., `https://your-backend.onrender.com`)

---

### **Step 2: Update Frontend Environment Variables**

Update `/app/frontend/.env` with your production backend URL:

```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
WDS_SOCKET_PORT=443
```

**Important:** Replace `https://your-backend-url.com` with your actual backend URL.

---

### **Step 3: Build Your React App**

```bash
cd /app/frontend

# Install dependencies
yarn install

# Create production build
yarn build
```

This creates a `build/` folder with optimized production files.

---

### **Step 4: Push Code to GitHub**

```bash
cd /app
git init
git add .
git commit -m "Initial commit - Dinmay's Blog"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### **Step 5: Deploy to Appwrite Sites**

#### **5.1: Access Appwrite Console**
1. Go to https://cloud.appwrite.io
2. Log in to your account
3. Create a new project or select existing one

#### **5.2: Create a New Site**
1. Navigate to **Sites** in the left sidebar
2. Click **"Create site"**
3. Choose **"Connect a repository"**

#### **5.3: Connect GitHub Repository**
1. Click **"Connect with GitHub"**
2. Authorize Appwrite to access your GitHub
3. Select your repository (e.g., `dinmay-blog`)
4. Choose the branch to deploy (usually `main`)

#### **5.4: Configure Build Settings**

Fill in the following configuration:

```
Framework: React
Root Directory: frontend
Install Command: yarn install
Build Command: yarn build
Output Directory: build
Node Version: 18
```

#### **5.5: Add Environment Variables**

Add your environment variables in Appwrite console:

```
REACT_APP_BACKEND_URL = https://your-backend-url.com
```

#### **5.6: Deploy**
1. Review your settings
2. Click **"Deploy"**
3. Wait for the build to complete (usually 2-5 minutes)
4. Your site will be live at: `https://your-project-id.appwrite.io`

---

### **Step 6: Custom Domain (Optional)**

1. In Appwrite Console, go to your site settings
2. Click **"Domains"**
3. Click **"Add domain"**
4. Enter your custom domain (e.g., `blog.yourdomain.com`)
5. Follow DNS configuration instructions
6. Add CNAME record to your DNS provider

---

## 🔧 Option 2: Manual Deployment (Without Git)

If you don't want to use Git integration:

### **Step 1: Build Locally**

```bash
cd /app/frontend
yarn install
yarn build
```

### **Step 2: Create Archive**

```bash
cd build
tar -czf dinmay-blog.tar.gz *
```

### **Step 3: Upload to Appwrite**

1. Go to Appwrite Console → Sites
2. Create a new site
3. Select **"Manual deployment"**
4. Upload `dinmay-blog.tar.gz`
5. Check **"Activate deployment after build"**
6. Click **"Create deployment"**

---

## 🗄️ Option 3: Full Migration to Appwrite (Advanced)

To fully migrate to Appwrite ecosystem, you'll need to:

### **Replace Backend with Appwrite Services**

1. **Database**: Replace MongoDB with Appwrite Database
   - Create collections for: blog_posts, comments, about_content
   - Set up proper permissions

2. **Authentication**: Use Appwrite Auth
   - Replace JWT auth with Appwrite session management

3. **Storage**: Use Appwrite Storage
   - For blog post images and media files

4. **Functions**: Convert FastAPI endpoints to Appwrite Cloud Functions
   - Create serverless functions for business logic

**Note:** This requires significant code refactoring and is beyond the scope of this quick deployment guide.

---

## 📝 Post-Deployment Checklist

✅ Frontend deployed and accessible  
✅ Backend URL configured correctly  
✅ API endpoints responding  
✅ Database connected  
✅ Authentication working  
✅ Image uploads working (if applicable)  
✅ Dark/Light mode persisting  
✅ Comments posting successfully  
✅ Admin login functioning  
✅ Post creation/deletion working  

---

## 🐛 Troubleshooting

### **Issue: API calls failing with CORS errors**

**Solution:** Add CORS middleware to your FastAPI backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-appwrite-site.appwrite.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Issue: Environment variables not loading**

**Solution:** 
- Ensure `REACT_APP_` prefix is used for all env vars
- Rebuild the app after changing environment variables
- Check Appwrite console for correct variable names

### **Issue: Routes not working (404 on refresh)**

**Solution:** Add a `_redirects` file in your `public/` folder:

```
/*    /index.html   200
```

This ensures React Router handles all routes.

---

## 📚 Resources

- [Appwrite Sites Documentation](https://appwrite.io/docs/products/sites)
- [Appwrite React Quick Start](https://appwrite.io/docs/products/sites/quick-start/react)
- [Appwrite Console](https://cloud.appwrite.io)

---

## 💡 Recommendations

1. **For Quick Deployment**: Use Option 1 (Frontend on Appwrite, Backend on Emergent)
2. **For Full Control**: Keep both frontend and backend on Emergent
3. **For Cost Optimization**: Use Appwrite's free tier for frontend hosting
4. **For Scalability**: Consider Option 3 (Full Appwrite migration) for long-term

---

## 🆘 Need Help?

If you encounter issues during deployment:
1. Check Appwrite build logs in the console
2. Verify backend URL is accessible
3. Test API endpoints with curl/Postman
4. Check browser console for errors
5. Review CORS configuration

---

**Good luck with your deployment! 🚀**

