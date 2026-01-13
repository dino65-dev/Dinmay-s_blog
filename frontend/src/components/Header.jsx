import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/all-posts', label: 'Posts', icon: '📚' },
    { path: '/about', label: 'About', icon: '👤' },
    { path: '/admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-3 glass shadow-lg shadow-indigo-500/5' 
          : 'py-5 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow duration-300">
                  <span className="text-white font-bold text-lg font-display">D</span>
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold font-display">
                  <span className="gradient-text">Dinmay's</span>
                  <span className="text-gray-800 dark:text-white ml-1">Blog</span>
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </span>
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Auth indicator */}
              {isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Admin
                </div>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center group overflow-hidden"
                aria-label="Toggle theme"
              >
                <div className={`absolute transition-all duration-500 ${
                  theme === 'dark' 
                    ? 'rotate-0 opacity-100' 
                    : 'rotate-90 opacity-0'
                }`}>
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className={`absolute transition-all duration-500 ${
                  theme === 'dark' 
                    ? '-rotate-90 opacity-0' 
                    : 'rotate-0 opacity-100'
                }`}>
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex flex-col items-center justify-center gap-1.5"
                aria-label="Toggle menu"
              >
                <span className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`} />
                <span className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`} />
                <span className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
};

export default Header;
