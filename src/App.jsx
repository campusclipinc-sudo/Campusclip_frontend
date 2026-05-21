import React from "react";
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
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
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
// Import our global styles after Bootstrap so our tokens & Inter font override defaults
import "./scss/base.scss";
import { setAuthToken } from "./libs/HttpClients";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const handleOnBeforeLift = () => {
  if (
    store.getState().user?.accessToken !== undefined &&
    store.getState().user?.accessToken !== null
  ) {
    setAuthToken(store.getState().user.accessToken);
  }
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate
          loading={<LoadingSpinner />}
          persistor={persistor}
          onBeforeLift={handleOnBeforeLift}
        >
          <GoogleOAuthProvider clientId={googleClientId}>
            <QueryClientProvider client={queryClient}>
              <SocketProvider>
                <NotificationStateProvider>
                  <BrowserRouter>
                    <InstagramIOSWrapper>
                      <InstagramIOSDebugger />
                      <PagesRoutes />
                      <ToastContainer />
                    </InstagramIOSWrapper>
                  </BrowserRouter>
                </NotificationStateProvider>
              </SocketProvider>
            </QueryClientProvider>
          </GoogleOAuthProvider>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  );
}

export default App;
