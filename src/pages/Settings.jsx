import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Shield, Bell, Database, Globe, Users, Mail } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { config, log } from '../config/environment.js';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: config.app.name,
      siteDescription: config.app.description,
      maintenanceMode: false,
      registrationEnabled: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: config.features.notifications,
      appointmentReminders: true,
      systemAlerts: true,
    },
    security: {
      sessionTimeout: config.auth.sessionTimeout / 1000 / 60, // Convert to minutes
      passwordMinLength: 8,
      requireTwoFactor: false,
      maxLoginAttempts: 5,
    },
    features: {
      chatEnabled: config.features.chat,
      analyticsEnabled: config.features.analytics,
      exerciseTrackingEnabled: config.features.exerciseTracking,
      fileUploadsEnabled: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      log('Settings updated:', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      general: {
        siteName: config.app.name,
        siteDescription: config.app.description,
        maintenanceMode: false,
        registrationEnabled: true,
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: config.features.notifications,
        appointmentReminders: true,
        systemAlerts: true,
      },
      security: {
        sessionTimeout: config.auth.sessionTimeout / 1000 / 60,
        passwordMinLength: 8,
        requireTwoFactor: false,
        maxLoginAttempts: 5,
      },
      features: {
        chatEnabled: config.features.chat,
        analyticsEnabled: config.features.analytics,
        exerciseTrackingEnabled: config.features.exerciseTracking,
        fileUploadsEnabled: true,
      },
    });
  };

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure your healthcare platform settings</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">Settings saved successfully!</p>
          </div>
        )}

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.general.siteDescription}
                onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                <p className="text-sm text-gray-500">Temporarily disable access to the platform</p>
              </div>
              <input
                type="checkbox"
                checked={settings.general.maintenanceMode}
                onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Registration Enabled</label>
                <p className="text-sm text-gray-500">Allow new users to register</p>
              </div>
              <input
                type="checkbox"
                checked={settings.general.registrationEnabled}
                onChange={(e) => handleInputChange('general', 'registrationEnabled', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-sm text-gray-500">Send notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-sm text-gray-500">Send browser push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Appointment Reminders</label>
                <p className="text-sm text-gray-500">Automatic appointment reminders</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.appointmentReminders}
                onChange={(e) => handleInputChange('notifications', 'appointmentReminders', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">System Alerts</label>
                <p className="text-sm text-gray-500">Important system notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.systemAlerts}
                onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Require Two-Factor Authentication</label>
                <p className="text-sm text-gray-500">Mandatory 2FA for all users</p>
              </div>
              <input
                type="checkbox"
                checked={settings.security.requireTwoFactor}
                onChange={(e) => handleInputChange('security', 'requireTwoFactor', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Feature Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Feature Settings</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Chat System</label>
                <p className="text-sm text-gray-500">Enable patient-therapist messaging</p>
              </div>
              <input
                type="checkbox"
                checked={settings.features.chatEnabled}
                onChange={(e) => handleInputChange('features', 'chatEnabled', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Analytics Dashboard</label>
                <p className="text-sm text-gray-500">Advanced analytics and reporting</p>
              </div>
              <input
                type="checkbox"
                checked={settings.features.analyticsEnabled}
                onChange={(e) => handleInputChange('features', 'analyticsEnabled', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Exercise Tracking</label>
                <p className="text-sm text-gray-500">Patient exercise monitoring</p>
              </div>
              <input
                type="checkbox"
                checked={settings.features.exerciseTrackingEnabled}
                onChange={(e) => handleInputChange('features', 'exerciseTrackingEnabled', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">File Uploads</label>
                <p className="text-sm text-gray-500">Allow file attachments</p>
              </div>
              <input
                type="checkbox"
                checked={settings.features.fileUploadsEnabled}
                onChange={(e) => handleInputChange('features', 'fileUploadsEnabled', e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;