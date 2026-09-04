import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'katex/dist/katex.min.css';
import InteractiveCodeBlock from './InteractiveCodeBlock';

function CodeBlock({ inline, className, children, ...props }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const language = /language-([\w-]+)/.exec(className || '')?.[1] || 'text';
  const source = String(children).replace(/\n$/, '');
  const isInline = inline === true || (!className && !String(children).includes('\n'));
  const interactiveMatch = /^interactive[-_]?(\w+)?$/.exec(language);

  useEffect(() => {
    if (codeRef.current && !isInline && !interactiveMatch) Prism.highlightElement(codeRef.current);
  }, [interactiveMatch, isInline, source]);

  if (isInline) return <code className="article-inline-code" {...props}>{children}</code>;

  if (interactiveMatch) {
    const aliases = { js: 'javascript', py: 'python', htm: 'html' };
    const requestedLanguage = interactiveMatch[1] || 'javascript';
    return <InteractiveCodeBlock language={aliases[requestedLanguage] || requestedLanguage} initialCode={source} />;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return <div className="article-code"><div className="article-code__bar"><span>{language}</span><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy code'}</button></div><pre><code ref={codeRef} className={className} {...props}>{children}</code></pre></div>;
}

export default function MarkdownRenderer({ content = '' }) {
  return <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex, rehypeRaw]} components={{ code: CodeBlock }}>{content}</ReactMarkdown></div>;
}
