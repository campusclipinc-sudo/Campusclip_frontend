import axios from "axios";
import { toast } from "react-toastify";

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 30000,
  headers: {
    "content-type": "application/json",
  },
});

let lastErrorTime = 0;
let lastErrorMessage = "";
const ERROR_DEBOUNCE_MS = 2000;

const showErrorOnce = (message) => {
  const now = Date.now();
  if (now - lastErrorTime > ERROR_DEBOUNCE_MS || message !== lastErrorMessage) {
    lastErrorTime = now;
    lastErrorMessage = message;
    toast.error(message);
  }
};

client.interceptors.request.use(
  (reqConfig) => {
    console.log("Request:", reqConfig.url, reqConfig.method);
    return reqConfig;
  },
  (err) => {
    console.error("Request Error", err);
    return Promise.reject(err);
  },
);

client.interceptors.response.use(
  (response) => {
    console.log("Response Success:", response.status, response.config.url);
    return response;
  },
  async (err) => {
    console.error("Response Error - Status:", err?.response?.status);
    console.error("Response Error - Full:", err);
    const status = err?.response?.status;
    const message = err?.response?.data?.message || "Server error";
    const errorData = err?.response?.data;

    console.log("Error Details - Status:", status, "Message:", message);

    // Check for AI/quota limit errors
    const isAILimitError =
      status === 429 || // Too Many Requests
      status === 503 || // Service Unavailable
      message?.toLowerCase()?.includes("quota") ||
      message?.toLowerCase()?.includes("rate limit") ||
      message?.toLowerCase()?.includes("ai limit") ||
      message?.toLowerCase()?.includes("limit exceeded") ||
      errorData?.error?.toLowerCase()?.includes("quota") ||
      errorData?.error?.toLowerCase()?.includes("rate limit");

    if (status === 401 || status === 403) {
      const { store } = await import("../store");
      const { logout } = await import("../store/userSlice");
      store.dispatch(logout());
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (status === 503) {
      showErrorOnce(
        "Service unavailable. The server is temporarily down. Please try again in a few moments.",
      );
    } else if (isAILimitError) {
      showErrorOnce(
        "AI processing limit reached. Please contact your organization for more quota.",
      );
    } else if (!status || status >= 500) {
      showErrorOnce(
        "Server is temporarily unavailable. Please try again later.",
      );
    } else {
      showErrorOnce(message);
    }

    return Promise.reject(err);
  },
);

export default client;

export const setAuthToken = (token) => {
  client.defaults.headers.common["Authorization"] = "";
  delete client.defaults.headers.common["Authorization"];
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};
