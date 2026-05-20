import { io } from "socket.io-client";

/**
 * Socket.io Client Utility
 * Manages WebSocket connection to the server for real-time updates
 */

let socket = null;
let connectionStatus = 'disconnected'; // Track connection state
let connectionStatusCallbacks = []; // Callbacks for connection status changes

/**
 * Register callback for connection status changes
 * @param {Function} callback - Function to call on status change
 * @returns {Function} Cleanup function
 */
export const onConnectionStatusChange = (callback) => {
  connectionStatusCallbacks.push(callback);
  // Immediately call with current status
  callback(connectionStatus);

  // Return cleanup function
  return () => {
    connectionStatusCallbacks = connectionStatusCallbacks.filter(cb => cb !== callback);
  };
};

/**
 * Get current connection status
 * @returns {string} Connection status: 'connected', 'connecting', 'disconnected'
 */
export const getConnectionStatus = () => {
  return connectionStatus;
};

/**
 * Update connection status and notify all listeners
 * @param {string} newStatus - New connection status
 */
const setConnectionStatus = (newStatus) => {
  if (connectionStatus !== newStatus) {
    connectionStatus = newStatus;
    connectionStatusCallbacks.forEach(callback => callback(newStatus));
  }
};

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

  // If socket exists but is disconnected, attempt to reconnect
  if (socket && !socket.connected) {
    socket.connect();
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
    reconnectionDelayGrowth: 1.2,
  });

  socket.on("connect", () => {
    console.log('Socket connected:', socket.id);
    setConnectionStatus('connected');
  });

  socket.on("disconnect", (reason) => {
    console.warn('Socket disconnected:', reason);
    setConnectionStatus('disconnected');
  });

  socket.on("reconnect_attempt", () => {
    console.log('Socket reconnection attempt...');
    setConnectionStatus('connecting');
  });

  socket.on("reconnect", () => {
    console.log('Socket reconnected');
    setConnectionStatus('connected');
  });

  socket.on("reconnect_error", (error) => {
    console.error('Socket reconnection error:', error);
    setConnectionStatus('disconnected');
  });

  socket.on("error", (error) => {
    console.error('Socket error:', error);
  });

  socket.on("connect_error", (error) => {
    console.error('Socket connection error:', error.message);
    setConnectionStatus('disconnected');
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
  onConnectionStatusChange,
  getConnectionStatus,
};
