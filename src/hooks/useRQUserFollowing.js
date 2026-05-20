import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserFollowingService from "../api/userFollowingService";

const defaultOnError = () => {};

// User following hooks
export const useToggleFollow = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => UserFollowingService.toggleFollow(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-students"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      if (onSuccess) onSuccess(data);
      if (data?.data?.action) {
        const actionMessages = {
          followed: "User followed successfully",
          unfollowed: "User unfollowed successfully",
          requested: "Follow request sent",
        };
      }
    },
    onError,
  });
};

export const useAcceptFollowRequest = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => UserFollowingService.acceptFollowRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed-infinite"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

export const useRejectFollowRequest = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => UserFollowingService.rejectFollowRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pending-requests"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

export const useGetPendingRequests = (params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["pending-requests", params],
    queryFn: () => UserFollowingService.getPendingRequests(params),
    enabled: params !== null && params !== undefined,
    onSuccess,
    onError,
  });
};

export const useGetFollowers = (userId, params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["followers", userId, params],
    queryFn: () => UserFollowingService.getFollowers(userId, params),
    enabled: !!userId,
    onSuccess,
    onError,
  });
};

export const useGetFollowing = (userId, params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["following", userId, params],
    queryFn: () => UserFollowingService.getFollowing(userId, params),
    enabled: !!userId,
    onSuccess,
    onError,
  });
};

// Club following hooks
export const useFollowClub = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => UserFollowingService.followClub(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["club-followers"] });
      queryClient.invalidateQueries({ queryKey: ["user-followed-clubs"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

export const useUnfollowClub = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId) => UserFollowingService.unfollowClub(clubId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["club-followers"] });
      queryClient.invalidateQueries({ queryKey: ["user-followed-clubs"] });
      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

export const useGetClubFollowers = (clubId, params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["club-followers", clubId, params],
    queryFn: () => UserFollowingService.getClubFollowers(clubId, params),
    enabled: !!clubId,
    onSuccess,
    onError,
  });
};

export const useGetUserFollowedClubs = (userId, params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["user-followed-clubs", userId, params],
    queryFn: () => UserFollowingService.getUserFollowedClubs(userId, params),
    enabled: !!userId,
    onSuccess,
    onError,
  });
};

// Check follow status
export const useCheckFollowStatus = (params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["follow-status", params],
    queryFn: () => UserFollowingService.checkFollowStatus(params),
    enabled: !!(params?.user_id || params?.club_id),
    onSuccess,
    onError,
  });
};

