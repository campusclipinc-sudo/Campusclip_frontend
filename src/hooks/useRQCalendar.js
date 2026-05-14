import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CalendarService from "../api/calendarService";
import GoogleCalendarService from "../api/googleCalendarService";
import { toast } from "react-toastify";

const defaultOnError = (error) => {
  const message =
    error?.response?.data?.message || error?.message || "Request failed";
  toast.error(message);
};

/**
 * Calculate start and end dates for a given month
 * Also extends end date by 2 weeks for "Coming Up" section
 * @param {Date} cursor - Date object representing the month
 * @returns {Object} - { startDate, endDate } as ISO strings
 */
export const getMonthDateRange = (cursor) => {
  // Start date: First day of the month at 00:00:00
  const startDate = new Date(cursor.getFullYear(), cursor.getMonth(), 1);

  // End date: Last day of the month + 14 days for "Coming Up" section
  const lastDayOfMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + 14); // Extend by 2 weeks

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

// ==================== Calendar Hooks ====================

export const useGetCalendarData = (
  startDate,
  endDate,
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ["calendar-data", startDate, endDate],
    queryFn: () => CalendarService.getCalendarData(startDate, endDate),
    enabled: Boolean(startDate && endDate),
    onSuccess,
    onError,
  });
};

export const useGetCalendarItems = (
  cursor,
  onSuccess,
  onError = defaultOnError
) => {
  const { startDate, endDate } = getMonthDateRange(cursor);

  return useQuery({
    queryKey: ["calendar-items", startDate, endDate],
    queryFn: () => CalendarService.getItems({ startDate, endDate }),
    enabled: Boolean(cursor),
    onSuccess,
    onError,
  });
};

export const useGetCalendarItemsForDate = (
  date,
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ["calendar-items-date", date],
    queryFn: () => CalendarService.getItemsForDate(date),
    enabled: Boolean(date),
    onSuccess,
    onError,
  });
};

// ==================== Google Calendar Hooks ====================

export const useGetGoogleSyncStatus = (onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["google-calendar-sync-status"],
    queryFn: () => GoogleCalendarService.getSyncStatus(),
    onSuccess,
    onError,
  });
};

export const useInitiateGoogleAuth = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: () => GoogleCalendarService.initiateAuth(),
    onSuccess: (data) => {
      if (data.data?.authUrl) {
        window.location.href = data.data.authUrl;
      }
      onSuccess?.(data);
    },
    onError,
  });
};

export const useSyncAllToGoogle = (onSuccess, onError = defaultOnError) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => GoogleCalendarService.syncAll(),
    onSuccess: (data) => {
      const total = data.data?.summary?.total || 0;
      qc.invalidateQueries({ queryKey: ["google-calendar-sync-status"] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useSyncEventToGoogle = (onSuccess, onError = defaultOnError) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId) => GoogleCalendarService.syncEvent(eventId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["google-calendar-sync-status"] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useUpdateGoogleSyncSettings = (
  onSuccess,
  onError = defaultOnError
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings) => GoogleCalendarService.updateSettings(settings),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["google-calendar-sync-status"] });
      onSuccess?.(data);
    },
    onError,
  });
};

export const useDisconnectGoogleCalendar = (
  onSuccess,
  onError = defaultOnError
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => GoogleCalendarService.disconnect(),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["google-calendar-sync-status"] });
      onSuccess?.(data);
    },
    onError,
  });
};
