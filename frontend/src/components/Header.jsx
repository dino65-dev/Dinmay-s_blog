import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <h1 className="text-2xl font-bold text-black dark:text-white">Dinmay's Blog</h1>
          <span className="text-2xl">{theme === 'dark' ? '🌙' : '🌕'}</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link to="/search" className="text-black dark:text-white hover:opacity-70 transition-opacity text-sm md:text-base">
            Search
          </Link>
          <Link to="/about" className="text-black dark:text-white hover:opacity-70 transition-opacity text-sm md:text-base">
            About
          </Link>
          <Link to="/all-posts" className="text-black dark:text-white hover:opacity-70 transition-opacity text-sm md:text-base">
            All Posts
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;