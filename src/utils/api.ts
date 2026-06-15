import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust base URL as needed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically append the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
