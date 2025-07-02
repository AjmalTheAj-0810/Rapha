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
  login: (credentials: { email?: string; username?: string; password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
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

  const login = async (credentials: { email?: string; username?: string; password: string }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setLoading(true);
      
      // Use email as username if provided
      const loginData = {
        username: credentials.email || credentials.username || '',
        password: credentials.password
      };
      
      const response = await apiService.login(loginData);
      
      if (response.token) {
        apiService.setToken(response.token);
        
        // Get user data after successful login
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store user data in localStorage
        localStorage.setItem(config.auth.userStorageKey, JSON.stringify(userData));
        log.info('User logged in successfully');
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error: any) {
      log.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      return { success: false, error: errorMessage };
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