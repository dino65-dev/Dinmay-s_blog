import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    website: '',
    date: '',
    message: ''
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const featuredPosts = posts.slice(0, 3);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

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
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-script text-xl md:text-2xl text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Dinmay's Blog
          </Link>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {/* Available for work */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Available for work
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl text-gray-800 dark:text-white">Hey,</span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400">
                  <img 
                    src="https://assets-v2.codedesign.ai/storage/v1/object/public/69666207f25d5592fb297096_0af76837/asset-11d4c42a" 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-script text-3xl md:text-4xl text-gray-800 dark:text-white">Dinmay</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-tight">
                Blog Writer &<br />Content Creator
              </h1>
              
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span>Based in</span>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src="https://assets-v2.codedesign.ai/storage/v1/object/public/69666207f25d5592fb297096_0af76837/asset-fc2aae2c" 
                    alt="Globe" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-2xl md:text-3xl text-gray-800 dark:text-white">Global</span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-lg leading-relaxed">
                Welcome to my blog, your go-to source for in-depth analysis and clear explanations of technology, coding, and creative writing. Join me in exploring ideas.
              </p>
              
              <Link
                to="/all-posts"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors group"
              >
                Explore Insights
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            
            {/* Right Content - 3D Spiral Video */}
            <div className="hidden lg:block relative">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-[600px] object-contain"
              >
                <source src="https://assets-v2.codedesign.ai/storage/v1/object/public/68cba0870189df94bdd9c5db_fb13161c/asset-ed557b88" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-600 dark:text-gray-400">Featured</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-semibold text-amber-500 mb-12">
            Latest Blog Posts
          </h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No posts yet. Be the first to create one!</p>
              <Link to="/admin" className="inline-flex items-center gap-2 mt-4 text-amber-500 hover:text-amber-600">
                Create First Post
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.slug}`}
                    className="group block bg-gray-100 dark:bg-gray-900 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-800">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-8">
                <Link
                  to="/all-posts"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  See All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-600 dark:text-gray-400">My Skills and</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-semibold text-amber-500 mb-12">
            Expertise
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-900">
              <img
                src="https://assets-v2.codedesign.ai/storage/v1/object/public/69666207f25d5592fb297096_0af76837/asset-27504a48"
                alt="Skills"
                className="w-full h-auto"
              />
              <div className="absolute bottom-6 left-6">
                <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
                  <img
                    src="https://assets-v2.codedesign.ai/storage/v1/object/public/69666207f25d5592fb297096_0af76837/asset-9b141fed"
                    alt="Icon"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex flex-wrap gap-3">
                {['Blog Writing', 'Content Creation', 'Technical Writing', 'Storytelling'].map((skill) => (
                  <span
                    key={skill}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200 font-medium shadow-sm hover:shadow-md transition-shadow"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              
              <p className="font-script text-2xl md:text-3xl text-gray-700 dark:text-gray-300 leading-relaxed">
                My journey in writing and content creation has equipped me with a unique blend of analytical and communication skills.
              </p>
              
              <Link
                to="/about"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors group"
              >
                View Insights
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Offerings Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-600 dark:text-gray-400">Content</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-semibold text-amber-500 mb-12">
            Offerings
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Blog Posts', icon: '📝' },
              { title: 'Technical Guides', icon: '📚' },
              { title: 'Tutorials', icon: '🎓' },
              { title: 'Code Reviews', icon: '💻' },
              { title: 'Custom Content', icon: '✨' },
              { title: 'Education', icon: '🎯' },
              { title: 'Visualization', icon: '📊' },
              { title: 'Consulting', icon: '💡' },
            ].map((item, index) => (
              <div
                key={index}
                className="group p-6 bg-white dark:bg-gray-900 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-600 dark:text-gray-400">FAQ's</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-semibold text-amber-500 mb-12">
            FAQ's
          </h2>
          
          <div className="space-y-4">
            {[
              { q: 'What topics do you write about?', a: 'I cover technology, coding, AI, web development, and creative writing.' },
              { q: 'How often do you publish new posts?', a: 'I aim to publish new content weekly, focusing on quality and relevance.' },
              { q: 'Is the content free?', a: 'Yes, all content on this blog is freely accessible to everyone.' },
              { q: 'Can I request a specific topic?', a: 'Yes, feel free to suggest topics. I prioritize based on relevance and community interest.' },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
          
          <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Still have questions? Feel free to get in touch today!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-gray-600 dark:text-gray-400">Get in touch today</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-semibold text-amber-500 mb-8">
                Contact
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 dark:text-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 dark:text-white"
                      placeholder="https://yoursite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Preferred Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Message me
                  </button>
                  <button
                    type="button"
                    className="px-8 py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Prefer to book a call
                  </button>
                </div>
              </form>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Dinmay's Blog
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-script text-lg">
                  Sharing ideas, one post at a time.
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                  info@dinmaysblog.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © 2025 Dinmay's Blog. All Rights Reserved
          </p>
          <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <Link to="/all-posts" className="hover:text-amber-500 transition-colors">Posts</Link>
            <Link to="/about" className="hover:text-amber-500 transition-colors">About</Link>
            <Link to="/admin" className="hover:text-amber-500 transition-colors">Admin</Link>
          </nav>
        </div>
      </footer>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-2 py-2 bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl">
          <Link
            to="/"
            className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors"
          >
            Home
          </Link>
          <Link
            to="/all-posts"
            className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors"
          >
            Posts
          </Link>
          <Link
            to="/about"
            className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors"
          >
            About
          </Link>
          <Link
            to="/search"
            className="px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 rounded-full transition-colors"
          >
            Search
          </Link>
          <Link
            to="/admin"
            className="px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-full hover:bg-amber-600 transition-colors"
          >
            Admin
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default HomePage;
