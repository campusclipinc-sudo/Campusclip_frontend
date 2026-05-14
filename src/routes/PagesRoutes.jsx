import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getActiveUserDetails, isUserLoggedIn } from "../store/userSlice";

import Home from "../pages/Home";
import RegisterForm from "../pages/Register";
import LoginForm from "../pages/Login";
import ProfileSetup from "../pages/ProfileSetup";
import SelectClassCount from "../pages/SelectClassCount";
import AddClasses from "../pages/AddClasses";
import Dashboard from "../pages/Dashboard";
import Feed from "../pages/feed/Feed";
import Chat from "../pages/chat/Chat";
import Calendar from "../pages/Calendar";
import Profile from "../pages/profile/Profile";
import Followers from "../pages/profile/Followers";
import Following from "../pages/profile/Following";
import FollowRequests from "../pages/profile/FollowRequests";
import Clubs from "../pages/clubs/Clubs";
import ClubDetails from "../pages/clubs/ClubDetails";
import OtpVerify from "../pages/OtpVerify";
import SetPassword from "../pages/SetPassword";
import ForgotPassword from "../pages/ForgotPassword";
import ClassDetails from "../pages/class/ClassDetails";
import Archive from "../pages/archive/Archive";
import Search from "../pages/Search";
import AllClasses from "../pages/AllClasses";
import AllStudents from "../pages/AllStudents";
import AllClubs from "../pages/AllClubs";
import PaymentSuccess from "../pages/events/PaymentSuccess";
import PaymentCancel from "../pages/events/PaymentCancel";
import Notifications from "../pages/Notifications";

import StudentProfile from "../pages/StudentProfile";

const PagesRoutes = () => {
  const isLoggedIn = useSelector(isUserLoggedIn);
  const userData = useSelector(getActiveUserDetails);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && userData) {
      // Check profile setup first
      if (userData.profile_setup === false) {
        navigate("/profile-setup");
      }
      // Then check class onboarding
      else if (userData.classes_onboarding_completed === false) {
        // If class count is set, go to add classes page
        if (userData.onboarding_class_count && userData.onboarding_class_count > 0) {
          navigate("/add-classes");
        } else {
          navigate("/select-class-count");
        }
      }
    }
  }, [isLoggedIn, userData, userData?.profile_setup, userData?.classes_onboarding_completed]);

  const PrepareRoutesWithoutLogin = () => {
    if (!isLoggedIn) {
      return (
        <>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<RegisterForm />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      );
    }
    return null;
  };

  const prepareLoggedInRoutes = () => {
    if (isLoggedIn && userData) {
      // Profile setup not complete
      if (userData.profile_setup === false) {
        return (
          <>
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="*" element={<Navigate to="/profile-setup" replace />} />
          </>
        );
      }

      // Class onboarding not complete
      if (userData.classes_onboarding_completed === false) {
        return (
          <>
            <Route path="/select-class-count" element={<SelectClassCount />} />
            <Route path="/add-classes" element={<AddClasses />} />
            <Route path="*" element={<Navigate to="/select-class-count" replace />} />
          </>
        );
      }

      // Full access - onboarding complete
      return (
        <>
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/select-class-count" element={<SelectClassCount />} />
          <Route path="/add-classes" element={<AddClasses />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/followers" element={<Followers />} />
          <Route path="/profile/:userId/followers" element={<Followers />} />
          <Route path="/profile/following" element={<Following />} />
          <Route path="/profile/:userId/following" element={<Following />} />
          <Route path="/follow-requests" element={<FollowRequests />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetails />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/class/:id" element={<ClassDetails />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search/classes" element={<AllClasses />} />
          <Route path="/search/students" element={<AllStudents />} />
          <Route path="/search/clubs" element={<AllClubs />} />
          <Route
            path="/events/payment-success"
            element={<PaymentSuccess />}
          />
          <Route path="/events/payment-cancel" element={<PaymentCancel />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      );
    }
    return null;
  };
  return (
    <Routes>
      {/* Public Routes */}
      {PrepareRoutesWithoutLogin()}

      {/* Private Routes */}
      {prepareLoggedInRoutes()}
    </Routes>
  );
};

export default PagesRoutes;
