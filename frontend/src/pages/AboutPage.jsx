import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import GitHubProfile from '../components/GitHubProfile';
import api from '../utils/api';

const AboutPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogTags, setBlogTags] = useState([]);
  const { theme, toggleTheme } = useTheme();
  const { settings } = useSiteSettings();

  const GITHUB_USERNAME = 'dino65-dev';

  useEffect(() => {
    const fetchGitHubProfile = async () => {
      try {
        const data = await api.getGitHubProfile(GITHUB_USERNAME);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching GitHub profile:', error);
        setError('Failed to load GitHub profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchGitHubProfile();
  }, []);

  // Fetch blog tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await api.getAllTags();
        setBlogTags(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-12 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-script text-lg sm:text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Dinmay's Blog
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Available for work
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 sm:pt-32 pb-24 sm:pb-32 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Live from GitHub</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-amber-500 mb-4">
              About Me
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Developer, creator, and lifelong learner. Here's my story.
            </p>
          </div>

          {/* Error State */}
          {error ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          ) : (
            <>
              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl mb-8 sm:mb-12">
                <GitHubProfile profile={profile} />
              </div>

              {/* Additional Info */}
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
                {[
                  {
                    icon: '💻',
                    title: 'What I Do',
                    description: 'Building software that makes a difference. From web apps to AI tools.'
                  },
                  {
                    icon: '❤️',
                    title: 'What I Love',
                    description: 'Clean code, open source, continuous learning, and helping others grow.'
                  },
                  {
                    icon: '🌟',
                    title: 'My Mission',
                    description: 'To create, share knowledge, and contribute to the developer community.'
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{item.icon}</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>

              {/* Blog Topics/Tags Section */}
              {blogTags.length > 0 && (
                <div className="mt-8 sm:mt-12">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Topics I Write About</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                      Explore my blog posts by topic. Click on any tag to find related articles.
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {blogTags.map((tag, index) => (
                        <Link
                          key={index}
                          to={`/search?tag=${encodeURIComponent(tag)}`}
                          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm sm:text-base font-medium hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Contact Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Let's Connect</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-amber-500 mb-4 sm:mb-6">
              Get in Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
              Interested in collaborating or have questions? Feel free to reach out!
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <a
                href="https://github.com/dino65-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub Profile
              </a>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                View Blog Posts
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">
            © 2025 Dinmay's Blog. All Rights Reserved
          </p>
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
            <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
            <Link to="/admin" className="hover:text-amber-500 transition-colors">Admin</Link>
          </nav>
        </div>
      </footer>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto max-w-lg">
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl">
          <Link to="/" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            Home
          </Link>
          <Link to="/all-posts" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            Posts
          </Link>
          <Link to="/about" className="px-3 sm:px-5 py-2 sm:py-2.5 bg-amber-500 text-white text-xs sm:text-sm font-medium rounded-full">
            About
          </Link>
          <Link to="/search" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            Search
          </Link>
          <Link to="/admin" className="px-3 sm:px-5 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded-full transition-colors">
            Admin
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AboutPage;
