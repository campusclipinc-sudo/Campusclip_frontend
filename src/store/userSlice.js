import { createSlice } from "@reduxjs/toolkit";
import { setAuthToken } from "../libs/HttpClients";

const userSlice = createSlice({
  name: "user",
  initialState: {
    accessToken: null,
    isLogin: false,
    rememberMe: false,
    user: null,
  },
  reducers: {
    loginSuccess: (state, { payload }) => {
      state.payload = payload;
      state.user = payload.userData;
      state.isLogin = payload.isLogin;
      state.accessToken = payload.accessToken;
      state.rememberMe = !!payload.rememberMe;
      setAuthToken(payload.accessToken);
      return state;
    },
    logout: (state) => {
      state.accessToken = null;
      state.isLogin = false;
      state.rememberMe = false;
      state.user = null;
      // Clear axios default Authorization header
      setAuthToken(null);
      // Clear localStorage
      localStorage.clear();
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
    },
  },
});

export const { loginSuccess, logout, updateUser } = userSlice.actions;
export const isUserLoggedIn = (state) => state.user.isLogin;

export const getAccessToken = (state) => state.user.accessToken;
export const getActiveUserDetails = (state) => {
  return state.user.user;
};
export default userSlice.reducer;
