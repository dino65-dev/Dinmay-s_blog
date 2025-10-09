import React, { useState, useEffect } from 'react';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [mounted, setMounted] = useState(false);

  console.log('TableOfContents rendered, content length:', content?.length);
  console.log('Headings found:', headings.length);

  useEffect(() => {
    // Wait for DOM to be ready, then extract headings from the rendered markdown
    const extractHeadings = () => {
      const actualHeadings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3');
      
      if (actualHeadings.length === 0) {
        // If no headings found yet, try again after a short delay
        setTimeout(extractHeadings, 100);
        return;
      }

      const headingsData = Array.from(actualHeadings).map((heading, index) => {
        const id = `heading-${index}`;
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent;
        
        // Add ID to the actual heading element
        heading.id = id;
        
        return { id, level, text };
      });
      
      setHeadings(headingsData);
      // Trigger mount animation
      setTimeout(() => setMounted(true), 100);
    };

    // Small delay to ensure markdown is rendered
    const timeoutId = setTimeout(extractHeadings, 50);
    
    return () => clearTimeout(timeoutId);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Scroll spy
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-5 transition-all duration-300 shadow-md hover:shadow-lg">
        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">📑 Table of Contents</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No headings found in this post.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-300 dark:border-gray-600 p-5 transition-all duration-500 shadow-lg hover:shadow-2xl hover:scale-[1.02] ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .toc-heading-item {
          animation: slideIn 0.3s ease-out forwards;
          animation-delay: calc(var(--item-index) * 0.05s);
          opacity: 0;
        }
        
        .toc-icon {
          display: inline-block;
          transition: transform 0.3s ease;
        }
        
        .toc-toggle:hover .toc-icon {
          animation: pulse 0.6s ease-in-out;
        }
        
        .active-heading {
          position: relative;
          overflow: hidden;
        }
        
        .active-heading::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            height: 0%;
          }
          to {
            height: 100%;
          }
        }
        
        .toc-button {
          position: relative;
          overflow: hidden;
        }
        
        .toc-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
        }
        
        .toc-button:hover::after {
          width: 100%;
          height: 100%;
        }
      `}</style>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl toc-icon">📑</span>
          <span className="transition-all duration-300">Contents</span>
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="toc-toggle text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 text-2xl leading-none font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 hover:rotate-90 hover:scale-110 active:scale-95"
          aria-label="Toggle table of contents"
        >
          <span className={`toc-icon inline-block transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`}>
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </div>
      
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="space-y-1 overflow-y-auto max-h-[550px] pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
          {headings.map((heading, index) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              style={{ '--item-index': index }}
              className={`toc-heading-item toc-button block w-full text-left text-sm transition-all duration-300 ease-out py-2.5 px-3 rounded-lg transform hover:translate-x-1 ${
                heading.level === 1 ? 'font-bold text-base' : ''
              } ${
                heading.level === 2 ? 'pl-6 font-medium' : ''
              } ${
                heading.level === 3 ? 'pl-9 text-xs' : ''
              } ${
                activeId === heading.id
                  ? 'active-heading text-blue-600 dark:text-blue-400 font-bold bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 border-l-4 border-blue-600 shadow-md scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700/70 dark:hover:to-gray-700/40 border-l-4 border-transparent hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
              }`}
            >
              <span className="relative z-10">{heading.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;
