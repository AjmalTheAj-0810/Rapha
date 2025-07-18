import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Bell } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  };

  const colors = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
    warning: 'bg-yellow-500 border-yellow-600',
  };

  const Icon = icons[notification.type] || Info;

  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${colors[notification.type]} text-white p-4 rounded-lg shadow-lg border-l-4 max-w-md w-full`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="font-semibold text-sm">{notification.title}</h4>
          )}
          <p className="text-sm opacity-90">{notification.message}</p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          type: 'info',
          title: 'New Message',
          message: 'You have a new message from Dr. Smith',
          action: { label: 'View', onClick: () => console.log('View message') }
        },
        {
          type: 'success',
          title: 'Exercise Completed',
          message: 'Great job! You completed your daily exercises',
        },
        {
          type: 'warning',
          title: 'Appointment Reminder',
          message: 'Your appointment is in 30 minutes',
        }
      ];

      // 20% chance to show a notification every 10 seconds
      if (Math.random() < 0.2) {
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        addNotification(randomNotification);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;