import { getAllPosts } from '@/lib/mongodb/posts'
import { BlogCard } from '@/components/blog/blog-card'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

async function PostsList() {
  const posts = await getAllPosts()

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No blog posts yet.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <BlogCard key={post.$id} post={post} index={index} />
      ))}
    </div>
  )
}

export default function AllPostsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">All Posts</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Browse through all our articles and tutorials
        </p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      }>
        <PostsList />
      </Suspense>
    </div>
  )
}
