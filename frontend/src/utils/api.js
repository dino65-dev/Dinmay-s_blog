import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios timeout and retry settings
const TIMEOUT = 60000; // 60 seconds for cold starts
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to check if backend is waking up
const isWakeUpError = (error) => {
  if (!error.response) {
    // Network error - likely backend is sleeping
    return true;
  }
  // 502/503 errors often indicate backend is starting up
  return error.response.status === 502 || error.response.status === 503;
};

// Enhanced axios request with retry logic for cold starts
const makeRequest = async (requestFn, retries = MAX_RETRIES) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    // Check if this is a wake-up error and we have retries left
    if (isWakeUpError(error) && retries > 0) {
      console.log(`Backend waking up... Retrying in ${RETRY_DELAY/1000}s (${retries} attempts left)`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Retry the request
      return makeRequest(requestFn, retries - 1);
    }
    
    // If not a wake-up error or out of retries, throw the error
    throw error;
  }
};

// Create axios instance with timeout
const axiosInstance = axios.create({
  timeout: TIMEOUT,
});

// Blog Posts API
export const api = {
  // Get all posts
  getPosts: async () => {
    const response = await makeRequest(() => 
      axiosInstance.get(`${API}/posts`)
    );
    return response.data;
  },

  // Search posts with advanced filters
  searchPosts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.contentType) params.append('content_type', filters.contentType);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.order) params.append('order', filters.order);
    
    const response = await makeRequest(() => 
      axiosInstance.get(`${API}/search/posts?${params.toString()}`)
    );
    return response.data;
  },

  // Get post by slug
  getPostBySlug: async (slug) => {
    const response = await makeRequest(() => 
      axiosInstance.get(`${API}/posts/${slug}`)
    );
    return response.data;
  },

  // Create a new post (requires auth)
  createPost: async (postData) => {
    const response = await makeRequest(() => 
      axiosInstance.post(`${API}/posts`, postData, {
        headers: getAuthHeaders(),
      })
    );
    return response.data;
  },

  // Update a post (requires auth)
  updatePost: async (postId, postData) => {
    const response = await makeRequest(() => 
      axiosInstance.put(`${API}/posts/${postId}`, postData, {
        headers: getAuthHeaders(),
      })
    );
    return response.data;
  },

  // Delete a post (requires auth)
  deletePost: async (postId) => {
    const response = await makeRequest(() => 
      axiosInstance.delete(`${API}/posts/${postId}`, {
        headers: getAuthHeaders(),
      })
    );
    return response.data;
  },

  // Auth API
  login: async (password) => {
    const response = await makeRequest(() => 
      axiosInstance.post(`${API}/auth/login`, { password })
    );
    return response.data;
  },

  // About API
  getAbout: async () => {
    const response = await makeRequest(() => 
      axiosInstance.get(`${API}/about`)
    );
    return response.data;
  },

  // Update about (requires auth)
  updateAbout: async (content) => {
    const response = await makeRequest(() => 
      axiosInstance.put(`${API}/about`, { content }, {
        headers: getAuthHeaders(),
      })
    );
    return response.data;
  },

  // Comments API
  // Get all comments for a post
  getComments: async (postId) => {
    const response = await makeRequest(() => 
      axiosInstance.get(`${API}/posts/${postId}/comments`)
    );
    return response.data;
  },

  // Create a comment (no auth required)
  createComment: async (postId, commentData) => {
    const response = await makeRequest(() => 
      axiosInstance.post(`${API}/posts/${postId}/comments`, commentData)
    );
    return response.data;
  },

  // Delete a comment (requires auth)
  deleteComment: async (commentId) => {
    const response = await makeRequest(() => 
      axiosInstance.delete(`${API}/comments/${commentId}`, {
        headers: getAuthHeaders(),
      })
    );
    return response.data;
  },

  // GitHub API
  getGitHubProfile: async (username) => {
    const response = await makeRequest(() => 
      axiosInstance.get(`${API}/github/profile/${username}`)
    );
    return response.data;
  },

  // Ping endpoint to wake up backend
  ping: async () => {
    try {
      const response = await makeRequest(() => 
        axiosInstance.get(`${API}/`, { timeout: 30000 })
      );
      return response.data;
    } catch (error) {
      console.error('Ping failed:', error);
      return null;
    }
  },

  // Upload API
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await makeRequest(() => 
      axiosInstance.post(`${API}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
    return response.data;
  },

  // List uploaded images
  listUploadedImages: async () => {
    const response = await makeRequest(() => 
      axiosInstance.get(`${API}/upload/images`)
    );
    return response.data;
  },
};

export default api;
