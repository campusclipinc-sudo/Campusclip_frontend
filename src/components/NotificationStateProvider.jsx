import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ChannelNotificationService from '../api/channelNotificationService';
import { getSocket, onConnectionStatusChange } from '../utils/socket';
import {
  resetNotificationSummary,
  setNotificationSummary,
} from '../store/notificationSlice';

const NotificationStateProvider = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.user?.accessToken);
  const userData = useSelector((state) => state.user?.userData);
  const isLogin = useSelector((state) => state.user?.isLogin);

  useEffect(() => {
    if (!accessToken) {
      dispatch(resetNotificationSummary());
      return;
    }

    // Skip getSummary API call for new users during registration flow
    // Only fetch summary after user has completed OTP verification and password setup
    if (!isLogin || !userData?.profile_setup) {
      return;
    }

    let isMounted = true;

    ChannelNotificationService.getSummary()
      .then((response) => {
        if (!isMounted) return;
        dispatch(setNotificationSummary(response?.data || response));
      })
      .catch((error) => {
        console.error('Failed to fetch channel notifications:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, isLogin, userData?.profile_setup, dispatch]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let retryTimeout = null;
    let cleanup = () => {};
    let unsubscribeFromConnectionStatus = null;

    const attachListener = () => {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        retryTimeout = window.setTimeout(attachListener, 300);
        return;
      }

      const handleStateUpdate = (summary) => {
        dispatch(setNotificationSummary(summary));
      };

      socket.on('notification:state-updated', handleStateUpdate);
      cleanup = () => {
        socket.off('notification:state-updated', handleStateUpdate);
      };
    };

    attachListener();

    // Re-attach listener when socket reconnects
    unsubscribeFromConnectionStatus = onConnectionStatusChange((status) => {
      if (status === 'connected') {
        // Clear existing cleanup
        cleanup();
        // Re-attach listener
        attachListener();
      }
    });

    return () => {
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
      if (unsubscribeFromConnectionStatus) {
        unsubscribeFromConnectionStatus();
      }
      cleanup();
    };
  }, [accessToken, dispatch]);

  return children;
};

export default NotificationStateProvider;
