import React, { useState, useEffect } from 'react';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState('');

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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-4 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Table of Contents</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Toggle table of contents"
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      {isOpen && (
        <nav className="space-y-2">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left text-sm transition-colors ${
                heading.level === 1 ? 'font-semibold' : ''
              } ${
                heading.level === 2 ? 'pl-4' : ''
              } ${
                heading.level === 3 ? 'pl-8' : ''
              } ${
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
