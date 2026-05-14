import React, { useState } from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DashboardLayout from "../component/DashboardLayout";
import {
  useListAllClasses,
  useJoinClass,
  useLeaveClass,
} from "../hooks/useRQclass";
import AddClassModal from "./class/AddClassModal";
import JoinClassSuccessModal from "../components/JoinClassSuccessModal";
import "../scss/AllClasses.scss";
import AOS from "aos";
import "aos/dist/aos.css";

const AllClasses = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user?.user);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [joinedClassData, setJoinedClassData] = useState({});
  const {
    data: classesData,
    isLoading,
    refetch: refetchClasses,
  } = useListAllClasses();
  const classes = classesData?.data || [];

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-quart",
      once: true,
      offset: 40,
    });
  }, []);

  const joinClassMutation = useJoinClass(
    () => {
      // Show success modal instead of toast
      setShowSuccessModal(true);
      refetchClasses();
    },
    (error) => {
      toast.error(error?.response?.data?.message || "Failed to join class");
    },
  );

  const leaveClassMutation = useLeaveClass(
    () => {
      refetchClasses();
    },
    (error) => {
      toast.error(error?.response?.data?.message || "Failed to leave class");
    },
  );

  const handleJoinClass = (classItem) => {
    // Store class data for the success modal
    setJoinedClassData({
      class_name: classItem.class_name,
      students_count: (classItem.students_count || 0) + 1, // Add 1 for the user joining
      assignments_count: 4, // This should come from backend in real scenario
    });
    joinClassMutation.mutate(classItem.id);
  };

  const handleLeaveClass = (classId) => {
    leaveClassMutation.mutate(classId);
  };

  const handleViewClass = (classId) => {
    navigate(`/class/${classId}`);
  };

  const isEnrolled = (classItem) => {
    // Check if current user is enrolled in this class
    return classItem.is_enrolled || false;
  };

  const isOwner = (classItem) => {
    // Check if current user is the owner/creator of this class
    return classItem.is_owner || false;
  };

  return (
    <DashboardLayout>
      <div className="all-students-page">
        <div className="all-students">
          <div
            className="all-students-header d-flex justify-content-between flex-wrap"
            data-aos="fade-down"
          >
            <Link to="/search" className="back-link">
              <div className="back-icon">
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
                  className="lucide lucide-arrow-left"
                  data-filename="pages/AllStudents"
                  data-linenumber="127"
                  data-visual-selector-id="pages/AllStudents127"
                  data-source-location="pages/AllStudents:127:12"
                  data-dynamic-content="false"
                >
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M19 12H5"></path>
                </svg>
              </div>{" "}
              All Classes
            </Link>
            <div>
              <div className="align-items-center">
                <Button
                  variant="primary"
                  className="add-class-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  Add New Class
                </Button>
              </div>
            </div>
          </div>

          <div className="all-students-content">
            {isLoading ? (
              <div className="loading-state">
                <p>Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="empty-state">
                <p className="text-muted">No classes available</p>
              </div>
            ) : (
              <Row className="popular-classes-row">
                {classes.map((classItem, index) => (
                  <Col key={classItem.id} sm={6} md={6} lg={4}>
                    <div
                      className="class-card"
                      data-aos="zoom-in"
                      data-aos-delay={index * 50}
                    >
                      <div className="d-flex">
                        <div className="class-icon">
                          <div className="class-placeholder">
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
                              className="lucide lucide-book-open w-3 h-3 text-white"
                            >
                              <path d="M12 7v14"></path>
                              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="class-info flex-grow-1">
                          <div className="d-flex align-items-center gap-2">
                            <h4 className="class-name mb-0">
                              {classItem.class_name || "Untitled Class"}
                            </h4>
                            {/* {isOwner(classItem) && (
                              <Badge bg="primary" className="enrolled-badge">
                                Owner
                              </Badge>
                            )} */}
                            {!isOwner(classItem) && isEnrolled(classItem) && (
                              <Badge bg="success" className="enrolled-badge">
                                Enrolled
                              </Badge>
                            )}
                          </div>
                          <p className="class-code">
                            {classItem.class_code || ""}{" "}
                            {classItem.instructor_name || ""}
                          </p>
                          <p className="class-instructor text-muted small">
                            {classItem.students_count || 0} students
                          </p>
                        </div>
                      </div>
                      <div className="d-flex gap-2 align-items-center mt-2 w-100">
                        {isOwner(classItem) ? (
                          <Button
                            className="w-100"
                            variant="secondary"
                            onClick={() => handleViewClass(classItem.id)}
                          >
                            View Class
                          </Button>
                        ) : isEnrolled(classItem) ? (
                          <>
                            <Button
                              variant="primary"
                              className="flex-grow-1"
                              onClick={() => handleViewClass(classItem.id)}
                            >
                              View Class
                            </Button>
                            <Button
                              onClick={() => handleLeaveClass(classItem.id)}
                              disabled={leaveClassMutation.isPending}
                            >
                              Leave
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            className="w-100"
                            onClick={() => handleJoinClass(classItem)}
                            disabled={joinClassMutation.isPending}
                          >
                            Join Class
                          </Button>
                        )}
                      </div>
                      <Link
                        to={`/class/${classItem.id}`}
                        className="class-card-link"
                      ></Link>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>

        <AddClassModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
        />

        {/* Join Class Success Modal */}
        <JoinClassSuccessModal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          classData={joinedClassData}
        />
      </div>
    </DashboardLayout>
  );
};

export default AllClasses;
