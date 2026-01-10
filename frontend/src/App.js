import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load pages for faster initial load (code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AllPostsPage = lazy(() => import('./pages/AllPostsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

// Lightweight loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/post/:slug" element={<BlogPostPage />} />
                <Route path="/all-posts" element={<AllPostsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </div>
  );
}

export default App;
