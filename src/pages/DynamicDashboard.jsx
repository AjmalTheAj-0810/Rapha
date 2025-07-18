import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Zap,
  Target,
  Clock,
  Bell,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useRealTimeData, useAnimatedCounter } from '../hooks/useRealTimeData';
import AnimatedCard, { StatCard, ProgressCard } from '../components/ui/AnimatedCard';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';

const DynamicDashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { data: realTimeData, loading, lastUpdated, refresh } = useRealTimeData();
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Animated counters for key metrics
  const animatedSteps = useAnimatedCounter(realTimeData?.steps || 0);
  const animatedCalories = useAnimatedCounter(realTimeData?.calories || 0);
  const animatedActiveUsers = useAnimatedCounter(realTimeData?.activeUsers || 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    refresh();
    setIsRefreshing(false);
    addNotification({
      type: 'success',
      title: 'Data Updated',
      message: 'Dashboard data has been refreshed successfully'
    });
  };

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  if (loading && !realTimeData) {
    return <DashboardSkeleton />;
  }

  const isPatient = user?.user_type === 'patient';
  const isPhysiotherapist = user?.user_type === 'physiotherapist';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {isPatient ? 'Track your progress and stay healthy' : 'Manage your patients and appointments'}
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Filter */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isPatient ? (
            <>
              <StatCard
                title="Steps Today"
                value={animatedSteps.toLocaleString()}
                change="+12% from yesterday"
                icon={Activity}
                color="blue"
                delay={0.1}
              />
              <StatCard
                title="Heart Rate"
                value={`${realTimeData?.heartRate || 72} bpm`}
                change="Normal range"
                icon={Heart}
                color="red"
                delay={0.2}
              />
              <StatCard
                title="Calories Burned"
                value={animatedCalories}
                change="+8% from yesterday"
                icon={Zap}
                color="yellow"
                delay={0.3}
              />
              <StatCard
                title="Exercise Progress"
                value={`${realTimeData?.exerciseProgress || 85}%`}
                change="Great progress!"
                icon={Target}
                color="green"
                delay={0.4}
              />
            </>
          ) : (
            <>
              <StatCard
                title="Active Patients"
                value={animatedActiveUsers}
                change="+5 new this week"
                icon={Users}
                color="blue"
                delay={0.1}
              />
              <StatCard
                title="Today's Appointments"
                value={realTimeData?.appointments || 8}
                change="2 upcoming"
                icon={Calendar}
                color="purple"
                delay={0.2}
              />
              <StatCard
                title="New Messages"
                value={realTimeData?.messages || 3}
                change="Requires attention"
                icon={MessageSquare}
                color="green"
                delay={0.3}
              />
              <StatCard
                title="Success Rate"
                value="94%"
                change="+2% this month"
                icon={TrendingUp}
                color="yellow"
                delay={0.4}
              />
            </>
          )}
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressCard
            title="Weekly Goal"
            progress={realTimeData?.exerciseProgress || 75}
            color="blue"
            delay={0.5}
          />
          <ProgressCard
            title="Monthly Target"
            progress={88}
            color="green"
            delay={0.6}
          />
          <ProgressCard
            title="Overall Health Score"
            progress={92}
            color="purple"
            delay={0.7}
          />
        </div>

        {/* Interactive Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Activity Feed */}
          <AnimatedCard 
            title="Live Activity Feed" 
            icon={Activity}
            expandable
            delay={0.8}
          >
            <div className="p-6 space-y-4">
              <AnimatePresence>
                {[
                  { time: '2 min ago', action: 'Completed morning exercises', type: 'success' },
                  { time: '15 min ago', action: 'Heart rate spike detected', type: 'warning' },
                  { time: '1 hour ago', action: 'New message from Dr. Smith', type: 'info' },
                  { time: '2 hours ago', action: 'Appointment reminder sent', type: 'info' },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </AnimatedCard>

          {/* Quick Actions */}
          <AnimatedCard 
            title="Quick Actions" 
            icon={Zap}
            delay={0.9}
          >
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {isPatient ? [
                  { label: 'Start Exercise', icon: Activity, color: 'bg-blue-500' },
                  { label: 'Log Symptoms', icon: Heart, color: 'bg-red-500' },
                  { label: 'Message Therapist', icon: MessageSquare, color: 'bg-green-500' },
                  { label: 'Book Appointment', icon: Calendar, color: 'bg-purple-500' },
                ] : [
                  { label: 'Add Patient', icon: Users, color: 'bg-blue-500' },
                  { label: 'Schedule Session', icon: Calendar, color: 'bg-purple-500' },
                  { label: 'Review Progress', icon: TrendingUp, color: 'bg-green-500' },
                  { label: 'Send Message', icon: MessageSquare, color: 'bg-yellow-500' },
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    onClick={() => addNotification({
                      type: 'info',
                      title: 'Action Triggered',
                      message: `${action.label} feature coming soon!`
                    })}
                  >
                    <action.icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{action.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Live Chart Placeholder */}
        <AnimatedCard 
          title="Real-time Health Metrics" 
          icon={TrendingUp}
          delay={1.2}
        >
          <div className="p-6">
            <div className="h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">Live chart data updating...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Heart rate, activity, and progress metrics
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default DynamicDashboard;