import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Calendar, 
  Activity, 
  MessageSquare, 
  AlertCircle,
  Info,
  Trash2,
  Settings,
  Loader
} from 'lucide-react';
import apiService from '../../services/api';

const NotificationCenter = ({ isOpen, onClose, className = '' }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = filter !== 'all' ? { is_read: filter === 'read' } : {};
      const response = await apiService.getNotifications(params);
      setNotifications(response.results || response);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [notificationId]: true }));
      
      await apiService.quickAction('mark_notification_read', { 
        notification_id: notificationId 
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await apiService.markAllNotificationsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [notificationId]: true }));
      
      await apiService.quickAction('delete_notification', { 
        notification_id: notificationId 
      });
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'exercise':
        return <Activity className="h-5 w-5 text-green-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-orange-600" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50';
    
    switch (type) {
      case 'appointment':
        return 'bg-blue-50';
      case 'exercise':
        return 'bg-green-50';
      case 'message':
        return 'bg-purple-50';
      case 'reminder':
        return 'bg-orange-50';
      case 'alert':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md max-h-96 overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`flex-1 py-1 px-3 text-sm font-medium rounded-md transition-colors ${
                  filter === filterType
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Actions */}
          {unreadCount > 0 && (
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all read</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={loadNotifications}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredNotifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>
                {filter === 'unread' 
                  ? 'No unread notifications' 
                  : filter === 'read'
                  ? 'No read notifications'
                  : 'No notifications yet'
                }
              </p>
            </div>
          )}

          {!loading && !error && filteredNotifications.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors ${getNotificationBgColor(
                    notification.type,
                    notification.is_read
                  )}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            notification.is_read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${
                            notification.is_read ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 mt-3">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            disabled={actionLoading[notification.id]}
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            {actionLoading[notification.id] ? (
                              <Loader className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            <span>Mark read</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          disabled={actionLoading[notification.id]}
                          className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {actionLoading[notification.id] ? (
                            <Loader className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              onClose();
              // Navigate to full notifications page
              window.location.href = '/notifications';
            }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
          >
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;