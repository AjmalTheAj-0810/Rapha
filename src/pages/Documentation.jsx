import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, Download, Code, Users, Settings, Activity } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { config } from '../config/environment.js';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Healthcare Management System</h2>
          <p className="text-gray-600 mb-6">
            Welcome to the {config.app.name} documentation. This comprehensive platform provides 
            healthcare professionals and patients with tools for appointment management, exercise tracking, 
            communication, and progress monitoring.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Patients</h3>
              <p className="text-gray-600">
                Book appointments, track exercise progress, communicate with physiotherapists, 
                and monitor your recovery journey.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <Activity className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Physiotherapists</h3>
              <p className="text-gray-600">
                Manage patient appointments, create exercise plans, track patient progress, 
                and analyze treatment outcomes.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Account Setup</h3>
              <p className="text-gray-600 mb-4">
                Create your account by registering as either a patient or physiotherapist. 
                Complete your profile information to get started.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Dashboard Overview</h3>
              <p className="text-gray-600 mb-4">
                Your dashboard provides a quick overview of upcoming appointments, exercise progress, 
                and recent messages. Customize your view based on your role and preferences.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Navigation</h3>
              <p className="text-gray-600 mb-4">
                Use the sidebar navigation to access different sections of the application. 
                The navigation adapts based on your user role and permissions.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Reference</h2>
          <p className="text-gray-600 mb-6">
            The platform provides a comprehensive REST API for integration with external systems.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Base URL</h3>
            <code className="text-sm bg-gray-200 px-2 py-1 rounded">
              {config.api.baseUrl}
            </code>
          </div>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Authentication</h4>
              <p className="text-gray-600 text-sm">
                All API requests require authentication using Bearer tokens.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Endpoints</h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• <code>/auth/</code> - Authentication endpoints</li>
                <li>• <code>/appointments/</code> - Appointment management</li>
                <li>• <code>/exercises/</code> - Exercise library and plans</li>
                <li>• <code>/users/</code> - User management</li>
                <li>• <code>/analytics/</code> - Analytics and reporting</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Documentation">
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <nav className="space-y-2">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {sections.find(section => section.id === activeSection)?.content}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Documentation;