'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'

interface MarkdownRendererProps {
  content: string
  contentType: 'markdown' | 'html'
}

export function MarkdownRenderer({ content, contentType }: MarkdownRendererProps) {
  useEffect(() => {
    Prism.highlightAll()
  }, [content])

  if (contentType === 'html') {
    return (
      <div
        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-900 prose-pre:text-gray-100"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <ReactMarkdown
      className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-pre:bg-gray-900 prose-pre:text-gray-100"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <code className={className} {...props}>
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}