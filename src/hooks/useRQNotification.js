import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "../api/notificationService";
import UserFollowingService from "../api/userFollowingService";
import ClubRequestService from "../api/clubRequestService";

const defaultOnError = () => {};

// Get all notifications for the current user
export const useGetUserNotifications = (
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ["user-notifications"],
    queryFn: () => NotificationService.getUserNotifications(),
    onSuccess,
    onError,
  });
};

// Get all follow and club requests
export const useGetAllRequests = (
  params = {},
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ["all-requests", params],
    queryFn: () => NotificationService.getAllRequests(params),
    onSuccess,
    onError,
  });
};

// Delete a single notification
export const useDeleteNotification = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      NotificationService.deleteNotification(notificationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

// Delete all notifications
export const useDeleteAllNotifications = (
  onSuccess,
  onError = defaultOnError
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.deleteAllNotifications(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

// Accept follow request
export const useAcceptFollowRequestNotification = (
  onSuccess,
  onError = defaultOnError
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => UserFollowingService.acceptFollowRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

// Reject follow request
export const useRejectFollowRequestNotification = (
  onSuccess,
  onError = defaultOnError
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => UserFollowingService.rejectFollowRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

// Accept club request
export const useAcceptClubRequest = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => ClubRequestService.action(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-requests"] });
      queryClient.invalidateQueries({ queryKey: ["club-requests"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

// Reject club request
export const useRejectClubRequest = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => ClubRequestService.action(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-requests"] });
      queryClient.invalidateQueries({ queryKey: ["club-requests"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};
