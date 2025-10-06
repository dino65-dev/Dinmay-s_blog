import React from 'react';
import Header from '../components/Header';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { mockAboutContent } from '../mockData';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <MarkdownRenderer content={mockAboutContent} />
      </main>
    </div>
  );
};

export default AboutPage;