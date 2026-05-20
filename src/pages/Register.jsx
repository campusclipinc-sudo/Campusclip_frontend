import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Button, Alert, Spinner, Col, Row } from "react-bootstrap";
import { useGoogleLogin } from "@react-oauth/google";
import AppleSignin from "react-apple-signin-auth";
import SEOHead from "../components/SEOHead";
import { getMetadata } from "../utils/seoConfig";
import {
  useGetEducationalInstitutions,
  useUserRegister,
  useGoogleLogin as useGoogleLoginMutation,
} from "../hooks/index";
import { setAuthToken } from "../libs/HttpClients";
import { loginSuccess } from "../store/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import "../scss/Register.scss";
import TNInput from "../component/TNInput";
import { toast } from "react-toastify";
import logo from "../assets/EmailLogo.png";
import google from "../assets/google.svg";

const RegisterForm = () => {
  const metadata = getMetadata("signup");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  // const [appleLoading, setAppleLoading] = useState(false);

  const {
    mutate: register,
    isLoading,
    isSuccess,
  } = useUserRegister((res) => {
    localStorage.accessToken = res.data.accessToken;
    navigate("/otp-verify");
    const dataStore = {
      accessToken: res.data.accessToken,
      isLogin: res.data.isLogin,
    };
    dispatch(loginSuccess(dataStore));
    setAuthToken(res.data.accessToken);
    formik.resetForm();
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

      // Check if profile setup is required
      if (res.data.requiresProfileSetup) {
        navigate("/profile-setup");
      } else {
        navigate("/dashboard");
      }
    },
    (error) => {
      setGoogleLoading(false);
      console.error("Google login error:", error);
      toast.error(
        error?.response?.data?.message || "Google registration failed",
      );
    },
  );

  // const { mutate: appleLoginMutation } = useAppleLoginMutation(
  //   (res) => {
  //     const dataStore = {
  //       userData: res.data.userInfo,
  //       isLogin: res.data.isLogin,
  //       accessToken: res.data.accessToken,
  //       rememberMe: false,
  //     };
  //     dispatch(loginSuccess(dataStore));
  //     setAuthToken(res.data.accessToken);
  //     // setAppleLoading(false);

  //     // Check if profile setup is required
  //     if (res.data.requiresProfileSetup) {
  //       navigate("/profile-setup");
  //     } else {
  //       navigate("/dashboard");
  //     }
  //   },
  //   (error) => {
  //     // setAppleLoading(false);
  //     console.error("Apple login error:", error);
  //     toast.error(
  //       error?.response?.data?.message || "Apple registration failed",
  //     );
  //   },
  // );

  // Custom Google Login hook - allows full button customization
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleLoading(true);
      googleLoginMutation({ accessToken: tokenResponse.access_token });
    },
    onError: () => {
      setGoogleLoading(false);
      toast.error("Google registration failed. Please try again.");
    },
  });

  // const handleAppleSuccess = (response) => {
  //   setAppleLoading(true);
  //   appleLoginMutation({
  //     idToken: response.authorization.id_token,
  //     user: response.user,
  //   });
  // };

  // const handleAppleError = (error) => {
  //   setAppleLoading(false);
  //   console.error("Apple registration error:", error);
  //   toast.error("Apple registration failed. Please try again.");
  // };
  const { data: educationalInstitutions } = useGetEducationalInstitutions();
  const collegeOptions = educationalInstitutions?.data?.map((institution) => ({
    value: institution.id,
    label: institution.name,
  }));

  const formik = useFormik({
    initialValues: {
      full_name: "",
      email: "",
      username: "",
      educational_institution_id: "",
      academic_year: "",
      major: "",
      birthday: "",
      account_privacy: "0",
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      username: Yup.string()
        .transform((val) =>
          val ? val.trim().toLowerCase().replace(/^@/, "") : "",
        )
        .matches(
          /^[a-z][a-z0-9._]{1,28}[a-z0-9]$/,
          "Username must start with a letter, contain only letters, numbers, '.', or '_', and have no spaces",
        )
        .test(
          "no-consecutive-sep",
          "Username cannot contain consecutive '.' or '_'",
          (value) => (value ? !/[._]{2,}/.test(value) : true),
        )
        .required("Username is required"),
      educational_institution_id: Yup.string().required("Educational institution is required"),
      academic_year: Yup.string().required("Academic year is required"),
      major: Yup.string().required("Major is required"),
      birthday: Yup.string().notRequired(),
      account_privacy: Yup.string()
        .oneOf(["0", "1"])
        .required("Account privacy is required"),
    }),

    onSubmit: (values) => {
      const normalized = {
        ...values,
        username: values.username,
      };
      register(normalized);
    },
  });

  return (
    <>
      <SEOHead {...metadata} />
      <div className="register-page" role="main">
      <div className="register-wrap">
        {/* <div className="phone-mockup" aria-hidden="true" /> */}
        <div className="auth-column">
          <div
            className="card form-card"
            role="region"
            aria-labelledby="register-title"
          >
            <div className="brand">
              <img src={logo} alt="CampusClip" className="brand-logo" />
            </div>
            <h3 id="register-title" className="title">
              Welcome to CampusClip!
            </h3>
            <p className="subtitle">
              Complete your profile to connect with your campus community
            </p>

            <div className="social-login-section">
              <button
                type="button"
                className="google-btn"
                onClick={() => googleLogin()}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Signing up with Google...</span>
                  </>
                ) : (
                  <>
                    <img src={google} alt="Google" className="google-icon" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* {appleLoading ? (
                <button type="button" className="apple-btn loading mt-3" disabled>
                  <Spinner animation="border" size="sm" />
                  <span className="ms-2">Signing up with Apple...</span>
                </button>
              ) : (
                <div className="apple-login-wrapper mt-3">
                  <AppleSignin
                    authOptions={{
                      clientId: import.meta.env.VITE_APPLE_CLIENT_ID || "com.campusclip.web",
                      scope: "email name",
                      redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin,
                      state: "state",
                      nonce: "nonce",
                      usePopup: true,
                    }}
                    onSuccess={handleAppleSuccess}
                    onError={handleAppleError}
                    skipScript={false}
                    render={(props) => (
                      <button
                        {...props}
                        type="button"
                        className="apple-signin-btn"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        <span className="ms-2">Sign up with Apple</span>
                      </button>
                    )}
                  />
                </div>
              )} */}
            </div>

            <div className="divider" role="separator">
              <span>OR CONTINUE WITH EMAIL</span>
            </div>

            <Form
              noValidate
              onSubmit={formik.handleSubmit}
              className="register-form"
            >
              <Row>
                <Col>
                  <TNInput
                    margin="mb-2"
                    label={"Full name"}
                    name="full_name"
                    placeholder="Full name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.full_name}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <TNInput
                    margin="mb-2"
                    label={"Email"}
                    type="email"
                    name="email"
                    placeholder="Email address"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <TNInput
                    margin="mb-2"
                    label={"Username"}
                    name="username"
                    placeholder="@ username"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.username}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <TNInput
                    margin="mb-2"
                    type="select"
                    label={"University/College"}
                    name="educational_institution_id"
                    options={collegeOptions}
                    placeholder="e.g., University of California"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.educational_institution_id}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                </Col>
              </Row>
              <Row>
                <Col lg={6} md={6}>
                  <TNInput
                    label={"Year"}
                    type="select"
                    name="academic_year"
                    options={[
                      { value: "", label: "Select year" },
                      { value: "1", label: "1st Year" },
                      { value: "2", label: "2nd Year" },
                      { value: "3", label: "3rd Year" },
                      { value: "4", label: "4th Year" },
                      { value: "5", label: "Freshman" },
                      { value: "6", label: "Sophomore" },
                      { value: "7", label: "Junior" },
                      { value: "8", label: "Senior" },
                      { value: "9", label: "Graduate" },
                    ]}
                    value={formik.values.academic_year}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                </Col>
                <Col lg={6} md={6}>
                  <TNInput
                    label={"Major"}
                    name="major"
                    placeholder="E.g., Computer Science"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.major}
                    error={formik.errors}
                    touched={formik.touched}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="privacy-row mt-3 mb-4">
                    <label className="form-label">Account Privacy</label>
                    <Form.Check
                      type="switch"
                      id="account_privacy_switch"
                      label="Private Account"
                      checked={String(formik.values.account_privacy) === "1"}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "account_privacy",
                          e.target.checked ? "1" : "0",
                        )
                      }
                      aria-describedby="privacy-help"
                    />
                    <div id="privacy-help" className="form-text">
                      People will need to request to follow you
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <TNInput
                    label={"Birthday (Optional)"}
                    type="date"
                    name="birthday"
                    placeholder="Select your birthday"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.birthday}
                    error={formik.errors}
                    touched={formik.touched}
                    maxDate={new Date()}
                  />
                </Col>
              </Row>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="register-btn"
                aria-label="Submit registration form"
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Get Started"
                )}
              </Button>

              {isSuccess && (
                <Alert variant="success" className="mt-2">
                  Registration successful!
                </Alert>
              )}
            </Form>

            <p className="terms" role="note">
              By signing up, you agree to our Terms, Privacy Policy and Cookies
              Policy.
            </p>
          </div>

          <div className="card switch-card">
            <p>
              Have an account?{" "}
              <Link to="/login" aria-label="Go to login">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default RegisterForm;
