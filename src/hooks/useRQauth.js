import { useMutation, useQuery } from "@tanstack/react-query";
import { UserService } from "../api/authService";

/**
 * Default error handler to display error messages using react-toastify.
 * @param {object} err - The error object from the mutation.
 */
const defaultError = () => {};

const useUserLogin = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => {
      return UserService.login(data);
    },
    onSuccess,
    onError,
  });
};

const useGoogleLogin = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => {
      return UserService.googleLogin(data);
    },
    onSuccess,
    onError,
  });
};

const useAppleLogin = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => {
      return UserService.appleLogin(data);
    },
    onSuccess,
    onError,
  });
};

const useUserRegister = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => {
      return UserService.register(data);
    },
    onSuccess,
    onError,
  });
};

const useGetProfile = (params, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["profile-data", params], // Query key
    queryFn: () => UserService.getProfile({ params }), // Query function
    onSuccess, // Success callback
    onError, // Error callback
  });
};

const useGetUserProfile = (userId, onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => UserService.getUserProfile(userId),
    enabled: Boolean(userId),
    onSuccess,
    onError,
  });
};

const useEditProfile = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => UserService.editProfile(data),
    onSuccess,
    onError,
  });
};

const useOtpVerify = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => UserService.otpVerify(data),
    onSuccess,
    onError,
  });
};

const useResendOtp = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => UserService.resendOtp(data),
    onSuccess,
    onError,
  });
};

const useSetPassword = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => UserService.setPassword(data),
    onSuccess,
    onError,
  });
};

const useForgotPassword = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => UserService.forgotPassword(data),
    onSuccess,
    onError,
  });
};

const useGetEducationalInstitutions = (onSuccess, onError = defaultError) => {
  return useQuery({
    queryKey: ["educational-institutions"],
    queryFn: () => UserService.getEducationalInstitutions(),
    onSuccess,
    onError,
  });
};

const useSetClassCount = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => UserService.setClassCount(data),
    onSuccess,
    onError,
  });
};

const useCompleteClassOnboarding = (onSuccess, onError = defaultError) => {
  return useMutation({
    mutationFn: (data) => UserService.completeClassOnboarding(data),
    onSuccess,
    onError,
  });
};

export {
  useUserLogin,
  useGoogleLogin,
  useAppleLogin,
  useUserRegister,
  useGetProfile,
  useGetUserProfile,
  useEditProfile,
  useOtpVerify,
  useResendOtp,
  useSetPassword,
  useForgotPassword,
  useGetEducationalInstitutions,
  useSetClassCount,
  useCompleteClassOnboarding,
};
