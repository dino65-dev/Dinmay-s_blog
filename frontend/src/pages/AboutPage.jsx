import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import GitHubProfile from '../components/GitHubProfile';
import api from '../utils/api';

const AboutPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient transition-colors">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mesh-gradient transition-colors">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient transition-colors">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live from GitHub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            <span className="gradient-text">About Me</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Developer, creator, and lifelong learner. Here's my story.
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass rounded-3xl overflow-hidden shadow-xl">
          <GitHubProfile profile={profile} />
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
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
            <div key={i} className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 font-display">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
