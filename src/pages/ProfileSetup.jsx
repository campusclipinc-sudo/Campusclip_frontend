import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Button, Spinner, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useGetEducationalInstitutions, useEditProfile } from "../hooks/index";
import { useDispatch, useSelector } from "react-redux";
import { getAccessToken, loginSuccess } from "../store/userSlice";
import "../scss/Register.scss";
import TNInput from "../component/TNInput";
import logo from "../assets/EmailLogo.png";

const ProfileSetup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userData);
  const accessToken = useSelector(getAccessToken);
  const { data: educationalInstitutions } = useGetEducationalInstitutions();
  const collegeOptions = educationalInstitutions?.data?.map((institution) => ({
    value: institution.id,
    label: institution.name,
  }));

  const { mutate: updateProfile, isLoading } = useEditProfile((res) => {

    // Update user data in Redux store
    const updatedUserData = {
      ...userData,
      ...res.data,
      profile_setup: true,
    };

    dispatch(
      loginSuccess({
        userData: updatedUserData,
        isLogin: true,
        accessToken: accessToken
      })
    );

    // Redirect to class onboarding if not completed
    if (!updatedUserData.classes_onboarding_completed) {
      navigate("/select-class-count");
    } else {
      navigate("/dashboard");
    }
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      university: "",
      academic_year: "",
      major: "",
      birthday: "",
      account_privacy: "0",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .transform((val) =>
          val ? val.trim().toLowerCase().replace(/^@/, "") : ""
        )
        .matches(
          /^[a-z][a-z0-9._]{1,28}[a-z0-9]$/,
          "Username must start with a letter, contain only letters, numbers, '.', or '_', and have no spaces"
        )
        .test(
          "no-consecutive-sep",
          "Username cannot contain consecutive '.' or '_'",
          (value) => (value ? !/[._]{2,}/.test(value) : true)
        )
        .required("Username is required"),
      university: Yup.string().required("University/College is required"),
      academic_year: Yup.string().required("Academic year is required"),
      major: Yup.string().required("Major is required"),
      birthday: Yup.string().notRequired(),
      account_privacy: Yup.string()
        .oneOf(["0", "1"])
        .required("Account privacy is required"),
    }),

    onSubmit: (values) => {
      const formData = new FormData();

      // Add the fields that need to be updated
      formData.append("username", values.username);
      formData.append("educational_institution_id", values.university); // Convert university to educational_institution_id
      formData.append("academic_year", values.academic_year);
      formData.append("major", values.major);
      if (values.birthday) {
        formData.append("birthday", values.birthday);
      }
      formData.append("account_privacy", values.account_privacy);
      formData.append("profile_setup", "true");

      updateProfile(formData);
    },
  });

  return (
    <div className="register-page" role="main">
      <div className="register-wrap">
        <div className="auth-column">
          <div
            className="card form-card"
            role="region"
            aria-labelledby="profile-setup-title"
          >
            <div className="brand">
              <img src={logo} alt="CampusClip" className="brand-logo" />
            </div>
            <h3 id="profile-setup-title" className="title">
              Welcome, {userData?.full_name}! 👋
            </h3>
            <p className="subtitle">
              Complete your profile to connect with your campus community
            </p>

            <Form
              noValidate
              onSubmit={formik.handleSubmit}
              className="register-form"
            >
              <Row>
                <Col>
                  <TNInput
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
                    type="select"
                    label={"University/College"}
                    name="university"
                    options={collegeOptions}
                    placeholder="e.g., University of California"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.university}
                    error={formik.errors}
                    touched={formik.touched}
                    margin="mt-2"
                  />
                </Col>
              </Row>

              <Row className="mt-3">
                <Col lg={6} md={6} >
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
                          e.target.checked ? "1" : "0"
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
                className="cta-button w-100 mt-4"
                aria-label="Complete profile setup"
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating your profile...
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </Form>

            <div className="footer-text mt-3">
              <p className="text-muted text-center small">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
