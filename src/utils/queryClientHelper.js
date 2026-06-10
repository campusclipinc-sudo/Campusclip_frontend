import { useQueryClient } from '@tanstack/react-query';

// List of all query keys that should be cleared on logout
const SENSITIVE_QUERY_KEYS = [
  'profile-data',
  'user-profile',
  'clubs',
  'club',
  'posts',
  'posts-infinite',
  'assignments',
  'schedules',
  'events',
  'class',
  'chat-messages',
  'notifications',
  'requests',
  'members',
  'followers',
  'following',
  'archive',
];

/**
 * Clear React Query cache completely
 * Used during logout to ensure no stale data persists
 */
export const clearQueryCache = (queryClient) => {
  if (!queryClient) return;

  try {
    // Clear all queries matching sensitive keys
    SENSITIVE_QUERY_KEYS.forEach(key => {
      queryClient.removeQueries({ queryKey: [key] });
    });

    // Also clear all queries completely for safety
    queryClient.clear();
    console.log('[Auth] React Query cache cleared on logout');
  } catch (error) {
    console.error('[Auth] Error clearing query cache:', error);
  }
};

/**
 * Get useQueryClient hook (wrapper for convenience)
 */
export const useQueryClientHelper = () => {
  return useQueryClient();
};

/**
 * Invalidate user-specific queries after login
 */
export const invalidateUserQueries = (queryClient) => {
  if (!queryClient) return;

  try {
    // Invalidate all user-specific queries
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Invalidate queries that contain user-specific keys
        return SENSITIVE_QUERY_KEYS.some(key =>
          query.queryKey.some(k => typeof k === 'string' && k.includes(key))
        );
      }
    });
    console.log('[Auth] User queries invalidated on login');
  } catch (error) {
    console.error('[Auth] Error invalidating queries:', error);
  }
};
