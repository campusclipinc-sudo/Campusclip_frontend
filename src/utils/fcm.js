import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBJlGOOmYV2RMGXRagPcc-QVDJ12jWQ69I",
  authDomain: "campus-clip-207c9.firebaseapp.com",
  projectId: "campus-clip-207c9",
  storageBucket: "campus-clip-207c9.firebasestorage.app",
  messagingSenderId: "450569890816",
  appId: "1:450569890816:web:c3489cd8f72e47b22a3ce5",
  measurementId: "G-S76E0RVTJL",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestFCMToken = async () => {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.log(
        "No FCM token available. Make sure you have configured Firebase correctly."
      );
      return null;
    }
  } catch (error) {
    console.info("Error getting FCM token:", error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload);
    callback(payload);
  });
};

/**
 * Get device information for tracking
 * @returns {Object} Device info object
 */
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;

  // Detect browser
  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  // Detect OS
  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  return {
    browser,
    os,
    userAgent,
    timestamp: new Date().toISOString(),
  };
};

export default {
  requestFCMToken,
  onMessageListener,
  getDeviceInfo,
};
