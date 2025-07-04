import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { log } from '../config/environment';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiOptions {
  immediate?: boolean;
  dependencies?: any[];
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: ApiOptions = {}
): ApiState<T> {
  const { immediate = true, dependencies = [], onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
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
export function useRecentActivity(limit: number = 10) {
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
export function useAppointments(params: any = {}) {
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
export function useExercises(params: any = {}) {
  return useApi(() => apiService.getExercises(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for exercise plans
export function useExercisePlans(params: any = {}) {
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
export function useExerciseProgress(params: any = {}) {
  return useApi(() => apiService.getExerciseProgress(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for notifications
export function useNotifications(params: any = {}) {
  return useApi(() => apiService.getNotifications(params), {
    dependencies: [JSON.stringify(params)],
  });
}

// Hook for users (for physiotherapists)
export function useUsers(params: any = {}) {
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
export function useExerciseAnalytics(timeRange: number = 30) {
  return useApi(() => apiService.getExerciseAnalytics({ days: timeRange }), {
    dependencies: [timeRange],
  });
}

// Hook for appointment analytics
export function useAppointmentAnalytics(timeRange: number = 30) {
  return useApi(() => apiService.getAppointmentAnalytics({ days: timeRange }), {
    dependencies: [timeRange],
  });
}

// Hook for patient progress report
export function usePatientProgressReport(patientId: string, params: any = {}) {
  return useApi(() => apiService.getPatientProgressReport(patientId, params), {
    dependencies: [patientId, JSON.stringify(params)],
    immediate: !!patientId,
  });
}

// Hook for global search
export function useGlobalSearch(query: string) {
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
export function useMessages(conversationId: string) {
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
export function useAvailableTimeSlots(physiotherapistId: string, date: string) {
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
export function useExerciseProgressStats(planId?: string) {
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
export function useWeeklyExerciseSchedule(planId: string) {
  return useApi(() => apiService.getWeeklyExerciseSchedule(planId), {
    dependencies: [planId],
    immediate: !!planId,
  });
}

// Mutation hook for API calls that modify data
export function useApiMutation<T, P>(
  apiCall: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(params);
      log('API mutation successful', { result });
      return result;
    } catch (err: any) {
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
  return useApiMutation((data: any) => apiService.createAppointment(data));
}

export function useUpdateAppointment() {
  return useApiMutation(({ id, data }: { id: string; data: any }) => 
    apiService.updateAppointment(id, data)
  );
}

export function useCancelAppointment() {
  return useApiMutation(({ id, reason }: { id: string; reason?: string }) => 
    apiService.cancelAppointment(id, reason)
  );
}

export function useCreateExerciseProgress() {
  return useApiMutation((data: any) => apiService.createExerciseProgress(data));
}

export function useUpdateProfile() {
  return useApiMutation((data: any) => apiService.updateProfile(data));
}

export function useSendMessage() {
  return useApiMutation(({ conversationId, message }: { conversationId: string; message: string }) => 
    apiService.sendMessage(conversationId, message)
  );
}

export function useMarkNotificationAsRead() {
  return useApiMutation((id: string) => apiService.markNotificationAsRead(id));
}

export function useQuickAction() {
  return useApiMutation(({ action, data }: { action: string; data?: any }) => 
    apiService.quickAction(action, data)
  );
}