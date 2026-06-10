import React, { useEffect, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getActiveUserDetails, isUserLoggedIn } from "../store/userSlice";

// Auth pages - loaded eagerly (needed immediately)
import Home from "../pages/Home";
import RegisterForm from "../pages/Register";
import LoginForm from "../pages/Login";
import OtpVerify from "../pages/OtpVerify";
import SetPassword from "../pages/SetPassword";
import ForgotPassword from "../pages/ForgotPassword";
import Waitlist from "../pages/Waitlist";

// Lazy-loaded pages (split into separate chunks)
const ProfileSetup = React.lazy(() => import("../pages/ProfileSetup"));
const SelectClassCount = React.lazy(() => import("../pages/SelectClassCount"));
const AddClasses = React.lazy(() => import("../pages/AddClasses"));
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
const Feed = React.lazy(() => import("../pages/feed/Feed"));
const Chat = React.lazy(() => import("../pages/chat/Chat"));
const Calendar = React.lazy(() => import("../pages/Calendar"));
const Profile = React.lazy(() => import("../pages/profile/Profile"));
const Followers = React.lazy(() => import("../pages/profile/Followers"));
const Following = React.lazy(() => import("../pages/profile/Following"));
const FollowRequests = React.lazy(() => import("../pages/profile/FollowRequests"));
const Clubs = React.lazy(() => import("../pages/clubs/Clubs"));
const ClubDetails = React.lazy(() => import("../pages/clubs/ClubDetails"));
const ClassDetails = React.lazy(() => import("../pages/class/ClassDetails"));
const Archive = React.lazy(() => import("../pages/archive/Archive"));
const Search = React.lazy(() => import("../pages/Search"));
const AllClasses = React.lazy(() => import("../pages/AllClasses"));
const AllStudents = React.lazy(() => import("../pages/AllStudents"));
const AllClubs = React.lazy(() => import("../pages/AllClubs"));
const PaymentSuccess = React.lazy(() => import("../pages/events/PaymentSuccess"));
const PaymentCancel = React.lazy(() => import("../pages/events/PaymentCancel"));
const Notifications = React.lazy(() => import("../pages/Notifications"));
const StudentProfile = React.lazy(() => import("../pages/StudentProfile"));

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
          <Route path="/" element={<Waitlist />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<RegisterForm />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      );
    }
    return null;
  };

  const WithSuspense = (Component) => (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );

  const prepareLoggedInRoutes = () => {
    if (isLoggedIn && userData) {
      // Profile setup not complete
      if (userData.profile_setup === false) {
        return (
          <>
            <Route path="/profile-setup" element={WithSuspense(ProfileSetup)} />
            <Route path="*" element={<Navigate to="/profile-setup" replace />} />
          </>
        );
      }

      // Class onboarding not complete
      if (userData.classes_onboarding_completed === false) {
        return (
          <>
            <Route path="/select-class-count" element={WithSuspense(SelectClassCount)} />
            <Route path="/add-classes" element={WithSuspense(AddClasses)} />
            <Route path="*" element={<Navigate to="/select-class-count" replace />} />
          </>
        );
      }

      // Full access - onboarding complete
      return (
        <>
          <Route path="/profile-setup" element={WithSuspense(ProfileSetup)} />
          <Route path="/select-class-count" element={WithSuspense(SelectClassCount)} />
          <Route path="/add-classes" element={WithSuspense(AddClasses)} />
          <Route path="/dashboard" element={WithSuspense(Dashboard)} />
          <Route path="/feed" element={WithSuspense(Feed)} />
          <Route path="/chat" element={WithSuspense(Chat)} />
          <Route path="/calendar" element={WithSuspense(Calendar)} />
          <Route path="/notifications" element={WithSuspense(Notifications)} />
          <Route path="/profile" element={WithSuspense(Profile)} />
          <Route path="/profile/:userId" element={WithSuspense(Profile)} />
          <Route path="/profile/followers" element={WithSuspense(Followers)} />
          <Route path="/profile/:userId/followers" element={WithSuspense(Followers)} />
          <Route path="/profile/following" element={WithSuspense(Following)} />
          <Route path="/profile/:userId/following" element={WithSuspense(Following)} />
          <Route path="/follow-requests" element={WithSuspense(FollowRequests)} />
          <Route path="/students/:id" element={WithSuspense(StudentProfile)} />
          <Route path="/clubs" element={WithSuspense(Clubs)} />
          <Route path="/clubs/:id" element={WithSuspense(ClubDetails)} />
          <Route path="/archive" element={WithSuspense(Archive)} />
          <Route path="/class/:id" element={WithSuspense(ClassDetails)} />
          <Route path="/search" element={WithSuspense(Search)} />
          <Route path="/search/classes" element={WithSuspense(AllClasses)} />
          <Route path="/search/students" element={WithSuspense(AllStudents)} />
          <Route path="/search/clubs" element={WithSuspense(AllClubs)} />
          <Route path="/events/payment-success" element={WithSuspense(PaymentSuccess)} />
          <Route path="/events/payment-cancel" element={WithSuspense(PaymentCancel)} />
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
