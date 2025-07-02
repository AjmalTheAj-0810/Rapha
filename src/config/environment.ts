/**
 * Environment Configuration
 * Centralized configuration management for the healthcare application
 */

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
    description: string;
  };
  features: {
    analytics: boolean;
    chat: boolean;
    notifications: boolean;
    exerciseTracking: boolean;
  };
  development: {
    debugMode: boolean;
    logLevel: string;
  };
  urls: {
    frontend: string;
    backend: string;
  };
  auth: {
    tokenStorageKey: string;
    userStorageKey: string;
    sessionTimeout: number;
  };
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  ui: {
    chartAnimationDuration: number;
    analyticsRefreshInterval: number;
    notificationTimeout: number;
    maxNotifications: number;
  };
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvBool = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

const getEnvNumber = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:12000/api'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 10000),
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Healthcare Management System'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    description: getEnvVar('VITE_APP_DESCRIPTION', 'Comprehensive healthcare management platform'),
  },
  features: {
    analytics: getEnvBool('VITE_ENABLE_ANALYTICS', true),
    chat: getEnvBool('VITE_ENABLE_CHAT', true),
    notifications: getEnvBool('VITE_ENABLE_NOTIFICATIONS', true),
    exerciseTracking: getEnvBool('VITE_ENABLE_EXERCISE_TRACKING', true),
  },
  development: {
    debugMode: getEnvBool('VITE_DEBUG_MODE', true),
    logLevel: getEnvVar('VITE_LOG_LEVEL', 'debug'),
  },
  urls: {
    frontend: getEnvVar('VITE_FRONTEND_URL', 'http://localhost:12001'),
    backend: getEnvVar('VITE_BACKEND_URL', 'http://localhost:12000'),
  },
  auth: {
    tokenStorageKey: getEnvVar('VITE_TOKEN_STORAGE_KEY', 'healthcare_auth_token'),
    userStorageKey: getEnvVar('VITE_USER_STORAGE_KEY', 'healthcare_user_data'),
    sessionTimeout: getEnvNumber('VITE_SESSION_TIMEOUT', 3600000),
  },
  upload: {
    maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 10485760), // 10MB
    allowedFileTypes: getEnvVar('VITE_ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,application/pdf,text/plain').split(','),
  },
  pagination: {
    defaultPageSize: getEnvNumber('VITE_DEFAULT_PAGE_SIZE', 20),
    maxPageSize: getEnvNumber('VITE_MAX_PAGE_SIZE', 100),
  },
  ui: {
    chartAnimationDuration: getEnvNumber('VITE_CHART_ANIMATION_DURATION', 1000),
    analyticsRefreshInterval: getEnvNumber('VITE_ANALYTICS_REFRESH_INTERVAL', 30000),
    notificationTimeout: getEnvNumber('VITE_NOTIFICATION_TIMEOUT', 5000),
    maxNotifications: getEnvNumber('VITE_MAX_NOTIFICATIONS', 50),
  },
};

// Development utilities
export const isDevelopment = config.development.debugMode;
export const isProduction = !isDevelopment;

// API utilities
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl.endsWith('/') 
    ? config.api.baseUrl.slice(0, -1) 
    : config.api.baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Logging utility
export const log = {
  debug: (...args: any[]) => {
    if (config.development.debugMode && config.development.logLevel === 'debug') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (config.development.debugMode) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

export default config;