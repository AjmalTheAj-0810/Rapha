import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import apiService from '../../services/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

const ApiIntegrationTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: 'pending' | 'success' | 'error', message?: string, data?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      } else {
        return [...prev, { name, status, message, data }];
      }
    });
  };

  const runApiTests = async () => {
    setIsRunning(true);
    setTests([]);

    const testCases = [
      {
        name: 'Health Check',
        test: () => apiService.healthCheck()
      },
      {
        name: 'Dashboard Stats',
        test: () => apiService.getDashboardStats()
      },
      {
        name: 'Recent Activity',
        test: () => apiService.getRecentActivity(5)
      },
      {
        name: 'Current User',
        test: () => apiService.getCurrentUser()
      },
      {
        name: 'Appointments',
        test: () => apiService.getAppointments()
      },
      {
        name: 'Exercises',
        test: () => apiService.getExercises()
      },
      {
        name: 'Exercise Plans',
        test: () => apiService.getExercisePlans()
      },
      {
        name: 'Notifications',
        test: () => apiService.getNotifications()
      },
      {
        name: 'Global Search',
        test: () => apiService.searchGlobal('test')
      },
      {
        name: 'Quick Actions',
        test: () => apiService.quickAction('get_unread_count')
      }
    ];

    for (const testCase of testCases) {
      updateTest(testCase.name, 'pending');
      
      try {
        const result = await testCase.test();
        updateTest(testCase.name, 'success', 'API call successful', result);
      } catch (error: any) {
        updateTest(testCase.name, 'error', error.message || 'API call failed');
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const totalTests = tests.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Integration Test</h2>
        <p className="text-gray-600">Test all API endpoints to verify integration</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={runApiTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Tests...' : 'Run API Tests'}
        </button>

        {tests.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {successCount} passed</span>
            <span className="text-red-600">✗ {errorCount} failed</span>
            <span className="text-gray-600">Total: {totalTests}</span>
          </div>
        )}
      </div>

      {tests.length > 0 && (
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium text-gray-900">{test.name}</span>
                </div>
                <span className="text-sm text-gray-600 capitalize">{test.status}</span>
              </div>
              
              {test.message && (
                <div className="mt-2 text-sm text-gray-700">
                  {test.message}
                </div>
              )}
              
              {test.data && test.status === 'success' && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    View Response Data
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {tests.length === 0 && !isRunning && (
        <div className="text-center py-12 text-gray-500">
          Click "Run API Tests" to start testing all endpoints
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationTest;