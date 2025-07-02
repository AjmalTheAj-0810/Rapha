import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Activity, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/dashboard/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import apiService from '../services/api';
import { config, log } from '../config/environment';

interface AnalyticsData {
  patientProgress: any[];
  appointmentStats: any[];
  exerciseCompletion: any[];
  monthlyTrends: any[];
  summary: {
    totalPatients: number;
    totalAppointments: number;
    avgCompletionRate: number;
    totalExerciseHours: number;
  };
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch analytics data from multiple endpoints
      const [exerciseAnalytics, dashboardStats] = await Promise.all([
        apiService.getExerciseAnalytics(parseInt(timeRange)),
        apiService.getDashboardStats()
      ]);

      // Mock additional analytics data for demonstration
      const mockData: AnalyticsData = {
        patientProgress: [
          { name: 'Week 1', completed: 85, target: 100 },
          { name: 'Week 2', completed: 92, target: 100 },
          { name: 'Week 3', completed: 78, target: 100 },
          { name: 'Week 4', completed: 95, target: 100 },
        ],
        appointmentStats: [
          { name: 'Mon', appointments: 8 },
          { name: 'Tue', appointments: 12 },
          { name: 'Wed', appointments: 10 },
          { name: 'Thu', appointments: 15 },
          { name: 'Fri', appointments: 9 },
          { name: 'Sat', appointments: 6 },
          { name: 'Sun', appointments: 3 },
        ],
        exerciseCompletion: [
          { name: 'Strength', value: 35, color: '#10B981' },
          { name: 'Flexibility', value: 25, color: '#3B82F6' },
          { name: 'Balance', value: 20, color: '#F59E0B' },
          { name: 'Cardio', value: 20, color: '#EF4444' },
        ],
        monthlyTrends: exerciseAnalytics.daily_data || [],
        summary: {
          totalPatients: dashboardStats.total_patients || 0,
          totalAppointments: dashboardStats.today_appointments || 0,
          avgCompletionRate: 87.5,
          totalExerciseHours: exerciseAnalytics.summary?.total_duration || 0,
        }
      };

      setAnalyticsData(mockData);
      log.info('Analytics data loaded successfully');
    } catch (err) {
      log.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <Layout title="Analytics Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Analytics Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics Dashboard">
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {['7', '30', '90'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  timeRange === days
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={analyticsData?.summary.totalPatients.toString() || '0'}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Today's Appointments"
            value={analyticsData?.summary.totalAppointments.toString() || '0'}
            icon={Calendar}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Avg Completion Rate"
            value={`${analyticsData?.summary.avgCompletionRate || 0}%`}
            icon={TrendingUp}
            color="emerald"
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard
            title="Exercise Hours"
            value={`${Math.round((analyticsData?.summary.totalExerciseHours || 0) / 60)}h`}
            icon={Clock}
            color="purple"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Progress Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Progress Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.patientProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#E5E7EB" 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Appointments */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Appointment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.appointmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Exercise Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.exerciseCompletion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData?.exerciseCompletion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Completion Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="exercises_completed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-medium text-emerald-800">High Engagement</h4>
              <p className="text-sm text-emerald-600 mt-1">
                87% of patients are completing their exercise routines consistently
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Peak Hours</h4>
              <p className="text-sm text-blue-600 mt-1">
                Most appointments are scheduled between 10 AM - 2 PM
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-800">Improvement Area</h4>
              <p className="text-sm text-amber-600 mt-1">
                Weekend appointment availability could be increased
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;