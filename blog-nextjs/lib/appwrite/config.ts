import { Client, Databases, Storage, Account } from 'node-appwrite'

// Client-side configuration
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  postsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID!,
  aboutCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ABOUT_COLLECTION_ID!,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
}

// Server-side client (with API key)
let serverClient: Client | null = null
let serverDatabases: Databases | null = null
let serverStorage: Storage | null = null
let serverAccount: Account | null = null

export function getServerClient() {
  if (!serverClient) {
    serverClient = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId)
      .setKey(process.env.APPWRITE_API_KEY || '')
  }
  return serverClient
}

export function getServerDatabases() {
  if (!serverDatabases) {
    serverDatabases = new Databases(getServerClient())
  }
  return serverDatabases
}

export function getServerStorage() {
  if (!serverStorage) {
    serverStorage = new Storage(getServerClient())
  }
  return serverStorage
}

export function getServerAccount() {
  if (!serverAccount) {
    serverAccount = new Account(getServerClient())
  }
  return serverAccount
}