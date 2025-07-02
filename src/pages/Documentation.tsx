import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, Download, Code, Users, Settings, Activity } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { config } from '../config/environment';

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const docSections: DocSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Healthcare Management System</h2>
          <p className="text-gray-600 leading-relaxed">
            Welcome to the {config.app.name} documentation. This comprehensive platform provides 
            healthcare professionals and patients with tools for appointment management, exercise tracking, 
            communication, and progress monitoring.
          </p>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-800 mb-2">Key Features</h3>
            <ul className="list-disc list-inside text-emerald-700 space-y-1">
              <li>Patient and Physiotherapist dashboards</li>
              <li>Appointment scheduling and management</li>
              <li>Exercise plan creation and tracking</li>
              <li>Real-time messaging and communication</li>
              <li>Progress analytics and reporting</li>
              <li>Notification system</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">For Patients</h4>
              <p className="text-sm text-gray-600">
                Book appointments, track exercise progress, communicate with physiotherapists, 
                and monitor your recovery journey.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">For Physiotherapists</h4>
              <p className="text-sm text-gray-600">
                Manage patient appointments, create exercise plans, track patient progress, 
                and access comprehensive analytics.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Users,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">1. Account Registration</h3>
            <p className="text-gray-600">
              New users can register by clicking the "Register" button on the login page. 
              Choose your account type (Patient or Physiotherapist) during registration.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800">2. Profile Setup</h3>
            <p className="text-gray-600">
              Complete your profile information including personal details, contact information, 
              and professional credentials (for physiotherapists).
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800">3. Dashboard Navigation</h3>
            <p className="text-gray-600">
              Familiarize yourself with the dashboard layout. The sidebar provides quick access 
              to all major features, while the main dashboard shows your personalized overview.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Quick Start Checklist</h4>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Complete your profile information</li>
              <li>Set up notification preferences</li>
              <li>Explore the dashboard features</li>
              <li>Book your first appointment (patients)</li>
              <li>Create your first exercise plan (physiotherapists)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Features Guide',
      icon: Activity,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Features Guide</h2>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Appointment Management</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Book appointments with available physiotherapists</li>
                <li>View upcoming and past appointments</li>
                <li>Reschedule or cancel appointments</li>
                <li>Add notes and feedback after sessions</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Exercise Tracking</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>View assigned exercise plans</li>
                <li>Log exercise completion and progress</li>
                <li>Rate difficulty and track pain levels</li>
                <li>View progress analytics and trends</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Communication</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Send and receive messages</li>
                <li>Share files and documents</li>
                <li>Get real-time notifications</li>
                <li>Participate in group discussions</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Analytics & Reports</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>View progress charts and trends</li>
                <li>Generate progress reports</li>
                <li>Track exercise streaks and achievements</li>
                <li>Monitor patient outcomes (physiotherapists)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: Code,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">API Reference</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Base URL</h3>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {config.api.baseUrl}
            </code>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Authentication</h3>
            <p className="text-gray-600">
              All API requests require authentication using Token-based authentication. 
              Include the token in the Authorization header:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <code>Authorization: Token your_auth_token_here</code>
            </div>

            <h3 className="text-lg font-semibold text-gray-800">Common Endpoints</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm">GET /dashboard/stats/</span>
                <span className="text-sm text-gray-600">Dashboard statistics</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm">GET /appointments/</span>
                <span className="text-sm text-gray-600">List appointments</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm">POST /exercises/progress/</span>
                <span className="text-sm text-gray-600">Log exercise progress</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm">GET /search/</span>
                <span className="text-sm text-gray-600">Global search</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="/API_ENDPOINTS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Full API Documentation
              </a>
              <a
                href="/IMPLEMENTATION_SUMMARY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Implementation Guide
              </a>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'admin',
      title: 'Admin Guide',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Administrator Guide</h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
            <p className="text-gray-600">
              Administrators can manage user accounts, assign roles, and monitor system usage 
              through the Users section.
            </p>

            <h3 className="text-lg font-semibold text-gray-800">System Settings</h3>
            <p className="text-gray-600">
              Configure system-wide settings including notifications, security policies, 
              and feature toggles through the Settings page.
            </p>

            <h3 className="text-lg font-semibold text-gray-800">Analytics & Monitoring</h3>
            <p className="text-gray-600">
              Monitor system performance, user engagement, and generate reports for 
              organizational insights.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">Security Best Practices</h4>
            <ul className="list-disc list-inside text-amber-700 space-y-1">
              <li>Regularly review user access permissions</li>
              <li>Enable two-factor authentication</li>
              <li>Monitor system logs for suspicious activity</li>
              <li>Keep the system updated with latest security patches</li>
              <li>Backup data regularly</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">System Health</h4>
              <p className="text-sm text-gray-600">
                Monitor system health through the health check endpoint and dashboard metrics.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Data Management</h4>
              <p className="text-sm text-gray-600">
                Manage data retention policies, exports, and compliance requirements.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Documentation">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-6">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {filteredSections.find(section => section.id === activeSection)?.content}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Documentation;