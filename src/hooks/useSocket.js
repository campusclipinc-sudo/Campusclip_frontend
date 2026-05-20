import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  initializeSocket,
  disconnectSocket,
  subscribeToPostLikes,
  subscribeToPostComments,
  getSocket,
  onConnectionStatusChange,
  getConnectionStatus,
} from "../utils/socket";

/**
 * Hook to initialize Socket.io connection
 * @param {string} token - JWT access token
 */
export const useSocketConnection = (token) => {
  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = initializeSocket(token);

    return () => {
      // Don't disconnect on component unmount - keep connection alive
      // Only disconnect when user logs out (token becomes null)
    };
  }, [token]);
};

/**
 * Hook to monitor connection status and ensure socket is connected
 * Automatically attempts to reconnect if disconnected
 * @param {string} token - JWT access token (optional)
 * @returns {Object} { isConnected, status }
 */
export const useSocketStatus = (token) => {
  const [isConnected, setIsConnected] = useState(() => getConnectionStatus() === 'connected');
  const [status, setStatus] = useState(() => getConnectionStatus());

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = onConnectionStatusChange((newStatus) => {
      setStatus(newStatus);
      setIsConnected(newStatus === 'connected');
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Attempt to reconnect if disconnected and we have a token
  useEffect(() => {
    if (!token) return;

    if (!isConnected) {
      const socket = getSocket();
      if (socket && !socket.connected) {
        socket.connect();
      } else if (!socket) {
        initializeSocket(token);
      }
    }
  }, [isConnected, token]);

  return { isConnected, status };
};

/**
 * Hook to listen for real-time like updates on a post
 * @param {number} post_id - The post ID
 */
export const usePostLikeUpdates = (post_id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!post_id) return;

    const unsubscribe = subscribeToPostLikes(post_id, (data) => {
      // Update the likes count in cache
      queryClient.setQueryData(["postLikes", post_id], (old) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            likes_count: data.likes_count,
          },
        };
      });

      // Invalidate feed to show updated counts
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
    });

    return () => {
      unsubscribe();
    };
  }, [post_id, queryClient]);
};

/**
 * Hook to listen for real-time comment updates on a post
 * @param {number} post_id - The post ID
 */
export const usePostCommentUpdates = (post_id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!post_id) return;

    const unsubscribe = subscribeToPostComments(post_id, (data) => {
      console.log("Comment update received:", data);

      // Invalidate comments to refetch
      queryClient.invalidateQueries({ queryKey: ["postComments", post_id] });

      // Invalidate feed to show updated counts
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
    });

    return () => {
      unsubscribe();
    };
  }, [post_id, queryClient]);
};

export default {
  useSocketConnection,
  usePostLikeUpdates,
  usePostCommentUpdates,
};
