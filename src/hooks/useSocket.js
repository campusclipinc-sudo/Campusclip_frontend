import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  initializeSocket,
  disconnectSocket,
  subscribeToPostLikes,
  subscribeToPostComments,
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
      disconnectSocket();
    };
  }, [token]);
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
