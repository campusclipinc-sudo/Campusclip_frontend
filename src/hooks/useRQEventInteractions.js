import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as eventInteractionService from "../api/eventInteractionService";

const defaultError = () => {};

/**
 * Hook to toggle like on an event
 */
export const useToggleEventLike = (onSuccess, onError = defaultError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event_id) => eventInteractionService.toggleLike(event_id),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["eventLikes", data.data.event_id],
      });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

/**
 * Hook to get likes for an event
 */
export const useGetEventLikes = (
  event_id,
  params,
  onSuccess,
  onError = defaultError,
) => {
  return useQuery({
    queryKey: ["eventLikes", event_id, params],
    queryFn: () => eventInteractionService.getEventLikes(event_id, params),
    enabled: !!event_id,
    staleTime: 30000, // 30 seconds
    onSuccess,
    onError,
  });
};

/**
 * Hook to add a comment to an event
 */
export const useAddEventComment = (onSuccess, onError = defaultError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ event_id, comment }) =>
      eventInteractionService.addComment(event_id, comment),
    onSuccess: (data) => {
      const event_id = data.data.comment.event_id;

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["eventComments", event_id] });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });

      if (onSuccess) onSuccess(data);
    },
    onError,
  });
};

/**
 * Hook to get comments for an event
 */
export const useGetEventComments = (
  event_id,
  params,
  onSuccess,
  onError = defaultError,
) => {
  return useQuery({
    queryKey: ["eventComments", event_id, params],
    queryFn: () => eventInteractionService.getEventComments(event_id, params),
    enabled: !!event_id,
    staleTime: 30000, // 30 seconds
    onSuccess,
    onError,
  });
};

/**
 * Hook to update a comment
 */
export const useUpdateEventComment = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: ({ comment_id, comment }) =>
      eventInteractionService.updateComment(comment_id, comment),
    onSuccess,
    onError,
  });
};

/**
 * Hook to delete a comment
 */
export const useDeleteEventComment = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: ({ comment_id }) =>
      eventInteractionService.deleteComment(comment_id),
    onSuccess,
    onError,
  });
};

export default {
  useToggleEventLike,
  useGetEventLikes,
  useAddEventComment,
  useGetEventComments,
  useUpdateEventComment,
  useDeleteEventComment,
};
