import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { login as loginApi, getCurrentUser as getCurrentUserApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Axios Authorization header interceptor
  useEffect(() => {
    const interceptor = axiosClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    return () => {
      axiosClient.interceptors.request.eject(interceptor);
    };
  }, []);

  // Fetch current user if token exists on initial app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const user = await getCurrentUserApi();
          setCurrentUser(user);
          setRole(user.role);
        } catch (error) {
          console.error('Session restoration failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginApi({ email, password });
      const { access, refresh, user } = data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setAccessToken(access);
      setRefreshToken(refresh);
      setCurrentUser(user);
      setRole(user.role);
      setIsLoading(false);
      return user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        currentUser,
        role,
        isLoading,
        login,
        logout,
        setCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
