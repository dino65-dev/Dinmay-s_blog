# API Contracts and Implementation Plan

## Backend APIs

### 1. Blog Post APIs

#### GET /api/posts
- Get all blog posts (sorted by date, newest first)
- Response: Array of blog post objects

#### GET /api/posts/:slug
- Get a single blog post by slug
- Response: Blog post object

#### POST /api/posts
- Create a new blog post (requires authentication)
- Request body: { title, slug, content, excerpt, featuredImage, contentType }
- Response: Created blog post object

#### PUT /api/posts/:id
- Update a blog post (requires authentication)
- Request body: { title, slug, content, excerpt, featuredImage, contentType }
- Response: Updated blog post object

#### DELETE /api/posts/:id
- Delete a blog post (requires authentication)
- Response: Success message

### 2. Authentication APIs

#### POST /api/auth/login
- Admin login
- Request body: { password }
- Response: { token, message }

#### POST /api/auth/verify
- Verify JWT token
- Request headers: Authorization: Bearer <token>
- Response: { valid: true/false }

### 3. About Content API

#### GET /api/about
- Get about page content
- Response: { content }

#### PUT /api/about
- Update about page content (requires authentication)
- Request body: { content }
- Response: { content }

## Database Models

### BlogPost
```
{
  _id: ObjectId,
  title: String (required),
  slug: String (required, unique),
  content: String (required),
  excerpt: String,
  featuredImage: String,
  contentType: String (enum: ['markdown', 'html']),
  publishedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### About
```
{
  _id: ObjectId,
  content: String (required),
  updatedAt: Date
}
```

### Admin (for future enhancement)
```
{
  _id: ObjectId,
  username: String,
  passwordHash: String,
  createdAt: Date
}
```

## Mock Data to Replace

In mockData.js:
- mockBlogPosts: Will be fetched from GET /api/posts
- mockAboutContent: Will be fetched from GET /api/about

## Frontend Integration

### Pages to Update:
1. HomePage.jsx: Replace mockBlogPosts with API call
2. BlogPostPage.jsx: Replace mockBlogPosts.find() with API call
3. AllPostsPage.jsx: Replace mockBlogPosts with API call
4. AboutPage.jsx: Replace mockAboutContent with API call
5. AdminPage.jsx: Add API calls for creating posts and authentication

## Authentication Flow
1. Admin enters password on /admin
2. POST to /api/auth/login
3. Store JWT token in localStorage
4. Include token in Authorization header for protected routes
5. Token expires after 24 hours
