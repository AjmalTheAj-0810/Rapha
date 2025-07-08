import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api.js';
import { log } from '../config/environment.js';

// Generic hook for API calls
export function useApi(apiCall, options = {}) {
  const { immediate = true, dependencies = [], onSuccess, onError } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      log('API call successful', { result });
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      log('API call failed', { error: err });
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for dashboard stats
export function useDashboardStats() {
  return useApi(() => apiService.getDashboardStats(), {
    immediate: true,
  });
}

// Hook for recent activity
export function useRecentActivity(limit = 10) {
  return useApi(() => apiService.getRecentActivity(limit), {
    dependencies: [limit],
  });
}

// Hook for user profile
export function useCurrentUser() {
  return useApi(() => apiService.getCurrentUser(), {
    immediate: true,
  });
}

// Hook for appointments
export function useAppointments(params = {}) {
  return useApi(() => apiService.getAppointments(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for upcoming appointments
export function useUpcomingAppointments() {
  return useApi(() => apiService.getUpcomingAppointments(), {
    immediate: true,
  });
}

// Hook for today's appointments
export function useTodaysAppointments() {
  return useApi(() => apiService.getTodaysAppointments(), {
    immediate: true,
  });
}

// Hook for exercises
export function useExercises(params = {}) {
  return useApi(() => apiService.getExercises(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for exercise plans
export function useExercisePlans(params = {}) {
  return useApi(() => apiService.getExercisePlans(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for my exercise plans
export function useMyExercisePlans() {
  return useApi(() => apiService.getMyExercisePlans(), {
    immediate: true,
  });
}

// Hook for exercise progress
export function useExerciseProgress(params = {}) {
  return useApi(() => apiService.getExerciseProgress(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for notifications
export function useNotifications(params = {}) {
  return useApi(() => apiService.getNotifications(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for users (for physiotherapists)
export function useUsers(params = {}) {
  return useApi(() => apiService.getUsers(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for physiotherapists
export function usePhysiotherapists() {
  return useApi(() => apiService.getPhysiotherapists(), {
    immediate: true,
  });
}

// Hook for exercise analytics
export function useExerciseAnalytics(timeRange = 30) {
  return useApi(() => apiService.getExerciseAnalytics({ days: timeRange }), {
    dependencies: [timeRange],
  });
}

// Hook for appointment analytics
export function useAppointmentAnalytics(timeRange = 30) {
  return useApi(() => apiService.getAppointmentAnalytics({ days: timeRange }), {
    dependencies: [timeRange],
  });
}

// Hook for patient progress report
export function usePatientProgressReport(patientId, params = {}) {
  return useApi(() => apiService.getPatientProgressReport(patientId, params), {
    dependencies: [patientId, JSON.stringify(params)],
    immediate: !!patientId,
  });
}

// Hook for global search
export function useGlobalSearch(query) {
  return useApi(() => apiService.searchGlobal(query), {
    dependencies: [query],
    immediate: !!query && query.length > 2,
  });
}

// Hook for conversations
export function useConversations() {
  return useApi(() => apiService.getConversations(), {
    immediate: true,
  });
}

// Hook for messages in a conversation
export function useMessages(conversationId) {
  return useApi(() => apiService.getMessages(conversationId), {
    dependencies: [conversationId],
    immediate: !!conversationId,
  });
}

// Hook for exercise categories
export function useExerciseCategories() {
  return useApi(() => apiService.getExerciseCategories(), {
    immediate: true,
  });
}

// Hook for available time slots
export function useAvailableTimeSlots(physiotherapistId, date) {
  return useApi(() => apiService.getAvailableTimeSlots(physiotherapistId, date), {
    dependencies: [physiotherapistId, date],
    immediate: !!(physiotherapistId && date),
  });
}

// Hook for dashboard data (combined stats and activity)
export function useDashboardData() {
  return useApi(() => apiService.getDashboardData(), {
    immediate: true,
  });
}

// Hook for exercise streaks
export function useExerciseStreaks() {
  return useApi(() => apiService.getExerciseStreaks(), {
    immediate: true,
  });
}

// Hook for exercise progress stats
export function useExerciseProgressStats(planId) {
  return useApi(() => apiService.getExerciseProgressStats(planId), {
    dependencies: [planId],
  });
}

// Hook for today's exercises
export function useTodaysExercises() {
  return useApi(() => apiService.getTodaysExercises(), {
    immediate: true,
  });
}

// Hook for weekly exercise schedule
export function useWeeklyExerciseSchedule(planId) {
  return useApi(() => apiService.getWeeklyExerciseSchedule(planId), {
    dependencies: [planId],
    immediate: !!planId,
  });
}

// Mutation hook for API calls that modify data
export function useApiMutation(apiCall) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(params);
      log('API mutation successful', { result });
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      log('API mutation failed', { error: err });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return {
    mutate,
    loading,
    error,
  };
}

// Specific mutation hooks
export function useCreateAppointment() {
  return useApiMutation((data) => apiService.createAppointment(data));
}

export function useUpdateAppointment() {
  return useApiMutation(({ id, data }) => 
    apiService.updateAppointment(id, data)
  );
}

export function useCancelAppointment() {
  return useApiMutation(({ id, reason }) => 
    apiService.cancelAppointment(id, reason)
  );
}

export function useCreateExerciseProgress() {
  return useApiMutation((data) => apiService.createExerciseProgress(data));
}

export function useUpdateProfile() {
  return useApiMutation((data) => apiService.updateProfile(data));
}

export function useSendMessage() {
  return useApiMutation(({ conversationId, message }) => 
    apiService.sendMessage(conversationId, message)
  );
}

export function useMarkNotificationAsRead() {
  return useApiMutation((id) => apiService.markNotificationAsRead(id));
}

export function useQuickAction() {
  return useApiMutation(({ action, data }) => 
    apiService.quickAction(action, data)
  );
}