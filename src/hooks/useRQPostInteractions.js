import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  addComment,
  deleteComment,
  getPostComments,
  getPostLikes,
  toggleLike,
  updateComment,
} from '../api/postInteractionService';

/**
 * Hook to toggle like on a post with optimistic updates
 * @returns {Object} Mutation object
 */
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ post_id }) => toggleLike(post_id),
    onMutate: async ({ post_id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['postLikes', post_id] });

      // Snapshot the previous value
      const previousLikes = queryClient.getQueryData(['postLikes', post_id]);

      // Optimistically update the cache
      queryClient.setQueryData(['postLikes', post_id], (old) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            is_liked_by_current_user: !old.data.is_liked_by_current_user,
            likes_count: old.data.is_liked_by_current_user
              ? old.data.likes_count - 1
              : old.data.likes_count + 1,
          },
        };
      });

      // Return context with snapshot
      return { previousLikes };
    },
    onError: (error, { post_id }, context) => {
      // Rollback on error
      if (context?.previousLikes) {
        queryClient.setQueryData(['postLikes', post_id], context.previousLikes);
      }
      toast.error(error?.response?.data?.message || 'Failed to update like');
    },
    onSuccess: (data, { post_id }) => {
      // Invalidate to refetch and sync with server
      queryClient.invalidateQueries({ queryKey: ['postLikes', post_id] });
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
    },
  });
};

/**
 * Hook to get likes for a post
 * @param {number} post_id - The post ID
 * @param {Object} params - Query parameters
 * @returns {Object} Query object
 */
export const useGetPostLikes = (post_id, params = {}) => {
  return useQuery({
    queryKey: ['postLikes', post_id, params],
    queryFn: () => getPostLikes(post_id, params),
    enabled: !!post_id,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to add a comment with optimistic updates
 * @returns {Object} Mutation object
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ post_id, comment }) => addComment(post_id, comment),
    onMutate: async ({ post_id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['postComments', post_id] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['postComments', post_id]);

      // Return context with snapshot
      return { previousComments };
    },
    onError: (error, { post_id }, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['postComments', post_id], context.previousComments);
      }
      toast.error(error?.response?.data?.message || 'Failed to add comment');
    },
    onSuccess: (data, { post_id }) => {
      // Invalidate to refetch and sync with server
      queryClient.invalidateQueries({ queryKey: ['postComments', post_id] });
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
    },
  });
};

/**
 * Hook to get comments for a post
 * @param {number} post_id - The post ID
 * @param {Object} params - Query parameters
 * @returns {Object} Query object
 */
export const useGetPostComments = (post_id, params = {}) => {
  return useQuery({
    queryKey: ['postComments', post_id, params],
    queryFn: () => getPostComments(post_id, params),
    enabled: !!post_id,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to update a comment
 * @returns {Object} Mutation object
 */
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comment_id, comment }) => updateComment(comment_id, comment),
    onSuccess: (data) => {
      const post_id = data.data.comment.post_id;
      queryClient.invalidateQueries({ queryKey: ['postComments', post_id] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update comment');
    },
  });
};

/**
 * Hook to delete a comment
 * @returns {Object} Mutation object
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comment_id }) => deleteComment(comment_id),
    onSuccess: (data) => {
      const post_id = data.data.post_id;
      queryClient.invalidateQueries({ queryKey: ['postComments', post_id] });
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete comment');
    },
  });
};
