# Dinmay's Blog

A modern, full-stack blog application with admin panel, markdown support, and beautiful design.

## Features

✅ **Blog Management**
- Create, read, update, and delete blog posts
- Support for both Markdown and HTML content
- Featured images for posts
- Auto-generated slugs from titles

✅ **Rich Content Support**
- Markdown rendering with live preview
- Math equations with KaTeX
- Code syntax highlighting with Prism.js
- Responsive image support

✅ **Admin Panel**
- Password-protected admin access
- Three editor options:
  - HTML Editor (for direct HTML/Markdown)
  - Markdown Editor (with live preview)
  - Quick Upload (paste pre-written content)

✅ **Authentication & Security**
- JWT-based authentication
- Protected API endpoints
- Secure admin login

✅ **Modern UI**
- Clean, minimalist design
- Mobile-responsive
- Fast page loads
- Beautiful typography

## Quick Start

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for detailed installation and setup instructions.

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (v4.4+)
- Yarn

### Quick Setup

```bash
# 1. Start MongoDB
mongod

# 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Frontend Setup (in a new terminal)
cd frontend
yarn install
yarn start
```

Visit: http://localhost:3000

## Default Credentials

- **Admin Password**: `tapuhero@123`

## Project Structure

```
/app/
├── backend/              # FastAPI backend
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   ├── server.py        # Main server file
│   └── requirements.txt # Python dependencies
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   ├── services/   # API services
│   │   └── hooks/      # Custom hooks
│   └── package.json    # Node dependencies
└── SETUP_GUIDE.md      # Detailed setup guide
```

## API Endpoints

### Public Endpoints
- `GET /api/posts` - Get all blog posts
- `GET /api/posts/{slug}` - Get single post by slug
- `GET /api/about` - Get about page content
- `POST /api/auth/login` - Admin login

### Protected Endpoints (Requires Authentication)
- `POST /api/posts` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `PUT /api/about` - Update about content

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- TailwindCSS
- Axios
- react-markdown
- KaTeX (math rendering)
- Prism.js (code highlighting)

**Backend:**
- FastAPI
- Motor (async MongoDB)
- PyJWT (authentication)
- python-jose
- bcrypt

**Database:**
- MongoDB

## Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=dinmay_blog
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key
ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Development

Both frontend and backend have hot-reload enabled for development.

**Backend API Documentation:** http://localhost:8001/docs (Swagger UI)

## Testing

Backend tests are available in `/app/backend_test.py`

```bash
cd backend
python backend_test.py
```

## Deployment

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for production deployment instructions.

## License

MIT

## Support

For issues or questions, please refer to the [SETUP_GUIDE.md](./SETUP_GUIDE.md) troubleshooting section
