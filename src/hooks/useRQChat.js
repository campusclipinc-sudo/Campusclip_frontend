import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ChatService from '../api/chatService';

const defaultOnError = (error) => {
  const message =
    error?.response?.data?.message || error?.message || 'Request failed';
  toast.error(message);
};

/**
 * Hook to get group chat history (infinite scroll)
 * @param {string} roomId - Room/Group ID
 * @param {object} params - Query parameters
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useGetGroupChatHistory = (
  roomId,
  params = {},
  onSuccess,
  onError = defaultOnError
) => {
  const limit = params.limit || 5;

  return useInfiniteQuery({
    queryKey: ['chat', 'group', roomId],
    queryFn: ({ pageParam = null }) =>
      ChatService.getGroupChatHistory(roomId, { ...params, cursor: pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor || null,
    enabled: !!roomId && params.enabled !== false,
    onSuccess,
    onError,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    initialPageParam: null,
  });
};

/**
 * Hook to get private chat history (infinite scroll)
 * @param {string} recipientId - Recipient user ID
 * @param {object} params - Query parameters
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useGetPrivateChatHistory = (
  recipientId,
  params = {},
  onSuccess,
  onError = defaultOnError
) => {
  return useInfiniteQuery({
    queryKey: ['chat', 'private', recipientId],
    queryFn: ({ pageParam = null }) =>
      ChatService.getPrivateChatHistory(recipientId, { ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor || null,
    enabled: !!recipientId,
    onSuccess,
    onError,
    initialPageParam: null,
  });
};

/**
 * Hook to get all conversations
 * @param {object} params - Query parameters
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useGetConversations = (
  params = {},
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ['chat', 'conversations', params],
    queryFn: () => ChatService.getConversations(params),
    onSuccess,
    onError,
  });
};

/**
 * Hook to get chat-eligible users (based on follow relationship)
 * @param {object} params - Query parameters (search)
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useGetChatEligibleUsers = (
  params = {},
  onSuccess,
  onError = defaultOnError
) => {
  return useQuery({
    queryKey: ['chat', 'eligible-users', params],
    queryFn: () => ChatService.getChatEligibleUsers(params),
    onSuccess,
    onError,
  });
};

/**
 * Hook to send a message
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useSendMessage = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData) => ChatService.sendMessage(messageData),
    onSuccess: (data, variables) => {
      // Update conversations list optimistically
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      // Don't invalidate chat history - let socket handle real-time updates
      if (onSuccess) onSuccess(data, variables);
    },
    onError,
  });
};

/**
 * Hook to mark messages as read
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useMarkAsRead = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (readData) => ChatService.markAsRead(readData),
    onSuccess: (data, variables) => {
      // Only invalidate unread count - chat messages are handled by socket
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread-count'] });
      if (onSuccess) onSuccess(data, variables);
    },
    onError,
  });
};

/**
 * Hook to get unread message count
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useGetUnreadCount = (onSuccess, onError = defaultOnError) => {
  return useQuery({
    queryKey: ['chat', 'unread-count'],
    queryFn: () => ChatService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
    onSuccess,
    onError,
  });
};

/**
 * Hook to delete a message
 * @param {function} onSuccess - Success callback
 * @param {function} onError - Error callback
 */
export const useDeleteMessage = (onSuccess, onError = defaultOnError) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId) => ChatService.deleteMessage(messageId),
    onSuccess: (data, messageId) => {
      // Invalidate all chat queries
      queryClient.invalidateQueries({ queryKey: ['chat'] });
      if (onSuccess) onSuccess(data, messageId);
    },
    onError,
  });
};

