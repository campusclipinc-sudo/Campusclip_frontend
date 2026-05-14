import axios from "axios";
import { toast } from "react-toastify";

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000000,
  headers: {
    "content-type": "application/json",
  },
});

client.interceptors.request.use(
  (reqConfig) => {
    return reqConfig;
  },
  (err) => {
    console.error("Request Error", err);
    return Promise.reject(err);
  }
);

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (err) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || "API Error";
    const errorData = err?.response?.data;

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
    } else if (isAILimitError) {
      toast.error("AI processing limit reached. Please contact your organization for more quota.");
    } else {
      toast.error(message);
    }

    return Promise.reject(err);
  }
);

export default client;

export const setAuthToken = (token) => {
  client.defaults.headers.common["Authorization"] = "";
  delete client.defaults.headers.common["Authorization"];
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};
