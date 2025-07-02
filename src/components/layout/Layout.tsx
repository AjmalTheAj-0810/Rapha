import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../dashboard/Navbar';
import Sidebar from './Sidebar';
import { config } from '../../config/environment';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = config.app.name,
  showSidebar = true,
  className = ''
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {showSidebar && user && (
          <Sidebar userType={user.user_type} />
        )}
        
        <main className={`flex-1 ${showSidebar ? 'ml-64' : ''} ${className}`}>
          <div className="p-6">
            {title && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;