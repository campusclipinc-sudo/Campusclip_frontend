import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import postService from "../api/postService";

const defaultOnError = () => {};

export const useListPosts = (params, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => postService.listPosts(params || {}),
    enabled: params !== null && params !== undefined,
    onSuccess,
    onError,
  });
};

export const useInfiniteListPosts = (params, onSuccess, onError = defaultOnError) => {
  return useInfiniteQuery({
    queryKey: ["posts-infinite", params],
    queryFn: ({ pageParam = 1 }) => {
      return postService.listPosts({ ...params, page: pageParam, limit: 10 });
    },
    enabled: params !== null && params !== undefined,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    onSuccess,
    onError,
  });
};

export const useCreatePost = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (postData) => postService.createPost(postData),
    onSuccess,
    onError,
  });
};

export const useUpdatePost = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (postData) => postService.updatePost(postData),
    onSuccess,
    onError,
  });
};

export const useDeletePost = (onSuccess, onError = defaultOnError) => {
  return useMutation({
    mutationFn: (postId) => postService.deletePost(postId),
    onSuccess,
    onError,
  });
};

export const useGetUserPosts = (userId, enabled = true, onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: () => postService.getPostsByUser(userId),
    enabled: enabled && Boolean(userId),
    onSuccess,
    onError,
  });
};
