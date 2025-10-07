# 🗄️ Appwrite Database Setup Guide

Complete step-by-step guide to set up your Appwrite database for Dinmay's Blog.

---

## 📋 Prerequisites

- Appwrite Cloud account: https://cloud.appwrite.io
- Project ID: `673bbac8002ad572aff9`
- API Key: Already configured in `.env.local`

---

## Step 1: Create Database

1. Log in to **Appwrite Console**: https://cloud.appwrite.io
2. Select your project (ID: `673bbac8002ad572aff9`)
3. Navigate to **Databases** from the sidebar
4. Click **"Create Database"**
5. Enter the following:
   - **Name**: `Dinmay Blog`
   - **Database ID**: `dinmay_blog`
6. Click **"Create"**

---

## Step 2: Create Collections

### Collection 1: Blog Posts

1. Inside your `dinmay_blog` database, click **"Create Collection"**
2. Enter:
   - **Name**: `Blog Posts`
   - **Collection ID**: `blog_posts`
3. Click **"Create"**

#### Add Attributes (Click "Add Attribute" for each):

| Attribute | Type | Size | Required | Default | Unique |
|-----------|------|------|----------|---------|--------|
| `title` | String | 256 | ✅ Yes | - | ❌ No |
| `slug` | String | 256 | ✅ Yes | - | ✅ Yes |
| `content` | String | 1000000 | ✅ Yes | - | ❌ No |
| `excerpt` | String | 500 | ✅ Yes | - | ❌ No |
| `contentType` | Enum | - | ✅ Yes | `markdown` | ❌ No |
| `featuredImage` | String | 2000 | ❌ No | - | ❌ No |
| `publishedDate` | DateTime | - | ✅ Yes | - | ❌ No |
| `tags` | String[] | 50 (element size) | ❌ No | - | ❌ No |

**For `contentType` Enum:**
- Elements: `markdown`, `html`
- Default value: `markdown`

**For `tags` String Array:**
- Min elements: 0
- Max elements: 20
- Element size: 50

#### Create Indexes:

1. Click the **"Indexes"** tab
2. Add the following indexes:

**Index 1: Slug (Unique)**
- Key: `slug_idx`
- Type: Key
- Attributes: `slug` (ASC)
- ✅ Unique

**Index 2: Published Date**
- Key: `published_idx`
- Type: Key
- Attributes: `publishedDate` (DESC)
- ❌ Not Unique

#### Set Permissions:

1. Click **"Settings"** tab
2. Scroll to **"Permissions"** section
3. Configure:
   - **Read Access**: Add Role → Select "Any"
   - **Create, Update, Delete**: Leave empty (controlled by API)

---

### Collection 2: Comments

1. In `dinmay_blog` database, click **"Create Collection"**
2. Enter:
   - **Name**: `Comments`
   - **Collection ID**: `comments`
3. Click **"Create"**

#### Add Attributes:

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| `postId` | String | 256 | ✅ Yes | - |
| `parentId` | String | 256 | ❌ No | - |
| `authorName` | String | 100 | ✅ Yes | - |
| `authorEmail` | String | 256 | ✅ Yes | - |
| `content` | String | 2000 | ✅ Yes | - |

#### Create Indexes:

**Index 1: Post ID**
- Key: `postId_idx`
- Type: Key
- Attributes: `postId` (ASC)

**Index 2: Parent ID**
- Key: `parentId_idx`
- Type: Key
- Attributes: `parentId` (ASC)

#### Set Permissions:

- **Read Access**: Add Role → "Any"
- **Create Access**: Add Role → "Any"
- **Update, Delete**: Leave empty (controlled by API)

---

### Collection 3: About (Optional)

1. In `dinmay_blog` database, click **"Create Collection"**
2. Enter:
   - **Name**: `About`
   - **Collection ID**: `about`
3. Click **"Create"**

#### Add Attributes:

| Attribute | Type | Size | Required |
|-----------|------|------|----------|
| `content` | String | 50000 | ✅ Yes |

#### Set Permissions:

- **Read Access**: Add Role → "Any"
- **Create, Update, Delete**: Leave empty (controlled by API)

---

## Step 3: Create Storage Bucket

1. Navigate to **Storage** from sidebar
2. Click **"Create Bucket"**
3. Enter:
   - **Name**: `Blog Images`
   - **Bucket ID**: `blog_images`
4. Configure settings:
   - **Maximum File Size**: `10485760` (10 MB)
   - **Allowed File Extensions**: `jpg,jpeg,png,gif,webp,svg`
   - **Compression**: Gzip (enabled)
   - **Encryption**: ✅ Enabled
   - **Antivirus**: ✅ Enabled
5. Click **"Create"**

#### Set Bucket Permissions:

- **Read Access**: Add Role → "Any"
- **Create, Update, Delete**: Leave empty (controlled by API)

---

## Step 4: Verify API Key Permissions

1. Go to **Project Settings** (gear icon)
2. Click **"API Keys"** tab
3. Find your API key (or create new one)
4. Ensure it has these scopes:
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `collections.read`
   - ✅ `collections.write`
   - ✅ `documents.read`
   - ✅ `documents.write`
   - ✅ `storage.read`
   - ✅ `storage.write`
   - ✅ `files.read`
   - ✅ `files.write`

---

## Step 5: Test the Setup

1. Make sure `.env.local` is configured correctly:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=673bbac8002ad572aff9
APPWRITE_API_KEY=your_api_key_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=dinmay_blog
NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID=blog_posts
NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID=comments
NEXT_PUBLIC_APPWRITE_ABOUT_COLLECTION_ID=about
NEXT_PUBLIC_APPWRITE_BUCKET_ID=blog_images
NEXT_PUBLIC_ADMIN_EMAIL=dinmaybrahmaofficial@gmail.com
ADMIN_PASSWORD=Tapuhero@123
```

2. Start the development server:

```bash
cd /app/blog-nextjs
npm run dev
```

3. Open http://localhost:3000
4. Go to `/admin` and login
5. Try creating a test post!

---

## ✅ Verification Checklist

Check off each item as you complete it:

- [ ] Database `dinmay_blog` created
- [ ] Collection `blog_posts` with 8 attributes
- [ ] `blog_posts` indexes created (slug_idx, published_idx)
- [ ] `blog_posts` permissions set (Read: Any)
- [ ] Collection `comments` with 5 attributes
- [ ] `comments` indexes created (postId_idx, parentId_idx)
- [ ] `comments` permissions set (Read & Create: Any)
- [ ] Collection `about` with 1 attribute (optional)
- [ ] Storage bucket `blog_images` created
- [ ] Bucket configured (10MB, file types, compression)
- [ ] Bucket permissions set (Read: Any)
- [ ] API key has correct scopes
- [ ] `.env.local` file configured
- [ ] Development server runs without errors
- [ ] Admin login works
- [ ] Can create test post

---

## 🚀 What's Next?

Once your database is set up:

1. **Create your first post** via `/admin`
2. **Test comments** on a blog post
3. **Try dark/light mode toggle**
4. **Test social sharing buttons**
5. **Check mobile responsiveness**
6. **Deploy to Appwrite Sites** (see APPWRITE_DEPLOYMENT_FINAL.md)

---

## 🐛 Troubleshooting

### Error: "Collection not found"

**Solution**: Verify collection IDs in `.env.local` match exactly with Appwrite dashboard

### Error: "Unauthorized"

**Solution**: 
- Check API key is correct
- Verify API key has not expired
- Ensure API key has required scopes

### Error: "Attribute validation failed"

**Solution**:
- Check all required fields are filled
- Verify string lengths don't exceed limits
- Ensure enum values are correct (markdown/html)

### Posts not showing on homepage

**Solution**:
- Create at least one post via admin panel
- Check browser console for errors
- Verify `published_idx` index exists
- Clear browser cache and reload

### Comments not posting

**Solution**:
- Verify `comments` collection exists
- Check email format is valid
- Ensure all required fields are filled
- Check browser console for API errors

---

## 📚 Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Databases Guide](https://appwrite.io/docs/products/databases)
- [Appwrite Storage Guide](https://appwrite.io/docs/products/storage)
- [Appwrite Discord Community](https://appwrite.io/discord)

---

**Database setup complete! 🎉 Your blog is ready to use!**

