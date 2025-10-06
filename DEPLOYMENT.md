# Deployment Guide

This guide covers different deployment options for Dinmay's Blog.

## Option 1: Local Development (Recommended for Testing)

### Quick Start with Scripts

**macOS/Linux:**
```bash
# Terminal 1 - Start Backend
./start-backend.sh

# Terminal 2 - Start Frontend
./start-frontend.sh
```

**Windows:**
```cmd
# Terminal 1 - Start Backend
start-backend.bat

# Terminal 2 - Start Frontend
start-frontend.bat
```

Visit: http://localhost:3000

## Option 2: Docker Compose (Recommended for Easy Setup)

This method runs everything in containers - MongoDB, Backend, and Frontend.

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))

### Steps

1. **Create Dockerfiles** (already included):
   - `/app/backend/Dockerfile`
   - `/app/frontend/Dockerfile`
   - `/app/docker-compose.yml`

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

4. **Stop all services**:
   ```bash
   docker-compose down
   ```

5. **Stop and remove data**:
   ```bash
   docker-compose down -v
   ```

### Production Docker Setup

For production, update `docker-compose.yml`:

```yaml
# Change environment variables:
backend:
  environment:
    - MONGO_URL=mongodb://mongodb:27017
    - DB_NAME=dinmay_blog
    - CORS_ORIGINS=https://yourdomain.com
    - SECRET_KEY=<strong-random-key-here>
    - ADMIN_PASSWORD=<secure-password>
```

## Option 3: Traditional Server Deployment

### Backend Deployment

**1. Using Gunicorn (Production WSGI server):**

```bash
cd backend
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001
```

**2. Using systemd (Linux):**

Create `/etc/systemd/system/dinmay-blog-backend.service`:

```ini
[Unit]
Description=Dinmay's Blog Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/app/backend
Environment="PATH=/path/to/app/backend/venv/bin"
ExecStart=/path/to/app/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable dinmay-blog-backend
sudo systemctl start dinmay-blog-backend
```

### Frontend Deployment

**1. Build for production:**
```bash
cd frontend
yarn build
```

This creates optimized files in `frontend/build/`

**2. Serve with Nginx:**

Create `/etc/nginx/sites-available/dinmay-blog`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/app/frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/dinmay-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Option 4: Cloud Platform Deployment

### Heroku

**Backend:**
```bash
cd backend
echo "web: uvicorn server:app --host 0.0.0.0 --port \$PORT" > Procfile
heroku create dinmay-blog-backend
heroku config:set MONGO_URL=<your-mongo-atlas-url>
heroku config:set DB_NAME=dinmay_blog
heroku config:set SECRET_KEY=<random-key>
heroku config:set ADMIN_PASSWORD=<password>
git push heroku main
```

**Frontend:**
```bash
cd frontend
# Update REACT_APP_BACKEND_URL to Heroku backend URL
heroku create dinmay-blog-frontend
heroku buildpacks:set heroku/nodejs
git push heroku main
```

### Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
1. Connect GitHub repo to Vercel
2. Set build command: `yarn build`
3. Set output directory: `build`
4. Add environment variable: `REACT_APP_BACKEND_URL=<backend-url>`

**Backend on Railway:**
1. Connect GitHub repo to Railway
2. Add MongoDB service
3. Add environment variables
4. Deploy

### AWS Deployment

**Backend on EC2:**
1. Launch EC2 instance (Ubuntu)
2. Install Python, pip, MongoDB
3. Clone repository
4. Follow traditional server deployment steps
5. Configure security groups (ports 8001, 27017)

**Frontend on S3 + CloudFront:**
1. Build frontend: `yarn build`
2. Create S3 bucket
3. Upload build files
4. Enable static website hosting
5. Create CloudFront distribution
6. Update DNS

## Option 5: DigitalOcean App Platform

1. Create new app
2. Connect GitHub repository
3. Configure backend service:
   - Run command: `uvicorn server:app --host 0.0.0.0 --port 8001`
   - Environment variables
4. Configure frontend service:
   - Build command: `yarn build`
   - Output directory: `build`
5. Add MongoDB database
6. Deploy

## MongoDB Options

### Local MongoDB
```bash
# Install and start MongoDB locally
mongod --dbpath /path/to/data
```

### MongoDB Atlas (Cloud - Recommended)
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (free tier available)
3. Whitelist IP addresses
4. Get connection string
5. Update MONGO_URL in backend/.env

### Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Environment Variables Checklist

Before deploying, ensure you have set:

**Backend:**
- ✅ MONGO_URL (MongoDB connection string)
- ✅ DB_NAME (database name)
- ✅ CORS_ORIGINS (frontend URL)
- ✅ SECRET_KEY (strong random key for JWT)
- ✅ ADMIN_PASSWORD (secure admin password)

**Frontend:**
- ✅ REACT_APP_BACKEND_URL (backend API URL)

## SSL/HTTPS Setup

For production, always use HTTPS:

**Using Let's Encrypt (free):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

## Monitoring & Logs

**Backend logs:**
```bash
# Using systemd
sudo journalctl -u dinmay-blog-backend -f

# Using PM2
pm2 logs backend
```

**Frontend logs:**
Check browser console and server logs

**MongoDB logs:**
```bash
# Local
tail -f /var/log/mongodb/mongod.log

# Docker
docker logs mongodb
```

## Backup Strategy

**MongoDB Backup:**
```bash
# Backup
mongodump --uri="<mongo-url>" --out=/path/to/backup

# Restore
mongorestore --uri="<mongo-url>" /path/to/backup
```

**Automated backups:**
- Use MongoDB Atlas automated backups
- Or setup cron job for regular mongodump

## Performance Optimization

1. **Frontend:**
   - Enable gzip compression in Nginx
   - Use CDN for static assets
   - Optimize images before uploading

2. **Backend:**
   - Use connection pooling for MongoDB
   - Enable caching for frequently accessed data
   - Use Redis for session storage (optional)

3. **Database:**
   - Create indexes on frequently queried fields
   - Monitor slow queries
   - Use MongoDB Atlas performance advisor

## Security Checklist

- ✅ Change default admin password
- ✅ Use strong SECRET_KEY
- ✅ Enable HTTPS
- ✅ Set proper CORS origins
- ✅ Keep dependencies updated
- ✅ Use environment variables (never hardcode secrets)
- ✅ Enable MongoDB authentication
- ✅ Use firewall rules
- ✅ Regular backups
- ✅ Monitor logs for suspicious activity

## Troubleshooting Production Issues

**503 Service Unavailable:**
- Check if backend service is running
- Check MongoDB connection
- Verify environment variables

**CORS Errors:**
- Update CORS_ORIGINS in backend
- Restart backend service

**Database Connection Failed:**
- Verify MongoDB is running
- Check MONGO_URL
- Verify network access (Atlas IP whitelist)

**Frontend Not Loading:**
- Check browser console for errors
- Verify REACT_APP_BACKEND_URL
- Check Nginx/web server configuration

---

For more help, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)