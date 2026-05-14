import React from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGauge,
    faHouseChimney,
    faCalendarDays,
    faUsers,
    faMagnifyingGlass,
    faUser,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png";
import { useGetProfile } from "../hooks/index";

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const { data: profileData, isLoading } = useGetProfile();
    const displayName = profileData?.full_name || "User";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <aside className="cc-sidebar">
            <div className="cc-sidebar__brand">
                <div className="d-flex justify-content-center align-items-center">
                    <div className="brand-icon"><span></span></div>
                    <div className="cc-brand-text">
                        <span className="title">CampusClip</span>
                    </div>
                </div>
                <span className="beta">BETA</span>
            </div>

            <Nav className="flex-column cc-sidebar__nav">
                <Nav.Item>
                    <Nav.Link as={Link} to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
                        {/* <FontAwesomeIcon icon={faGauge} /> */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-source-location="layout:162:14" data-dynamic-content="false"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
                        <span>Dashboard</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/feed" className={isActive("/feed") ? "active" : ""}>
                        {/* <FontAwesomeIcon icon={faHouseChimney} /> */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-source-location="layout:162:14" data-dynamic-content="false"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                        <span>Feed</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/calendar" className={isActive("/calendar") ? "active" : ""}>
                        {/* <FontAwesomeIcon icon={faCalendarDays} /> */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-source-location="layout:162:14" data-dynamic-content="false"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                        <span>Calendar</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/clubs" className={isActive("/clubs") ? "active" : ""}>
                        {/* <FontAwesomeIcon icon={faUsers} /> */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-source-location="layout:162:14" data-dynamic-content="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>Clubs</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/search" className={isActive("/search") ? "active" : ""}>
                        {/* <FontAwesomeIcon icon={faMagnifyingGlass} /> */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-source-location="layout:162:14" data-dynamic-content="false"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                        <span>Search</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/profile" className={isActive("/profile") ? "active" : ""}>
                        {/* <FontAwesomeIcon icon={faUser} /> */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  data-source-location="layout:162:14" data-dynamic-content="false"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Profile</span>
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <div className="cc-sidebar__profile">
                <div className="d-flex align-items-center profile-inner">
                    <div className="avatar">{initial}</div>
                    <div className="meta">
                        <div className="name">{displayName}</div>
                        <Link to="/profile" className="link" aria-label="View profile">View Profile</Link>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
