import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity, 
  Clock, 
  Target,
  Flame,
  Award,
  AlertCircle,
  Loader,
  Download,
  Filter
} from 'lucide-react';
import Layout from '../components/layout/Layout';
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
import apiService from '../services/api';

interface ExerciseAnalytics {
  summary: {
    total_exercises: number;
    total_duration: number;
    avg_exercises_per_day: number;
    days_with_activity: number;
    streak: number;
  };
  daily_data: Array<{
    date: string;
    exercises_completed: number;
    total_duration: number;
    avg_difficulty: number;
    avg_pain_before: number;
    avg_pain_after: number;
  }>;
}

interface DashboardStats {
  upcoming_appointments: number;
  active_exercise_plans: number;
  completed_exercises_today: number;
  total_progress_entries: number;
  exercise_streak: number;
  user_type: string;
}

const EnhancedAnalytics: React.FC = () => {
  const [exerciseAnalytics, setExerciseAnalytics] = useState<ExerciseAnalytics | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('exercises');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [exerciseData, statsData] = await Promise.all([
        apiService.getExerciseAnalytics(parseInt(timeRange)),
        apiService.getDashboardStats()
      ]);

      setExerciseAnalytics(exerciseData);
      setDashboardStats(statsData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!exerciseAnalytics?.daily_data) return [];
    
    return exerciseAnalytics.daily_data.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      exercises: day.exercises_completed,
      duration: Math.round(day.total_duration),
      difficulty: day.avg_difficulty,
      painBefore: day.avg_pain_before,
      painAfter: day.avg_pain_after,
      painReduction: day.avg_pain_before - day.avg_pain_after
    }));
  };

  const getPainReductionData = () => {
    const chartData = formatChartData();
    return chartData.filter(day => day.painBefore > 0 && day.painAfter >= 0);
  };

  const getCompletionRateData = () => {
    const chartData = formatChartData();
    const totalDays = parseInt(timeRange);
    const activeDays = exerciseAnalytics?.summary.days_with_activity || 0;
    const inactiveDays = totalDays - activeDays;

    return [
      { name: 'Active Days', value: activeDays, color: '#10B981' },
      { name: 'Inactive Days', value: inactiveDays, color: '#EF4444' }
    ];
  };

  const exportData = () => {
    if (!exerciseAnalytics) return;
    
    const data = {
      summary: exerciseAnalytics.summary,
      daily_data: exerciseAnalytics.daily_data,
      dashboard_stats: dashboardStats,
      export_date: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exercise-analytics-${timeRange}days-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchAnalyticsData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const summary = exerciseAnalytics?.summary;
  const chartData = formatChartData();
  const painData = getPainReductionData();
  const completionData = getCompletionRateData();

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Exercise Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into your exercise progress and recovery</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* Time Range Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            
            {/* Export Button */}
            <button
              onClick={exportData}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Exercises"
            value={summary?.total_exercises || 0}
            icon={<Activity className="h-6 w-6 text-blue-600" />}
            subtitle={`${timeRange} days`}
            trend="positive"
          />
          
          <StatCard
            title="Total Duration"
            value={`${Math.round((summary?.total_duration || 0) / 60)}m`}
            icon={<Clock className="h-6 w-6 text-green-600" />}
            subtitle="Minutes exercised"
            trend="positive"
          />
          
          <StatCard
            title="Daily Average"
            value={summary?.avg_exercises_per_day?.toFixed(1) || '0.0'}
            icon={<Target className="h-6 w-6 text-purple-600" />}
            subtitle="Exercises per day"
            trend="positive"
          />
          
          <StatCard
            title="Active Days"
            value={`${summary?.days_with_activity || 0}/${timeRange}`}
            icon={<Calendar className="h-6 w-6 text-orange-600" />}
            subtitle="Days with activity"
            trend="positive"
          />
          
          <StatCard
            title="Current Streak"
            value={`${summary?.streak || 0} days`}
            icon={<Flame className="h-6 w-6 text-red-600" />}
            subtitle="Exercise streak"
            trend="positive"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Exercise Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Exercise Progress</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="exercises">Exercises Count</option>
                <option value="duration">Duration (minutes)</option>
                <option value="difficulty">Difficulty Level</option>
              </select>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pain Reduction Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pain Level Tracking</h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={painData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="painBefore" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Pain Before"
                />
                <Line 
                  type="monotone" 
                  dataKey="painAfter" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Pain After"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Completion Rate */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Completion Rate</h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {completionData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">{entry.value} days</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Exercise Trends</h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="exercises" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
            
            <div className="space-y-4">
              {/* Streak Achievement */}
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Current Streak</p>
                  <p className="text-xs text-orange-700">
                    {summary?.streak || 0} consecutive days of exercise
                  </p>
                </div>
              </div>

              {/* Consistency Score */}
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Award className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Consistency Score</p>
                  <p className="text-xs text-green-700">
                    {Math.round(((summary?.days_with_activity || 0) / parseInt(timeRange)) * 100)}% active days
                  </p>
                </div>
              </div>

              {/* Average Pain Reduction */}
              {painData.length > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Pain Reduction</p>
                    <p className="text-xs text-blue-700">
                      Average {(painData.reduce((acc, day) => acc + day.painReduction, 0) / painData.length).toFixed(1)} point improvement
                    </p>
                  </div>
                </div>
              )}

              {/* Exercise Intensity */}
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Average Intensity</p>
                  <p className="text-xs text-purple-700">
                    {chartData.length > 0 
                      ? (chartData.reduce((acc, day) => acc + day.difficulty, 0) / chartData.length).toFixed(1)
                      : '0'
                    }/5 difficulty level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedAnalytics;