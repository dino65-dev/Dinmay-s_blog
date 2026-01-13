import React, { useState, useEffect } from 'react';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const extractHeadings = () => {
      const actualHeadings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3');
      
      if (actualHeadings.length === 0) {
        setTimeout(extractHeadings, 100);
        return;
      }

      const headingsData = Array.from(actualHeadings).map((heading, index) => {
        const id = `heading-${index}`;
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent;
        heading.id = id;
        return { id, level, text };
      });
      
      setHeadings(headingsData);
      setTimeout(() => setMounted(true), 100);
    };

    const timeoutId = setTimeout(extractHeadings, 50);
    return () => clearTimeout(timeoutId);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    const actualHeadings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3');
    actualHeadings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white font-display">Contents</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No headings found.</p>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl p-5 transition-all duration-500 ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white font-display">Contents</h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all duration-300"
          aria-label="Toggle table of contents"
        >
          <svg 
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="space-y-1">
          {headings.map((heading, index) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left text-sm transition-all duration-300 py-2 px-3 rounded-lg ${
                heading.level === 1 ? 'font-semibold' : ''
              } ${
                heading.level === 2 ? 'pl-5' : ''
              } ${
                heading.level === 3 ? 'pl-8 text-xs' : ''
              } ${
                activeId === heading.id
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-l-2 border-indigo-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;
