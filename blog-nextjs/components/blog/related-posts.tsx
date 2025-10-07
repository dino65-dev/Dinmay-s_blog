import Link from 'next/link'
import { BlogPost } from '@/types'
import { formatDate } from '@/lib/utils'
import { Clock, Calendar } from 'lucide-react'

interface RelatedPostsProps {
  posts: BlogPost[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.$id}
            href={`/post/${post.slug}`}
            className="group block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg"
          >
            {post.featuredImage && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(post.publishedDate)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}