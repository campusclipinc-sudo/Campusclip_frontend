import { logout } from './userSlice';

/**
 * Redux middleware to clear React Query cache on logout
 * This is needed because:
 * 1. HTTP interceptor dispatches logout without access to queryClient
 * 2. We need to ensure cache is cleared regardless of logout source
 */
let queryClientRef = null;

export const setQueryClientRef = (queryClient) => {
  queryClientRef = queryClient;
};

export const logoutMiddleware = () => (next) => (action) => {
  // Check if this is a logout action
  if (action.type === logout.type) {
    // Clear React Query cache when logout action is dispatched
    if (queryClientRef) {
      try {
        queryClientRef.clear();
        console.log('[Middleware] React Query cache cleared on logout action');
      } catch (error) {
        console.error('[Middleware] Error clearing cache:', error);
      }
    }
  }

  return next(action);
};
