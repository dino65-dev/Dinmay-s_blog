# Dinmay's Blog - Next.js + Appwrite

A modern, feature-rich blog platform built with Next.js 14, Appwrite, and Tailwind CSS.

## ✨ Features

- 🎨 Modern UI with dark/light theme
- 📝 Markdown & HTML support with KaTeX & Prism.js
- 🔐 Secure admin panel  
- 🚀 Fast performance with Next.js App Router
- 📱 Fully responsive design
- 🔍 Full-text search
- ⚡ Powered by Appwrite

## 🚀 Quick Start

```bash
cd blog-nextjs
npm install
npm run dev
```

## ⚙️ Appwrite Setup

### 1. Create Database & Collections

**Database:** `dinmay_blog`

**Collection: blog_posts**
Attributes:
- `title` (String, 256, Required)
- `slug` (String, 256, Required, Unique)
- `content` (String, 1000000, Required)
- `excerpt` (String, 500, Required)
- `contentType` (Enum: ['markdown', 'html'], Required)
- `featuredImage` (String, 2000)
- `publishedDate` (DateTime, Required)
- `tags` (String[], 50)

**Storage Bucket:** `blog_images`

### 2. Get API Key

Generate API key with database and storage permissions.

### 3. Update .env.local

```env
APPWRITE_API_KEY=your_api_key_here
```

## 📖 Usage

1. Go to `/admin`
2. Login with your configured credentials (set in .env.local)
3. Create posts!

## 🏗️ Tech Stack

Next.js 14 • Appwrite • Tailwind CSS • Framer Motion • TypeScript

---

Built with ❤️ by Dinmay
