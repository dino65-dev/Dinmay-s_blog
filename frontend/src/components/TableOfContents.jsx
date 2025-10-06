import React, { useState, useEffect } from 'react';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState('');

  console.log('TableOfContents rendered, content length:', content?.length);
  console.log('Headings found:', headings.length);

  useEffect(() => {
    // Extract headings from content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headingElements = tempDiv.querySelectorAll('h1, h2, h3');
    const headingsData = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      const level = parseInt(heading.tagName.substring(1));
      const text = heading.textContent;
      
      return { id, level, text };
    });
    
    setHeadings(headingsData);
  }, [content]);

  useEffect(() => {
    // Add IDs to actual headings in the DOM
    const actualHeadings = document.querySelectorAll('.blog-content h1, .blog-content h2, .blog-content h3');
    actualHeadings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

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
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 p-5 transition-colors shadow-md">
        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">📑 Table of Contents</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No headings found in this post.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-600 p-5 transition-colors shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">📑</span>
          <span>Contents</span>
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-2xl leading-none font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle table of contents"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      {isOpen && (
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left text-sm transition-all duration-200 py-2 px-3 rounded-md ${
                heading.level === 1 ? 'font-bold text-base' : ''
              } ${
                heading.level === 2 ? 'pl-6 font-medium' : ''
              } ${
                heading.level === 3 ? 'pl-9 text-xs' : ''
              } ${
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-600'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/70 border-l-4 border-transparent'
              }`}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default TableOfContents;
