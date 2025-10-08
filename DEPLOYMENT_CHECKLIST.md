# ✅ Render Deployment Checklist

Use this checklist to ensure smooth deployment.

---

## Pre-Deployment

- [ ] Code is in a GitHub repository
- [ ] Azure Cosmos DB is configured and accessible
- [ ] All environment variables documented
- [ ] Backend tests passing (36/36 ✅)
- [ ] Frontend working locally
- [ ] Render account created

---

## Backend Deployment

- [ ] Create Render Web Service (or use Blueprint)
- [ ] Set build command: `pip install -r requirements.txt`
- [ ] Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables:
  - [ ] `MONGO_URL`
  - [ ] `DB_NAME`
  - [ ] `SECRET_KEY`
  - [ ] `ADMIN_PASSWORD`
  - [ ] `CORS_ORIGINS` (set to `*` initially)
- [ ] Deploy and wait for completion
- [ ] Test backend API: `/api/` endpoint
- [ ] Note backend URL for frontend config

---

## Frontend Deployment

- [ ] Create Render Static Site (or use Blueprint)
- [ ] Set build command: `yarn install && yarn build`
- [ ] Set publish directory: `build`
- [ ] Add environment variable:
  - [ ] `REACT_APP_BACKEND_URL` (use backend URL from above)
- [ ] Deploy and wait for completion
- [ ] Test frontend loads correctly
- [ ] Note frontend URL for CORS update

---

## Post-Deployment Configuration

- [ ] Update backend `CORS_ORIGINS` with frontend URL
- [ ] Wait for backend to restart (1-2 min)
- [ ] Clear browser cache
- [ ] Test full application flow

---

## Testing

### Backend API Tests
- [ ] GET `/api/` - Returns API message
- [ ] POST `/api/auth/login` - Login works
- [ ] GET `/api/posts` - Returns posts
- [ ] POST `/api/posts` - Create post (with auth)
- [ ] GET `/api/posts/{slug}` - Get single post
- [ ] DELETE `/api/posts/{id}` - Delete post (with auth)

### Frontend Tests
- [ ] Homepage loads
- [ ] Blog posts display correctly
- [ ] Individual post page works
- [ ] Admin login works
- [ ] Can create new post
- [ ] Can delete post
- [ ] Comments work
- [ ] Dark/light mode toggle
- [ ] Mobile responsive
- [ ] All posts page works
- [ ] Search functionality works

### Integration Tests
- [ ] Frontend can reach backend
- [ ] Backend can reach Azure Cosmos DB
- [ ] Authentication flow works
- [ ] Data persists in database
- [ ] CORS configured correctly

---

## Optional Enhancements

- [ ] Add custom domain
- [ ] Configure email alerts
- [ ] Set up monitoring
- [ ] Enable auto-deploy on push
- [ ] Add Google Analytics
- [ ] Configure CDN for images
- [ ] Set up database backups
- [ ] Add rate limiting
- [ ] Configure caching

---

## Documentation

- [ ] Document backend URL
- [ ] Document frontend URL
- [ ] Document admin credentials
- [ ] Update README with deployment info
- [ ] Share URLs with team/users

---

## Maintenance

- [ ] Monitor logs regularly
- [ ] Check error rates
- [ ] Monitor database usage
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review access logs
- [ ] Backup important data

---

## Final Checklist

- [ ] ✅ Both services deployed successfully
- [ ] ✅ All tests passing
- [ ] ✅ CORS configured correctly
- [ ] ✅ Environment variables set
- [ ] ✅ URLs documented
- [ ] ✅ Application fully functional

---

## 🎉 Deployment Complete!

**Frontend URL:** `https://dinmay-blog-frontend.onrender.com`
**Backend URL:** `https://dinmay-blog-backend.onrender.com`
**Database:** Azure Cosmos DB
**Status:** Live ✅

---

**Date Deployed:** _________________
**Deployed By:** _________________
**Git Commit:** _________________