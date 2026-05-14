import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import feedService from "../api/feedService";
import { toast } from "react-toastify";

const defaultOnError = (error) => {
  const message =
    error?.response?.data?.message || error?.message || "Request failed";
  toast.error(message);
};

/**
 * Hook to fetch user's personalized feed
 * Returns posts and events merged into a single feed
 */
export const useGetUserFeed = (params = {}, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["feed", params],
    queryFn: () => feedService.getUserFeed(params),
    onSuccess,
    onError,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook to fetch user's personalized feed with infinite scroll
 * Returns posts and events merged into a single feed with pagination support
 */
export const useInfiniteUserFeed = (params = {}, onSuccess, onError = defaultOnError) => {
  return useInfiniteQuery({
    queryKey: ["feed-infinite", params],
    queryFn: ({ pageParam = 1 }) => {
      return feedService.getUserFeed({ ...params, page: pageParam, limit: params.limit || 10 });
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 0, // Always fetch fresh data when user comes to feed
    refetchOnWindowFocus: true,
    onSuccess,
    onError,
  });
};
