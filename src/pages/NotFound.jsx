import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isUserLoggedIn } from "../store/userSlice";
import "../scss/NotFound.scss";

const NotFound = () => {
  const navigate = useNavigate();
  const isLoggedIn = useSelector(isUserLoggedIn);

  const handleGoHome = () => {
    navigate(isLoggedIn ? "/dashboard" : "/login");
  };

  return (
    <Container className="not-found-container d-flex align-items-center justify-content-center">
      <div className="not-found-content text-center">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleGoHome}
          className="not-found-button"
        >
          {isLoggedIn ? "Back to Dashboard" : "Back to Login"}
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;
