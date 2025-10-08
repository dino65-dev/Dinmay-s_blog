import { MongoClient, Db, GridFSBucket } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI!
const DB_NAME = process.env.MONGODB_DB_NAME || 'dinmay_blog'

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in your environment variables')
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let cachedBucket: GridFSBucket | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
  })

  const db = client.db(DB_NAME)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (cachedBucket) {
    return cachedBucket
  }

  const db = await getDatabase()
  cachedBucket = new GridFSBucket(db, {
    bucketName: 'images'
  })

  return cachedBucket
}

// Collection names
export const COLLECTIONS = {
  POSTS: 'posts',
  COMMENTS: 'comments',
  ABOUT: 'about',
} as const
