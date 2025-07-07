import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity, 
  BarChart3, 
  PieChart as PieChartIcon,
  Download,
  Filter
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import StatCard from '../components/dashboard/StatCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import apiService from '../services/api.js';

const EnhancedAnalytics = () => {
  const [exerciseAnalytics, setExerciseAnalytics] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [exerciseData, statsData] = await Promise.all([
        apiService.getExerciseAnalytics(timeRange),
        apiService.getDashboardStats()
      ]);
      
      setExerciseAnalytics(exerciseData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      
      // Fallback data for demo purposes
      setExerciseAnalytics({
        completionRate: 85,
        totalExercises: 156,
        averageSessionDuration: 25,
        weeklyProgress: [
          { day: 'Mon', completed: 12, assigned: 15 },
          { day: 'Tue', completed: 18, assigned: 20 },
          { day: 'Wed', completed: 15, assigned: 18 },
          { day: 'Thu', completed: 22, assigned: 25 },
          { day: 'Fri', completed: 19, assigned: 22 },
          { day: 'Sat', completed: 8, assigned: 10 },
          { day: 'Sun', completed: 6, assigned: 8 }
        ],
        exerciseTypes: [
          { name: 'Strength', value: 35, color: '#8884d8' },
          { name: 'Flexibility', value: 25, color: '#82ca9d' },
          { name: 'Cardio', value: 20, color: '#ffc658' },
          { name: 'Balance', value: 20, color: '#ff7300' }
        ],
        monthlyTrend: [
          { month: 'Jan', sessions: 45, completion: 78 },
          { month: 'Feb', sessions: 52, completion: 82 },
          { month: 'Mar', sessions: 48, completion: 85 },
          { month: 'Apr', sessions: 61, completion: 88 },
          { month: 'May', sessions: 55, completion: 85 },
          { month: 'Jun', sessions: 67, completion: 90 }
        ]
      });
      
      setDashboardStats({
        totalPatients: 1247,
        activePatients: 892,
        totalAppointments: 3456,
        completedExercises: 12890,
        averageAdherence: 87,
        monthlyGrowth: 12.5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      exerciseAnalytics,
      dashboardStats,
      exportDate: new Date().toISOString(),
      timeRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout title="Enhanced Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Enhanced Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into patient progress and system performance</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
            
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
            <p className="text-yellow-600 text-sm mt-1">Showing demo data for preview purposes.</p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={dashboardStats?.totalPatients || 0}
            icon={Users}
            trend={`+${dashboardStats?.monthlyGrowth || 0}%`}
            trendUp={true}
          />
          <StatCard
            title="Active Patients"
            value={dashboardStats?.activePatients || 0}
            icon={Activity}
            trend={`${Math.round(((dashboardStats?.activePatients || 0) / (dashboardStats?.totalPatients || 1)) * 100)}%`}
            trendUp={true}
          />
          <StatCard
            title="Completion Rate"
            value={`${exerciseAnalytics?.completionRate || 0}%`}
            icon={TrendingUp}
            trend="+5.2%"
            trendUp={true}
          />
          <StatCard
            title="Avg Session Duration"
            value={`${exerciseAnalytics?.averageSessionDuration || 0}min`}
            icon={BarChart3}
            trend="+2.1min"
            trendUp={true}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Exercise Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exerciseAnalytics?.weeklyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="assigned" fill="#e5e7eb" name="Assigned" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Exercise Types Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={exerciseAnalytics?.exerciseTypes || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(exerciseAnalytics?.exerciseTypes || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={exerciseAnalytics?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sessions"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Sessions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completion"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="Completion %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Top Performing Exercises</h4>
            <div className="space-y-3">
              {['Knee Extensions', 'Shoulder Rolls', 'Ankle Circles', 'Hip Flexors'].map((exercise, index) => (
                <div key={exercise} className="flex justify-between items-center">
                  <span className="text-gray-700">{exercise}</span>
                  <span className="text-emerald-600 font-medium">{95 - index * 3}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Patient Engagement</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Daily Active Users</span>
                <span className="text-blue-600 font-medium">342</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Weekly Active Users</span>
                <span className="text-blue-600 font-medium">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Avg Session Time</span>
                <span className="text-blue-600 font-medium">18min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Return Rate</span>
                <span className="text-blue-600 font-medium">78%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">System Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">API Response Time</span>
                <span className="text-green-600 font-medium">145ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Uptime</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Error Rate</span>
                <span className="text-green-600 font-medium">0.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Data Sync</span>
                <span className="text-green-600 font-medium">Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedAnalytics;