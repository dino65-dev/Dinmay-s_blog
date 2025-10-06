const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Blog Posts API
export const blogAPI = {
  // Get all posts
  getAllPosts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  // Search posts with advanced filters
  searchPosts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.contentType) params.append('content_type', filters.contentType);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.order) params.append('order', filters.order);
      
      const response = await fetch(`${API_BASE_URL}/api/search/posts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search posts');
      return await response.json();
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  },

  // Get post by slug
  getPostBySlug: async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${slug}`);
      if (!response.ok) throw new Error('Post not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Create new post (requires auth)
  createPost: async (postData) => {
    return await authFetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Update post (requires auth)
  updatePost: async (postId, postData) => {
    return await authFetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  // Delete post (requires auth)
  deletePost: async (postId) => {
    return await authFetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
    });
  },
};

// Auth API
export const authAPI = {
  // Login
  login: async (password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid password');
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Verify token
  verifyToken: async () => {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      return data.valid;
    } catch (error) {
      return false;
    }
  },
};

// About API
export const aboutAPI = {
  // Get about content
  getAbout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/about`);
      if (!response.ok) throw new Error('Failed to fetch about content');
      return await response.json();
    } catch (error) {
      console.error('Error fetching about:', error);
      return { content: '# About\n\nWelcome to the blog!' };
    }
  },

  // Update about content (requires auth)
  updateAbout: async (content) => {
    return await authFetch(`${API_BASE_URL}/api/about`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },
};