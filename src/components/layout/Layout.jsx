import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../dashboard/Navbar';
import Sidebar from './Sidebar.jsx';
import { config } from '../../config/environment.js';

const Layout = ({ 
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