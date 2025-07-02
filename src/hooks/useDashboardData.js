import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useDashboardData = () => {
  const [data, setData] = useState({
    stats: {
      sessionsCompleted: 0,
      dailyStreak: 0,
      nextSession: null,
      painLevel: null
    },
    appointments: [],
    exercises: [],
    exercisePlans: [],
    loading: true,
    error: null
  });

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch appointments
        const appointmentsResponse = await apiService.getAppointments();
        const appointments = appointmentsResponse.results || appointmentsResponse;

        // Fetch exercises
        const exercisesResponse = await apiService.getExercises();
        const exercises = exercisesResponse.results || exercisesResponse;

        // Fetch exercise plans
        const exercisePlansResponse = await apiService.getExercisePlans();
        const exercisePlans = exercisePlansResponse.results || exercisePlansResponse;

        // Calculate stats
        const now = new Date();
        const thisMonth = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate.getMonth() === now.getMonth() && 
                 aptDate.getFullYear() === now.getFullYear() &&
                 apt.status === 'completed';
        });

        const upcomingAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate > now && apt.status === 'scheduled';
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        const nextSession = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

        // Calculate daily streak (simplified - would need more complex logic in real app)
        const dailyStreak = Math.floor(Math.random() * 30) + 1; // Placeholder

        setData({
          stats: {
            sessionsCompleted: thisMonth.length,
            dailyStreak,
            nextSession,
            painLevel: Math.floor(Math.random() * 3) + 1 // Placeholder
          },
          appointments,
          exercises,
          exercisePlans,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user]);

  return data;
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAppointments();
        setAppointments(response.results || response);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated]);

  const createAppointment = async (appointmentData) => {
    try {
      const newAppointment = await apiService.createAppointment(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      throw err;
    }
  };

  const updateAppointment = async (id, updateData) => {
    try {
      const updatedAppointment = await apiService.updateAppointment(id, updateData);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      return updatedAppointment;
    } catch (err) {
      throw err;
    }
  };

  const deleteAppointment = async (id) => {
    try {
      await apiService.deleteAppointment(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};

export const useExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [exercisePlans, setExercisePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchExercises = async () => {
      try {
        setLoading(true);
        const [exercisesResponse, plansResponse] = await Promise.all([
          apiService.getExercises(),
          apiService.getExercisePlans()
        ]);
        
        setExercises(exercisesResponse.results || exercisesResponse);
        setExercisePlans(plansResponse.results || plansResponse);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [isAuthenticated]);

  const createExercise = async (exerciseData) => {
    try {
      const newExercise = await apiService.createExercise(exerciseData);
      setExercises(prev => [...prev, newExercise]);
      return newExercise;
    } catch (err) {
      throw err;
    }
  };

  const updateExercise = async (id, updateData) => {
    try {
      const updatedExercise = await apiService.updateExercise(id, updateData);
      setExercises(prev => 
        prev.map(ex => ex.id === id ? updatedExercise : ex)
      );
      return updatedExercise;
    } catch (err) {
      throw err;
    }
  };

  const deleteExercise = async (id) => {
    try {
      await apiService.deleteExercise(id);
      setExercises(prev => prev.filter(ex => ex.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    exercises,
    exercisePlans,
    loading,
    error,
    createExercise,
    updateExercise,
    deleteExercise
  };
};

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUsers();
        setUsers(response.results || response);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated]);

  const createUser = async (userData) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      throw err;
    }
  };

  const updateUser = async (id, updateData) => {
    try {
      const updatedUser = await apiService.updateUser(id, updateData);
      setUsers(prev => 
        prev.map(user => user.id === id ? updatedUser : user)
      );
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser
  };
};