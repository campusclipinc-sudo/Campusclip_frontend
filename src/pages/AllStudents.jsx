import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import Select from "react-select";
import DashboardLayout from "../component/DashboardLayout";
import { useListAllStudents } from "../hooks/useRQStudent";
import { useToggleFollow } from "../hooks/useRQUserFollowing";
import { UserService } from "../api/authService";
import "../scss/AllStudents.scss";
import AOS from "aos";
import "aos/dist/aos.css";

const AllStudents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedSchool = searchParams.get("school") || "";

  useEffect(() => {
    UserService.getEducationalInstitutions()
      .then((res) => {
        const list = res?.data || res || [];
        setSchools(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  const schoolParam = selectedSchool ? { educational_institution_id: selectedSchool } : {};
  const { data: studentsData, isLoading } = useListAllStudents(schoolParam);
  const allStudents = studentsData?.data || [];
  const toggleFollowMutation = useToggleFollow();

  const students = useMemo(() => {
    if (!searchQuery.trim()) return allStudents;
    return allStudents.filter((student) =>
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allStudents, searchQuery]);

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-quart",
      once: true,
      offset: 40,
    });
  }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleToggle = (studentId) => {
    toggleFollowMutation.mutate({ following_user: studentId });
  };

  const getDisplayText = (student) => {
    if (student.major) return student.major;
    if (student.university) return student.university;
    return "";
  };

  const schoolOptions = useMemo(() =>
    schools.map((school) => ({
      value: school.id,
      label: school.name,
    })),
    [schools]
  );

  const selectedSchoolOption = useMemo(() =>
    schoolOptions.find((option) => String(option.value) === String(selectedSchool)),
    [selectedSchool, schoolOptions]
  );

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      fontSize: "0.875rem",
      height: "2.5rem",
      padding: "0",
      border: "1px solid rgba(96, 165, 250 / 0.3)",
      backgroundColor: "rgba(30, 58, 138, 0.2)",
      borderRadius: "0.75rem",
      color: "#fff",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "none",
    }),
    input: (base) => ({
      ...base,
      color: "#fff",
      padding: "0",
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgba(255, 255, 255 / 0.5)",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "rgba(255, 255, 255 / 0.7)",
      padding: "8px 12px",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "rgba(255, 255, 255 / 0.7)",
      padding: "8px 8px",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#0f172a",
      border: "1px solid rgb(59, 130, 246 / 0.3)",
      borderRadius: "12px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)",
      marginTop: "8px",
    }),
    menuList: (base) => ({
      ...base,
      padding: "8px 0",
      maxHeight: "320px",
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(96, 165, 250, 0.3)",
        borderRadius: "3px",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "rgba(59, 130, 246, 0.3)"
        : state.isFocused
        ? "rgba(96, 165, 250, 0.2)"
        : "transparent",
      color: "#fff",
      cursor: "pointer",
      padding: "12px 16px",
      fontSize: "0.875rem",
      transition: "all 0.15s ease",
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "rgba(255, 255, 255 / 0.5)",
    }),
  };

  return (
    <DashboardLayout>
      <div className="all-students-page">
        <div className="all-students">
          <div className="all-students-header" data-aos="fade-down">
            <div className="d-flex flex-wrap justify-content-between align-items-center w-100 gap-3">
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
                </div>
                All Students
              </Link>
              <div style={{
                position: "relative",
                minWidth: "250px",
              }}>
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
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    color: "rgb(156, 163, 175)",
                  }}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    width: "100%",
                    padding: "0.75rem 2.5rem",
                    border: "1px solid rgb(255 255 255 / 0.2)",
                    backgroundColor: "rgb(255 255 255 / 0.1)",
                    height: "2.5rem",
                    borderRadius: "0.75rem",
                    color: "#fff",
                  }}
                />
              </div>
              <div style={{ minWidth: "200px" }}>
                <Select
                  options={schoolOptions}
                  value={selectedSchoolOption}
                  onChange={(option) => {
                    if (option) {
                      setSearchParams({ school: option.value });
                    } else {
                      setSearchParams({});
                    }
                  }}
                  styles={customSelectStyles}
                  isClearable={true}
                  isSearchable={true}
                  placeholder="Select School"
                  className="school-filter-select"
                />
              </div>
            </div>
          </div>

          <div className="all-students-content">
            {isLoading ? (
              <div className="loading-state">
                <p>Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <p className="text-muted">No students available</p>
              </div>
            ) : (
              <Row>
                {students.map((student, index) => (
                  <Col key={student.id} sm={6} md={4} lg={3}>
                    <div
                      className="student-card"
                      data-aos="zoom-in"
                      data-aos-delay={index * 50}
                    >
                      <div className="student-card-content">
                        <Link
                          to={`/students/${student.id}`}
                          className="text-decoration-none d-block w-100"
                        >
                          <div className="student-avatar">
                            {student.profile_image ? (
                              <img
                                src={student.profile_image}
                                alt={student.full_name}
                                className="avatar-img"
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                {getInitials(student.full_name)}
                              </div>
                            )}
                          </div>
                          <div className="student-info">
                            <h4
                              className="student-name"
                              title={student.full_name}
                            >
                              {student.full_name || "Unknown"}
                            </h4>
                            <p className="student-major">
                              {getDisplayText(student)}
                            </p>
                          </div>
                        </Link>
                        <Button
                          variant={student.is_following ? "secondary" : "dark"}
                          className="follow-btn"
                          onClick={() => handleToggle(student.id)}
                          disabled={toggleFollowMutation.isPending}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 11V9a2 2 0 0 0-2-2"></path>
                            <path d="M16 5h2a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          {student && student.is_following === true
                            ? "Following"
                            : student.is_following === false &&
                                student.follow_status === "pending"
                              ? "Requested"
                              : "Follow"}
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllStudents;
