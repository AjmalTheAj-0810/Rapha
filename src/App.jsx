import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import PrivateRoute from './routes/PrivateRoute';
import RoleBasedRedirect from './routes/RoleBasedRedirect';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PersonalInformation from './pages/PersonalInformation';

// Dashboard Pages
import PatientDashboard from './pages/PatientDashboard';
import PhysioDashboard from './pages/PhysioDashboard';
import EnhancedPatientDashboard from './pages/EnhancedPatientDashboard';

// Chat Pages
import PatientChat from './pages/PatientChat';
import PhysioChat from './pages/PhysioChat';

// Booking Pages
import Booking from './pages/Booking';
import EnhancedBooking from './pages/EnhancedBooking';
import PhysioBookings from './pages/PhysioBookings';

// Other Pages
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import Exercises from './pages/Exercises';
import Users from './pages/Users';
import Analytics from './pages/Analytics.jsx';
import EnhancedAnalytics from './pages/EnhancedAnalytics.jsx';
import Settings from './pages/Settings.jsx';
import Documentation from './pages/Documentation.jsx';
import ApiIntegrationTest from './components/testing/ApiIntegrationTest.jsx';

// Dynamic Pages
import DynamicDashboard from './pages/DynamicDashboard.jsx';
import DynamicBooking from './components/appointments/DynamicBooking.jsx';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading Healthcare App...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/personal-info" element={<PersonalInformation />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route path="/patient-dashboard" element={
              <PrivateRoute>
                <EnhancedPatientDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/patient-dashboard-classic" element={
              <PrivateRoute>
                <PatientDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/physio-dashboard" element={
              <PrivateRoute>
                <PhysioDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/patient-chat" element={
              <PrivateRoute>
                <PatientChat />
              </PrivateRoute>
            } />
            
            <Route path="/physio-chat" element={
              <PrivateRoute>
                <PhysioChat />
              </PrivateRoute>
            } />
            
            <Route path="/booking" element={
              <PrivateRoute>
                <EnhancedBooking />
              </PrivateRoute>
            } />
            
            <Route path="/booking-classic" element={
              <PrivateRoute>
                <Booking />
              </PrivateRoute>
            } />
            
            <Route path="/physio-bookings" element={
              <PrivateRoute>
                <PhysioBookings />
              </PrivateRoute>
            } />
            
            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/appointments" element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            } />

            <Route path="/exercises" element={
              <PrivateRoute>
                <Exercises />
              </PrivateRoute>
            } />

            <Route path="/users" element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            } />

            <Route path="/analytics" element={
              <PrivateRoute>
                <EnhancedAnalytics />
              </PrivateRoute>
            } />
            
            <Route path="/analytics-classic" element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } />

            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />

            <Route path="/docs" element={
              <PrivateRoute>
                <Documentation />
              </PrivateRoute>
            } />
            
            <Route path="/dynamic-dashboard" element={
              <PrivateRoute>
                <DynamicDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/dynamic-booking" element={
              <PrivateRoute>
                <DynamicBooking />
              </PrivateRoute>
            } />
            
            {/* Redirect routes */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;