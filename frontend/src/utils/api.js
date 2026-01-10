import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with optimized settings
const axiosInstance = axios.create({
  baseURL: API,
  timeout: 15000, // 15 second timeout
});

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Cloudinary URL optimizer utility
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const { width, height, quality = 'auto', format = 'auto' } = options;
  let transforms = `q_${quality},f_${format}`;
  
  if (width) transforms += `,w_${width}`;
  if (height) transforms += `,h_${height}`;
  if (width || height) transforms += ',c_fill';
  
  return url.replace('/upload/', `/upload/${transforms}/`);
};

// Blog Posts API
export const api = {
  // Get all posts
  getPosts: async () => {
    const response = await axiosInstance.get('/posts');
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
    
    const response = await axiosInstance.get(`/search/posts?${params.toString()}`);
    return response.data;
  },

  // Get post by slug
  getPostBySlug: async (slug) => {
    const response = await axiosInstance.get(`/posts/${slug}`);
    return response.data;
  },

  // Create a new post (requires auth)
  createPost: async (postData) => {
    const response = await axiosInstance.post('/posts', postData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Update a post (requires auth)
  updatePost: async (postId, postData) => {
    const response = await axiosInstance.put(`/posts/${postId}`, postData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Delete a post (requires auth)
  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Auth API
  login: async (password) => {
    const response = await axiosInstance.post('/auth/login', { password });
    return response.data;
  },

  // About API
  getAbout: async () => {
    const response = await axiosInstance.get('/about');
    return response.data;
  },

  // Update about (requires auth)
  updateAbout: async (content) => {
    const response = await axiosInstance.put('/about', { content }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Comments API
  // Get all comments for a post
  getComments: async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}/comments`);
    return response.data;
  },

  // Create a comment (no auth required)
  createComment: async (postId, commentData) => {
    const response = await axiosInstance.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  },

  // Delete a comment (requires auth)
  deleteComment: async (commentId) => {
    const response = await axiosInstance.delete(`/comments/${commentId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // GitHub API
  getGitHubProfile: async (username) => {
    const response = await axiosInstance.get(`/github/profile/${username}`);
    return response.data;
  },

  // File Upload API
  // Upload a single image file
  uploadImage: async (file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/upload/image', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout for uploads
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined,
    });
    return response.data;
  },

  // Upload large file in chunks
  uploadChunked: async (file, onProgress = null) => {
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let fileId = null;
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('file', new Blob([chunk]), file.name);
      formData.append('chunk_number', i);
      formData.append('total_chunks', totalChunks);
      if (fileId) formData.append('file_id', fileId);
      
      const response = await axiosInstance.post('/upload/chunk', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout per chunk
      });
      
      if (i === 0 && response.data.file_id) {
        fileId = response.data.file_id;
      }
      
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
      
      if (response.data.complete) {
        return response.data;
      }
    }
  },

  // Get uploaded file URL
  getUploadUrl: (filename) => {
    return `${API}/uploads/${filename}`;
  },

  // Delete uploaded file (requires auth)
  deleteUpload: async (filename) => {
    const response = await axiosInstance.delete(`/uploads/${filename}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get upload status (check if Cloudinary is configured)
  getUploadStatus: async () => {
    const response = await axiosInstance.get('/upload/status');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await axiosInstance.get('/health');
    return response.data;
  },
};

export default api;
