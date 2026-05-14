// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// TODO: Replace with your Firebase config
// You can get these values from Firebase Console > Project Settings > General > Your apps > Web app
firebase.initializeApp({
  apiKey: "AIzaSyBJlGOOmYV2RMGXRagPcc-QVDJ12jWQ69I",
  authDomain: "campus-clip-207c9.firebaseapp.com",
  projectId: "campus-clip-207c9",
  storageBucket: "campus-clip-207c9.firebasestorage.app",
  messagingSenderId: "450569890816",
  appId: "1:450569890816:web:c3489cd8f72e47b22a3ce5",
  measurementId: "G-S76E0RVTJL",
});
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification?.title || "Campus Clip";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: payload.notification?.icon || "/logo.png",
    badge: "/logo.png",
    tag: payload.data?.tag || "notification",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event);
  event.notification.close();

  // Handle the click - you can open a specific URL based on notification data
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
