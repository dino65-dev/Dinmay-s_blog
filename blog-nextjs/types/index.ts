export interface BlogPost {
  $id: string
  title: string
  slug: string
  content: string
  excerpt: string
  contentType: 'markdown' | 'html'
  featuredImage?: string
  publishedDate: string
  tags?: string[]
  $createdAt: string
  $updatedAt: string
}

export interface AboutContent {
  $id: string
  content: string
  $createdAt: string
  $updatedAt: string
}

export interface CreatePostData {
  title: string
  content: string
  excerpt: string
  contentType: 'markdown' | 'html'
  featuredImage?: string
  tags?: string[]
}

export interface UpdatePostData extends Partial<CreatePostData> {
  publishedDate?: string
}