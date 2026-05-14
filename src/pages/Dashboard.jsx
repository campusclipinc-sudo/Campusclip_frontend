import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import DashboardLayout from "../component/DashboardLayout";
import "../scss/layout.scss";
import AddClassModal from "./class/AddClassModal";
import {
  AddClassModalProvider,
  useAddClassModal,
} from "./class/AddClassContext";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useListClasses } from "../hooks/index";
import AOS from "aos";
import "aos/dist/aos.css";
import { useFCM } from "../hooks/useFCM";
import Gauge from "../components/dashboard/Gauge";
import { NotificationDot } from "../components/NotificationIndicators";
import { selectClassNotifications } from "../store/notificationSlice";

const Dashboard = () => {
  // IMPORTANT: The AddClassModalProvider lives inside DashboardLayout, so
  // we must consume the context inside a descendant of DashboardLayout.
  const OpenAddClassButton = () => {
    const { openAddClass } = useAddClassModal();
    return (
      <div className="d-flex justify-content-center">
        <Button variant="btns" onClick={openAddClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus w-4 h-4 mr-2"
            data-filename="pages/Dashboard"
            data-linenumber="341"
            data-visual-selector-id="pages/Dashboard341"
            data-source-location="pages/Dashboard:341:16"
            data-dynamic-content="false"
          >
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>{" "}
          Add Your First Class
        </Button>
      </div>
    );
  };

  const navigate = useNavigate();
  const classNotifications = useSelector(selectClassNotifications);
  console.log("Class notifications:", classNotifications); // Debugging log
  // Get authentication status from Redux
  const isAuthenticated = useSelector((state) => state.user?.isLogin);

  // Initialize FCM - automatically saves token when authenticated
  const {
    fcmToken,
    isLoading: fcmLoading,
    error: fcmError,
  } = useFCM(isAuthenticated);

  // Log FCM status for debugging
  useEffect(() => {
    if (fcmToken) {
      console.log("✅ FCM token registered successfully");
    }
    if (fcmError) {
      console.error("❌ FCM error:", fcmError);
    }
  }, [fcmToken, fcmError]);

  const { data, isLoading } = useListClasses();

  const responseData = data?.data || data || {};
  const classes = Array.isArray(responseData)
    ? responseData
    : responseData.classes || [];
  const totalTargetGradeAverage = responseData.total_target_grade_average || 0;
  const totalCurrentGradeAverage =
    responseData.total_current_grade_average || 0;
  const totalRequiredGradeAverage =
    responseData.total_required_grade_average || 0;

  const [showAddClass, setShowAddClass] = useState(false);
  const openAddClass = () => setShowAddClass(true);
  const closeAddClass = () => setShowAddClass(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-quart",
      once: true,
      offset: 40,
    });
  }, []);
  useEffect(() => {
    // Refresh AOS when list length changes
    AOS.refresh();
  }, [classes?.length]);

  return (
    <AddClassModalProvider
      openAddClass={openAddClass}
      closeAddClass={closeAddClass}
    >
      <DashboardLayout>
        <div className="dashboard-main">
          <div className="d-flex flex-wrap align-items-center justify-content-between page-head">
            <div className="d-flex align-items-center">
              <div className="title-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-source-location="layout:162:14"
                  data-dynamic-content="false"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                  <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                  <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                  <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                </svg>
              </div>
              <div className="title">
                <h2>Dashboard</h2>
                <p>Your academic command center</p>
              </div>
            </div>
            <div className="actions d-flex gap-3">
              <Button variant="second" onClick={() => navigate("/archive")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-filename="pages/Dashboard"
                  data-linenumber="279"
                  data-visual-selector-id="pages/Dashboard279"
                  data-source-location="pages/Dashboard:279:14"
                  data-dynamic-content="false"
                >
                  <rect width="20" height="5" x="2" y="3" rx="1"></rect>
                  <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
                  <path d="M10 12h4"></path>
                </svg>
                Archives
              </Button>
              <Button variant="second" className="btn-add-class" onClick={openAddClass}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-filename="pages/Dashboard"
                  data-linenumber="284"
                  data-visual-selector-id="pages/Dashboard284"
                  data-source-location="pages/Dashboard:284:12"
                  data-dynamic-content="false"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                Add Class
              </Button>
            </div>
          </div>

          {classes.length > 0 ? (
            <div
              className="cc-banner flex-wrap d-flex align-items-center justify-content-between"
              data-aos="fade-up"
            >
              <div className="cc-banner-content">
                <h3>Your Academic Performance</h3>
                <p>Based on {classes.length} active {classes.length === 1 ? 'class' : 'classes'}</p>
              </div>
              <div className="d-flex flex-wrap gap-3">
                <Gauge
                  value={totalCurrentGradeAverage}
                  label="Current Average"
                  colorStart="#10b981"
                  colorEnd="#06b6d4"
                />
                <Gauge
                  value={totalTargetGradeAverage}
                  value2={totalCurrentGradeAverage}
                  label="Target Goal"
                  colorStart="#f59e0b"
                  colorEnd="#ef4444"
                  colorStart2="#10b981"
                  colorEnd2="#06b6d4"
                />

              </div>
            </div>
          ) : (
            <div className="cc-banner" data-aos="fade-up">
              <div className="cc-banner-content">
                <h3>Your Academic Performance</h3>
                <p>Add your first class to start tracking your grades</p>
              </div>
            </div>
          )}
          <div className="my-classes-main" data-aos="fade-up">
            <h4>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                data-filename="pages/Dashboard"
                data-linenumber="323"
                data-visual-selector-id="pages/Dashboard323"
                data-source-location="pages/Dashboard:323:12"
                data-dynamic-content="false"
              >
                <path d="M12 7v14"></path>
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
              </svg>{" "}
              <span className="d-inline-flex align-items-center">
                My Classes
              </span>
            </h4>

            {isLoading ? (
              <Row className="g-3">
                <Col md={6} lg={5} xl={4}>
                  <div className="cc-empty-card" data-aos="fade-up">
                    <div className="mb-2" style={{ fontSize: 28 }}>
                      ⏳
                    </div>
                    <div className="fw-semibold mb-1">Loading classes...</div>
                  </div>
                </Col>
              </Row>
            ) : classes && classes?.length > 0 ? (
              <Row>
                {classes?.map((cls, idx) => (
                  <Col key={cls.id || idx} md={6} lg={5} xl={3}>
                    <div
                      className="cc-class-card"
                      style={{ cursor: "pointer" }}
                      onClick={() => cls.id && navigate(`/class/${cls.id}`)}
                    >
                      <div className="class-card-top">
                        {cls.class_code ? (
                          <div className="badge-tags">
                            {String(cls.class_code).toUpperCase()}
                          </div>
                        ) : null}
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <h5 className="mb-0">{cls.class_name || "Untitled Class"}</h5>
                          {classNotifications.byClass?.[cls.id]?.hasUnread && <NotificationDot style={{ marginLeft: 0 }} />}
                        </div>
                        <p style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                          {cls.instructor_name || ""}
                          {cls.instructor_email && (
                            <span style={{ fontSize: "0.75rem" }}>
                              · {cls.instructor_email}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center class-card-bottom">
                        <span>Grade</span>
                        <div className="badge-tag">
                          {cls.current_grade ? `${cls.current_grade}%` : "N/A"}
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="cc-empty-card">
                <div className="cc-empty-card-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-filename="pages/Dashboard"
                    data-linenumber="334"
                    data-visual-selector-id="pages/Dashboard334"
                    data-source-location="pages/Dashboard:334:12"
                    data-dynamic-content="false"
                  >
                    <path d="M12 7v14"></path>
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                  </svg>
                </div>
                <h3>No Classes Yet</h3>
                <p>Start tracking your grades by adding your first class</p>
                <OpenAddClassButton />
              </div>
            )}
          </div>
          <AddClassModal show={showAddClass} onHide={closeAddClass} />
        </div>
      </DashboardLayout>
    </AddClassModalProvider>
  );
};

export default Dashboard;
