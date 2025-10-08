import { HeroSection } from '@/components/blog/hero-section'
import { BlogCard } from '@/components/blog/blog-card'
import { getAllPosts } from '@/lib/mongodb/posts'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

async function BlogGrid() {
  const posts = await getAllPosts()

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No blog posts yet. Check back soon!
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

function BlogGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Latest Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the latest articles, tutorials, and insights from our blog
          </p>
        </div>

        <Suspense fallback={<BlogGridSkeleton />}>
          <BlogGrid />
        </Suspense>
      </section>
    </div>
  )
}
