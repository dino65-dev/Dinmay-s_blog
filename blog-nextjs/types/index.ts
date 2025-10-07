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

export interface Comment {
  $id: string
  postId: string
  parentId?: string
  authorName: string
  authorEmail: string
  content: string
  $createdAt: string
  $updatedAt: string
}

export interface CreateCommentData {
  postId: string
  parentId?: string
  authorName: string
  authorEmail: string
  content: string
}