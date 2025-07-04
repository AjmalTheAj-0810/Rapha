import React from 'react';
import { CheckCircle, Lightbulb, Calendar, Flame, Clock, Smile, Activity, Users, CalendarDays, AlertCircle } from 'lucide-react';
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
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { stats, appointments, exercises, exercisePlans, loading, error } = useDashboardData();

  const patientInsights = [
    {
      type: 'positive',
      icon: CheckCircle,
      title: 'Excellent Progress!',
      message: 'Your exercise consistency has improved by 23% this week. Keep up the great work!',
      color: 'green'
    },
    {
      type: 'suggestion',
      icon: Lightbulb,
      title: 'Optimization Tip',
      message: 'Consider doing your stretching exercises in the morning for better flexibility gains.',
      color: 'blue'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">Error loading dashboard: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name || 'Patient'}!
          </h1>
          <p className="text-gray-600">Track your recovery and manage your health journey</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Sessions Completed"
            value={stats.sessionsCompleted.toString()}
            icon={<Calendar className="h-6 w-6 text-blue-600" />}
            subtitle="This month"
            trend={stats.sessionsCompleted > 0 ? 12 : 0}
          />
          <StatCard
            title="Daily Streak"
            value={stats.dailyStreak.toString()}
            icon={<Flame className="h-6 w-6 text-orange-500" />}
            subtitle="Days in a row"
            trend={8}
          />
          <StatCard
            title="Next Session"
            value={stats.nextSession ? "Scheduled" : "None"}
            icon={<Clock className="h-6 w-6 text-green-600" />}
            subtitle={stats.nextSession ? 
              `${new Date(stats.nextSession.date).toLocaleDateString()} at ${stats.nextSession.time || 'TBD'}` : 
              "No upcoming sessions"
            }
          />
          <StatCard
            title="Pain Level"
            value={`${stats.painLevel || 0}/10`}
            icon={<Smile className="h-6 w-6 text-green-600" />}
            subtitle="Current level"
            trend={stats.painLevel ? -20 : 0}
          />
        </div>

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