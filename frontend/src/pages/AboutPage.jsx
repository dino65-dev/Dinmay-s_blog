import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import MarkdownRenderer from '../components/MarkdownRenderer';
import api from '../utils/api';

const AboutPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await api.getAbout();
        setContent(data.content);
      } catch (error) {
        console.error('Error fetching about content:', error);
        setContent('# About\n\nWelcome to the blog!');
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <MarkdownRenderer content={content} />
      </main>
    </div>
  );
};

export default AboutPage;