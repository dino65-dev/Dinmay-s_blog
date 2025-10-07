# 📝 Dinmay's Blog - Next.js + Appwrite

A modern, full-featured blog platform built with Next.js 15, Appwrite, and Tailwind CSS. Complete with comments, social sharing, dark mode, and more!

---

## ✨ Features

### 🎨 Design & UX
- Modern glassmorphism UI with smooth animations
- Dark/Light theme with system preference detection
- Fully responsive design (mobile-first)
- Reading progress indicator
- Floating navbar with blur effect
- 3D hover effects on cards
- Skeleton loaders for smooth transitions

### 📝 Content Management
- Rich text editor with Markdown & HTML support
- KaTeX for mathematical equations
- Prism.js for code syntax highlighting
- Featured images with optimization
- Tag system for categorization
- Full-text search functionality
- Table of Contents with scroll spy

### 💬 Community Features
- **Comments system** with nested replies (unlimited depth)
- **Social sharing** buttons (Twitter, Facebook, LinkedIn, WhatsApp)
- **Related posts** suggestions
- Admin moderation for comments

### 🔐 Admin Panel
- Secure authentication with JWT
- Create, edit, and delete posts
- Delete comments (with cascade)
- Multiple upload options
- Live markdown preview

### ⚡ Performance
- Server-Side Rendering (SSR)
- Incremental Static Regeneration (ISR)
- Optimized images and assets
- Fast page loads with Next.js 15
- Edge-ready deployment

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Appwrite Cloud account
- Git (optional, for deployment)

### Installation

1. **Clone or navigate to the project**:
```bash
cd /app/blog-nextjs
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:

Create `.env.local` file (already created with your credentials):
```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=673bbac8002ad572aff9
APPWRITE_API_KEY=your_api_key_here

# Database Configuration
NEXT_PUBLIC_APPWRITE_DATABASE_ID=dinmay_blog
NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID=blog_posts
NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID=comments
NEXT_PUBLIC_APPWRITE_ABOUT_COLLECTION_ID=about
NEXT_PUBLIC_APPWRITE_BUCKET_ID=blog_images

# Admin Credentials
NEXT_PUBLIC_ADMIN_EMAIL=dinmaybrahmaofficial@gmail.com
ADMIN_PASSWORD=Tapuhero@123

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Appwrite database**:

Follow the detailed guide: **`APPWRITE_DATABASE_SETUP.md`**

This includes:
- Creating database and collections
- Setting up indexes
- Configuring permissions
- Creating storage bucket

5. **Start development server**:
```bash
npm run dev
```

6. **Open your browser**:
```
http://localhost:3000
```

---

## 📁 Project Structure

```
blog-nextjs/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Page routes
│   │   ├── page.tsx             # Homepage
│   │   ├── post/[slug]/         # Individual post page
│   │   ├── posts/               # All posts page
│   │   ├── admin/               # Admin dashboard
│   │   ├── search/              # Search page
│   │   └── about/               # About page
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── posts/               # Blog posts CRUD
│   │   └── comments/            # Comments endpoints
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── blog/                    # Blog-specific components
│   │   ├── blog-card.tsx        # Post card component
│   │   ├── comments.tsx         # Comments system
│   │   ├── social-share.tsx     # Social sharing buttons
│   │   ├── related-posts.tsx    # Related posts widget
│   │   ├── table-of-contents.tsx # TOC with scroll spy
│   │   └── markdown-renderer.tsx # Markdown/HTML renderer
│   ├── layout/                  # Layout components
│   │   └── header.tsx           # Navigation bar
│   ├── providers/               # Context providers
│   │   └── theme-provider.tsx   # Dark/light theme
│   └── ui/                      # UI components
├── lib/                         # Utilities and configurations
│   ├── appwrite/                # Appwrite integrations
│   │   ├── client.ts            # Client-side Appwrite
│   │   ├── config.ts            # Appwrite configuration
│   │   ├── auth.ts              # Authentication logic
│   │   ├── posts.ts             # Blog posts operations
│   │   ├── comments.ts          # Comments operations
│   │   └── storage.ts           # File storage
│   └── utils.ts                 # Helper functions
├── types/                       # TypeScript definitions
│   └── index.ts                 # Type definitions
├── public/                      # Static assets
├── .env.local                   # Environment variables (not in git)
├── package.json                 # Dependencies
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── README.md                    # This file
├── APPWRITE_DATABASE_SETUP.md   # Database setup guide
├── APPWRITE_DEPLOYMENT_FINAL.md # Deployment guide
└── MIGRATION_COMPLETE.md        # Migration notes
```

---

## 🎯 Usage Guide

### Admin Panel

1. **Login**:
   - Navigate to `/admin`
   - Enter your email: `dinmaybrahmaofficial@gmail.com`
   - Enter your password: `Tapuhero@123`

2. **Create a Post**:
   - Click "Create Post"
   - Fill in title, content, excerpt
   - Choose content type (Markdown or HTML)
   - Add featured image URL
   - Add tags (optional)
   - Click "Create Post"

3. **Edit a Post**:
   - View any post
   - Click "Edit Post" button (admin only)
   - Update fields
   - Save changes

4. **Delete a Post**:
   - View any post
   - Click "Delete" button (admin only)
   - Confirm deletion

5. **Manage Comments**:
   - View any post with comments
   - Click trash icon next to comment (admin only)
   - Confirm deletion (will delete all nested replies)

### Creating Content

#### Markdown Posts
```markdown
# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

[Link text](https://example.com)

![Image alt](https://example.com/image.jpg)

```code block```

Math: $E = mc^2$
```

#### HTML Posts
```html
<h1>Heading</h1>
<p>Paragraph text</p>
<img src="https://example.com/image.jpg" alt="Image">
<a href="https://example.com">Link</a>
```

---

## 🚀 Deployment

### Deploy to Appwrite Sites (Recommended)

Complete step-by-step guide: **`APPWRITE_DEPLOYMENT_FINAL.md`**

Quick steps:
1. Push code to GitHub
2. Connect repository to Appwrite Sites
3. Configure environment variables
4. Deploy!

Your site will be live at: `https://your-project.appwrite.io`

### Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# Import to Vercel
# Add environment variables
# Deploy!
```

### Deploy to Netlify

Similar to Vercel - import from Git and configure build settings.

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Backend** | Appwrite (BaaS) |
| **Database** | Appwrite Database |
| **Storage** | Appwrite Storage |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion |
| **Markdown** | react-markdown, rehype-katex, remark-gfm |
| **Code Highlighting** | Prism.js |
| **Math Rendering** | KaTeX |
| **Icons** | Lucide React |
| **Notifications** | Sonner |
| **Theme** | next-themes |

---

## 📚 Documentation

- **`README.md`** (this file) - Quick start and overview
- **`APPWRITE_DATABASE_SETUP.md`** - Detailed database setup instructions
- **`APPWRITE_DEPLOYMENT_FINAL.md`** - Complete deployment guide
- **`MIGRATION_COMPLETE.md`** - Migration notes from React to Next.js
- **`SETUP_APPWRITE.md`** - Original setup guide

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

### Environment Variables Not Loading

- Ensure `.env.local` exists in project root
- Restart development server after changes
- Check for typos in variable names
- Verify `NEXT_PUBLIC_` prefix for client-side vars

### Appwrite Connection Issues

- Verify endpoint URL is correct
- Check project ID matches your Appwrite project
- Ensure API key is valid and has correct permissions
- Check internet connection

### Comments Not Working

- Verify `comments` collection exists in Appwrite
- Check collection permissions (Read & Create: Any)
- Ensure all required fields are provided
- Check browser console for API errors

---

## 🤝 Contributing

This is a personal blog project. Feel free to fork and customize for your own use!

---

## 📄 License

MIT License - Feel free to use this project for your own blog.

---

## 👤 Author

**Dinmay Brahma**
- Email: dinmaybrahmaofficial@gmail.com
- Blog: [Your deployed URL]

---

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Appwrite](https://appwrite.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Status**: ✅ Production Ready

**Last Updated**: January 2025

**Version**: 2.0.0

---

**Happy Blogging! 🚀✨**
