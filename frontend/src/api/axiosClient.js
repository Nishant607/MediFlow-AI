import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to all outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to automatically refresh expired access tokens
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on login or token refresh endpoints
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/refresh/')
    ) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      if (response.data.refresh) {
        localStorage.setItem('refresh_token', response.data.refresh);
      }

      axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
