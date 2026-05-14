import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Button, Spinner, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import DashboardLayout from "../component/DashboardLayout";
import { useListCategories } from "../hooks/useRQClub";
import { useJoinClass, useLeaveClass } from "../hooks/useRQclass";
import {
    useUniversalSearch,
    useTrendingStudents,
    usePopularClubs,
    usePopularClasses,
} from "../hooks/useRQSearch";
import JoinClassSuccessModal from "../components/JoinClassSuccessModal";
import { UserService } from "../api/authService";
import "../scss/Search.scss";

const Search = () => {
    // const currentUser = useSelector((state) => state.user?.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [joinedClassData, setJoinedClassData] = useState({});
    const [selectedSchool, setSelectedSchool] = useState("");
    const [schools, setSchools] = useState([]);

    // Fetch educational institutions for the filter dropdown
    useEffect(() => {
        UserService.getEducationalInstitutions().then((res) => {
            const list = res?.data || res || [];
            setSchools(Array.isArray(list) ? list : []);
        }).catch(() => { });
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: categoriesData } = useListCategories();
    const categories = categoriesData?.data || [];

    // Search results (only fetch when there's a search query)
    const {
        data: searchData,
        isLoading: searchLoading,
        refetch: refetchSearch,
    } = useUniversalSearch({
        query: debouncedQuery,
        ...(selectedSchool && { educational_institution_id: selectedSchool }),
    });

    // Trending/Popular data (filtered by selected school)
    const schoolParam = selectedSchool ? { educational_institution_id: selectedSchool } : {};
    const { data: trendingData } = useTrendingStudents({ limit: 4, ...schoolParam });
    const { data: popularClubsData } = usePopularClubs({ limit: 4, ...schoolParam });
    const { data: popularClassesData, refetch: refetchPopularClasses } =
        usePopularClasses({ limit: 4, ...schoolParam });

    const joinClassMutation = useJoinClass(
        () => {
            // Show success modal instead of toast
            setShowSuccessModal(true);
            // Refetch search results if searching, otherwise refetch popular classes
            if (debouncedQuery.trim().length > 0) {
                refetchSearch();
            } else {
                refetchPopularClasses();
            }
        },
        (error) => {
            toast.error(error?.response?.data?.message || "Failed to join class");
        },
    );

    const leaveClassMutation = useLeaveClass(
        () => {
            // Refetch search results if searching, otherwise refetch popular classes
            if (debouncedQuery.trim().length > 0) {
                refetchSearch();
            } else {
                refetchPopularClasses();
            }
        },
        (error) => {
            toast.error(error?.response?.data?.message || "Failed to leave class");
        },
    );

    const categoriesMap = new Map();
    categories.forEach((cat) => categoriesMap.set(cat.id, cat.name));

    const trendingStudents = trendingData?.data?.students || [];
    const popularClubs = popularClubsData?.data?.clubs || [];
    const popularClasses = popularClassesData?.data?.classes || [];

    // Search results
    const searchResults = searchData?.data || {};
    const searchUsers = searchResults.users || [];
    const searchClubs = searchResults.clubs || [];
    const searchClasses = searchResults.classes || [];

    const hasSearchQuery = debouncedQuery.trim().length > 0;
    const hasSearchResults =
        searchUsers.length > 0 ||
        searchClubs.length > 0 ||
        searchClasses.length > 0;


    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Convert schools to React Select format
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

    // Custom styles for React Select matching search page design
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
            "&:hover": {
                borderColor: "rgba(96, 165, 250 / 0.5)",
                backgroundColor: "rgba(30, 58, 138, 0.3)",
            },
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
            "&:hover": {
                color: "#fff",
            },
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
            "&:hover": {
                backgroundColor: "rgba(96, 165, 250, 0.25)",
            },
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: "rgba(255, 255, 255 / 0.5)",
        }),
    };

    const handleJoinClass = (classItem) => {
        // Store class data for the success modal
        setJoinedClassData({
            class_name: classItem.class_name,
            students_count: (classItem.members_count || 0) + 1, // Add 1 for the user joining
            assignments_count: 4, // This should come from backend in real scenario
        });
        joinClassMutation.mutate(classItem.id);
    };

    // const handleLeaveClass = (classId) => {
    //     leaveClassMutation.mutate(classId);
    // };

    return (
        <DashboardLayout>
            <div className="search-page">
                <div className="search-container">
                    <div className="search-header animate-fade-down">
                        <div className="d-flex flex-wrap align-items-center search-title">
                            <div className="icon-head">
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
                                >
                                    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"></path>
                                    <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                            </div>
                            <div className="">
                                <h2>Explore</h2>
                                <p>Discover your campus community</p>
                            </div>
                        </div>

                        <div className="search-form">
                            <div className="search-controls">
                                <div className="search-input-wrapper">
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
                                        className="search-icon"
                                    >
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Search students, clubs, classes..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchLoading && (
                                        <Spinner
                                            animation="border"
                                            size="sm"
                                            className="search-spinner"
                                        />
                                    )}
                                </div>
                                <div className="school-filter-wrapper">
                                    <Select
                                        options={schoolOptions}
                                        value={selectedSchoolOption}
                                        onChange={(option) => {
                                            setSelectedSchool(option ? option.value : "");
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
                    </div>

                    <div className="search-content">
                        {hasSearchQuery ? (
                            /* Search Results */
                            <>
                                {searchLoading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Searching...</p>
                                    </div>
                                ) : hasSearchResults ? (
                                    <>
                                        {/* Users Search Results */}
                                        {searchUsers.length > 0 && (
                                            <section className="search-section animate-fade-up">
                                                <div className="section-header">
                                                    <h3>Students ({searchUsers.length})</h3>
                                                </div>
                                                <Row>
                                                    {searchUsers.map((student, index) => (
                                                        <Col key={student.id} xs={6} sm={6} md={6} lg={3}>
                                                            <div className="student-card animate-zoom-in">
                                                                <Link
                                                                    to={`/students/${student.id}`}
                                                                    className="text-decoration-none d-block"
                                                                >
                                                                    <div className="d-flex align-items-center flex-column">
                                                                        <div className="student-avatar">
                                                                            {student.profile_image ? (
                                                                                <img
                                                                                    src={student.profile_image}
                                                                                    alt={student.full_name}
                                                                                    className="avatar-placeholder"
                                                                                />
                                                                            ) : (
                                                                                <div className="avatar-placeholder">
                                                                                    {getInitials(student.full_name)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="student-info">
                                                                            <h4 className="student-name mb-0">
                                                                                {student.full_name}
                                                                            </h4>
                                                                            <p className="student-major mb-0">
                                                                                @{student.username}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </section>
                                        )}

                                        {/* Clubs Search Results */}
                                        {searchClubs.length > 0 && (
                                            <section className="search-section animate-fade-up">
                                                <div className="section-header">
                                                    <h3>Clubs ({searchClubs.length})</h3>
                                                </div>
                                                <Row>
                                                    {searchClubs.map((club, index) => (
                                                        <Col key={club.id} xs={6} sm={6} md={6} lg={3}>
                                                            <div className="student-card animate-zoom-in">
                                                                <Link
                                                                    to={`/clubs/${club.id}`}
                                                                    className="text-decoration-none d-block"
                                                                >
                                                                    <div className="d-flex align-items-center flex-column">
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
                                                                            <h4 className="student-name mb-0">
                                                                                {club.name}
                                                                            </h4>
                                                                            <p className="student-major mb-0">
                                                                                {categoriesMap.get(club.category_id) ||
                                                                                    "Uncategorized"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </section>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="64"
                                            height="64"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-muted mb-3"
                                        >
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <path d="m21 21-4.35-4.35"></path>
                                        </svg>
                                        <p className="text-muted">
                                            No results found for "{debouncedQuery}"
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Default View - Trending & Popular */
                            <>
                                {/* Trending Students Section */}
                                <section className="search-section animate-fade-up">
                                    <div className="section-header trending-students d-flex flex-wrap justify-content-between align-items-center">
                                        <h3>
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
                                                className="lucide lucide-trending-up w-5 h-5 text-emerald-400"
                                                data-filename="pages/Search"
                                                data-linenumber="745"
                                                data-visual-selector-id="pages/Search745"
                                                data-source-location="pages/Search:745:22"
                                                data-dynamic-content="false"
                                            >
                                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                                <polyline points="16 7 22 7 22 13"></polyline>
                                            </svg>
                                            Trending Students
                                        </h3>
                                        <Link to={`/search/students${selectedSchool ? `?school=${selectedSchool}` : ""}`} className="view-more-link">
                                            View more{" "}
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
                                            >
                                                <path d="m9 18 6-6-6-6"></path>
                                            </svg>
                                        </Link>
                                    </div>
                                    <Row>
                                        {trendingStudents.length > 0 ? (
                                            trendingStudents.map((student, index) => (
                                                <Col key={student.id} sm={6} md={6} lg={3} xs={6}>
                                                    <div className="student-card animate-zoom-in">
                                                        <Link
                                                            to={`/students/${student.id}`}
                                                            className="text-decoration-none d-block"
                                                        >
                                                            <div className="d-flex align-items-center flex-column">
                                                                <div className="student-avatar">
                                                                    {student.profile_image ? (
                                                                        <img
                                                                            src={student.profile_image}
                                                                            alt={student.full_name}
                                                                            className="avatar-placeholder"
                                                                        />
                                                                    ) : (
                                                                        <div className="avatar-placeholder">
                                                                            {getInitials(student.full_name)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="student-info">
                                                                    <h4 className="student-name mb-0">
                                                                        {student.full_name}
                                                                    </h4>
                                                                    <p className="student-major mb-0">
                                                                        @{student.username}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </Col>
                                            ))
                                        ) : (
                                            <Col>
                                                <p className="text-muted">No students available</p>
                                            </Col>
                                        )}
                                    </Row>
                                </section>

                                {/* Popular Clubs Section */}
                                <section className="search-section animate-fade-up">
                                    <div className="section-header popular-clubs d-flex flex-wrap justify-content-between align-items-center">
                                        <h3>
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
                                            >
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                            Popular Clubs
                                        </h3>
                                        <Link to={`/search/clubs${selectedSchool ? `?school=${selectedSchool}` : ""}`} className="view-more-link">
                                            View more{" "}
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
                                            >
                                                <path d="m9 18 6-6-6-6"></path>
                                            </svg>
                                        </Link>
                                    </div>
                                    <Row>
                                        {popularClubs.map((club, index) => (
                                            <Col key={club.id} sm={6} md={6} lg={3} xs={6}>
                                                <div className="student-card animate-zoom-in">
                                                    <Link
                                                        to={`/clubs/${club.id}`}
                                                        className="text-decoration-none d-block"
                                                    >
                                                        <div className="d-flex align-items-center flex-column">
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
                                                                <h4 className="student-name mb-0">
                                                                    {club.name}
                                                                </h4>
                                                                <p className="student-major mb-0">
                                                                    {categoriesMap.get(club.category_id) ||
                                                                        "Uncategorized"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </section>

                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Join Class Success Modal */}
            <JoinClassSuccessModal
                show={showSuccessModal}
                onHide={() => setShowSuccessModal(false)}
                classData={joinedClassData}
            />
        </DashboardLayout>
    );
};

export default Search;
