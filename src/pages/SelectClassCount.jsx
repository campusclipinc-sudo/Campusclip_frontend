import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAccessToken,
  getActiveUserDetails,
  loginSuccess,
} from "../store/userSlice";
import { useSetClassCount } from "../hooks/index";
import { toast } from "react-toastify";
import TNInput from "../component/TNInput";
import logo from "../assets/EmailLogo.png";
import "../scss/Register.scss";

const SelectClassCount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector(getActiveUserDetails);
  const accessToken = useSelector(getAccessToken);

  const { mutate: setClassCount, isLoading } = useSetClassCount((res) => {

    const updatedUserData = {
      ...userData,
      onboarding_class_count: res.data.onboarding_class_count,
      classes_onboarding_completed: res.data.classes_onboarding_completed,
    };
    dispatch(
      loginSuccess({
        userData: updatedUserData,
        isLogin: true,
        accessToken: accessToken,
      }),
    );

    if (res.data.classes_onboarding_completed === true) {
      navigate("/dashboard");
    } else {
      navigate("/add-classes");
    }
  });

  const formik = useFormik({
    initialValues: {
      class_count: "",
    },
    validationSchema: Yup.object({
      class_count: Yup.number()
        .min(1, "Please select at least 1 class")
        .max(5, "Maximum 5 classes allowed")
        .required("Please select number of classes"),
    }),
    onSubmit: (values) => {
      setClassCount({ class_count: parseInt(values.class_count) });
    },
  });

  const handleSkip = () => {
    setClassCount({ class_count: 0, skip: true });
  };

  return (
    <div className="register-page" role="main">
      <div className="register-wrap">
        <div className="auth-column">
          <div
            className="card form-card"
            role="region"
            aria-labelledby="class-count-title"
          >
            <div className="brand">
              <img src={logo} alt="CampusClip" className="brand-logo" />
            </div>
            <h3 id="class-count-title" className="title">
              How many classes are you taking?
            </h3>
            <p className="subtitle">
              Select the number of classes you'd like to add. You can upload
              your syllabus and we'll extract the details automatically.
            </p>

            <Form
              noValidate
              onSubmit={formik.handleSubmit}
              className="register-form"
            >
              <TNInput
                type="select"
                label="Number of Classes"
                name="class_count"
                options={[
                  { value: "", label: "Select number of classes" },
                  { value: "1", label: "1 Class" },
                  { value: "2", label: "2 Classes" },
                  { value: "3", label: "3 Classes" },
                  { value: "4", label: "4 Classes" },
                  { value: "5", label: "5 Classes" },
                ]}
                value={formik.values.class_count}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors}
                touched={formik.touched}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || !formik.values.class_count}
                className="register-btn w-100 mt-4"
                aria-label="Continue to add classes"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-100 mt-2 skip-btn"
                onClick={handleSkip}
                disabled={isLoading}
              >
                Skip for now
              </Button>
            </Form>
          </div>

          <div className="card switch-card">
            <p>You can always add more classes later from your dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectClassCount;
