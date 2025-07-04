import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { config, log } from '../config/environment';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'patient' | 'physiotherapist' | 'admin';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<any>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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

  const login = async (credentials: any): Promise<any> => {
    try {
      setLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.token) {
        apiService.setToken(response.token);
        
        // If user data is already in the response, use it
        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem(config.auth.userStorageKey, JSON.stringify(response.user));
          log.info('User logged in successfully');
          return response;
        } else {
          // Otherwise, get user data after successful login
          try {
            const userData = await apiService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem(config.auth.userStorageKey, JSON.stringify(userData));
            log.info('User logged in successfully');
            return { ...response, user: userData };
          } catch (userError) {
            log.error('Failed to get user data:', userError);
            return response;
          }
        }
      }
      return response;
    } catch (error) {
      log.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
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

  const logout = (): void => {
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

  const value: AuthContextType = {
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