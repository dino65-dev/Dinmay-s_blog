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

  if (headings.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base text-gray-900 dark:text-white">📑 Table of Contents</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-xl leading-none"
          aria-label="Toggle table of contents"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      {isOpen && (
        <nav className="space-y-2.5">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left text-sm transition-all duration-200 py-1 px-2 rounded ${
                heading.level === 1 ? 'font-semibold' : ''
              } ${
                heading.level === 2 ? 'pl-4' : ''
              } ${
                heading.level === 3 ? 'pl-8 text-xs' : ''
              } ${
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
