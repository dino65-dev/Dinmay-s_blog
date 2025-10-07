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
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading GitHub profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">About</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time GitHub profile - Always up to date!
          </p>
        </div>
        <GitHubProfile profile={profile} />
      </main>
    </div>
  );
};

export default AboutPage;