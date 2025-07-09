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
  const [registrationData, setRegistrationData] = useState(null);

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

  // Set temporary registration data for multi-step registration
  const setTempRegistrationData = (data) => {
    setRegistrationData(data);
    // Also set temporary user data for UI purposes
    setUser({ ...data, role: data.role });
  };

  // Complete registration with personal information
  const completeRegistration = async (personalInfo) => {
    try {
      setLoading(true);
      
      if (!registrationData) {
        throw new Error('Registration data not found');
      }

      // Combine registration data with personal information
      const completeUserData = {
        username: registrationData.email, // Use email as username
        email: registrationData.email,
        password: registrationData.password,
        user_type: registrationData.role,
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        phone_number: personalInfo.phoneNumber,
        date_of_birth: personalInfo.dateOfBirth,
        address: `${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zip}, ${personalInfo.country}`,
      };

      const response = await apiService.register(completeUserData);
      
      if (response.token) {
        apiService.setToken(response.token);
        
        // Use user data from registration response or get from API
        let userData = response.user;
        if (!userData) {
          try {
            userData = await apiService.getCurrentUser();
          } catch (error) {
            // If getCurrentUser fails, create user data from response
            userData = {
              id: response.id || 1,
              username: completeUserData.username,
              email: completeUserData.email,
              user_type: completeUserData.user_type,
              first_name: completeUserData.first_name,
              last_name: completeUserData.last_name,
              phone_number: completeUserData.phone_number,
              date_of_birth: completeUserData.date_of_birth,
              address: completeUserData.address,
            };
          }
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store user data in localStorage
        localStorage.setItem(config.auth.userStorageKey, JSON.stringify(userData));
        
        // Clear registration data
        setRegistrationData(null);
        
        log.info('User registered successfully');
        return userData;
      }
    } catch (error) {
      log.error('Registration failed:', error);
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
    registrationData,
    login,
    register,
    logout,
    setTempRegistrationData,
    completeRegistration,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};