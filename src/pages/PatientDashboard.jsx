import React, { useState, useEffect } from 'react';
import { CheckCircle, Lightbulb, Calendar, Flame, Clock, Smile, Activity, Users, CalendarDays, AlertCircle, RefreshCw } from 'lucide-react';
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
import { 
  useDashboardStats, 
  useRecentActivity, 
  useUpcomingAppointments, 
  useMyExercisePlans,
  useExerciseStreaks,
  useExerciseProgressStats,
  useTodaysExercises,
  useNotifications,
  useCurrentUser
} from '../hooks/useApi';

const PatientDashboard = () => {
  // API hooks for real-time data
  const { data: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: recentActivity, loading: activityLoading } = useRecentActivity(5);
  const { data: upcomingAppointments, loading: appointmentsLoading } = useUpcomingAppointments();
  const { data: exercisePlans, loading: plansLoading } = useMyExercisePlans();
  const { data: exerciseStreaks, loading: streaksLoading } = useExerciseStreaks();
  const { data: progressStats, loading: progressLoading } = useExerciseProgressStats();
  const { data: todaysExercises, loading: todaysLoading } = useTodaysExercises();
  const { data: notifications, loading: notificationsLoading } = useNotifications({ is_read: false });
  const { data: currentUser } = useCurrentUser();

  // Loading and error states
  const [refreshing, setRefreshing] = useState(false);
  
  const isLoading = statsLoading || activityLoading || appointmentsLoading || plansLoading;
  const hasError = statsError;

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchStats();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Generate insights based on real data
  const generateInsights = () => {
    const insights = [];
    
    if (progressStats?.completion_rate > 80) {
      insights.push({
        type: 'positive',
        icon: CheckCircle,
        title: 'Excellent Progress!',
        message: `Your exercise completion rate is ${progressStats.completion_rate}%. Keep up the great work!`,
        color: 'green'
      });
    }
    
    if (exerciseStreaks?.current_streak > 7) {
      insights.push({
        type: 'achievement',
        icon: Flame,
        title: 'Amazing Streak!',
        message: `You're on a ${exerciseStreaks.current_streak}-day exercise streak. You're on fire!`,
        color: 'orange'
      });
    }
    
    if (todaysExercises?.length > 0) {
      insights.push({
        type: 'reminder',
        icon: Clock,
        title: 'Today\'s Exercises',
        message: `You have ${todaysExercises.length} exercises scheduled for today.`,
        color: 'blue'
      });
    }
    
    // Default insights if no data
    if (insights.length === 0) {
      insights.push({
        type: 'suggestion',
        icon: Lightbulb,
        title: 'Stay Consistent',
        message: 'Regular exercise is key to recovery. Try to maintain a daily routine.',
        color: 'blue'
      });
    }
    
    return insights;
  };

  const patientInsights = generateInsights();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {currentUser?.first_name || 'Patient'}!
            </h1>
            <p className="text-gray-600">Track your recovery and manage your health journey</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {hasError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Unable to load dashboard data</p>
              <p className="text-red-600 text-sm">{statsError}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Stats Cards Row */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Sessions Completed"
              value={dashboardStats?.total_sessions || progressStats?.completed_sessions || '0'}
              icon={<Calendar className="h-6 w-6 text-blue-600" />}
              subtitle="This month"
              trend={dashboardStats?.sessions_trend || 0}
            />
            <StatCard
              title="Daily Streak"
              value={exerciseStreaks?.current_streak || '0'}
              icon={<Flame className="h-6 w-6 text-orange-500" />}
              subtitle="Days in a row"
              trend={exerciseStreaks?.streak_change || 0}
            />
            <StatCard
              title="Next Session"
              value={upcomingAppointments?.[0]?.date ? 
                new Date(upcomingAppointments[0].date).toLocaleDateString() : 'None scheduled'}
              icon={<Clock className="h-6 w-6 text-green-600" />}
              subtitle={upcomingAppointments?.[0]?.start_time ? 
                `${upcomingAppointments[0].start_time} with ${upcomingAppointments[0].physiotherapist_name || 'Physiotherapist'}` : 
                'Schedule an appointment'}
            />
            <StatCard
              title="Completion Rate"
              value={`${Math.round(progressStats?.completion_rate || 0)}%`}
              icon={<Activity className="h-6 w-6 text-green-600" />}
              subtitle="Exercise completion"
              trend={progressStats?.completion_trend || 0}
            />
          </div>
        )}

        {/* Quick Access Navigation */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/appointments" 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">My Appointments</h3>
                  <p className="text-sm text-gray-600">View and manage appointments</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/exercises" 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Exercise Library</h3>
                  <p className="text-sm text-gray-600">Browse exercises and plans</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/profile" 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-600">Update personal information</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <RadialProgressChart 
            percentage={74} 
            title="Exercise Completion" 
            subtitle="Great progress this week!"
          />
          <StreakTracker streakDays={7} currentStreak={5} />
          <AdherenceRate rate={85} trend={5} />
        </div>

        {/* Exercise Manager Section - Full Width */}
        <div className="mb-8">
          <PatientExerciseView />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <NextMeeting 
            doctorName="Dr. Sarah Johnson"
            date="Tomorrow"
            time="10:00 AM"
            canJoin={false}
          />
          <UpcomingSessions />
        </div>

        {/* Recovery Trends - Full Width */}
        <div className="mb-8">
          <RecoveryTrendsChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedRecentMessages isPhysio={false} />
          <AIInsights insights={patientInsights} isPatient={true} />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;