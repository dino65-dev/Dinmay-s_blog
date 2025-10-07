import { getPostBySlug, deletePost, getAllPosts } from '@/lib/appwrite/posts'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { ReadingProgress } from '@/components/reading-progress'
import { Comments } from '@/components/blog/comments'
import { SocialShare } from '@/components/blog/social-share'
import { RelatedPosts } from '@/components/blog/related-posts'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { formatDate, calculateReadingTime } from '@/lib/utils'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { isAuthenticated } from '@/lib/appwrite/auth'
import DeleteButton from './delete-button'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)
  
  if (!post) return { title: 'Post Not Found' }
  
  return {
    title: `${post.title} | Dinmay's Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)
  const authenticated = await isAuthenticated()
  
  if (!post) {
    notFound()
  }

  return (
    <>
      <ReadingProgress />
      
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <header className="mb-12 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{calculateReadingTime(post.content)} min read</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-12 max-w-4xl mx-auto rounded-xl overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <MarkdownRenderer content={post.content} contentType={post.contentType} />
        </div>

        {/* Admin Actions */}
        {authenticated && (
          <div className="mt-12 max-w-3xl mx-auto flex gap-4 justify-end border-t border-gray-200 dark:border-gray-800 pt-8">
            <Link href={`/admin/edit/${post.$id}`}>
              <Button variant="outline">Edit Post</Button>
            </Link>
            <DeleteButton postId={post.$id} />
          </div>
        )}
      </article>
    </>
  )
}
