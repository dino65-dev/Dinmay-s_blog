import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'katex/dist/katex.min.css';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = async () => {
    const code = codeRef.current?.textContent || '';
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [children]);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (!inline && match) {
    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-language">{language}</span>
          <button
            onClick={handleCopy}
            className="copy-button"
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
            <span className="copy-text">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <pre className={className}>
          <code ref={codeRef} className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const MarkdownRenderer = ({ content }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      Prism.highlightAllUnder(containerRef.current);
    }
  }, [content]);

  return (
    <div ref={containerRef} className="markdown-content prose prose-lg dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
      <style>{`
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          font-weight: bold;
          color: inherit;
        }
        .markdown-content h1 {
          font-size: 2.5rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .markdown-content h2 {
          font-size: 2rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-content h3 {
          font-size: 1.5rem;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content p {
          margin: 1rem 0;
          line-height: 1.7;
          color: inherit;
        }
        .markdown-content ul, .markdown-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
          color: inherit;
        }
        .markdown-content li {
          margin: 0.5rem 0;
          color: inherit;
        }
        .markdown-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .dark .markdown-content a {
          color: #60a5fa;
        }
        .markdown-content code {
          background: #f4f4f4;
          color: #1f2937;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .dark .markdown-content code {
          background: #374151;
          color: #e5e7eb;
        }
        .markdown-content pre {
          background: #f7f7f7;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .dark .markdown-content pre {
          background: #1e1e1e;
          border-color: #374151;
        }
        .markdown-content pre code {
          background: transparent;
          padding: 0;
          color: #1f2937;
          font-size: 0.9em;
          line-height: 1.6;
        }
        .dark .markdown-content pre code {
          color: #e5e7eb;
        }
        /* Prism Light Theme Styles */
        .markdown-content pre code .token.comment,
        .markdown-content pre code .token.prolog,
        .markdown-content pre code .token.doctype,
        .markdown-content pre code .token.cdata {
          color: #708090;
        }
        .markdown-content pre code .token.punctuation {
          color: #999;
        }
        .markdown-content pre code .token.property,
        .markdown-content pre code .token.tag,
        .markdown-content pre code .token.boolean,
        .markdown-content pre code .token.number,
        .markdown-content pre code .token.constant,
        .markdown-content pre code .token.symbol,
        .markdown-content pre code .token.deleted {
          color: #905;
        }
        .markdown-content pre code .token.selector,
        .markdown-content pre code .token.attr-name,
        .markdown-content pre code .token.string,
        .markdown-content pre code .token.char,
        .markdown-content pre code .token.builtin,
        .markdown-content pre code .token.inserted {
          color: #690;
        }
        .markdown-content pre code .token.operator,
        .markdown-content pre code .token.entity,
        .markdown-content pre code .token.url,
        .markdown-content pre code .language-css .token.string,
        .markdown-content pre code .style .token.string {
          color: #9a6e3a;
        }
        .markdown-content pre code .token.atrule,
        .markdown-content pre code .token.attr-value,
        .markdown-content pre code .token.keyword {
          color: #07a;
        }
        .markdown-content pre code .token.function,
        .markdown-content pre code .token.class-name {
          color: #DD4A68;
        }
        .markdown-content pre code .token.regex,
        .markdown-content pre code .token.important,
        .markdown-content pre code .token.variable {
          color: #e90;
        }
        /* Prism Dark Theme Styles */
        .dark .markdown-content pre code .token.comment,
        .dark .markdown-content pre code .token.prolog,
        .dark .markdown-content pre code .token.doctype,
        .dark .markdown-content pre code .token.cdata {
          color: #999;
        }
        .dark .markdown-content pre code .token.punctuation {
          color: #ccc;
        }
        .dark .markdown-content pre code .token.property,
        .dark .markdown-content pre code .token.tag,
        .dark .markdown-content pre code .token.boolean,
        .dark .markdown-content pre code .token.number,
        .dark .markdown-content pre code .token.constant,
        .dark .markdown-content pre code .token.symbol,
        .dark .markdown-content pre code .token.deleted {
          color: #f92672;
        }
        .dark .markdown-content pre code .token.selector,
        .dark .markdown-content pre code .token.attr-name,
        .dark .markdown-content pre code .token.string,
        .dark .markdown-content pre code .token.char,
        .dark .markdown-content pre code .token.builtin,
        .dark .markdown-content pre code .token.inserted {
          color: #a6e22e;
        }
        .dark .markdown-content pre code .token.operator,
        .dark .markdown-content pre code .token.entity,
        .dark .markdown-content pre code .token.url,
        .dark .markdown-content pre code .language-css .token.string,
        .dark .markdown-content pre code .style .token.string {
          color: #f8f8f2;
        }
        .dark .markdown-content pre code .token.atrule,
        .dark .markdown-content pre code .token.attr-value,
        .dark .markdown-content pre code .token.keyword {
          color: #66d9ef;
        }
        .dark .markdown-content pre code .token.function,
        .dark .markdown-content pre code .token.class-name {
          color: #e6db74;
        }
        .dark .markdown-content pre code .token.regex,
        .dark .markdown-content pre code .token.important,
        .dark .markdown-content pre code .token.variable {
          color: #fd971f;
        }
        .markdown-content .katex {
          font-size: 1.1em;
        }
        .markdown-content .katex-display {
          margin: 1.5rem 0;
          overflow-x: auto;
        }
        .markdown-content strong {
          color: inherit;
        }
        .markdown-content em {
          color: inherit;
        }
        .markdown-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          color: inherit;
          font-style: italic;
        }
        .dark .markdown-content blockquote {
          border-left-color: #4b5563;
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