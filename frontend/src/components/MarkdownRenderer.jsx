import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'katex/dist/katex.min.css';

const MarkdownRenderer = ({ content }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  return (
    <div className="markdown-content prose prose-lg dark:prose-invert max-w-none">
      <style>{`
        .markdown-content h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .markdown-content h2 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-content h3 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content p {
          margin: 1rem 0;
          line-height: 1.7;
        }
        .markdown-content ul, .markdown-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        .markdown-content li {
          margin: 0.5rem 0;
        }
        .markdown-content code {
          background: #f4f4f4;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .dark .markdown-content code {
          background: #374151;
        }
        .markdown-content pre code {
          background: transparent;
          padding: 0;
        }
        .markdown-content .katex {
          font-size: 1.1em;
        }
        .markdown-content .katex-display {
          margin: 1.5rem 0;
          overflow-x: auto;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className={className}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;