import axios from 'axios';

// The documentation states the base URL is https://test.liquidmatics.co.tz/api/users
const API_BASE_URL = 'https://test.liquidmatics.co.tz/api/users';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'user';
  isActive: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request Interceptor: Attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem('auth_token');
    let token = rawToken;

    // Defensive check: if token was accidentally stored as [object Object]
    if (token === '[object Object]') {
      console.error('[API] Token is "[object Object]". This indicates the login response was not parsed correctly.');
      token = null;
    }

    if (token) {
      // Standard Bearer token format
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authHeader;
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
      authHeader: config.headers.Authorization ? 'Present' : 'Missing'
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Detailed logging and error mapping
api.interceptors.response.use(
  (response) => {
    console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data;
    
    // Extract the most useful error message
    let errorMessage = 'An unexpected error occurred';
    if (errorData) {
      errorMessage = errorData.message || errorData.error || (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status,
      message: errorMessage,
      fullResponse: errorData,
      requestHeaders: error.config?.headers
    });

    // Special handling for 401 to help debug token issues
    if (status === 401) {
      console.warn('Unauthorized: Token rejected by server. Possible issues: Invalid format, expired, or wrong header key.');
    }

    // Special handling for 500 to help debug server crashes
    if (status === 500) {
      console.error('Server Error (500): The backend encountered an unhandled exception.');
    }

    // Attach friendly message for UI components
    error.friendlyMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

export const userService = {
  // Token Management
  setToken: (token: any) => {
    if (token) {
      // Ensure we store a string, and try to extract from common object structures
      let tokenString = '';
      if (typeof token === 'string') {
        tokenString = token;
      } else if (token.token) {
        tokenString = token.token;
      } else if (token.access_token) {
        tokenString = token.access_token;
      } else {
        tokenString = JSON.stringify(token);
      }
      localStorage.setItem('auth_token', tokenString);
    } else {
      localStorage.removeItem('auth_token');
    }
  },

  getToken: () => localStorage.getItem('auth_token'),

  // PUBLIC ROUTES
  register: async (userData: { username: string; email: string; password: string; role: string }) => {
    // POST https://test.liquidmatics.co.tz/api/users/register
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    // POST https://test.liquidmatics.co.tz/api/users/login
    const response = await api.post('/login', credentials);
    return response.data; // Expected: { token: "..." }
  },

  // AUTHENTICATED ROUTES
  getProfile: async () => {
    // GET https://test.liquidmatics.co.tz/api/users/profile
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (userData: { username?: string; currentPassword?: string; password?: string }) => {
    // PUT https://test.liquidmatics.co.tz/api/users/profile
    const response = await api.put('/profile', userData);
    return response.data;
  },

  // ADMIN ROUTES
  getAllUsers: async (params?: { page?: number; pageSize?: number; search?: string; role?: string; isActive?: boolean }) => {
    // GET https://test.liquidmatics.co.tz/api/users
    const response = await api.get('', { params });
    return response.data;
  },

  createUser: async (userData: { username: string; email: string; password: string; role: string }) => {
    // POST https://test.liquidmatics.co.tz/api/users
    const response = await api.post('', userData);
    return response.data;
  },

  getUserById: async (id: string | number) => {
    // GET https://test.liquidmatics.co.tz/api/users/:id
    const response = await api.get(`/${id}`);
    return response.data;
  },

  updateUserById: async (id: string | number, userData: any) => {
    // PUT https://test.liquidmatics.co.tz/api/users/:id
    const response = await api.put(`/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string | number) => {
    // DELETE https://test.liquidmatics.co.tz/api/users/:id
    const response = await api.delete(`/${id}`);
    return response.data;
  }
};
