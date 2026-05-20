import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { EnvelopeAt } from "react-bootstrap-icons";
import TNInput from "../component/TNInput";
import SEOHead from "../components/SEOHead";
import { getMetadata } from "../utils/seoConfig";
import "../scss/ForgotPassword.scss";
import { toast } from "react-toastify";
import { useForgotPassword } from "../hooks/index";

const ForgotPassword = () => {
  const metadata = getMetadata("forgotPassword");
  const navigate = useNavigate();

  const { mutate: forgot, isLoading } = useForgotPassword((res) => {
    const token = res?.data?.accessToken;
    if (token) {
      localStorage.accessToken = token;
    }
    navigate("/otp-verify");
  });

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: (values) => {
      forgot({ email: values.email });
    },
  });

  return (
    <>
      <SEOHead {...metadata} />
      <div className="register-page auth-flow-page" role="main">
      <div className="register-wrap">
        <div className="auth-column">
          <div
            className="card form-card"
            role="region"
            aria-labelledby="forgot-title"
          >
            <div className="auth-icon-wrap" aria-hidden="true">
              <EnvelopeAt size={26} />
            </div>

            <span className="auth-step-badge">Step 1 of 3</span>

            <h3 id="forgot-title" className="title">
              Forgot your password?
            </h3>
            <p className="auth-subtitle">
              Enter your email address and we'll send you a 6-digit verification
              code.
            </p>

            <Form
              noValidate
              onSubmit={formik.handleSubmit}
              className="register-form"
            >
              <TNInput
                label={"Email"}
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.errors}
                touched={formik.touched}
              />
              <Button
                type="submit"
                className="register-btn"
                disabled={isLoading}
                aria-label="Send reset link"
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </Form>
          </div>

          <div className="card switch-card">
            <div className="d-flex justify-content-center gap-2">
              <span >Remembered your password?</span>
              <Link
                to="/login"
                className="link-primary"
                aria-label="Go to login"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ForgotPassword;
