import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api.js';
import { config, log } from '../config/environment.js';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(config.auth.tokenStorageKey);
      const userData = localStorage.getItem(config.auth.userStorageKey);
      
      if (token && userData) {
        try {
          apiService.setToken(token);
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          log.info('User authenticated from storage');
        } catch (error) {
          log.error('Auth check failed:', error);
          localStorage.removeItem(config.auth.tokenStorageKey);
          localStorage.removeItem(config.auth.userStorageKey);
          apiService.removeToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await apiService.login({ username, password });
      
      if (response.token) {
        apiService.setToken(response.token);
        
        // Get user data after successful login
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store user data in localStorage
        localStorage.setItem(config.auth.userStorageKey, JSON.stringify(userData));
        log.info('User logged in successfully');
      }
    } catch (error) {
      log.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await apiService.register(userData);
      log.info('User registered successfully');
    } catch (error) {
      log.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      apiService.removeToken();
      localStorage.removeItem(config.auth.tokenStorageKey);
      localStorage.removeItem(config.auth.userStorageKey);
      setUser(null);
      setIsAuthenticated(false);
      log.info('User logged out successfully');
    } catch (error) {
      log.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};