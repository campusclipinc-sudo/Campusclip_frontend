import { io } from "socket.io-client";

/**
 * Socket.io Client Utility
 * Manages WebSocket connection to the server for real-time updates
 */

let socket = null;

/**
 * Initialize Socket.io connection
 * @param {string} token - JWT access token for authentication
 * @returns {Object} Socket instance
 */
export const initializeSocket = (token) => {
  // Only reuse existing socket if it's already connected
  if (socket && socket.connected) {
    return socket;
  }

  // If socket exists but is disconnected or connecting, don't create a new one yet
  if (socket && !socket.connected) {
    return socket;
  }

  const serverUrl =
    import.meta.env.VITE_API_BASE_URL || "https://api-dev.campusclip.com";

  socket = io(serverUrl, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    // Socket connected
  });

  socket.on("disconnect", (reason) => {
    // Socket disconnected
  });

  socket.on("error", (error) => {
    console.error('Socket error:', error);
  });

  socket.on("connect_error", (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

/**
 * Get current socket instance
 * @returns {Object|null} Socket instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket connection
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Subscribe to like events for a specific post
 * @param {number} post_id - The post ID
 * @param {Function} callback - Callback function to handle like events
 * @returns {Function} Cleanup function to unsubscribe
 */
export const subscribeToPostLikes = (post_id, callback) => {
  if (!socket) {
    return () => {};
  }

  const eventName = `post:${post_id}:like`;

  socket.on(eventName, callback);

  // Return cleanup function
  return () => {
    socket.off(eventName, callback);
  };
};

/**
 * Subscribe to comment events for a specific post
 * @param {number} post_id - The post ID
 * @param {Function} callback - Callback function to handle comment events
 * @returns {Function} Cleanup function to unsubscribe
 */
export const subscribeToPostComments = (post_id, callback) => {
  if (!socket) {
    return () => {};
  }

  const eventName = `post:${post_id}:comment`;

  socket.on(eventName, callback);

  // Return cleanup function
  return () => {
    socket.off(eventName, callback);
  };
};

/**
 * Subscribe to new message notifications
 * Receives notifications when user gets a new message (private or group)
 * even if they're not currently viewing that chat
 * @param {Function} callback - Callback function to handle notification
 * @returns {Function} Cleanup function to unsubscribe
 */
export const subscribeToNewMessages = (callback) => {
  if (!socket) {
    return () => {};
  }

  socket.on("notification:new-message", callback);

  // Return cleanup function
  return () => {
    socket.off("notification:new-message", callback);
  };
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  subscribeToPostLikes,
  subscribeToPostComments,
  subscribeToNewMessages,
};
