import { getAllPosts } from '@/lib/appwrite/posts'
import { BlogCard } from '@/components/blog/blog-card'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

async function PostsList() {
  const posts = await getAllPosts()

  if (posts.length === 0) {
    return (
      &lt;div className="text-center py-12"&gt;
        &lt;p className="text-gray-500 dark:text-gray-400 text-lg"&gt;
          No blog posts yet.
        &lt;/p&gt;
      &lt;/div&gt;
    )
  }

  return (
    &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"&gt;
      {posts.map((post, index) =&gt; (
        &lt;BlogCard key={post.$id} post={post} index={index} /&gt;
      ))}
    &lt;/div&gt;
  )
}

export default function AllPostsPage() {
  return (
    &lt;div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"&gt;
      &lt;div className="mb-12 text-center"&gt;
        &lt;h1 className="text-4xl md:text-5xl font-bold mb-4"&gt;All Posts&lt;/h1&gt;
        &lt;p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"&gt;
          Browse through all our articles and tutorials
        &lt;/p&gt;
      &lt;/div&gt;

      &lt;Suspense fallback={
        &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"&gt;
          {[...Array(6)].map((_, i) =&gt; (
            &lt;div key={i} className="space-y-4"&gt;
              &lt;Skeleton className="h-48 w-full" /&gt;
              &lt;Skeleton className="h-6 w-3/4" /&gt;
              &lt;Skeleton className="h-4 w-full" /&gt;
            &lt;/div&gt;
          ))}
        &lt;/div&gt;
      }&gt;
        &lt;PostsList /&gt;
      &lt;/Suspense&gt;
    &lt;/div&gt;
  )
}