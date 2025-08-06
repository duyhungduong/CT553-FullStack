import axios from "axios";
import { config } from "./config";

export const axiosInstance = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging in development
if (config.ENABLE_DEBUG_LOGS) {
  axiosInstance.interceptors.request.use((config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (config.ENABLE_DEBUG_LOGS) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (config.ENABLE_DEBUG_LOGS) {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    }
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access - redirecting to login');
      // Note: Don't redirect here as it might interfere with Clerk
    }
    
    if (error.response?.status === 429) {
      // Handle rate limiting
      console.warn('Rate limit exceeded - please slow down requests');
    }
    
    if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

