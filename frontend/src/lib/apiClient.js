import axios from 'axios';

// Create an Axios instance with base URL from environment variables.
// In Vite, environment variables prefixed with VITE_ are exposed to the client.
// Ensure you have a .env file with VITE_API_BASE_URL defined.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token if present.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for global error handling.
apiClient.interceptors.response.use((response) => response, (error) => {
  // You can add custom error handling logic here, e.g., logout on 401.
  if (error.response?.status === 401) {
    // Optionally clear token and redirect to login.
    localStorage.removeItem('authToken');
  }
  return Promise.reject(error);
});

export default apiClient;
