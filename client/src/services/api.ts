import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if:
    // 1. It's a 401 error
    // 2. It's not the login/signup endpoints
    // 3. User has a token (meaning they were logged in)
    const isAuthEndpoint = error.config?.url?.includes('/auth/google') || 
                           error.config?.url?.includes('/auth/signup');
    const hasToken = localStorage.getItem('token');
    
    if (error.response?.status === 401 && !isAuthEndpoint && hasToken) {
      // Unauthorized - clear token and redirect to login
      console.error('Authentication failed, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    // Log errors for debugging
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status, error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

