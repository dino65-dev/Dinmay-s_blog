# Appwrite Setup Guide for Dinmay's Blog

This guide walks you through setting up Appwrite for your blog application.

## Step 1: Create Appwrite Project

1. Go to **Appwrite Cloud**: https://cloud.appwrite.io
2. Sign up or log in
3. Click **"Create Project"**
4. Project Name: `Dinmay Blog`
5. Note your **Project ID**: `673bbac8002ad572aff9`
6. Note your **Endpoint**: `https://fra.cloud.appwrite.io/v1`

## Step 2: Create Database

1. In your project, go to **Databases**
2. Click **"Create Database"**
3. Name: `dinmay_blog`
4. Database ID: `dinmay_blog`
5. Click **Create**

## Step 3: Create Collections

### Collection 1: blog_posts

1. Click **"Create Collection"**
2. Name: `blog_posts`
3. Collection ID: `blog_posts`
4. Click **Create**

#### Add Attributes:

Click **"Add Attribute"** for each:

1. **String Attribute**
   - Key: `title`
   - Size: 256
   - Required: ✅
   - Click Create

2. **String Attribute**
   - Key: `slug`
   - Size: 256
   - Required: ✅
   - Click Create

3. **String Attribute**
   - Key: `content`
   - Size: 1000000 (1MB)
   - Required: ✅
   - Click Create

4. **String Attribute**
   - Key: `excerpt`
   - Size: 500
   - Required: ✅
   - Click Create

5. **Enum Attribute**
   - Key: `contentType`
   - Elements: `markdown`, `html`
   - Required: ✅
   - Default: `markdown`
   - Click Create

6. **String Attribute**
   - Key: `featuredImage`
   - Size: 2000
   - Required: ❌
   - Click Create

7. **DateTime Attribute**
   - Key: `publishedDate`
   - Required: ✅
   - Click Create

8. **String Array Attribute**
   - Key: `tags`
   - Size: 50
   - Min: 0
   - Max: 20
   - Required: ❌
   - Click Create

#### Create Indexes:

1. Click **"Indexes"** tab
2. **Add Index**:
   - Key: `slug_idx`
   - Type: Key
   - Attributes: `slug`
   - Order: ASC
   - Unique: ✅

3. **Add Index**:
   - Key: `published_idx`
   - Type: Key
   - Attributes: `publishedDate`
   - Order: DESC

#### Set Permissions:

1. Click **"Settings"** tab
2. Under **Permissions**:
   - Read: Add Role → **Any**
   - Create: No permissions (API only)
   - Update: No permissions (API only)
   - Delete: No permissions (API only)

### Collection 2: about (Optional)

1. Create collection `about` with ID `about`
2. Add attribute:
   - String: `content`, Size: 50000, Required: ✅
3. Same permissions as blog_posts

## Step 4: Create Storage Bucket

1. Go to **Storage**
2. Click **"Create Bucket"**
3. Name: `Blog Images`
4. Bucket ID: `blog_images`
5. Max File Size: `10485760` (10MB)
6. Allowed File Extensions: `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`
7. Compression: Gzip
8. Encryption: ✅ Enabled
9. Antivirus: ✅ Enabled

#### Set Bucket Permissions:
- Read: Add Role → **Any**
- Create/Update/Delete: No permissions (API only)

## Step 5: Generate API Key

1. Go to **Project Settings** (gear icon)
2. Click **"API Keys"** tab
3. Click **"Create API Key"**
4. Name: `Blog Admin Key`
5. Expiration: Never (or set custom date)
6. Select Scopes:
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `storage.read`
   - ✅ `storage.write`
7. Click **Create**
8. **IMPORTANT**: Copy the API key immediately (shown only once!)

## Step 6: Update Environment Variables

Open `/blog-nextjs/.env.local` and update:

```env
# Appwrite Configuration (already set)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=673bbac8002ad572aff9

# ADD YOUR API KEY HERE (from Step 5)
APPWRITE_API_KEY=paste_your_api_key_here

# Database IDs (already set, verify they match)
NEXT_PUBLIC_APPWRITE_DATABASE_ID=dinmay_blog
NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID=blog_posts
NEXT_PUBLIC_APPWRITE_ABOUT_COLLECTION_ID=about
NEXT_PUBLIC_APPWRITE_BUCKET_ID=blog_images

# Admin credentials (change if needed)
NEXT_PUBLIC_ADMIN_EMAIL=admin@dinmay.com
ADMIN_PASSWORD=tapuhero@123
```

## Step 7: Test the Setup

1. Save the `.env.local` file
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Visit http://localhost:3000
4. Go to `/admin` and login
5. Try creating a test post!

## Verification Checklist

- [ ] Database `dinmay_blog` created
- [ ] Collection `blog_posts` with all 8 attributes
- [ ] Indexes created (slug_idx, published_idx)
- [ ] Storage bucket `blog_images` created
- [ ] API key generated with correct scopes
- [ ] API key added to `.env.local`
- [ ] Dev server restarted

## Troubleshooting

### "Connection failed" error
- Check endpoint URL and project ID in `.env.local`
- Verify your internet connection
- Check Appwrite Cloud status

### "Unauthorized" error
- Verify API key is correct
- Check API key has not expired
- Ensure API key has correct scopes

### "Collection not found" error
- Verify collection IDs match exactly
- Check database ID is correct
- Ensure collections are in the right database

### "Cannot create document" error
- Check all required attributes are filled
- Verify attribute sizes (especially content)
- Check enum values are correct (markdown/html)

## Need Help?

- Appwrite Docs: https://appwrite.io/docs
- Appwrite Discord: https://appwrite.io/discord
- GitHub Issues: Open an issue in your repository

---

🎉 Once setup is complete, you're ready to start blogging!
