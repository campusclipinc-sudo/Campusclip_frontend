import { useEffect, useState } from "react";
import { saveFcmToken, removeFcmToken } from "../api/deviceService";
import {
  requestFCMToken,
  getDeviceInfo,
  onMessageListener,
} from "../utils/fcm";

/**
 * Custom hook to manage FCM token
 * Automatically requests permission and saves token when user logs in
 */
export const useFCM = (isAuthenticated = false) => {
  const [fcmToken, setFcmToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Initialize FCM when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const initializeFCM = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request FCM token
        const token = await requestFCMToken();

        if (token) {
          setFcmToken(token);

          // Get device information
          const deviceInfo = getDeviceInfo();

          // Save token to backend
          await saveFcmToken(token, "web", deviceInfo);

          // Store token in localStorage for cleanup on logout
          localStorage.setItem("fcm_token", token);

          console.log("FCM token saved successfully");
        }
      } catch (err) {
        console.error("Error initializing FCM:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFCM();
  }, [isAuthenticated]);

  // Listen for foreground messages
  useEffect(() => {
    if (!fcmToken) return;

    onMessageListener((payload) => {
      console.log("Received foreground message:", payload);

      // Show browser notification
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "New Notification", {
          body: payload.notification?.body || "",
          icon: payload.notification?.icon || "/logo.png",
        });
      }
    });
  }, [fcmToken]);

  // Cleanup function to remove FCM token on logout
  const cleanupFCM = async () => {
    const storedToken = localStorage.getItem("fcm_token");

    if (storedToken) {
      try {
        await removeFcmToken(storedToken);
        localStorage.removeItem("fcm_token");
        setFcmToken(null);
        console.log("FCM token removed successfully");
      } catch (err) {
        console.info("Error removing FCM token:", err);
      }
    }
  };

  return {
    fcmToken,
    isLoading,
    error,
    cleanupFCM, // Call this when user logs out
  };
};

export default useFCM;
