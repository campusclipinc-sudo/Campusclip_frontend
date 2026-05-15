import React, { useMemo, useState, useEffect } from "react";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import DashboardLayout from "../component/DashboardLayout";
import { useListClubs, useListCategories } from "../hooks/useRQClub";
import { useFollowClub, useRequestClub } from "../hooks/useRQClubRequest";
import { UserService } from "../api/authService";
import "../scss/customAnimations.scss";

const AllClubs = () => {
  const navigate = useNavigate();
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
  const { data: clubsData, isLoading: clubsLoading, refetch } = useListClubs(schoolParam);
  const { data: categoriesData } = useListCategories();
  const { mutate: requestClub, isPending: isPending } = useRequestClub(() => {
    refetch();
  });
  const { mutate: followClub, isPending: followPending } = useFollowClub(() => {
    refetch();
  });


  const myClubs = Array.isArray(clubsData?.data?.myClubs)
    ? clubsData.data.myClubs
    : [];
  const otherClubs = Array.isArray(clubsData?.data?.otherClubs)
    ? clubsData.data.otherClubs
    : [];
  const categories = categoriesData?.data || [];

  const categoriesMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const filteredMyClubs = useMemo(() => {
    if (!searchQuery.trim()) return myClubs;
    return myClubs.filter((club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myClubs, searchQuery]);

  const filteredOtherClubs = useMemo(() => {
    if (!searchQuery.trim()) return otherClubs;
    return otherClubs.filter((club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [otherClubs, searchQuery]);

  const allClubs = [...filteredMyClubs, ...filteredOtherClubs];

  const handleJoinClub = (club) => {
    requestClub({ club_id: club.id, is_following: false });
  };

  const handleFollowClub = (club) => {
    followClub({ following_club: club.id });
  };

  const isMyClub = (clubId) => {
    return myClubs.some((club) => club.id === clubId);
  };

  const isMember = (club) => {
    return (
      Array.isArray(club.requests) &&
      club.requests.some(
        (r) => r.status === "approved" || r.status === "accepted",
      )
    );
  };

  const isFollowing = (club) => {
    return club.is_following === true;
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
          <div className="all-students-header fade-down-animation">
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
                All Clubs
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
                  placeholder="Search clubs..."
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
            {clubsLoading ? (
              <div className="loading-state">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading clubs...</p>
              </div>
            ) : allClubs.length === 0 ? (
              <div className="empty-state">
                <p className="text-muted">No clubs available</p>
              </div>
            ) : (
              <Row>
                {allClubs.map((club) => {
                  const isOwnClub = isMyClub(club.id);
                  const hasPending = Array.isArray(club.requests)
                    ? club.requests.some((r) => r.status === "pending")
                    : false;
                  const isMemberOfClub = isMember(club);
                  const label = hasPending
                    ? "Requested"
                    : club.is_public
                      ? "Join Club"
                      : "Request";
                  const memberLabel = isMemberOfClub ? "Member" : label;

                  return (
                    <Col key={club.id} sm={6} md={4} lg={3}>
                      <div
                        className="student-card scale-up-animation"
                        style={{
                          animationDelay: `${(allClubs.findIndex((c) => c.id === club.id) || 0) * 0.05}s`
                        }}
                      >
                        <div className="student-card-content">
                          <div className="student-avatar">
                            {club.club_profile_image ? (
                              <img
                                src={club.club_profile_image}
                                alt={club.name}
                                className="club-img"
                              />
                            ) : (
                              <div className="avatar-placeholder">
                                {club.name?.[0]?.toUpperCase() || "C"}
                              </div>
                            )}
                          </div>
                          <div className="student-info">
                            <h4 className="student-name" title={club.name}>
                              {club.name || "Untitled Club"}
                            </h4>
                            <p className="student-major">
                              {club.category?.name ||
                                categoriesMap.get(club.category_id) ||
                                "Uncategorized"}
                            </p>
                          </div>
                          <div className="club-actions w-100">
                            {isOwnClub ? (
                              <Button
                                className="view-club-btn"
                                onClick={() => navigate(`/clubs/${club.id}`)}
                              >
                                View Club
                              </Button>
                            ) : (
                              <>
                                <Button
                                  className="follow-link-btn"
                                  onClick={() => handleFollowClub(club)}
                                  disabled={followPending}
                                >
                                  {isFollowing(club) ? "Following" : "Follow"}
                                </Button>
                                {isMemberOfClub ? (
                                  <Button
                                    variant="secondary"
                                    className="join-btn"
                                    onClick={() => navigate(`/clubs/${club.id}`)}
                                  >
                                    Member
                                  </Button>
                                ) : (
                                  <Button
                                    className="join-btn"
                                    onClick={() => handleJoinClub(club)}
                                    disabled={isPending}
                                  >
                                    {label}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllClubs;
