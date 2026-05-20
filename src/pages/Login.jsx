import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";
import { toast } from "react-toastify";
import TNInput from "../component/TNInput";
import SEOHead from "../components/SEOHead";
import { getMetadata } from "../utils/seoConfig";
import {
  useUserLogin,
  useGoogleLogin as useGoogleLoginMutation,
  useAppleLogin as useAppleLoginMutation,
} from "../hooks/index";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/userSlice";
import "../scss/AuthSplit.scss";
import { setAuthToken } from "../libs/HttpClients";
import google from "../assets/google.svg";
import logo from "../assets/logo.png";
import AOS from "aos";
import "aos/dist/aos.css";

const LoginForm = () => {
  const metadata = getMetadata("login");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const savedEmail = localStorage.getItem("rememberEmail") || "";
  const savedPassword = localStorage.getItem("rememberPassword") || "";
  const savedRemember = !!(savedEmail || savedPassword);

  const loadRememberedAccounts = () => {
    try {
      const raw = localStorage.getItem("rememberedAccounts");
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) return arr.filter((x) => x && x.email);
      return [];
    } catch {
      return [];
    }
  };

  const saveRememberedAccounts = (list) => {
    try {
      localStorage.setItem("rememberedAccounts", JSON.stringify(list));
    } catch {
      return;
    }
  };

  const rememberedAccounts = loadRememberedAccounts();

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-quart",
      once: true,
      offset: 40,
    });
  }, []);

  const { mutate: login, isLoading } = useUserLogin((res) => {
    const dataStore = {
      userData: res.data.userInfo,
      isLogin: res.data.isLogin,
      accessToken: res.data.accessToken,
      rememberMe: formik.values.rememberMe,
    };
    dispatch(loginSuccess(dataStore));
    setAuthToken(res.data.accessToken);
    formik.resetForm();
    navigate("/dashboard");
  });

  const { mutate: googleLoginMutation } = useGoogleLoginMutation(
    (res) => {
      const dataStore = {
        userData: res.data.userInfo,
        isLogin: res.data.isLogin,
        accessToken: res.data.accessToken,
        rememberMe: false,
      };
      dispatch(loginSuccess(dataStore));
      setAuthToken(res.data.accessToken);
      setGoogleLoading(false);
      if (res.data.requiresProfileSetup) {
        navigate("/profile-setup");
      } else {
        navigate("/dashboard");
      }
    },
    (error) => {
      setGoogleLoading(false);
      console.error("Google login error:", error);
      toast.error(error?.response?.data?.message || "Google login failed");
    },
  );

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleLoading(true);
      googleLoginMutation({ accessToken: tokenResponse.access_token });
    },
    onError: () => {
      setGoogleLoading(false);
      toast.error("Google login failed. Please try again.");
    },
  });

  const { mutate: appleLoginMutation } = useAppleLoginMutation(
    (res) => {
      const dataStore = {
        userData: res.data.userInfo,
        isLogin: res.data.isLogin,
        accessToken: res.data.accessToken,
        rememberMe: false,
      };
      dispatch(loginSuccess(dataStore));
      setAuthToken(res.data.accessToken);
      setAppleLoading(false);
      if (res.data.requiresProfileSetup) {
        navigate("/profile-setup");
      } else {
        navigate("/dashboard");
      }
    },
    (error) => {
      setAppleLoading(false);
      console.error("Apple login error:", error);
      toast.error(error?.response?.data?.message || "Apple login failed");
    },
  );

  const handleAppleSuccess = (response) => {
    setAppleLoading(true);
    appleLoginMutation({
      idToken: response.authorization.id_token,
      user: response.user,
    });
  };

  const handleAppleError = (error) => {
    setAppleLoading(false);
    console.error("Apple login error:", error);
    toast.error("Apple login failed. Please try again.");
  };

  const formik = useFormik({
    initialValues: {
      email: savedEmail,
      password: savedPassword,
      rememberMe: savedRemember,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
      const { email, password, rememberMe } = values;
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberPassword", password);
        const list = loadRememberedAccounts();
        const now = Date.now();
        const filtered = list.filter((a) => a.email !== email);
        const updated = [{ email, lastUsedAt: now }, ...filtered].slice(0, 5);
        saveRememberedAccounts(updated);
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.removeItem("rememberPassword");
      }
      login({ email, password });
    },
  });

  return (
    <>
      <SEOHead {...metadata} />
      <div className="auth-split">
      {/* Decorative background orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <div className="auth-grid">
        {/* Left: Form panel */}
        <div className="left-pane" data-aos="fade-right">
          <div className="form-card">
            {/* Brand */}
            <div className="brand" data-aos="fade-down" data-aos-delay="100">
              <img src={logo} alt="CampusClip" className="brand-logo" />
              {/* <span className="brand-name">CampusClip</span> */}
            </div>

            <div className="form-heading" data-aos="fade-up" data-aos-delay="150">
              <p>Sign in to continue to your account</p>
            </div>

            {/* Google login */}
            <div data-aos="fade-up" data-aos-delay="200">
              <button
                type="button"
                className="google-btn"
                onClick={() => googleLogin()}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <img src={google} alt="Google" className="google-icon" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            <div className="divider" role="separator" data-aos="fade-up" data-aos-delay="250">
              <span>or sign in with email</span>
            </div>

            <Form
              noValidate
              onSubmit={formik.handleSubmit}
              className="login-form"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <TNInput
                label="Email address"
                type="email"
                name="email"
                placeholder="name@university.edu"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.errors}
                touched={formik.touched}
                list="remembered-emails"
              />
              <datalist id="remembered-emails">
                {rememberedAccounts.map((acc) => (
                  <option key={acc.email} value={acc.email} />
                ))}
              </datalist>

              <div className="mt-3">
                <TNInput
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Min 8 characters"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  error={formik.errors}
                  touched={formik.touched}
                />
              </div>

              <div className="form-options mt-3 mb-4">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  label="Remember me"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  className="remember-checkbox"
                />
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="login-btn"
                aria-label="Submit login form"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </Button>

              <div className="signup-prompt">
                <span>Don't have an account?</span>
                <Link to="/signup" className="signup-link">
                  Create Account
                </Link>
              </div>
            </Form>

            <div className="auth-footer">
              <p>&copy; {new Date().getFullYear()} CampusClip. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Right: Showcase panel */}
        <div className="right-pane" data-aos="fade-left">
          <div className="showcase-inner">
            <div className="showcase-badge" data-aos="fade-down" data-aos-delay="200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span>Student Platform</span>
            </div>

            <h2 className="showcase-title" data-aos="fade-up" data-aos-delay="250">
              Your Academic Hub,<br />All in One Place
            </h2>
            <p className="showcase-subtitle" data-aos="fade-up" data-aos-delay="300">
              Track classes, manage assignments, connect with clubs, and stay organized throughout your campus journey.
            </p>

            {/* Stats */}
            <div className="stats-row" data-aos="fade-up" data-aos-delay="350">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Universities</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Clubs</span>
              </div>
            </div>

            {/* Features */}
            <div className="feature-list">
              <div className="feature-item" data-aos="fade-up" data-aos-delay="400">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <span className="feature-title">Track Classes & Grades</span>
                  <span className="feature-desc">Monitor your academic performance in real time</span>
                </div>
              </div>

              <div className="feature-item" data-aos="fade-up" data-aos-delay="480">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                    <path d="m9 16 2 2 4-4"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <span className="feature-title">Manage Assignments</span>
                  <span className="feature-desc">Never miss a deadline with smart reminders</span>
                </div>
              </div>

              <div className="feature-item" data-aos="fade-up" data-aos-delay="560">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <span className="feature-title">Join Campus Clubs</span>
                  <span className="feature-desc">Connect with students who share your interests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative floating shapes */}
          <div className="float-shape shape-1" />
          <div className="float-shape shape-2" />
          <div className="float-shape shape-3" />
        </div>
      </div>
      </div>
    </>
  );
};

export default LoginForm;
