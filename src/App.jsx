import React, { useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store, persistor } from "./store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import PagesRoutes from "./routes/PagesRoutes";
import { ToastContainer } from "react-toastify";
import SocketProvider from "./components/SocketProvider";
import NotificationStateProvider from "./components/NotificationStateProvider";
import InstagramIOSWrapper from "./components/InstagramIOSWrapper";
import InstagramIOSDebugger from "./components/InstagramIOSDebugger";
import InstagramIOSErrorBoundary from "./components/InstagramIOSErrorBoundary";
import InstagramIOSVisibleErrors from "./components/InstagramIOSVisibleErrors";
import InstagramIOSStatusDisplay from "./components/InstagramIOSStatusDisplay";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./scss/base.scss";
import { setAuthToken } from "./libs/HttpClients";
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
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

const AppContent = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const dispatch = useDispatch();
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

  return (
    <>
      <InstagramIOSVisibleErrors />
      <InstagramIOSStatusDisplay />
      <HelmetProvider>
        <GoogleOAuthProvider clientId={googleClientId}>
          <QueryClientProvider client={queryClient}>
            <SocketProvider>
              <NotificationStateProvider>
                <BrowserRouter>
                  <InstagramIOSWrapper>
                    <InstagramIOSErrorBoundary>
                      <InstagramIOSDebugger />
                      <PagesRoutes />
                      <ToastContainer />
                    </InstagramIOSErrorBoundary>
                  </InstagramIOSWrapper>
                </BrowserRouter>
              </NotificationStateProvider>
            </SocketProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
