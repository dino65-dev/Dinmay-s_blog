import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const SiteSettingsContext = createContext();

// Default settings fallback
const defaultSettings = {
  blog_title: "Dinmay's Blog",
  blog_description: "A personal blog about technology, AI, and more",
  author_name: "Dinmay",
  author_bio: "",
  author_avatar: "https://assets-v2.codedesign.ai/storage/v1/object/public/69666207f25d5592fb297096_0af76837/asset-11d4c42a",
  social_twitter: "",
  social_github: "",
  social_linkedin: "",
  footer_text: "© 2025 Dinmay's Blog. All Rights Reserved"
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api.getSiteSettings();
      // Merge with defaults to ensure all fields exist
      setSettings({
        ...defaultSettings,
        ...data,
        // Ensure avatar has a fallback
        author_avatar: data.author_avatar || defaultSettings.author_avatar
      });
    } catch (error) {
      console.error('Error fetching site settings:', error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Function to refresh settings (called after admin updates)
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export default SiteSettingsContext;
