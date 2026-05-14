import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ChannelNotificationService from '../api/channelNotificationService';
import { getSocket } from '../utils/socket';
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

    const attachListener = () => {
      const socket = getSocket();
      if (!socket) {
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

    return () => {
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
      cleanup();
    };
  }, [accessToken, dispatch]);

  return children;
};

export default NotificationStateProvider;
