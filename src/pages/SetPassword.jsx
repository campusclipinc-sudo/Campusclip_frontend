import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Form, Button, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { KeyFill } from "react-bootstrap-icons";
import TNInput from "../component/TNInput";
import { useSetPassword } from "../hooks/index";
import { loginSuccess } from "../store/userSlice";
import { setAuthToken } from "../libs/HttpClients";
import { toast } from "react-toastify";
import "../scss/SetPassword.scss";

const SetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem("accessToken");

  const formik = useFormik({
    initialValues: { password: "", confirm_password: "" },
    validationSchema: Yup.object({
      password: Yup.string()
        .required("Password is required")
        .matches(
          /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
          "Password must be at least 8 characters, include one uppercase letter and one special character",
        ),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: (values) => {
      setPassword({ accessToken, password: values.password });
    },
  });

  const { mutate: setPassword, isLoading } = useSetPassword((res) => {
    formik.resetForm();
    if (res?.data?.isLogin && res?.data?.accessToken) {
      const dataStore = {
        userData: res.data.userInfo,
        isLogin: res.data.isLogin,
        accessToken: res.data.accessToken,
        rememberMe: false,
      };
      dispatch(loginSuccess(dataStore));
      setAuthToken(res.data.accessToken);
      navigate("/select-class-count");
    } else {
      navigate("/dashboard");
    }
  });

  return (
    <div className="register-page auth-flow-page" role="main">
      <div className="register-wrap">
        <div className="auth-column">
          <div
            className="card form-card"
            role="region"
            aria-labelledby="setpass-title"
          >
            <div className="auth-icon-wrap" aria-hidden="true">
              <KeyFill size={26} />
            </div>

            <span className="auth-step-badge">Step 3 of 3</span>

            <h3 id="setpass-title" className="title">
              Set new password
            </h3>
            <p className="auth-subtitle">
              Choose a strong password — at least 8 characters with one
              uppercase letter and one special character.
            </p>

            <Form
              noValidate
              onSubmit={formik.handleSubmit}
              className="register-form"
            >
              <TNInput
                label={"New Password"}
                type="password"
                name="password"
                placeholder="Enter new password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                error={formik.errors}
                touched={formik.touched}
                className="mb-3"
              />
              <TNInput
                label={"Confirm Password"}
                type="password"
                name="confirm_password"
                placeholder="Re-enter new password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirm_password}
                error={formik.errors}
                touched={formik.touched}
              />
              <Button
                type="submit"
                className="register-btn"
                disabled={isLoading}
                aria-label="Set new password"
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Set Password"
                )}
              </Button>
            </Form>
          </div>

          <div className="card switch-card">
            <p className="mb-0" style={{ fontSize: "0.85rem" }}>
              Use a mix of letters, numbers, and symbols for a stronger
              password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
