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
import InteractiveCodeBlock from './InteractiveCodeBlock';

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
  const codeContent = String(children).replace(/\n$/, '');

  // Check if this is an interactive code block
  const interactiveMatch = /^interactive[-_]?(\w+)?$/.exec(language);
  if (interactiveMatch) {
    const interactiveLang = interactiveMatch[1] || 'javascript';
    // Map language aliases
    const langMap = {
      'js': 'javascript',
      'py': 'python',
      'htm': 'html'
    };
    const normalizedLang = langMap[interactiveLang] || interactiveLang;
    
    return (
      <InteractiveCodeBlock 
        language={normalizedLang} 
        initialCode={codeContent}
      />
    );
  }

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
    <div ref={containerRef} className="markdown-content prose prose-xl dark:prose-invert max-w-none w-full text-gray-900 dark:text-gray-100">
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
        
        /* Inline code */
        .markdown-content code {
          background: #f4f4f4;
          color: #e11d48;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }
        .dark .markdown-content code {
          background: #374151;
          color: #fb7185;
        }
        
        /* Code block wrapper */
        .markdown-content .code-block-wrapper {
          position: relative;
          margin: 1.5rem 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .dark .markdown-content .code-block-wrapper {
          border-color: #374151;
        }
        
        /* Code block header */
        .markdown-content .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
        }
        .dark .markdown-content .code-block-header {
          background: #1f2937;
          border-bottom-color: #374151;
        }
        
        .markdown-content .code-language {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.05em;
        }
        .dark .markdown-content .code-language {
          color: #9ca3af;
        }
        
        /* Copy button */
        .markdown-content .copy-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #4b5563;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .markdown-content .copy-button:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          color: #1f2937;
        }
        .dark .markdown-content .copy-button {
          color: #d1d5db;
          background: #374151;
          border-color: #4b5563;
        }
        .dark .markdown-content .copy-button:hover {
          background: #4b5563;
          border-color: #6b7280;
          color: #f3f4f6;
        }
        
        /* Code block pre */
        .markdown-content .code-block-wrapper pre {
          margin: 0;
          background: #fafafa;
          padding: 1rem;
          overflow-x: auto;
        }
        .dark .markdown-content .code-block-wrapper pre {
          background: #111827;
        }
        
        .markdown-content .code-block-wrapper pre code {
          background: transparent;
          padding: 0;
          color: #1f2937;
          font-size: 0.875rem;
          line-height: 1.6;
          font-family: 'Courier New', monospace;
        }
        .dark .markdown-content .code-block-wrapper pre code {
          color: #e5e7eb;
        }
        /* Prism Light Theme Token Colors */
        .markdown-content pre code .token.comment,
        .markdown-content pre code .token.prolog,
        .markdown-content pre code .token.doctype,
        .markdown-content pre code .token.cdata {
          color: #6a737d;
          font-style: italic;
        }
        
        .markdown-content pre code .token.punctuation {
          color: #24292e;
        }
        
        .markdown-content pre code .token.property,
        .markdown-content pre code .token.tag,
        .markdown-content pre code .token.boolean,
        .markdown-content pre code .token.number,
        .markdown-content pre code .token.constant,
        .markdown-content pre code .token.symbol {
          color: #005cc5;
        }
        
        .markdown-content pre code .token.selector,
        .markdown-content pre code .token.attr-name,
        .markdown-content pre code .token.string,
        .markdown-content pre code .token.char,
        .markdown-content pre code .token.builtin {
          color: #032f62;
        }
        
        .markdown-content pre code .token.operator,
        .markdown-content pre code .token.entity,
        .markdown-content pre code .token.url {
          color: #d73a49;
        }
        
        .markdown-content pre code .token.atrule,
        .markdown-content pre code .token.attr-value,
        .markdown-content pre code .token.keyword {
          color: #d73a49;
        }
        
        .markdown-content pre code .token.function,
        .markdown-content pre code .token.class-name {
          color: #6f42c1;
        }
        
        .markdown-content pre code .token.regex,
        .markdown-content pre code .token.important,
        .markdown-content pre code .token.variable {
          color: #e36209;
        }
        
        .markdown-content pre code .token.deleted {
          color: #b31d28;
        }
        
        .markdown-content pre code .token.inserted {
          color: #22863a;
        }
        
        /* Prism Dark Theme Token Colors */
        .dark .markdown-content pre code .token.comment,
        .dark .markdown-content pre code .token.prolog,
        .dark .markdown-content pre code .token.doctype,
        .dark .markdown-content pre code .token.cdata {
          color: #6a9955;
          font-style: italic;
        }
        
        .dark .markdown-content pre code .token.punctuation {
          color: #d4d4d4;
        }
        
        .dark .markdown-content pre code .token.property,
        .dark .markdown-content pre code .token.tag,
        .dark .markdown-content pre code .token.boolean,
        .dark .markdown-content pre code .token.number,
        .dark .markdown-content pre code .token.constant,
        .dark .markdown-content pre code .token.symbol {
          color: #b5cea8;
        }
        
        .dark .markdown-content pre code .token.selector,
        .dark .markdown-content pre code .token.attr-name,
        .dark .markdown-content pre code .token.string,
        .dark .markdown-content pre code .token.char,
        .dark .markdown-content pre code .token.builtin {
          color: #ce9178;
        }
        
        .dark .markdown-content pre code .token.operator,
        .dark .markdown-content pre code .token.entity,
        .dark .markdown-content pre code .token.url {
          color: #d4d4d4;
        }
        
        .dark .markdown-content pre code .token.atrule,
        .dark .markdown-content pre code .token.attr-value,
        .dark .markdown-content pre code .token.keyword {
          color: #569cd6;
        }
        
        .dark .markdown-content pre code .token.function,
        .dark .markdown-content pre code .token.class-name {
          color: #dcdcaa;
        }
        
        .dark .markdown-content pre code .token.regex,
        .dark .markdown-content pre code .token.important,
        .dark .markdown-content pre code .token.variable {
          color: #d16969;
        }
        
        .dark .markdown-content pre code .token.deleted {
          color: #ce9178;
        }
        
        .dark .markdown-content pre code .token.inserted {
          color: #b5cea8;
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

        /* Interactive Code Block Styles */
        .markdown-content .interactive-code-block {
          margin: 1.5rem 0;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
