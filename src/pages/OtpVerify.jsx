import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ShieldLock } from "react-bootstrap-icons";
import SEOHead from "../components/SEOHead";
import { getMetadata } from "../utils/seoConfig";
import { useOtpVerify, useResendOtp } from "../hooks/index";
import { toast } from "react-toastify";
import "../scss/OTPVerify.scss";

const OtpVerify = () => {
  const metadata = getMetadata("otpVerify");
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/g, "Enter 6 digit OTP")
        .required("OTP is required"),
    }),
    onSubmit: (values) => {
      const otpValue = otpDigits.join("");
      if (otpValue.length !== 6) {
        toast.error("Please enter all 6 digits");
        return;
      }
      verifyOtp({ accessToken, otp: otpValue });
    },
  });

  const { mutate: verifyOtp, isLoading: verifying } = useOtpVerify((res) => {
    setOtpDigits(["", "", "", "", "", ""]);
    formik.resetForm();
    navigate(`/set-password`);
  });

  const { mutate: resend, isLoading: resending } = useResendOtp((res) => {
    setOtpDigits(["", "", "", "", "", ""]);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  });

  const handleResend = () => {
    if (secondsLeft > 0 || resending) return;
    resend({ accessToken });
    setSecondsLeft(60);
  };

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    const otpValue = newOtpDigits.join("");
    formik.setFieldValue("otp", otpValue);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (otpValue.length === 6) {
      setTimeout(() => {
        formik.handleSubmit();
      }, 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      formik.setFieldValue("otp", pastedData);
      inputRefs.current[5]?.focus();
      setTimeout(() => {
        formik.handleSubmit();
      }, 100);
    } else {
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleFocus = (index) => {
    inputRefs.current[index]?.select();
  };

  return (
    <>
      <SEOHead {...metadata} />
      <div className="register-page auth-flow-page" role="main">
      <div className="register-wrap">
        <div className="auth-column">
          <div
            className="card form-card"
            role="region"
            aria-labelledby="otp-title"
          >
            <div className="auth-icon-wrap" aria-hidden="true">
              <ShieldLock size={26} />
            </div>

            <span className="auth-step-badge">Step 2 of 3</span>

            <h3 id="otp-title" className="title">
              Verify your code
            </h3>
            <p className="auth-subtitle">
              We sent a 6-digit code to your email. Enter it below — it expires
              in a few minutes.
            </p>

            <Form
              noValidate
              onSubmit={formik.handleSubmit}
              className="register-form"
            >
              <div className="otp-input-wrapper">
                <label className="otp-label">One-Time Password</label>
                <div className="otp-container" onPaste={handlePaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`otp-input ${formik.errors.otp && formik.touched.otp ? "otp-input-error" : ""}`}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={() => handleFocus(index)}
                      disabled={verifying}
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>
                {formik.errors.otp && formik.touched.otp && (
                  <div className="otp-error-message">{formik.errors.otp}</div>
                )}
              </div>

              <Button
                type="submit"
                className="register-btn"
                disabled={verifying || otpDigits.join("").length !== 6}
                aria-label="Verify OTP"
              >
                {verifying ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </Form>

            <div className="d-flex justify-content-center mt-3">
              {secondsLeft > 0 ? (
                <div aria-live="polite"  style={{ fontSize: "0.875rem" }}>
                  Resend code in{" "}
                  <strong>00:{String(secondsLeft).padStart(2, "0")}</strong>
                </div>
              ) : (
                <Button
                  variant="link"
                  disabled={resending}
                  onClick={handleResend}
                  aria-label="Resend OTP"
                  style={{ fontSize: "0.875rem" }}
                >
                  {resending ? "Resending..." : "Resend OTP"}
                </Button>
              )}
            </div>
          </div>

          <div className="card switch-card">
            <p className="mb-0" style={{ fontSize: "0.85rem" }}>
              Didn't receive a code? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default OtpVerify;
