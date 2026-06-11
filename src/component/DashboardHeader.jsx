import React from "react";
import { Nav, Container, Dropdown, Image, Badge } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGetProfile } from "../hooks/index";
import { useSelector } from "react-redux";
import { useLogout } from "../hooks/useLogout";
import {
    selectClubNotifications,
    selectPrivateChatTotalCount,
} from "../store/notificationSlice";
import { toast } from "react-toastify";
import { NotificationDot } from "../components/NotificationIndicators";

import Logo from "../assets/logo.png";

const DashboardHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");
    const { logout } = useLogout();

    const { data: profileData } = useGetProfile();
    const displayName = profileData?.full_name || "User";
    const initial = displayName.charAt(0).toUpperCase();
    const clubNotifications = useSelector(selectClubNotifications);
    const unreadCount = useSelector(selectPrivateChatTotalCount);

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="cc-header">
            <div className="cc-header__container">
                {/* Logo & Brand */}
                <div className="cc-header__brand">
                    <Link to="/dashboard" className="d-flex align-items-center text-decoration-none">
                        {/* <div className="brand-icon">
                            <span></span>
                        </div>
                        <span className="cc-brand-text">CampusClip</span> */}
                        <Image src={Logo} alt="CampusClip Logo" width={40} height={40} />
                    </Link>
                </div>

                {/* Navigation */}
                <Nav className="cc-header__nav d-flex">
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/dashboard"
                            className={isActive("/dashboard") ? "active" : ""}
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
                                <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                                <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                                <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                                <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                            </svg>
                            <span>Dashboard</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/feed"
                            className={isActive("/feed") ? "active" : ""}
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
                                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            </svg>
                            <span>Feed</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/calendar"
                            className={isActive("/calendar") ? "active" : ""}
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
                                <path d="M8 2v4"></path>
                                <path d="M16 2v4"></path>
                                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                                <path d="M3 10h18"></path>
                            </svg>
                            <span>Calendar</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/clubs"
                            className={isActive("/clubs") ? "active" : ""}
                            style={{ position: "relative" }}
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
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span className="d-inline-flex align-items-center">
                                Clubs
                                {clubNotifications.hasUnread && <NotificationDot />}
                            </span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/search"
                            className={isActive("/search") ? "active" : ""}
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
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                            <span>Search</span>
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/profile"
                            className={isActive("/profile") ? "active" : ""}
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
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Profile</span>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* User Profile with Mobile Actions */}
                <div className="cc-header__profile">
                    {/* Mobile Actions - Alerts and Messages (Mobile Only) */}
                    <div className="cc-header__mobile-actions d-md-none">
                        <button
                            className="cc-header__mobile-action-btn"
                            aria-label="Notifications"
                            onClick={() => navigate("/notifications")}
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
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                            </svg>
                        </button>
                        <button
                            className="cc-header__mobile-action-btn"
                            aria-label="Messages"
                            onClick={() => navigate("/chat")}
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
                                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                            </svg>
                            {unreadCount > 0 && (
                                <Badge
                                    bg="danger"
                                    pill
                                    className="cc-header__mobile-badge"
                                >
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </Badge>
                            )}
                        </button>
                    </div>

                    <Dropdown align="end">
                        <Dropdown.Toggle
                            variant="link"
                            id="user-dropdown"
                            className="text-decoration-none d-flex align-items-center gap-2"
                        >
                            <div className="avatar">
                                {profileData?.profile_image ? (
                                    <img
                                        src={profileData.profile_image}
                                        alt={displayName}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "50%",
                                        }}
                                    />
                                ) : (
                                    initial
                                )}
                            </div>
                            <span className="username d-none d-md-inline">{displayName}</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item as={Link} to="/profile">
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
                                    className="me-2"
                                >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                View Profile
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout}>
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
                                    className="me-2"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" x2="9" y1="12" y2="12"></line>
                                </svg>
                                Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
