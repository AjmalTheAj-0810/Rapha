import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Calendar, 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  Settings,
  Search,
  Activity,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlobalSearch from '../search/GlobalSearch';
import NotificationCenter from '../notifications/NotificationCenter';
import apiService from '../../services/api';

const EnhancedNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [healthStatus, setHealthStatus] = useState('healthy');
  
  useEffect(() => {
    loadUnreadNotifications();
    checkSystemHealth();
    
    // Set up periodic checks
    const notificationInterval = setInterval(loadUnreadNotifications, 30000); // Every 30 seconds
    const healthInterval = setInterval(checkSystemHealth, 60000); // Every minute
    
    return () => {
      clearInterval(notificationInterval);
      clearInterval(healthInterval);
    };
  }, []);

  const loadUnreadNotifications = async () => {
    try {
      const response = await apiService.getUnreadNotificationCount();
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const health = await apiService.healthCheck();
      setHealthStatus(health.status || 'healthy');
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus('unhealthy');
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  const handleKeyboardShortcuts = (e) => {
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(true);
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setIsNotificationOpen(false);
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, []);

  const isPatient = user?.role === 'patient';
  const isPhysiotherapist = user?.role === 'physiotherapist';
  const isAdmin = user?.role === 'admin';
  
  const getNavItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        icon: LayoutDashboard,
        path: isPatient ? '/patient-dashboard' : isPhysiotherapist ? '/physio-dashboard' : '/admin-dashboard'
      }
    ];

    if (isPatient) {
      return [
        ...baseItems,
        {
          name: 'Exercises',
          icon: Activity,
          path: '/exercises'
        },
        {
          name: 'Appointments',
          icon: Calendar,
          path: '/appointments'
        },
        {
          name: 'Booking',
          icon: Calendar,
          path: '/booking'
        },
        {
          name: 'Chat',
          icon: MessageCircle,
          path: '/patient-chat'
        },
        {
          name: 'Analytics',
          icon: BarChart3,
          path: '/analytics'
        }
      ];
    }

    if (isPhysiotherapist) {
      return [
        ...baseItems,
        {
          name: 'Patients',
          icon: Users,
          path: '/patients'
        },
        {
          name: 'Appointments',
          icon: Calendar,
          path: '/physio-bookings'
        },
        {
          name: 'Chat',
          icon: MessageCircle,
          path: '/physio-chat'
        },
        {
          name: 'Analytics',
          icon: BarChart3,
          path: '/analytics'
        }
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        {
          name: 'Users',
          icon: Users,
          path: '/users'
        },
        {
          name: 'Analytics',
          icon: BarChart3,
          path: '/analytics'
        },
        {
          name: 'Settings',
          icon: Settings,
          path: '/settings'
        }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Rapha</span>
              </Link>
              
              {/* System Health Indicator */}
              <div className={`w-2 h-2 rounded-full ${
                healthStatus === 'healthy' ? 'bg-green-500' : 
                healthStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} title={`System status: ${healthStatus}`}></div>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Search (Cmd+K)"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Search</span>
                <span className="hidden lg:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">⌘K</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden mt-4">
            <div className="flex space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Global Search Modal */}
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />

      {/* Click outside handler for profile dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default EnhancedNavbar;