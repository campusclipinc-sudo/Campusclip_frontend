import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout as reduxLogout } from '../store/userSlice';
import { clearQueryCache } from '../utils/queryClientHelper';

/**
 * Custom hook for proper logout with cache clearing
 * Ensures:
 * 1. React Query cache is cleared
 * 2. Redux state is cleared
 * 3. Auth token is cleared
 * 4. Cookies and localStorage are cleared
 * 5. User is redirected to login
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const logout = (options = {}) => {
    const { redirectTo = '/login', callback } = options;

    try {
      // Step 1: Clear React Query cache FIRST (before Redux logout clears the token)
      clearQueryCache(queryClient);

      // Step 2: Dispatch Redux logout (clears auth token, localStorage, cookies)
      dispatch(reduxLogout());

      // Step 3: Execute callback if provided
      if (callback) {
        callback();
      }

      // Step 4: Redirect to login page
      setTimeout(() => {
        navigate(redirectTo);
      }, 100);

      console.log('[Auth] Logout completed successfully');
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
      // Force redirect even on error
      navigate(redirectTo);
    }
  };

  return { logout };
};
