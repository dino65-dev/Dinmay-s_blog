/**
 * Dinmay's Blog — Smart Caching Proxy
 * 
 * Runs on Oracle VPS, owns Redis (localhost) + Cosmos DB connections.
 * Backend (Render/Leapcell) makes lightweight HTTP calls here.
 * 
 * Features:
 *  - Stale-While-Revalidate: serve stale data instantly, refresh in background
 *  - Cache Stampede Prevention: in-flight request deduplication
 *  - Blog-specific endpoints matching the exact API structure
 *  - Write-through invalidation for all mutations
 *  - Health + stats endpoints for monitoring
 */

require('dotenv').config();
const express = require('express');
const compression = require('compression');
const Redis = require('ioredis');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(compression());

const PORT = process.env.PORT || 3001;
const API_SECRET = process.env.API_SECRET;

// ─── Redis (localhost — sub-millisecond) ────────────────────────────────────
let redisReady = false;
let lastRedisErrLog = 0;

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: process.env.REDIS_PASS,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 10) return null;  // Stop retrying after 10 attempts
    return Math.min(times * 1000, 10000);  // 1s, 2s, 3s... up to 10s
  },
  lazyConnect: false,
});

redis.on('connect', () => { redisReady = true; console.log('✅ Redis connected (localhost)'); });
redis.on('close', () => { redisReady = false; });
redis.on('error', (err) => {
  redisReady = false;
  const now = Date.now();
  if (now - lastRedisErrLog > 30000) {  // Log at most once per 30s
    console.error('❌ Redis unavailable:', err.message);
    lastRedisErrLog = now;
  }
});

// ─── MongoDB (persistent connection pool) ───────────────────────────────────
let db;
const mongo = new MongoClient(process.env.COSMOS_URI, {
  maxPoolSize: 5,       // Cosmos DB free tier — keep low
  minPoolSize: 2,       // Keep 2 warm connections
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 15000,
  retryWrites: false,   // Cosmos DB doesn't support retryWrites
  retryReads: true,
  compressors: ['zstd', 'zlib'],
});

// ─── Cache Stampede Prevention ──────────────────────────────────────────────
const inflight = new Map();

// ─── Stats ──────────────────────────────────────────────────────────────────
const stats = { hits: 0, misses: 0, stale: 0, stampede_prevented: 0, errors: 0 };

// ─── TTL Strategy (tuned per data volatility) ───────────────────────────────
const TTL = {
  POSTS_LIST:   120,    // 2 min — post list changes on create/delete
  POST_SLUG:    600,    // 10 min — individual post rarely changes
  TAGS:         600,    // 10 min — tags change when posts change
  ABOUT:        86400,  // 24 hr — almost never changes
  SETTINGS:     86400,  // 24 hr — almost never changes
  COMMENTS:     300,    // 5 min — moderate writes
  GITHUB:       600,    // 10 min — external API, rate limited
  STALE_BACKUP: 86400,  // 24 hr — stale fallback
};

// ─── Smart Auth Middleware (for write endpoints) ────────────────────────────
function requireSecret(req, res, next) {
  const token = req.headers['x-api-secret'];
  if (token !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── Core Cache Logic ───────────────────────────────────────────────────────

/**
 * Get from cache with Stale-While-Revalidate.
 * Returns { data, source } where source is 'cache', 'stale', or null (miss).
 */
async function cacheGet(key) {
  if (!redisReady) {
    stats.misses++;
    return { data: null, source: null, needsRefresh: false };
  }
  try {
    const cached = await redis.get(key);
    if (cached) {
      stats.hits++;
      const ttl = await redis.ttl(key);
      return { data: JSON.parse(cached), source: 'cache', needsRefresh: ttl < 60 };
    }
    const stale = await redis.get(`stale:${key}`);
    if (stale) {
      stats.stale++;
      return { data: JSON.parse(stale), source: 'stale', needsRefresh: true };
    }
  } catch (err) {
    stats.errors++;
  }
  stats.misses++;
  return { data: null, source: null, needsRefresh: false };
}

/**
 * Set cache with primary TTL + long-lived stale backup.
 */
async function cacheSet(key, data, ttl) {
  if (!redisReady) return;
  try {
    const serialized = JSON.stringify(data);
    await redis.setex(key, ttl, serialized);
    await redis.setex(`stale:${key}`, TTL.STALE_BACKUP, serialized);
  } catch (err) { /* silently skip */ }
}

/**
 * Invalidate cache keys + their stale backups.
 */
async function cacheInvalidate(...keys) {
  if (!redisReady) return;
  try {
    const allKeys = keys.flatMap(k => [k, `stale:${k}`]);
    if (allKeys.length > 0) await redis.del(...allKeys);
  } catch (err) { /* silently skip */ }
}

/**
 * Fetch with cache stampede prevention.
 * If the same key is already being fetched, wait for that result.
 */
async function fetchWithDedup(key, ttl, fetchFn) {
  // 1. Try cache (with SWR)
  const { data, source, needsRefresh } = await cacheGet(key);

  if (data && !needsRefresh) {
    return { data, source };
  }

  if (data && needsRefresh) {
    // Return stale/near-expiry data immediately, refresh in background
    refreshInBackground(key, ttl, fetchFn);
    return { data, source };
  }

  // 2. True cold miss — check inflight
  if (inflight.has(key)) {
    stats.stampede_prevented++;
    const result = await inflight.get(key);
    return { data: result, source: 'dedup' };
  }

  // 3. Fetch from DB
  const promise = fetchFn();
  inflight.set(key, promise);

  try {
    const result = await promise;
    await cacheSet(key, result, ttl);
    return { data: result, source: 'db' };
  } catch (err) {
    throw err;
  } finally {
    inflight.delete(key);
  }
}

/**
 * Fire-and-forget background cache refresh.
 */
function refreshInBackground(key, ttl, fetchFn) {
  if (inflight.has(key)) return; // Already refreshing
  
  const promise = fetchFn();
  inflight.set(key, promise);
  
  promise
    .then(result => cacheSet(key, result, ttl))
    .catch(err => console.error(`Background refresh error for ${key}:`, err.message))
    .finally(() => inflight.delete(key));
}

// ═══════════════════════════════════════════════════════════════════════════
// READ ENDPOINTS (cached)
// ═══════════════════════════════════════════════════════════════════════════

// GET /posts — all posts (no content field for fast list loading)
app.get('/posts', async (req, res) => {
  try {
    const { data, source } = await fetchWithDedup('posts:all', TTL.POSTS_LIST, async () => {
      return await db.collection('blog_posts')
        .find({}, { projection: { content: 0, _id: 0 } })
        .sort({ publishedDate: -1 })
        .toArray();
    });
    res.set('X-Cache', source);
    res.json(data);
  } catch (err) {
    console.error('GET /posts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /posts/:slug — single post by slug (full content)
app.get('/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const { data, source } = await fetchWithDedup(`posts:slug:${slug}`, TTL.POST_SLUG, async () => {
      const post = await db.collection('blog_posts').findOne({ slug }, { projection: { _id: 0 } });
      if (!post) return null;
      return post;
    });
    if (!data) return res.status(404).json({ error: 'Post not found' });
    res.set('X-Cache', source);
    res.json(data);
  } catch (err) {
    console.error(`GET /posts/${slug} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// GET /tags — all unique tags
app.get('/tags', async (req, res) => {
  try {
    const { data, source } = await fetchWithDedup('tags:all', TTL.TAGS, async () => {
      const posts = await db.collection('blog_posts').find({}, { projection: { tags: 1 } }).toArray();
      const allTags = new Set();
      for (const post of posts) {
        if (post.tags) post.tags.forEach(t => allTags.add(t));
      }
      return [...allTags].sort();
    });
    res.set('X-Cache', source);
    res.json(data);
  } catch (err) {
    console.error('GET /tags error:', err.message);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET /about — about page content
app.get('/about', async (req, res) => {
  try {
    const { data, source } = await fetchWithDedup('about:content', TTL.ABOUT, async () => {
      const about = await db.collection('about').findOne({}, { projection: { _id: 0 } });
      return about || { content: '# About\n\nWelcome to the blog!', updatedAt: new Date() };
    });
    res.set('X-Cache', source);
    res.json(data);
  } catch (err) {
    console.error('GET /about error:', err.message);
    res.status(500).json({ error: 'Failed to fetch about' });
  }
});

// GET /settings — site settings
app.get('/settings', async (req, res) => {
  try {
    const { data, source } = await fetchWithDedup('settings:all', TTL.SETTINGS, async () => {
      const settings = await db.collection('site_settings').findOne({}, { projection: { _id: 0 } });
      return settings || {};
    });
    res.set('X-Cache', source);
    res.json(data);
  } catch (err) {
    console.error('GET /settings error:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// GET /posts/:postId/comments — comments for a post
app.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  try {
    const { data, source } = await fetchWithDedup(`comments:${postId}`, TTL.COMMENTS, async () => {
      return await db.collection('comments')
        .find({ post_id: postId }, { projection: { _id: 0 } })
        .sort({ created_at: 1 })
        .toArray();
    });
    res.set('X-Cache', source);
    res.json(data);
  } catch (err) {
    console.error(`GET /comments/${postId} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// GET /github/profile/:username — GitHub profile (external API, cached aggressively)
app.get('/github/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const { data, source } = await fetchWithDedup(`github:${username}`, TTL.GITHUB, async () => {
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
          signal: AbortSignal.timeout(10000),
        }),
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
          signal: AbortSignal.timeout(10000),
        }),
      ]);

      if (!profileRes.ok) return null;
      const profile = await profileRes.json();
      const repos = reposRes.ok ? await reposRes.json() : [];

      return {
        login: profile.login,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        blog: profile.blog,
        twitter_username: profile.twitter_username,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        created_at: profile.created_at,
        html_url: profile.html_url,
        repos: repos.map(r => ({
          name: r.name,
          description: r.description,
          html_url: r.html_url,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
          language: r.language,
          updated_at: r.updated_at,
        })),
      };
    });
    if (!data) return res.status(404).json({ error: 'GitHub user not found' });
    res.set('X-Cache', source);
    res.json(data);
  } catch (err) {
    console.error(`GET /github/${username} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch GitHub profile' });
  }
});

// GET /search/posts — search (not cached — dynamic params)
app.get('/search/posts', async (req, res) => {
  try {
    const { q, content_type, tag, start_date, end_date, sort_by, order } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }
    if (content_type) filter.contentType = content_type;
    if (tag) filter.tags = { $regex: tag, $options: 'i' };

    const dateFilter = {};
    if (start_date) dateFilter.$gte = new Date(start_date);
    if (end_date) dateFilter.$lte = new Date(end_date + 'T23:59:59');
    if (Object.keys(dateFilter).length) filter.publishedDate = dateFilter;

    const sortField = sort_by === 'title' ? 'title' : 'publishedDate';
    const sortOrder = order === 'asc' ? 1 : -1;

    const posts = await db.collection('blog_posts')
      .find(filter, { projection: { _id: 0 } })
      .sort({ [sortField]: sortOrder })
      .toArray();

    res.json(posts);
  } catch (err) {
    console.error('GET /search/posts error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// WRITE ENDPOINTS (with cache invalidation)
// ═══════════════════════════════════════════════════════════════════════════

// POST /posts — create post
app.post('/posts', requireSecret, async (req, res) => {
  try {
    const post = req.body;
    const existing = await db.collection('blog_posts').findOne({ slug: post.slug });
    if (existing) return res.status(400).json({ error: 'Slug already exists' });

    await db.collection('blog_posts').insertOne(post);
    await cacheInvalidate('posts:all', 'tags:all');
    res.status(201).json(post);
  } catch (err) {
    console.error('POST /posts error:', err.message);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /posts/:postId — update post
app.put('/posts/:postId', requireSecret, async (req, res) => {
  try {
    const { postId } = req.params;
    const existing = await db.collection('blog_posts').findOne({ id: postId });
    if (!existing) return res.status(404).json({ error: 'Post not found' });

    const update = req.body;
    update.updatedAt = new Date();
    await db.collection('blog_posts').updateOne({ id: postId }, { $set: update });
    const updated = await db.collection('blog_posts').findOne({ id: postId }, { projection: { _id: 0 } });

    // Invalidate old + new slugs
    const oldSlug = existing.slug || '';
    await cacheInvalidate('posts:all', 'tags:all', `posts:slug:${oldSlug}`);
    if (update.slug && update.slug !== oldSlug) {
      await cacheInvalidate(`posts:slug:${update.slug}`);
    }
    res.json(updated);
  } catch (err) {
    console.error('PUT /posts error:', err.message);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /posts/:postId — delete post
app.delete('/posts/:postId', requireSecret, async (req, res) => {
  try {
    const { postId } = req.params;
    const existing = await db.collection('blog_posts').findOne({ id: postId });
    if (!existing) return res.status(404).json({ error: 'Post not found' });

    await db.collection('blog_posts').deleteOne({ id: postId });
    await cacheInvalidate('posts:all', 'tags:all', `posts:slug:${existing.slug || ''}`, `comments:${postId}`);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('DELETE /posts error:', err.message);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /posts/:postId/comments — create comment
app.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comment = req.body;
    if (comment.post_id !== postId) return res.status(400).json({ error: 'Post ID mismatch' });

    if (comment.parent_id) {
      const parent = await db.collection('comments').findOne({ id: comment.parent_id });
      if (!parent) return res.status(404).json({ error: 'Parent comment not found' });
    }

    await db.collection('comments').insertOne(comment);
    await cacheInvalidate(`comments:${postId}`);
    res.status(201).json(comment);
  } catch (err) {
    console.error('POST /comments error:', err.message);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// DELETE /comments/:commentId — delete comment
app.delete('/comments/:commentId', requireSecret, async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await db.collection('comments').findOne({ id: commentId });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    await db.collection('comments').deleteOne({ id: commentId });
    await db.collection('comments').deleteMany({ parent_id: commentId });
    if (comment.post_id) await cacheInvalidate(`comments:${comment.post_id}`);
    res.json({ message: 'Comment and replies deleted successfully' });
  } catch (err) {
    console.error('DELETE /comments error:', err.message);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// PUT /about — update about page
app.put('/about', requireSecret, async (req, res) => {
  try {
    const aboutData = req.body;
    aboutData.updatedAt = new Date();
    await db.collection('about').deleteMany({});
    await db.collection('about').insertOne(aboutData);
    await cacheInvalidate('about:content');
    res.json(aboutData);
  } catch (err) {
    console.error('PUT /about error:', err.message);
    res.status(500).json({ error: 'Failed to update about' });
  }
});

// PUT /settings — update settings
app.put('/settings', requireSecret, async (req, res) => {
  try {
    const settings = req.body;
    settings.updated_at = new Date();
    await db.collection('site_settings').deleteMany({});
    await db.collection('site_settings').insertOne(settings);
    await cacheInvalidate('settings:all');
    res.json(settings);
  } catch (err) {
    console.error('PUT /settings error:', err.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// POST /contact — submit contact message (public)
app.post('/contact', async (req, res) => {
  try {
    const message = req.body;
    await db.collection('contact_messages').insertOne(message);
    res.status(201).json(message);
  } catch (err) {
    console.error('POST /contact error:', err.message);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

// GET /contact/messages — admin only
app.get('/contact/messages', requireSecret, async (req, res) => {
  try {
    const messages = await db.collection('contact_messages')
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PUT /contact/messages/:messageId/read — mark as read
app.put('/contact/messages/:messageId/read', requireSecret, async (req, res) => {
  try {
    const result = await db.collection('contact_messages').updateOne(
      { id: req.params.messageId },
      { $set: { read: true } }
    );
    if (result.modifiedCount === 0) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// DELETE /contact/messages/:messageId
app.delete('/contact/messages/:messageId', requireSecret, async (req, res) => {
  try {
    const result = await db.collection('contact_messages').deleteOne({ id: req.params.messageId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// GET /contact/unread-count
app.get('/contact/unread-count', requireSecret, async (req, res) => {
  try {
    const count = await db.collection('contact_messages').countDocuments({ read: false });
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count unread' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MONITORING
// ═══════════════════════════════════════════════════════════════════════════

app.get('/health', async (req, res) => {
  let dbOk = false;
  try { await db.command({ ping: 1 }); dbOk = true; } catch (err) { /* db down */ }
  res.json({
    status: dbOk ? 'healthy' : 'degraded',
    redis: redisReady ? 'connected' : 'unavailable',
    database: dbOk ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.get('/stats', (req, res) => {
  const total = stats.hits + stats.misses + stats.stale;
  res.json({
    ...stats,
    total_requests: total,
    hit_rate: total > 0 ? `${((stats.hits / total) * 100).toFixed(1)}%` : '0%',
    inflight_keys: inflight.size,
    uptime_seconds: Math.floor(process.uptime()),
    memory_mb: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════

async function start() {
  try {
    await mongo.connect();
    db = mongo.db(process.env.DB_NAME);
    console.log(`✅ MongoDB connected to ${process.env.DB_NAME}`);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Blog Proxy running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Stats: http://localhost:${PORT}/stats`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await redis.quit();
  await mongo.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  await redis.quit();
  await mongo.close();
  process.exit(0);
});

start();
