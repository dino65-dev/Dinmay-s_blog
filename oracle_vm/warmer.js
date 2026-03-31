/**
 * Cache Pre-Warmer — runs every 5 minutes via cron.
 * Refreshes the most-accessed keys before they expire,
 * so users almost never experience a true cache miss.
 *
 * Usage:  node warmer.js
 * Cron:   */5 * * * * node /home/ubuntu/proxy/warmer.js >> /var/log/cache-warmer.log 2>&1
 */

require('dotenv').config();
const Redis = require('ioredis');
const { MongoClient } = require('mongodb');

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: process.env.REDIS_PASS,
});

const mongo = new MongoClient(process.env.COSMOS_URI, {
  maxPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
});

const TTL = {
  POSTS_LIST: 120,
  TAGS: 600,
  ABOUT: 86400,
  SETTINGS: 86400,
};

const STALE_TTL = 86400;

// Keys to pre-warm and their fetch logic
const warmers = [
  {
    key: 'posts:all',
    ttl: TTL.POSTS_LIST,
    threshold: 60, // Refresh if < 60s remaining
    fetch: async (db) => {
      return await db.collection('blog_posts')
        .find({}, { projection: { content: 0, _id: 0 } })
        .sort({ publishedDate: -1 })
        .toArray();
    },
  },
  {
    key: 'tags:all',
    ttl: TTL.TAGS,
    threshold: 120,
    fetch: async (db) => {
      const posts = await db.collection('blog_posts')
        .find({}, { projection: { tags: 1 } })
        .toArray();
      const allTags = new Set();
      for (const post of posts) {
        if (post.tags) post.tags.forEach(t => allTags.add(t));
      }
      return [...allTags].sort();
    },
  },
  {
    key: 'about:content',
    ttl: TTL.ABOUT,
    threshold: 3600, // Refresh if < 1hr remaining (24hr TTL)
    fetch: async (db) => {
      const about = await db.collection('about').findOne({}, { projection: { _id: 0 } });
      return about || { content: '# About\n\nWelcome to the blog!', updatedAt: new Date() };
    },
  },
  {
    key: 'settings:all',
    ttl: TTL.SETTINGS,
    threshold: 3600,
    fetch: async (db) => {
      const settings = await db.collection('site_settings').findOne({}, { projection: { _id: 0 } });
      return settings || {};
    },
  },
];

(async () => {
  const start = Date.now();
  let warmed = 0;
  let skipped = 0;

  try {
    await mongo.connect();
    const db = mongo.db(process.env.DB_NAME);

    for (const w of warmers) {
      const ttl = await redis.ttl(w.key);

      // Refresh if key is missing (-2), no expiry (-1), or below threshold
      if (ttl === -2 || ttl === -1 || ttl < w.threshold) {
        const result = await w.fetch(db);
        const serialized = JSON.stringify(result);
        await redis.setex(w.key, w.ttl, serialized);
        await redis.setex(`stale:${w.key}`, STALE_TTL, serialized);
        warmed++;
        console.log(`✅ Warmed: ${w.key} (was ttl=${ttl})`);
      } else {
        skipped++;
      }
    }

    // Also warm the most recent blog post slugs (top 5)
    const topPosts = await db.collection('blog_posts')
      .find({}, { projection: { slug: 1 } })
      .sort({ publishedDate: -1 })
      .limit(5)
      .toArray();

    for (const post of topPosts) {
      if (!post.slug) continue;
      const key = `posts:slug:${post.slug}`;
      const ttl = await redis.ttl(key);

      if (ttl === -2 || ttl < 120) {
        const fullPost = await db.collection('blog_posts')
          .findOne({ slug: post.slug }, { projection: { _id: 0 } });
        if (fullPost) {
          const serialized = JSON.stringify(fullPost);
          await redis.setex(key, 600, serialized);
          await redis.setex(`stale:${key}`, STALE_TTL, serialized);
          warmed++;
          console.log(`✅ Warmed: ${key}`);
        }
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 Warmer done in ${Date.now() - start}ms — warmed: ${warmed}, skipped: ${skipped}`);
  } catch (err) {
    console.error('❌ Warmer error:', err.message);
  } finally {
    await redis.quit();
    await mongo.close();
    process.exit(0);
  }
})();
