import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  MessageSquare,
  Activity,
  User,
  Bell,
  Users,
  Settings,
  LogOut,
  Stethoscope,
  ClipboardList,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config/environment';

interface SidebarProps {
  userType: 'patient' | 'physiotherapist' | 'admin';
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const getNavigationItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        name: 'Dashboard',
        href: userType === 'patient' ? '/patient-dashboard' : '/physio-dashboard',
        icon: Home,
        enabled: true
      },
      {
        name: 'Appointments',
        href: '/appointments',
        icon: Calendar,
        enabled: true
      },
      {
        name: 'Messages',
        href: userType === 'patient' ? '/patient-chat' : '/physio-chat',
        icon: MessageSquare,
        enabled: config.features.chat
      },
      {
        name: 'Exercises',
        href: '/exercises',
        icon: Activity,
        enabled: config.features.exerciseTracking
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: User,
        enabled: true
      },
      {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell,
        enabled: config.features.notifications
      }
    ];

    // Add role-specific items
    if (userType === 'physiotherapist') {
      baseItems.splice(2, 0, {
        name: 'My Bookings',
        href: '/physio-bookings',
        icon: ClipboardList,
        enabled: true
      });
      
      baseItems.splice(4, 0, {
        name: 'Patients',
        href: '/users',
        icon: Users,
        enabled: true
      });

      if (config.features.analytics) {
        baseItems.splice(5, 0, {
          name: 'Analytics',
          href: '/analytics',
          icon: BarChart3,
          enabled: true
        });
      }
    }

    if (userType === 'patient') {
      baseItems.splice(2, 0, {
        name: 'Book Session',
        href: '/booking',
        icon: Stethoscope,
        enabled: true
      });
    }

    if (userType === 'admin') {
      baseItems.push(
        {
          name: 'User Management',
          href: '/users',
          icon: Users,
          enabled: true
        },
        {
          name: 'System Settings',
          href: '/settings',
          icon: Settings,
          enabled: true
        },
        {
          name: 'Documentation',
          href: '/docs',
          icon: BookOpen,
          enabled: true
        }
      );
    }

    return baseItems.filter(item => item.enabled);
  };

  const navigationItems = getNavigationItems();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500">
          <h2 className="text-xl font-bold text-white truncate">
            {config.app.name}
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  active
                    ? 'bg-emerald-100 text-emerald-700 border-r-2 border-emerald-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 capitalize">
                {userType}
              </p>
              <p className="text-xs text-gray-500">
                v{config.app.version}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;