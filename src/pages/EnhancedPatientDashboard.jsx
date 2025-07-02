import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Lightbulb, 
  Calendar, 
  Flame, 
  Clock, 
  Smile, 
  Activity, 
  Users, 
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Bell,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/dashboard/Navbar';
import StatCard from '../components/dashboard/StatCard';
import RadialProgressChart from '../components/charts/RadialProgressChart';
import StreakTracker from '../components/dashboard/StreakTracker';
import AdherenceRate from '../components/dashboard/AdherenceRate';
import NextMeeting from '../components/dashboard/NextMeeting';
import UpcomingSessions from '../components/dashboard/UpcomingSessions';
import EnhancedRecentMessages from '../components/dashboard/EnhancedRecentMessages';
import AIInsights from '../components/dashboard/AIInsights';
import RecoveryTrendsChart from '../components/charts/RecoveryTrendsChart';
import PatientExerciseView from '../components/exercises/PatientExerciseView';
import apiService from '../services/api';

const EnhancedPatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [exerciseAnalytics, setExerciseAnalytics] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadRecentActivity();
    loadExerciseAnalytics();
    loadUnreadNotifications();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activity = await apiService.getRecentActivity(10);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const loadExerciseAnalytics = async () => {
    try {
      const analytics = await apiService.getExerciseAnalytics(30);
      setExerciseAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load exercise analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const count = await apiService.getUnreadNotificationCount();
      setUnreadCount(count.unread_count || 0);
    } catch (error) {
      console.error('Failed to load notification count:', error);
    }
  };

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await apiService.searchWithCache(query, 30000);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const analytics = exerciseAnalytics?.summary || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6">
        {/* Header with Search and Notifications */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Patient Dashboard</h1>
            <p className="text-gray-600">Track your recovery and manage your health journey</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises, appointments..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      to={result.url}
                      className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => setSearchResults([])}
                    >
                      <div className="font-medium text-gray-900">{result.title}</div>
                      <div className="text-sm text-gray-600">{result.description}</div>
                      <div className="text-xs text-blue-600 capitalize">{result.type}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              onClick={markAllNotificationsRead}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Upcoming Appointments"
            value={stats.upcoming_appointments || 0}
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            subtitle="Next 7 days"
            trend={stats.upcoming_appointments > 0 ? "positive" : "neutral"}
          />
          
          <StatCard
            title="Active Exercise Plans"
            value={stats.active_exercise_plans || 0}
            icon={<Activity className="h-6 w-6 text-green-600" />}
            subtitle="Currently assigned"
            trend="positive"
          />
          
          <StatCard
            title="Today's Exercises"
            value={stats.completed_exercises_today || 0}
            icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
            subtitle="Completed today"
            trend={stats.completed_exercises_today > 0 ? "positive" : "neutral"}
          />
          
          <StatCard
            title="Exercise Streak"
            value={`${stats.exercise_streak || 0} days`}
            icon={<Flame className="h-6 w-6 text-orange-600" />}
            subtitle="Current streak"
            trend={stats.exercise_streak > 0 ? "positive" : "neutral"}
          />
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Exercises</span>
                  <span className="font-semibold">{analytics.total_exercises || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration</span>
                  <span className="font-semibold">{Math.round((analytics.total_duration || 0) / 60)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Day</span>
                  <span className="font-semibold">{analytics.avg_exercises_per_day?.toFixed(1) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Days</span>
                  <span className="font-semibold">{analytics.days_with_activity || 0}/30</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Tracking</h3>
              <RadialProgressChart 
                percentage={((analytics.days_with_activity || 0) / 30) * 100}
                title="Monthly Activity"
                subtitle={`${analytics.days_with_activity || 0} active days`}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Streak Tracker</h3>
              <StreakTracker 
                currentStreak={stats.exercise_streak || 0}
                longestStreak={analytics.streak || 0}
                weeklyGoal={7}
              />
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'appointment' && (
                        <Calendar className="h-5 w-5 text-blue-600" />
                      )}
                      {activity.type === 'exercise' && (
                        <Activity className="h-5 w-5 text-green-600" />
                      )}
                      {activity.type === 'message' && (
                        <Users className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                      {activity.status && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/booking"
                className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-center">
                  <CalendarDays className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-blue-900">Book Appointment</span>
                </div>
              </Link>
              
              <Link
                to="/exercises"
                className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-center">
                  <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-green-900">View Exercises</span>
                </div>
              </Link>
              
              <Link
                to="/chat"
                className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-center">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-purple-900">Message Physio</span>
                </div>
              </Link>
              
              <Link
                to="/analytics"
                className="flex items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-orange-900">View Analytics</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Exercise Analytics Chart */}
        {exerciseAnalytics?.daily_data && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Progress Trends</h3>
            <RecoveryTrendsChart data={exerciseAnalytics.daily_data} />
          </div>
        )}

        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
          <AIInsights 
            insights={[
              {
                type: 'positive',
                icon: CheckCircle,
                title: 'Excellent Progress!',
                message: `Your exercise consistency has improved. Current streak: ${stats.exercise_streak || 0} days!`,
                color: 'green'
              },
              {
                type: 'suggestion',
                icon: Lightbulb,
                title: 'Optimization Tip',
                message: analytics.avg_exercises_per_day > 1 
                  ? 'Great daily activity! Consider tracking pain levels for better insights.'
                  : 'Try to maintain a daily exercise routine for better results.',
                color: 'blue'
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedPatientDashboard;