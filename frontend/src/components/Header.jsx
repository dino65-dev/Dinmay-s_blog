import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <h1 className="text-2xl font-bold text-black">Dinmay's Blog</h1>
          <span className="text-2xl">🌕</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/search" className="text-black hover:opacity-70 transition-opacity">
            Search
          </Link>
          <Link to="/about" className="text-black hover:opacity-70 transition-opacity">
            About
          </Link>
          <Link to="/all-posts" className="text-black hover:opacity-70 transition-opacity">
            All Posts
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;