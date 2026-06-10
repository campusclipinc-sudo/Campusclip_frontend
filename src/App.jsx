import React, { useEffect, useMemo } from "react";
import { Provider, useSelector } from "react-redux";
import { store, persistor } from "./store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import PagesRoutes from "./routes/PagesRoutes";
import { ToastContainer } from "react-toastify";
import SocketProvider from "./components/SocketProvider";
import NotificationStateProvider from "./components/NotificationStateProvider";
import InstagramIOSVisibleErrors from "./components/InstagramIOSVisibleErrors";
import InstagramIOSStatusDisplay from "./components/InstagramIOSStatusDisplay";
import ScrollLockFixer from "./components/ScrollLockFixer";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./scss/base.scss";
import { setAuthToken } from "./libs/HttpClients";
import { setQueryClientRef } from "./store/logoutMiddleware";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import AOS from "aos";
import "aos/dist/aos.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 5 * 60 * 1000, // Reduced from 10 to 5 minutes for security
    },
    mutations: {
      retry: 0,
    },
  },
});

// Initialize queryClient reference for logout middleware
setQueryClientRef(queryClient);

const AppContent = React.memo(() => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const user = useSelector((state) => state.user);

  useEffect(() => {
    persistor.persist();
  }, []);

  useEffect(() => {
    if (user?.accessToken) {
      setAuthToken(user.accessToken);
    }
  }, [user?.accessToken]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Memoize provider clients to prevent unnecessary re-initialization
  const queryClientMemo = useMemo(() => queryClient, []);
  const googleClientIdMemo = useMemo(() => googleClientId, [googleClientId]);

  return (
    <>
      <InstagramIOSVisibleErrors />
      <InstagramIOSStatusDisplay />
      <HelmetProvider>
        <GoogleOAuthProvider clientId={googleClientIdMemo}>
          <QueryClientProvider client={queryClientMemo}>
            <SocketProvider>
              <NotificationStateProvider>
                <BrowserRouter>
                  <ScrollLockFixer />
                  <PagesRoutes />
                  <ToastContainer />
                </BrowserRouter>
              </NotificationStateProvider>
            </SocketProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </>
  );
});

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
